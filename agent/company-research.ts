import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";

import { callWithFallback } from "@/lib/ai-client";
import { logAgentError } from "@/lib/agent-logger";
import type { CompanyDossier, Job, Profile } from "@/types";

// gpt-4o (the model in library-docs.md's original Stagehand pattern) was retired
// Feb 17, 2026 — use the same current OpenAI model the rest of the app standardized on.
const STAGEHAND_MODEL = "gpt-5.4-mini";
const SESSION_TIMEOUT_SECONDS = 120;
const MAX_SUBPAGES = 3;
const SYNTHESIS_TEMPERATURE = 0.4;
// library-docs.md's original 800 (sized by analogy with feature 07's pre-fix figure) truncated
// real responses mid-string — 9 fields including several multi-item bullet arrays needs more
// headroom than a single-paragraph extraction. Confirmed via a live failure: OpenAI's response
// was cut off mid-JSON at the old limit, which surfaces as an "Unterminated string" parse error,
// not something the unescaped-control-char repair pass in lib/ai-client.ts can fix.
const SYNTHESIS_MAX_TOKENS = 2000;
// The prompt here (full homepage + up to 3 sub-page extractions, serialized) is meaningfully
// larger than the prompts that established lib/ai-client.ts's 20s default timeout — give
// providers more room before the fallback chain gives up on them.
const SYNTHESIS_TIMEOUT_MS = 35_000;

const homepageSchema = z.object({
  oneLiner: z.string().describe("What the company does in one sentence"),
  productSummary: z.string().describe("What they build/sell and who it's for"),
  signals: z.array(z.string()).describe("Funding, notable customers, scale, mission, recent news"),
  pageLinks: z
    .array(
      z.object({
        url: z.string(),
        kind: z.enum(["about", "careers", "blog", "engineering", "product", "team", "other"]),
      }),
    )
    .describe("Internal links worth visiting"),
});

const subPageSchema = z.object({
  keyPoints: z.array(z.string()),
  technologies: z.array(z.string()).describe("Specific languages, frameworks, tools, platforms"),
  valuesOrCulture: z.array(z.string()).describe("Stated values, working style, team norms"),
  notable: z.array(z.string()).describe("Customers, funding, scale, projects, awards"),
});

// Same defensive nullable/optional pattern as agent/extractor.ts — providers inconsistently
// omit or null a field instead of returning an empty string/array, and a strict required
// schema fails the entire dossier over one thin field (this is what broke Groq's response).
const nullableString = z.union([z.string(), z.null()]).optional();
const nullableStringArray = z.union([z.array(z.string()), z.null()]).optional();

const dossierSchema = z.object({
  companyOverview: nullableString,
  techStack: nullableStringArray,
  culture: nullableStringArray,
  whyThisRole: nullableString,
  yourEdge: nullableStringArray,
  gapsToAddress: nullableStringArray,
  smartQuestions: nullableStringArray,
  interviewPrep: nullableStringArray,
  sources: nullableStringArray,
});

type HomepageData = z.infer<typeof homepageSchema>;
type SubPageData = z.infer<typeof subPageSchema>;
type RawDossier = z.infer<typeof dossierSchema>;

function normalizeDossier(raw: RawDossier): CompanyDossier {
  return {
    companyOverview: raw.companyOverview ?? "",
    techStack: raw.techStack ?? [],
    culture: raw.culture ?? [],
    whyThisRole: raw.whyThisRole ?? "",
    yourEdge: raw.yourEdge ?? [],
    gapsToAddress: raw.gapsToAddress ?? [],
    smartQuestions: raw.smartQuestions ?? [],
    interviewPrep: raw.interviewPrep ?? [],
    sources: raw.sources ?? [],
  };
}

type ResearchResult = { success: true; data: CompanyDossier } | { success: false; error: string };

export async function deriveHomepageUrl(redirectUrl: string, company: string): Promise<string> {
  try {
    const response = await fetch(redirectUrl, { redirect: "follow" });
    const hostname = new URL(response.url).hostname;
    if (!hostname.includes("adzuna.com")) {
      const parts = hostname.split(".");
      const rootDomain = parts.length > 2 ? parts.slice(-2).join(".") : hostname;
      return `https://${rootDomain}`;
    }
  } catch {
    // fall through to the company-name fallback below
  }
  const slug = company.toLowerCase().replace(/[^a-z0-9]/g, "");
  return `https://www.${slug}.com`;
}

// Prefer about/blog/engineering/product pages over careers — careers pages rarely
// add anything beyond what the job posting itself already says.
function rankSubPageLinks(pageLinks: HomepageData["pageLinks"]): HomepageData["pageLinks"] {
  return [...pageLinks]
    .sort((a, b) => Number(a.kind === "careers") - Number(b.kind === "careers"))
    .slice(0, MAX_SUBPAGES);
}

const SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role.
You are given (a) research collected from the company's own website, (b) the job posting,
and (c) the candidate's profile. Produce a concise, concrete briefing that gives this
specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent
  funding, customers, headcount, or facts. If research was thin, infer carefully from
  the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this
  company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly
  and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind
  of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid, strict JSON matching this exact shape — no markdown fences, no commentary,
and no raw line breaks inside string values (escape any line break as \\n). If you have
nothing for a field, return "" for strings or [] for arrays — never omit the key:
{
  "companyOverview": string,
  "techStack": string[],
  "culture": string[],
  "whyThisRole": string,
  "yourEdge": string[],
  "gapsToAddress": string[],
  "smartQuestions": string[],
  "interviewPrep": string[],
  "sources": string[]
}`;

function buildUserPrompt(
  homepageData: HomepageData | null,
  subPageData: SubPageData[],
  job: Job,
  profile: Profile,
): string {
  return `COMPANY RESEARCH (from their website): ${JSON.stringify({ homepage: homepageData, subPages: subPageData })}

JOB POSTING:
Title: ${job.title}
Company: ${job.company}
Description: ${job.aboutRole}
Matched skills (already computed): ${job.matchedSkills.join(", ")}
Missing skills (already computed): ${job.missingSkills.join(", ")}

CANDIDATE PROFILE:
Current title: ${profile.currentTitle}
Experience: ${profile.yearsExperience} years, level ${profile.experienceLevel}
Skills: ${profile.skills.join(", ")}
Work history: ${JSON.stringify(profile.workExperience)}`;
}

async function browseCompanySite(
  homepageUrl: string,
  runId: string | null,
  userId: string,
  jobId: string,
): Promise<{ homepageData: HomepageData | null; subPageData: SubPageData[] }> {
  let stagehand: Stagehand | null = null;
  let homepageData: HomepageData | null = null;
  const subPageData: SubPageData[] = [];

  try {
    stagehand = new Stagehand({
      env: "BROWSERBASE",
      apiKey: process.env.BROWSERBASE_API_KEY!,
      browserbaseSessionCreateParams: {
        projectId: process.env.BROWSERBASE_PROJECT_ID!,
        timeout: SESSION_TIMEOUT_SECONDS,
      },
      model: { modelName: STAGEHAND_MODEL, apiKey: process.env.OPENAI_API_KEY },
      disablePino: true,
    });
    await stagehand.init();

    const page = stagehand.context.activePage();
    if (!page) {
      throw new Error("Stagehand has no active page after init");
    }

    await page.goto(homepageUrl, { waitUntil: "domcontentloaded" });
    homepageData = await stagehand.extract(
      "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
      homepageSchema,
    );

    if (!homepageData.oneLiner && !homepageData.productSummary) {
      return { homepageData: null, subPageData: [] };
    }

    for (const link of rankSubPageLinks(homepageData.pageLinks)) {
      try {
        await page.goto(link.url, { waitUntil: "domcontentloaded" });
        const data = await stagehand.extract(
          "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
          subPageSchema,
        );
        subPageData.push(data);
      } catch (error) {
        await logAgentError(runId, userId, `Sub-page extraction failed for ${link.url}: ${String(error)}`, jobId);
      }
    }
  } catch (error) {
    await logAgentError(runId, userId, `Company website research failed: ${String(error)}`, jobId);
    homepageData = null;
  } finally {
    if (stagehand) {
      try {
        await stagehand.close();
      } catch (error) {
        await logAgentError(runId, userId, `Failed to close Browserbase session: ${String(error)}`, jobId);
      }
    }
  }

  return { homepageData, subPageData };
}

export async function researchCompany(job: Job, profile: Profile, userId: string): Promise<ResearchResult> {
  try {
    const homepageUrl = await deriveHomepageUrl(job.sourceUrl, job.company);
    const { homepageData, subPageData } = await browseCompanySite(homepageUrl, job.runId, userId, job.id);

    const synthesis = await callWithFallback({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(homepageData, subPageData, job, profile),
      schema: dossierSchema,
      temperature: SYNTHESIS_TEMPERATURE,
      maxTokens: SYNTHESIS_MAX_TOKENS,
      timeoutMs: SYNTHESIS_TIMEOUT_MS,
    });

    if (!synthesis.success) {
      await logAgentError(job.runId, userId, `Company research synthesis failed: ${synthesis.error}`, job.id);
      return { success: false, error: "Could not generate a company research briefing. Please try again." };
    }

    return { success: true, data: normalizeDossier(synthesis.data) };
  } catch (error) {
    await logAgentError(job.runId, userId, `Company research failed: ${String(error)}`, job.id);
    return { success: false, error: "Company research failed. Please try again." };
  }
}
