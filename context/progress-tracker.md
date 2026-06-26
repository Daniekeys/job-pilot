# Progress Tracker

Update this file after every completed feature. Any AI agent reading this should immediately know what is done, what is in progress, and what is next.

---

## Current Status

**Phase:** Phase 2 — Profile Page
**Last completed:** 04 Database Schema
**Next:** 05 Profile Page — Full UI

---

## Progress

### Phase 1 — Foundation

- [x] 01 Homepage
- [x] 02 Auth
- [x] 03 PostHog Initialization
- [x] 04 Database Schema

### Phase 2 — Profile Page

- [ ] 05 Profile Page — Full UI
- [ ] 06 Profile Save Logic
- [ ] 07 AI Profile Extraction from Resume
- [ ] 08 Resume PDF Generation from Profile

### Phase 3 — Find Jobs Page

- [ ] 09 Find Jobs Page — Full UI
- [ ] 10 Adzuna Job Discovery
- [ ] 11 Filter + Sort + Pagination

### Phase 4 — Job Details Page

- [ ] 12 Job Details Page — Full UI
- [ ] 13 Company Research Agent

### Phase 5 — Dashboard

- [ ] 14 Dashboard Page — Full UI
- [ ] 15 Stats Bar — Real Data
- [ ] 16 Recent Activity — Real Data
- [ ] 17 Analytics Charts — PostHog Data

---

## Decisions Made During Build

- **01 Homepage:** Built directly from `context/designs/landing-page.png` rather than the section list in build-plan.md — design took precedence per ui-rules.md ("Design assets are available — use them as the source of truth"). No `HowItWorks.tsx` — the design has two alternating feature/image blocks instead of numbered steps.
- **01 Homepage:** The four screenshot-style assets in `public/images/` (`dashboard-demo.png`, `jobs-lists.png`, `agnet-log.png`, `user-icon.png`) are embedded directly as `<Image>` — they already match the mockup pixel-for-pixel, so no UI was rebuilt with HTML/CSS for those sections.
- **01 Homepage:** "Get Started" / "Start for free" / "Find Your First Match" all link to `/login` for now. Auth doesn't exist yet (Phase 1 → 02), so the conditional "→ /dashboard if authenticated" behavior from build-plan.md isn't wired up yet — revisit once auth lands.
- **01 Homepage:** Primary CTA buttons use `bg-overlay` (dark), not `bg-accent` (purple) — matches the actual button color in the design screenshot. The purple `bg-accent` primary button style from ui-tokens.md still applies to in-app primary actions (e.g. Find Jobs, Save Profile).
- **01 Homepage:** `public/logo.png` is a combined icon+wordmark PNG, rendered as one `<Image>` in Navbar/Footer rather than rebuilding the icon with the CSS gradient spec in ui-tokens.md (that spec's `#4A2EC5` stop isn't an actual token, so using the provided asset avoided introducing a hardcoded hex).
- **02 Auth:** The project already had `@insforge/sdk` (not the `@insforge/ssr` package architecture.md's code samples reference) with a real `@insforge/sdk/ssr` submodule — `createBrowserClient`, `createServerClient`, `createAuthActions`, `updateSession` — confirmed by reading the installed package's type defs and compiled source. This submodule is what `lib/insforge-client.ts` / `lib/insforge-server.ts` already used from 01 Homepage, so all new auth code follows it instead of the generic `createClient()` pattern in InsForge's MCP docs.
- **02 Auth:** Next.js 16 renamed `middleware.ts` → `proxy.ts` (exported function is `proxy`, not `middleware`) — confirmed in `node_modules/next/dist/docs`. Route protection lives in `proxy.ts` at the project root, not `middleware.ts`.
- **02 Auth:** OAuth callback is `app/(auth)/callback/route.ts` (a Route Handler), not `page.tsx` as architecture.md's folder list shows — cookies can only be written in a Server Action or Route Handler, never during Server Component render, and the callback step must persist the exchanged session cookies before redirecting to `/dashboard`.
- **02 Auth:** `signInWithOAuth()`'s PKCE `codeVerifier` is persisted in a short-lived httpOnly cookie (`oauth_code_verifier`, 10 min, name in `lib/utils.ts`) between the sign-in redirect and the callback exchange — the SDK's own `codeVerifier` persistence uses browser `sessionStorage`, which doesn't exist when `signInWithOAuth` is called from a Server Action.
- **02 Auth:** `app/page.tsx` (homepage) now redirects authenticated users straight to `/dashboard` server-side, resolving the "revisit once auth lands" note left in 01 Homepage. CTA button hrefs stay `/login` since they only render for logged-out users now.
- **02 Auth:** No design mockup exists for `/login` (only dashboard/find-jobs/job-details/landing-page in `context/designs/`) — built from ui-rules.md/ui-tokens.md as a centered card with two OAuth buttons. Brand icons (Google, GitHub) are inline SVGs since the installed `lucide-react` version ships no brand/logo icons.
- **02 Auth — manual step still needed:** InsForge backend metadata shows `allowedRedirectUrls: []`. There is no MCP tool to set this — add `http://localhost:3000/callback` (and the production URL later) in the InsForge dashboard's Auth settings before testing sign-in end-to-end.
- **02 Auth:** Post-login redirects to `/dashboard`, which doesn't exist until Phase 5 — this will 404 until then, expected per the build order.
- **02 Auth — documented exception:** `GoogleIcon` in `app/(auth)/login/page.tsx` hardcodes Google's 4 official brand hex colors (`#4285F4`, `#34A853`, `#FBBC05`, `#EA4335`) inline, which a code review flagged against ui-tokens.md's "never hardcode hex" rule. These are externally mandated brand colors on a fixed multi-color logo, not theme colors — same category as `--color-linkedin` in ui-tokens.md. Follow-up: add `--color-google-blue/green/yellow/red` tokens to `app/globals.css`'s `@theme` block and reference them via `var(--color-google-*)` instead of inline hex, matching the LinkedIn precedent exactly.
- **02 Auth — known issue from code review:** `proxy.ts` calls `updateSession()` against a `NextResponse.next()` response, but the two redirect branches return a *different* `NextResponse.redirect(...)` object — any cookie refresh/clear queued by `updateSession()` is silently dropped on those paths. Not yet fixed. Fix: copy `response.cookies.getAll()` onto the redirect response (or build the redirect response first and pass its cookie store into `updateSession()`).
- **02 Auth — resolved:** InsForge backend's `allowedRedirectUrls` is no longer empty — `get-backend-metadata` now shows `http://localhost:3000/callback` and `http://localhost:3001/callback` configured. The "manual step still needed" note from earlier sessions is done.
- **04 Database Schema:** All four tables (`profiles`, `agent_runs`, `jobs`, `agent_logs`) created via `run-raw-sql` with exact columns from architecture.md, plus the `resumes` storage bucket (private). Decisions, confirmed with the developer via `/architect`:
  - **`profiles.id`** is the auth user's id itself (`PRIMARY KEY id uuid REFERENCES auth.users(id) ON DELETE CASCADE`) — no separate `user_id` column on this table, matching the 1:1 design in architecture.md.
  - **Profile row auto-creation:** a `SECURITY DEFINER` trigger function `handle_new_user()` fires `AFTER INSERT ON auth.users` and inserts an empty `profiles` row (`is_complete = false`, `email` pre-filled). Verified live on `auth.users` via `pg_trigger`. Every authenticated user has a profile row from the moment they sign up — no "no profile yet" state to handle anywhere downstream.
  - **CHECK constraints** added on every enum-like column instead of plain `text`: `profiles.experience_level/remote_preference/cover_letter_tone/work_authorization`, `jobs.source/job_type`, `agent_runs.status`, `agent_logs.level`. Enforces the invariants architecture.md already states in prose, at the DB layer.
  - **`resumes` bucket created with `isPublic: false`** — resume bytes only retrievable via authenticated `insforge.storage.download()`, matching architecture.md's "authenticated users only, own files only" literally (a public bucket would have allowed anyone with the URL to fetch the PDF without auth).
  - **RLS policies** (all using `auth.uid()`, verified via `get-table-schema` on every table): `profiles` has SELECT + UPDATE only (no INSERT/DELETE — the trigger is the only writer of new rows, and nothing in scope ever deletes a profile). `agent_runs` and `jobs` have SELECT + INSERT + UPDATE (UPDATE needed — agent writes go back and update `agent_runs.status/jobs_found/completed_at` after a run finishes, and `jobs.company_research` after research). `agent_logs` has SELECT + INSERT only (logs are never updated or deleted).
  - **`updated_at` auto-trigger** (`set_updated_at()`) added on `profiles` only — the only table with an `updated_at` column.
  - All FKs use `ON DELETE CASCADE` down the chain (`auth.users` → `profiles` → `agent_runs`/`jobs` → `agent_logs`) — nothing in scope deletes users, but this keeps the DB consistent if it ever happens.

---

## Notes

- **03 PostHog Initialization:** `lib/posthog-client.ts`, `lib/posthog-server.ts`, and `app/providers.tsx` (init + manual `$pageview`) already existed from earlier work. Added the missing piece from library-docs.md's PostHog rules: `posthog.identify(userId)` after login / `posthog.reset()` on logout. None of the four approved events (`job_search_started`, `job_found`, `profile_completed`, `company_researched`) have a real trigger yet — Profile, Find Jobs, and Company Research don't exist until later phases — so no event capture calls were added; adding them now would mean firing them from nowhere or inventing new events, both against code-standards.md.
- **03 PostHog Initialization:** Sign-in/sign-out are server-driven (Server Action → redirect → route handler), so there's no single client-side "login"/"logout" moment to hook. Instead, `PostHogIdentify` in `app/providers.tsx` checks `insforge.auth.getCurrentUser()` on every pathname change and diffs against the last-identified user id (stored under `POSTHOG_LAST_IDENTIFIED_USER_KEY` in `localStorage`, see `lib/utils.ts`) to call `identify`/`reset` exactly once per transition. `signOutAction` in `actions/auth.ts` still has no UI calling it (no sign-out control exists in Navbar yet) — `reset()` is wired and will fire correctly once that control is added, but is currently untestable end-to-end for that reason.

_Add notes here as the build progresses — workarounds, patterns, anything that differs from the context files._
