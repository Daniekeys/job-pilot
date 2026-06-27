import { z } from "zod";

import { callWithFallback } from "@/lib/ai-client";
import type { Profile } from "@/types";

const GENERATION_TEMPERATURE = 0.4;
// Reasoning providers (Groq's gpt-oss-20b) need headroom beyond their visible answer —
// see lib/ai-client.ts's reasoning_effort note. Sized for a summary + up to 3 roles of bullets.
const GENERATION_MAX_TOKENS = 1500;
const BULLETS_PER_ROLE = 4;

const resumeContentSchema = z.object({
  summary: z.string(),
  workExperience: z.array(z.object({ bullets: z.array(z.string()) })),
});

export type ResumeContent = z.infer<typeof resumeContentSchema>;

const SYSTEM_PROMPT = `You are a professional resume writer. Given a candidate's profile, write polished resume content.

Rules:
- Write a professional summary paragraph, 2-3 sentences, highlighting the candidate's title, experience level, and strongest skills.
- For each work experience entry, rewrite its responsibilities into ${BULLETS_PER_ROLE} short, impactful bullet points using strong action verbs.
- Never invent companies, job titles, dates, metrics, or skills not present in the input. Only rephrase what is given — if the input is thin, write fewer or shorter bullets rather than inventing detail.
- workExperience in your response must be the same length and order as the work experience list given to you.
- Return ONLY valid, strict JSON matching this exact shape — no markdown fences, no commentary:
{
  "summary": string,
  "workExperience": [{ "bullets": string[] }]
}`;

function buildUserPrompt(profile: Profile): string {
  const roles = profile.workExperience
    .filter((role) => role.companyName.trim() !== "" || role.jobTitle.trim() !== "")
    .map(
      (role, index) =>
        `${index}. ${role.jobTitle} at ${role.companyName} (${role.startDate} - ${role.isCurrent ? "Present" : role.endDate})\nOriginal responsibilities: ${role.responsibilities || "(none provided)"}`,
    )
    .join("\n\n");

  return `CANDIDATE PROFILE:
Current title: ${profile.currentTitle}
Experience level: ${profile.experienceLevel}
Years of experience: ${profile.yearsExperience}
Skills: ${profile.skills.join(", ")}
Industries: ${profile.industries.join(", ")}

WORK EXPERIENCE (rewrite bullets for each, same order, same count):
${roles || "(none provided)"}`;
}

export async function generateResumeContent(
  profile: Profile,
): Promise<{ success: true; data: ResumeContent } | { success: false; error: string }> {
  const rolesToWrite = profile.workExperience.filter(
    (role) => role.companyName.trim() !== "" || role.jobTitle.trim() !== "",
  );

  const result = await callWithFallback({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: buildUserPrompt(profile),
    schema: resumeContentSchema,
    temperature: GENERATION_TEMPERATURE,
    maxTokens: GENERATION_MAX_TOKENS,
  });

  if (!result.success) {
    return { success: false, error: "Could not generate resume content. Please try again." };
  }

  // Guard against a provider returning a mismatched count despite instructions — pad with
  // a single fallback bullet from the original text rather than dropping a role silently.
  const workExperience =
    result.data.workExperience.length === rolesToWrite.length
      ? result.data.workExperience
      : rolesToWrite.map((role, index) => result.data.workExperience[index] ?? { bullets: [role.responsibilities].filter(Boolean) });

  return { success: true, data: { summary: result.data.summary, workExperience } };
}
