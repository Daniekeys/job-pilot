# Library Docs

Project-specific usage patterns for every third party library in this project. This file only covers how we use each library in this specific project — rules, patterns, and constraints specific to JobPilot.

Read the relevant section before implementing any feature that touches these libraries.

---

## Before Using Any Library

Before implementing any feature that uses a third party library:

1. **Check AGENTS.md** at the project root — it lists every skill installed for this project and how to use them. Skills contain up-to-date API documentation, usage patterns, and best practices specific to this codebase.

2. **Check if an MCP server is configured** for that library. Some tools have MCP servers that give the AI agent direct access to documentation, logs, and debugging tools. If an MCP server is available — use it before falling back to general knowledge.

3. **Read this file** for project-specific patterns that override general library knowledge.

The order of authority is:

```
MCP server (real-time docs) → Skills via AGENTS.md → This file (project rules) → General training knowledge
```

Never rely on general training knowledge alone for library APIs — they change frequently and training data may be outdated.

---

## InsForge

**Check first:** Check AGENTS.md for an installed InsForge skill. If an InsForge MCP server is configured — use it. The skill/MCP will have the latest API patterns.

### Client vs Server

Two separate instances — never mix them:

```typescript
// lib/insforge-client.ts — browser context only
import { createBrowserClient } from "@insforge/ssr";

export const insforge = createBrowserClient(
  process.env.NEXT_PUBLIC_INSFORGE_URL!,
  process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
);
```

```typescript
// lib/insforge-server.ts — server context only
import { createServerClient } from "@insforge/ssr";
import { cookies } from "next/headers";

export const createInsforgeServer = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_INSFORGE_URL!,
    process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
};
```

**Rules:**

- Browser client — Client Components, browser-side auth state, realtime subscriptions
- Server client — Server Components, API routes, Server Actions, agent functions
- Never use browser client in server context
- Never use server client in browser context

---

### Auth

```typescript
// Get current user in server context
const insforge = await createInsforgeServer();
const {
  data: { user },
  error,
} = await insforge.auth.getUser();
if (!user) redirect("/login");
```

---

### DB Queries

```typescript
// Read
const { data, error } = await insforge
  .from("jobs")
  .select("*")
  .eq("user_id", user.id)
  .order("found_at", { ascending: false });

// Insert
const { data, error } = await insforge
  .from("jobs")
  .insert({ user_id: user.id, title, company, match_score })
  .select()
  .single();

// Update
const { error } = await insforge
  .from("jobs")
  .update({ company_research: dossier })
  .eq("id", jobId)
  .eq("user_id", user.id); // always scope to user
```

**Rules:**

- Always scope queries to `user_id` — never query without user filter
- Always handle the `error` return — never assume success
- Use `.single()` when expecting exactly one row

---

### Storage

The installed `@insforge/sdk` has no `contentType`/`upsert` options and `upload()` takes only `(path, file: File | Blob)` — not a raw `Buffer`. The `resumes` bucket is private (architecture.md's deliberate choice), so there's no `getPublicUrl()` for it; mint a signed URL instead.

```typescript
// Upload file (manual upsert — remove then upload, since there's no upsert flag)
const bucket = insforge.storage.from("resumes");
await bucket.remove(`${userId}/resume.pdf`);
const { data, error } = await bucket.upload(`${userId}/resume.pdf`, fileOrBlob);

// Private bucket — mint a signed URL for browser access, never getPublicUrl
const { data: signed } = await bucket.createSignedUrl(
  `${userId}/resume.pdf`,
  60 * 60 * 24,
); // 24h TTL
const url = signed?.signedUrl;
```

**Storage paths:**

- Base resume: `resumes/{user_id}/resume.pdf`

**Rules:**

- Always upsert manually (`remove()` then `upload()`) for base resume uploads — overwrites existing file
- Save the storage PATH to the DB after upload, never a URL — `resumes` is private, so the path must be re-signed via `createSignedUrl()` on every read
- Never write files to disk — always upload a `File`/`Blob` directly to storage

---

## Adzuna API

**Check first:** Check AGENTS.md for an installed Adzuna skill. If none exists — use this file and the official Adzuna API docs.

### Job Search

```typescript
// lib/adzuna.ts
// Location is country-only (a closed dropdown, not free text) — Adzuna's `where` expects a
// real geocodable place and has no "remote" support (confirmed against their docs), so this
// app no longer attempts city/region-level `where` filtering at all, only the country itself.
//
// Adzuna's `category` param accepts exactly one tag per request — there is no comma-separated
// multi-category syntax. To cover both IT and design roles, ADZUNA_CATEGORIES (["it-jobs",
// "creative-design-jobs"]) is queried in parallel per search and the results are merged/deduped
// by job id. Category requests are wrapped in Promise.allSettled so one failing category does not
// fail the whole search, and scoring is batched in chunks of 10 jobs to stay within provider limits.
export async function searchJobs(
  jobTitle: string,
  country: string,
): Promise<AdzunaJob[]> {
  const resultsByCategory = await Promise.allSettled(
    ADZUNA_CATEGORIES.map((category) => {
      const params = new URLSearchParams({
        app_id: process.env.ADZUNA_APP_ID!,
        app_key: process.env.ADZUNA_APP_KEY!,
        what: jobTitle,
        category,
        results_per_page: "5", // 5 per category × 2 categories = same total budget as the old single-category "10"
        "content-type": "application/json",
      });
      return fetch(
        `https://api.adzuna.com/v1/api/jobs/${country}/search/1?${params}`,
      ).then((res) => {
        if (!res.ok) throw new Error(`Adzuna API error: ${res.status}`);
        return res.json();
      });
    }),
  );

  const seen = new Map<string, AdzunaJob>();
  let fulfilledCount = 0;
  for (const result of resultsByCategory) {
    if (result.status === "fulfilled") {
      fulfilledCount += 1;
      for (const job of result.value.results ?? []) {
        seen.set(job.id, job);
      }
    }
  }
  if (fulfilledCount === 0) {
    throw new Error("All Adzuna category requests failed");
  }
  return [...seen.values()];
}
```

### Response Shape

Each Adzuna job result contains:

```typescript
type AdzunaJob = {
  id: string;
  title: string;
  company: { display_name: string };
  location: { display_name: string };
  description: string; // snippet only — not full description
  redirect_url: string; // Adzuna tracking URL → redirects to actual job
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted: "0" | "1"; // "1" means salary is estimated
  contract_type?: string;
  created: string; // ISO date string
  category: { tag: string; label: string };
};
```

### Saving Jobs to DB

```typescript
// Map Adzuna result to jobs table
const jobRecord = {
  user_id: userId,
  run_id: runId,
  source: "search", // always 'search' for Adzuna jobs
  source_url: job.redirect_url,
  external_apply_url: job.redirect_url,
  title: job.title,
  company: job.company.display_name,
  location: job.location.display_name,
  salary: job.salary_min
    ? `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max! / 1000)}k`
    : null,
  job_type: mapJobType(job), // NEVER job.contract_type directly — see Rules below
  about_role: job.description, // Adzuna returns snippet — used as description
  match_score: scoredJob.matchScore,
  match_reason: scoredJob.matchReason,
  matched_skills: scoredJob.matchedSkills,
  missing_skills: scoredJob.missingSkills,
  found_at: new Date().toISOString(),
};
```

**Rules:**

- **Search `ADZUNA_CATEGORIES` (`it-jobs` + `creative-design-jobs`), never a single hardcoded category.** Originally locked to `it-jobs` only per project-overview.md, but real usage showed tech-adjacent titles (UI/UX Designer, Product Designer) are filed under Adzuna's separate "Creative & Design Jobs" category, not IT — searching IT-only for "uiux" returned an unrelated Software Engineer posting that merely mentioned the term, because `category=it-jobs` filtered out every genuine design posting before the keyword search even ran. Developer explicitly chose to widen scope rather than just improve the no-results messaging.
- **`job_type` must go through `mapJobType()` (`agent/adzuna.ts`), never `job.contract_type` raw.** `jobs.job_type`'s CHECK constraint only allows `'fulltime' | 'parttime' | 'contract'`, but Adzuna's actual values are `contract_type: "permanent" | "contract"` and `contract_time: "full_time" | "part_time"` — passing `contract_type` straight through previously violated the constraint on every insert (`23514` error) whenever Adzuna returned `"permanent"`.
- **No `where`/free-text location filtering at all** — confirmed against Adzuna's own docs that `where` only accepts real geocodable places (their example: `"london"`) with no "remote"/"anywhere" support. Location is therefore a closed **country dropdown** (`ADZUNA_COUNTRIES` in `lib/utils.ts`), not a text field — `searchJobs(jobTitle, country)` only ever sets the country in the URL path, never a `where` param.
- `source` is always `'search'` for Adzuna jobs — never any other value
- `salary_is_predicted: "1"` means Adzuna estimated the salary — this is normal
- Adzuna description is a snippet — the 3-provider fallback chain (`lib/ai-client.ts`) scores from it, not a full description
- **Adzuna supports exactly 12 countries**: `gb`, `us`, `de`, `fr`, `au`, `nz`, `ca`, `in`, `pl`, `br`, `at`, `za` (`ADZUNA_COUNTRIES` in `lib/utils.ts` is the single source of truth — both the `SearchControls` dropdown and `app/api/agent/find/route.ts` import from it). `lib/adzuna.ts`'s `detectCountry()` keyword-matches free text to one of the 12 and is only used for the profile-fallback path (when the user leaves the dropdown on "Use my profile" and `profile.preferredLocations` needs to be mapped to a country) — never for direct user input, since the dropdown is already constrained to valid codes.

---

## Browserbase

**Check first:** Check AGENTS.md for an installed Browserbase skill. If a Browserbase MCP server is configured — use it. The skill/MCP will have the latest session management and API patterns.

**No direct `@browserbasehq/sdk` calls or `lib/browserbase.ts` client exist in this project.** The installed Stagehand v3 (`@browserbasehq/stagehand`) creates and owns its own Browserbase session internally via `browserbaseSessionCreateParams` — there's no separate "create a session via the Browserbase SDK, then hand its id to Stagehand" step needed (that two-step pattern was specific to older Stagehand versions). `@browserbasehq/sdk` is still an installed dependency (Stagehand's own types reference it), just not imported directly anywhere in app code. See the Stagehand section below for the actual session-creation pattern used (`agent/company-research.ts`).

**The `POST /api/agent/research` route awaits the full Stagehand session synchronously** — `stagehand.init()`, every `extract()` call, and `stagehand.close()` all happen inside the request handler before it responds, not as a fire-and-forget background trigger. The client-side "Researching..." pending state (see `components/job-details/CompanyResearch.tsx`) exists because the request can take up to the full session timeout.

**Rules:**

- Always use single sessions — never parallel sessions (free plan limit)
- Session timeout is 120 seconds — sufficient for 3-4 page visits
- Always end sessions cleanly — call `stagehand.close()` in a `finally` block when done
- Project ID always from `process.env.BROWSERBASE_PROJECT_ID` — never hardcode

---

## Stagehand

**Check first:** Check AGENTS.md for an installed Stagehand skill. If a Stagehand MCP server is configured — use it. The skill/MCP will have the latest act() and extract() patterns.

**Installed version: 3.6.0 (v3).** This is a major-version jump from the object-argument API older docs/training data describe — confirmed by reading the installed package's own `.d.ts` files (`node_modules/@browserbasehq/stagehand/dist/esm/lib/v3/`) before writing any code, per AGENTS.md's "this is not the library you know" rule. `extract()`/`act()` take **positional** arguments now, not `{ instruction, schema }` objects, and the exported `Stagehand` class is an alias for an internal `V3` class. There is no separate "create a Browserbase session, then pass its id to Stagehand" step needed — `browserbaseSessionCreateParams` lets Stagehand create and own its session internally.

### Initialisation

```typescript
import { Stagehand } from "@browserbasehq/stagehand";

const stagehand = new Stagehand({
  env: "BROWSERBASE",
  apiKey: process.env.BROWSERBASE_API_KEY!,
  browserbaseSessionCreateParams: {
    projectId: process.env.BROWSERBASE_PROJECT_ID!,
    timeout: 120, // seconds — sufficient for 3-4 page visits
  },
  // gpt-4o is retired (Feb 17, 2026) — use the same current OpenAI model the
  // rest of the app standardized on (see lib/ai-client.ts's PROVIDERS).
  model: { modelName: "gpt-5.4-mini", apiKey: process.env.OPENAI_API_KEY },
  disablePino: true,
});

await stagehand.init();
const page = stagehand.context.activePage();
if (!page) throw new Error("Stagehand has no active page after init");
await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
```

### extract()

Positional: `extract(instruction: string, schema: ZodType, options?)`. Navigate with `page.goto()` first — `extract()` reads whatever page is currently active, it does not navigate itself.

```typescript
import { z } from "zod";

const result = await stagehand.extract(
  "Extract the company overview, main product description, and any technology mentions from this page.",
  z.object({
    companyOverview: z.string().optional(),
    mainProduct: z.string().optional(),
    techMentions: z.array(z.string()).optional(),
    navLinks: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .optional(),
  }),
);
```

### act()

Also positional: `act(instruction: string, options?)`.

```typescript
// Always wrap in try/catch
try {
  await stagehand.act("Click the About link in the navigation");
} catch (error) {
  await logAgentError(runId, userId, `act() failed: ${String(error)}`, jobId);
}
```

### Company Research Pattern

Three-step process: homepage extraction → sub-page extraction → AI synthesis.
Job description and user profile come from DB — never re-fetch what you already have.
Browser's only job is the company website. Real implementation: `agent/company-research.ts`.

```typescript
// Step 1 — Homepage extraction
const homepageData = await stagehand.extract(
  "This is a company's homepage. Capture what the company actually does, who it's for, and any concrete signals (funding, customers, scale, mission, recent launches). Then find the internal links most worth visiting to research them as an employer.",
  z.object({
    oneLiner: z.string().describe("What the company does in one sentence"),
    productSummary: z
      .string()
      .describe("What they build/sell and who it's for"),
    signals: z
      .array(z.string())
      .describe("Funding, notable customers, scale, mission, recent news"),
    pageLinks: z
      .array(
        z.object({
          url: z.string(),
          kind: z.enum([
            "about",
            "careers",
            "blog",
            "engineering",
            "product",
            "team",
            "other",
          ]),
        }),
      )
      .describe("Internal links worth visiting"),
  }),
);

// If oneLiner and productSummary are empty — wrong site or parked domain.
// Skip sub-pages, proceed to synthesis with job description and profile only.
if (!homepageData.oneLiner && !homepageData.productSummary) {
  // proceed to synthesis with homepageData treated as null
}

// Step 2 — Sub-page extraction (max 3, prefer about/blog/engineering/product over careers).
// Navigate first, then extract — extract() always reads the current page.
await page.goto(link.url, { waitUntil: "domcontentloaded" });
const subPageData = await stagehand.extract(
  "Extract substance that helps a candidate understand this company before applying: what they do, their values and how they work, the specific technologies and tools they use, notable projects or customers, and how the team operates. Ignore nav, footers, cookie banners, and generic marketing copy.",
  z.object({
    keyPoints: z.array(z.string()),
    technologies: z
      .array(z.string())
      .describe("Specific languages, frameworks, tools, platforms"),
    valuesOrCulture: z
      .array(z.string())
      .describe("Stated values, working style, team norms"),
    notable: z
      .array(z.string())
      .describe("Customers, funding, scale, projects, awards"),
  }),
);

// Step 3 — AI synthesis (after the Browserbase session is closed). Goes through the
// shared 3-provider fallback chain (lib/ai-client.ts's callWithFallback()), not a raw
// OpenAI call — built as shared infra in feature 07 specifically so company research
// could reuse it. Feeds three data sources: company research + job from DB + profile from DB.
const SYSTEM_PROMPT = `You are a sharp career strategist preparing a candidate to apply for a specific role. You are given (a) research collected from the company's own website, (b) the job posting, and (c) the candidate's profile. Produce a concise, concrete briefing that gives this specific candidate an edge for this specific role.

Rules:
- Ground every company claim in the provided research or job posting. Never invent funding, customers, headcount, or facts. If research was thin, infer carefully from the job posting and say what's inferred.
- Be specific to THIS candidate. Connect their actual skills and past work to this company's stack, product, and values. No generic advice that would apply to anyone.
- Turn the candidate's missing skills into a strategy: how to frame the gap honestly and what adjacent experience to lean on.
- Talking points and questions must reference real things from the research, the kind of detail that signals the candidate did their homework.
- Keep every item tight: one or two sentences. No fluff.

Return ONLY valid, strict JSON matching this exact shape — no markdown fences, no commentary,
and no raw line breaks inside string values (escape any line break as \\n). If you have
nothing for a field, return "" for strings or [] for arrays — never omit the key:
{
  "companyOverview": string, "techStack": string[], "culture": string[], "whyThisRole": string,
  "yourEdge": string[], "gapsToAddress": string[], "smartQuestions": string[],
  "interviewPrep": string[], "sources": string[]
}`;

const result = await callWithFallback({
  systemPrompt: SYSTEM_PROMPT,
  userPrompt: `COMPANY RESEARCH (from their website): ${JSON.stringify({ homepage: homepageData, subPages: subPageData })}

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
Work history: ${JSON.stringify(profile.workExperience)}`,
  schema: dossierSchema, // Zod schema — fields are nullable/optional (see Rules), never strict-required
  temperature: 0.4,
  maxTokens: 2000, // 800 truncated real responses mid-JSON — see Rules
  timeoutMs: 35_000, // this prompt is bigger than the 20s default was tuned for
});
```

**Dossier fields:**

| Field           | Type     | Purpose                                             |
| --------------- | -------- | --------------------------------------------------- |
| companyOverview | string   | What the company does                               |
| techStack       | string[] | Technologies they use                               |
| culture         | string[] | Values and working style                            |
| whyThisRole     | string   | Why this role exists                                |
| yourEdge        | string[] | Specific links between THIS candidate and this role |
| gapsToAddress   | string[] | Missing skills reframed as strategy                 |
| smartQuestions  | string[] | Questions that show real research                   |
| interviewPrep   | string[] | Topics to prepare for this role                     |
| sources         | string[] | Pages the company info came from                    |

**Rules:**

- Always use `extract(instruction, schema)` (positional, v3 API) — never parse raw HTML or use regex
- Always wrap every `act()` and `extract()` in try/catch, logging via `logAgentError(runId, userId, message, jobId)` — `runId` may be `null` (`agent_logs.run_id` is nullable; company research logs against the job's own `run_id`, not a new agent run)
- Always call `await stagehand.close()` in a `finally` block — ends the Browserbase session even if research throws
- Stagehand's own extraction model is `gpt-5.4-mini` (gpt-4o is retired) — synthesis goes through `callWithFallback()`, never a raw OpenAI call
- **The synthesis `systemPrompt` must spell out the exact JSON shape** (field names + types), same as `agent/extractor.ts` — "Return ONLY valid JSON" with no shape produces inconsistent field names/verbosity across providers. Confirmed via a live failure where all 3 providers failed (truncated/malformed JSON, schema mismatch) with no shape given.
- `dossierSchema`'s fields are nullable/optional (`nullableString`/`nullableStringArray`, same pattern as `extractor.ts`), never strict-required — normalize nulls to `""`/`[]` before saving. A provider omitting one thin field shouldn't fail the whole dossier.
- `maxTokens: 2000`, not `800` — 9 fields with several bullet arrays needs more headroom than a single-paragraph extraction; 800 truncated real responses mid-JSON.
- Temperature is `0.4` for synthesis — grounded but flexible enough to make real connections
- Max 3 sub-pages — never exceed this on free plan
- Job description and profile always come from DB — never re-fetch via browser
- If browser research returns empty — still run synthesis with job + profile only
- yourEdge, gapsToAddress, and smartQuestions are the most valuable fields — never skip them

## OpenAI GPT-4o

**Check first:** Check AGENTS.md for an installed OpenAI skill. The skill will have the latest API patterns and model capabilities.

### Structured JSON Response

```typescript
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

const response = await openai.chat.completions.create({
  model: "gpt-4o",
  response_format: { type: "json_object" },
  temperature: 0.3,
  messages: [
    {
      role: "system",
      content: "You are a job matching assistant. Return only valid JSON.",
    },
    {
      role: "user",
      content: `Your prompt here`,
    },
  ],
});

const result = JSON.parse(response.choices[0].message.content!);
```

**Temperature settings:**

- `0.3` — matching, scoring, extraction, research synthesis — deterministic results
- `0.7` — resume generation — natural variation

**Max tokens:**

- Job matching + scoring: `300`
- Company research synthesis: `2000` (was `800` — truncated real responses; see Stagehand section)
- Resume generation: `1000`
- Profile extraction from resume: `800`

**Rules:**

- Model string is always `'gpt-4o'` — never use other model names
- Always use `response_format: { type: 'json_object' }` for structured data
- Always parse `response.choices[0].message.content` as string — even with json_object it returns a string
- Always validate parsed JSON before using — wrap in try/catch
- Match threshold is always `MATCH_THRESHOLD` from `lib/utils.ts` — never hardcode 70
- Company research synthesis must always return a complete dossier — never return empty even if browser research failed

---

## PostHog

**Check first:** Check AGENTS.md for an installed PostHog skill. If a PostHog MCP server is configured — use it. The skill/MCP will have the latest client and server patterns.

### Client Setup (Browser)

```typescript
// lib/posthog-client.ts
import posthog from "posthog-js";

export function initPostHog() {
  if (typeof window !== "undefined") {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
      capture_pageview: false, // manual pageview tracking
    });
  }
}

// Capture event client-side
posthog.capture("job_found", {
  userId,
  source: "search",
  matchScore: score,
});
```

### Server Setup

```typescript
// lib/posthog-server.ts
import { PostHog } from "posthog-node";

export const createPostHogServer = () =>
  new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST!,
    flushAt: 1, // send immediately
    flushInterval: 0, // no batching — Next.js functions are short-lived
  });

// Always use and shutdown in the same function
const posthog = createPostHogServer();
posthog.capture({
  distinctId: userId,
  event: "company_researched",
  properties: { userId, jobId, company },
});
await posthog.shutdown(); // required — ensures event is sent
```

**Rules:**

- Always call `await posthog.shutdown()` in server-side functions — events are lost without it
- `flushAt: 1` and `flushInterval: 0` always set on server client
- Event names must match exactly the list in `code-standards.md`
- Always include `userId` as a property on every server-side event
- Call `posthog.identify(userId)` after login on client side
- Call `posthog.reset()` on logout on client side

---

## @react-pdf/renderer

**Check first:** Check AGENTS.md for an installed react-pdf skill. PDF generation APIs can differ from general training knowledge.

**Installed version:** 4.5.1. No Turbopack bundling issues found (unlike `pdf-parse`) — no `serverExternalPackages` entry needed.

### Resume PDF Generation

`renderToBuffer`'s TypeScript signature requires the literal `React.ReactElement<DocumentProps>` returned by `<Document>` — passing a wrapper component element (`<ResumePDF profile={profile} />` as JSX, or via `createElement`) fails to type-check, since the wrapper's own props aren't `DocumentProps`. Call the template as a plain function instead so the call expression's type is the `<Document>` element it returns:

```typescript
// agent/resume-pdf.tsx
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  section: { marginBottom: 10 },
  heading: { fontSize: 14, fontWeight: 'bold' },
  text: { fontSize: 10 },
})

export function ResumePDF({ profile }: { profile: Profile }) {
  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.heading}>{profile.fullName}</Text>
          <Text style={styles.text}>{profile.email}</Text>
        </View>
      </Page>
    </Document>
  )
}
```

```typescript
// app/api/resume/generate/route.ts (.ts, not .tsx — call the template as a function, no JSX needed here)
import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/agent/resume-pdf";

const buffer = await renderToBuffer(ResumePDF({ profile }));

// resumes is a PRIVATE bucket — upload() takes File | Blob, not a raw Buffer, and has
// no contentType/upsert options. Buffer.buffer is typed ArrayBufferLike (may be a
// SharedArrayBuffer), so wrap in a fresh Uint8Array first to satisfy BlobPart.
const path = `${userId}/resume.pdf`;
const bucket = insforge.storage.from("resumes");
await bucket.remove(path); // manual upsert — see InsForge Storage section above
const { data, error } = await bucket.upload(
  path,
  new Blob([new Uint8Array(buffer)], { type: "application/pdf" }),
);

// Save the STORAGE PATH to the DB, not a URL — resumes is private, so callers must mint
// a signed URL via bucket.createSignedUrl(path, ttlSeconds) on every read, never getPublicUrl.
await insforge.database
  .from("profiles")
  .update({ resume_pdf_url: path })
  .eq("id", userId);
```

**Supported CSS properties:**
Only use these — others are silently ignored:
`padding, margin, fontSize, color, fontFamily, flexDirection, alignItems, justifyContent, borderRadius, width, height, fontWeight, textAlign, lineHeight`

**Rules:**

- Server-side only — never import in client components
- Always use `renderToBuffer` — not `renderToStream` or `PDFDownloadLink`
- PDF generation only in `app/api/resume/` routes — the React-PDF template itself lives in `agent/` (it's part of the resume generation pipeline, not a UI component)
- Generated buffer uploaded directly to InsForge Storage — never written to disk
- `resume_pdf_url` always stores the storage path, never a URL — see the InsForge Storage rules above (same private-bucket constraint as the uploaded-resume flow)

---

## pdf-parse

**Check first:** Check AGENTS.md for an installed pdf-parse skill.

### Extract Text from Uploaded Resume

```typescript
import pdf from "pdf-parse";

// In API route handling resume upload
export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("resume") as File;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const pdfData = await pdf(buffer);
  const extractedText = pdfData.text; // raw text content

  // Send to GPT-4o for structured extraction
}
```

**Rules:**

- Server-side only — never import in client components
- `pdfData.text` is raw unformatted text — GPT-4o handles the structure extraction
- Always handle parse errors — some PDFs are image-based and return empty text
- If `pdfData.text` is empty or very short — return error to user: "Could not extract text from this PDF. Please try a different file."

---

## Recharts

**Check first:** Check AGENTS.md for an installed Recharts skill. No MCP server configured for this library — `context7` was unreachable (network) when this was first added, so the standard `AreaChart`/`BarChart`/`ResponsiveContainer` API (stable across recent major versions) was used directly. Re-verify against the installed version's own types if a chart stops rendering as expected.

**Installed version: 3.9.0.** Not in the original `code-standards.md` approved list — added for feature 14 (Dashboard — Full UI) since build-plan.md's feature 17 explicitly names `recharts` for the three dashboard charts. Built now (with mock data) rather than deferred, so feature 17 only swaps data sources, not the chart components themselves.

### Client Component requirement

`ResponsiveContainer` measures the DOM to size its chart, so every chart must render inside a `"use client"` component — `components/dashboard/AnalyticsCharts.tsx` is `"use client"` for exactly this reason, per code-standards.md's "third party client-only libraries" rule. The chart data itself can still be static/mock or passed down as a prop from a Server Component parent.

### Color tokens in SVG, not Tailwind classes

Recharts' `Bar`/`Area`/`Line` color the SVG directly via the `fill`/`stroke` prop (a real SVG presentation attribute), not a `className`. Passing a Tailwind class has no effect on the rendered shape's color. To stay compliant with ui-tokens.md's "never hardcode hex" rule, pass the CSS variable directly as the attribute value — this is the documented "reference the CSS variable directly" exception ui-tokens.md already allows for inline styles, applied the same way to SVG attributes (both resolve via the CSS cascade in modern browsers):

```tsx
<Bar dataKey="count" fill="var(--color-info)" />
<Area dataKey="count" stroke="var(--color-accent)" fill="url(#jobsFoundGradient)" />
```

Gradient fills (e.g. the "Jobs Found Over Time" area chart) need an SVG `<linearGradient>` in `<defs>`, referenced by `fill="url(#id)"`:

```tsx
<defs>
  <linearGradient id="jobsFoundGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
    <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
  </linearGradient>
</defs>
```

### Axis tick color — no exact token match

ui-tokens.md's Typography table lists chart axis labels as the literal hex `#9CA3AF`, distinct from `--color-text-muted` (`#99A1AF`) — a one-off value with no backing CSS variable. Same precedent as `AppNavbar`'s inactive nav-link color: reused the closest existing token (`--color-text-muted`) rather than introducing a near-duplicate variable for an imperceptible difference. Pass via the `tick` prop, not `className`:

```tsx
<XAxis dataKey="day" tick={{ fill: "var(--color-text-muted)", fontSize: 12 }} axisLine={false} tickLine={false} />
```

### Grid lines

ui-tokens.md specifies dashed grid lines, horizontal only (confirmed against `context/designs/dashboard.png` — no vertical grid lines in any of the three charts):

```tsx
<CartesianGrid vertical={false} stroke="var(--color-border)" strokeDasharray="3 3" />
```

**Rules:**

- Always wrap charts in `ResponsiveContainer` — never a fixed pixel width/height
- Always color via `fill`/`stroke` set to a `var(--color-*)` string — never a hardcoded hex, never a Tailwind class (it won't apply)
- `AnalyticsCharts.tsx` holds all three dashboard charts in one file, per architecture.md's planned single-file component — it renders three sibling `ChartCard` elements (no shared wrapping `<div>`) so the page's own 2-column grid (`RecentActivity` + the three charts as four grid items) auto-places them into the design's exact layout (Recent Activity beside Company Research Activity, then the other two charts on the row below) without manual row/col-span classes.
