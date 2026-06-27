import { z } from "zod";

import { callWithFallback } from "@/lib/ai-client";
import type { Profile } from "@/types";

const EXTRACTION_TEMPERATURE = 0.3;
// library-docs.md's original 800 was sized for gpt-4o, a non-reasoning model. Groq's
// gpt-oss-20b spends part of its budget on hidden reasoning tokens before the visible
// answer, so this needs more headroom or reasoning-capable providers return empty content.
const EXTRACTION_MAX_TOKENS = 2000;
const MAX_WORK_EXPERIENCE_ROLES = 3;

const nullableString = z.union([z.string(), z.null()]).optional();
const nullableStringArray = z.union([z.array(z.string()), z.null()]).optional();

const workExperienceSchema = z.object({
  companyName: nullableString,
  jobTitle: nullableString,
  startDate: nullableString,
  endDate: nullableString,
  isCurrent: z.union([z.boolean(), z.null()]).optional(),
  responsibilities: nullableString,
});

const educationSchema = z.object({
  highestDegree: nullableString,
  fieldOfStudy: nullableString,
  institutionName: nullableString,
  graduationYear: nullableString,
});

const extractedProfileSchema = z.object({
  fullName: nullableString,
  phone: nullableString,
  location: nullableString,
  linkedinUrl: nullableString,
  portfolioUrl: nullableString,
  workAuthorization: z.union([z.enum(["citizen", "permanent_resident", "visa_required"]), z.literal(""), z.null()]).optional(),
  currentTitle: nullableString,
  experienceLevel: z.union([z.enum(["junior", "mid", "senior", "lead"]), z.literal(""), z.null()]).optional(),
  yearsExperience: z.union([z.number(), z.null()]).optional(),
  skills: nullableStringArray,
  industries: nullableStringArray,
  workExperience: z.union([z.array(workExperienceSchema), z.null()]).optional(),
  education: z.union([educationSchema, z.null()]).optional(),
  jobTitlesSeeking: nullableStringArray,
  remotePreference: z.union([z.enum(["remote", "onsite", "hybrid", "any"]), z.literal(""), z.null()]).optional(),
  salaryExpectation: nullableString,
  preferredLocations: nullableStringArray,
});

type ExtractedProfile = z.infer<typeof extractedProfileSchema>;

const SYSTEM_PROMPT = `You are a resume parser. Extract only what is explicitly stated in the resume text below into the given JSON shape.

Rules:
- Never invent or guess a value that isn't explicitly present in the text.
- If a field isn't present in the resume, return "" for strings, [] for arrays, or null for the number — never a placeholder.
- workAuthorization, remotePreference, salaryExpectation, preferredLocations, and jobTitlesSeeking are rarely stated on a resume — only fill them if explicitly stated, otherwise leave them empty.
- workExperience holds at most ${MAX_WORK_EXPERIENCE_ROLES} roles — pick the most recent ones if there are more.
- education holds only the single highest degree found.
- Return ONLY valid, strict JSON matching this exact shape — no markdown fences, no commentary, and no raw line breaks inside string values (escape any line break as \\n):
{
  "fullName": string, "phone": string, "location": string, "linkedinUrl": string, "portfolioUrl": string,
  "workAuthorization": "citizen" | "permanent_resident" | "visa_required" | "",
  "currentTitle": string,
  "experienceLevel": "junior" | "mid" | "senior" | "lead" | "",
  "yearsExperience": number | null,
  "skills": string[], "industries": string[],
  "workExperience": [{ "companyName": string, "jobTitle": string, "startDate": string, "endDate": string, "isCurrent": boolean, "responsibilities": string }],
  "education": { "highestDegree": string, "fieldOfStudy": string, "institutionName": string, "graduationYear": string },
  "jobTitlesSeeking": string[],
  "remotePreference": "remote" | "onsite" | "hybrid" | "any" | "",
  "salaryExpectation": string,
  "preferredLocations": string[]
}`;

function mapToProfilePartial(extracted: ExtractedProfile): Partial<Profile> {
  return {
    fullName: extracted.fullName ?? "",
    phone: extracted.phone ?? "",
    location: extracted.location ?? "",
    linkedinUrl: extracted.linkedinUrl ?? "",
    portfolioUrl: extracted.portfolioUrl ?? "",
    workAuthorization: extracted.workAuthorization ?? "",
    currentTitle: extracted.currentTitle ?? "",
    experienceLevel: extracted.experienceLevel ?? "",
    yearsExperience: extracted.yearsExperience ?? "",
    skills: extracted.skills ?? [],
    industries: extracted.industries ?? [],
    workExperience: (extracted.workExperience ?? []).slice(0, MAX_WORK_EXPERIENCE_ROLES).map((role) => ({
      companyName: role.companyName ?? "",
      jobTitle: role.jobTitle ?? "",
      startDate: role.startDate ?? "",
      endDate: role.endDate ?? "",
      isCurrent: role.isCurrent ?? false,
      responsibilities: role.responsibilities ?? "",
    })),
    education: {
      highestDegree: extracted.education?.highestDegree ?? "",
      fieldOfStudy: extracted.education?.fieldOfStudy ?? "",
      institutionName: extracted.education?.institutionName ?? "",
      graduationYear: extracted.education?.graduationYear ?? "",
    },
    jobTitlesSeeking: (extracted.jobTitlesSeeking ?? []).join(", "),
    remotePreference: extracted.remotePreference ?? "",
    salaryExpectation: extracted.salaryExpectation ?? "",
    preferredLocations: (extracted.preferredLocations ?? []).join(", "),
  };
}

export async function extractProfileFromResume(
  resumeText: string,
): Promise<{ success: true; data: Partial<Profile> } | { success: false; error: string }> {
  const result = await callWithFallback({
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `RESUME TEXT:\n${resumeText}`,
    schema: extractedProfileSchema,
    temperature: EXTRACTION_TEMPERATURE,
    maxTokens: EXTRACTION_MAX_TOKENS,
  });

  if (!result.success) {
    return { success: false, error: "Could not extract profile details from this resume. Please fill in the fields manually." };
  }

  return { success: true, data: mapToProfilePartial(result.data) };
}
