import { z } from "zod";

import { searchJobs, type AdzunaJob } from "@/lib/adzuna";
import { callWithFallback } from "@/lib/ai-client";
import { logAgentError } from "@/lib/agent-logger";
import type { Profile, JobSource } from "@/types";

const SCORING_TEMPERATURE = 0.3;
// Sized for up to 10 jobs scored in one call (paragraph reason + skill arrays each) —
// well above extractor.ts's single-object 2000, since this returns an array of 10.
const SCORING_MAX_TOKENS = 4000;

const scoreSchema = z.object({
  scores: z.array(
    z.object({
      matchScore: z.number().int().min(0).max(100),
      matchReason: z.string(),
      matchedSkills: z.array(z.string()),
      missingSkills: z.array(z.string()),
    }),
  ),
});

export type DiscoveredJob = {
  source: JobSource;
  sourceUrl: string;
  externalApplyUrl: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  jobType: string;
  aboutRole: string;
  matchScore: number;
  matchReason: string;
  matchedSkills: string[];
  missingSkills: string[];
};

function formatSalary(job: AdzunaJob): string {
  if (!job.salary_min) return "Not listed";
  const min = Math.round(job.salary_min / 1000);
  const max = job.salary_max ? Math.round(job.salary_max / 1000) : min;
  return `$${min}k - $${max}k`;
}

// jobs.job_type's CHECK constraint only allows 'fulltime' | 'parttime' | 'contract' (architecture.md),
// but Adzuna's own values are "permanent"/"contract" (contract_type) and "full_time"/"part_time"
// (contract_time) — passing Adzuna's raw string through violated the constraint on every insert.
function mapJobType(job: AdzunaJob): "fulltime" | "parttime" | "contract" {
  if (job.contract_type === "contract") return "contract";
  if (job.contract_time === "part_time") return "parttime";
  return "fulltime";
}

// Scores every job in a single AI call instead of one call per job — up to 10x fewer
// requests through the 3-provider fallback chain for the same search.
async function scoreJobs(
  jobs: AdzunaJob[],
  profile: Profile,
): Promise<{ success: true; scores: z.infer<typeof scoreSchema>["scores"] } | { success: false; error: string }> {
  const systemPrompt = `You are a job matching assistant. Score each job below against the candidate's profile.

Rules:
- matchScore is an integer 0-100 reflecting how well the candidate's skills and experience fit the job.
- matchReason is one short paragraph explaining the score.
- matchedSkills lists skills the candidate has that the job requires.
- missingSkills lists skills the job requires that the candidate lacks.
- Return exactly one score object per job, in the same order as the jobs were given.
- Return ONLY valid JSON matching this shape: { "scores": [{ "matchScore": number, "matchReason": string, "matchedSkills": string[], "missingSkills": string[] }] }`;

  const userPrompt = `CANDIDATE PROFILE:
Current title: ${profile.currentTitle}
Experience: ${profile.yearsExperience} years, level ${profile.experienceLevel}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.workExperience)}

JOBS (score in this exact order):
${jobs.map((job, i) => `${i + 1}. ${job.title} at ${job.company.display_name}\n${job.description}`).join("\n\n")}`;

  const result = await callWithFallback({
    systemPrompt,
    userPrompt,
    schema: scoreSchema,
    temperature: SCORING_TEMPERATURE,
    maxTokens: SCORING_MAX_TOKENS,
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }
  if (result.data.scores.length !== jobs.length) {
    return { success: false, error: "Scoring response length did not match job count" };
  }

  return { success: true, scores: result.data.scores };
}

export async function discoverJobs(
  jobTitle: string,
  country: string,
  profile: Profile,
  runId: string,
  userId: string,
): Promise<{ success: boolean; jobs?: DiscoveredJob[]; error?: string }> {
  try {
    const adzunaJobs = await searchJobs(jobTitle, country);

    if (adzunaJobs.length === 0) {
      return { success: true, jobs: [] };
    }

    const scoring = await scoreJobs(adzunaJobs, profile);
    // AI scoring failing entirely shouldn't discard real search results — save the jobs
    // unscored rather than losing them, and log the scoring failure separately.
    const scores = scoring.success
      ? scoring.scores
      : adzunaJobs.map(() => ({
          matchScore: 0,
          matchReason: "Scoring is temporarily unavailable for this job.",
          matchedSkills: [] as string[],
          missingSkills: [] as string[],
        }));

    if (!scoring.success) {
      await logAgentError(runId, userId, `Job scoring failed: ${scoring.error}`);
    }

    const jobs: DiscoveredJob[] = adzunaJobs.map((job, i) => ({
      source: "search",
      sourceUrl: job.redirect_url,
      externalApplyUrl: job.redirect_url,
      title: job.title,
      company: job.company.display_name,
      location: job.location.display_name,
      salary: formatSalary(job),
      jobType: mapJobType(job),
      aboutRole: job.description,
      matchScore: scores[i].matchScore,
      matchReason: scores[i].matchReason,
      matchedSkills: scores[i].matchedSkills,
      missingSkills: scores[i].missingSkills,
    }));

    return { success: true, jobs };
  } catch (error) {
    await logAgentError(runId, userId, `Adzuna discovery failed: ${String(error)}`);
    return { success: false, error: "Failed to search for jobs. Please try again." };
  }
}
