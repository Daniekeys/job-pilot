# Memory — Phase 1 / 04 Database Schema

Last updated: 2026-06-26

## What was built

- Ran a full schema migration against the InsForge backend via the `run-raw-sql` MCP tool (no application code touched — pure infrastructure):
  - **`profiles`** — `id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE` (no separate `user_id` column — profiles.id IS the auth user id), all columns from `architecture.md`, CHECK constraints on `experience_level`, `remote_preference`, `cover_letter_tone`, `work_authorization`.
  - **`agent_runs`** — `user_id` FK to `profiles(id)`, CHECK on `status`.
  - **`jobs`** — `user_id`/`run_id` FKs, CHECK on `source` and `job_type`.
  - **`agent_logs`** — `user_id`/`run_id`/`job_id` FKs, CHECK on `level`.
  - Indexes on every `user_id` column plus `jobs.found_at`, `jobs.match_score`, `jobs.run_id`, `agent_logs.run_id`, `agent_logs.job_id`.
  - `set_updated_at()` trigger on `profiles` only (only table with `updated_at`).
  - `handle_new_user()` — `SECURITY DEFINER` trigger function + `AFTER INSERT ON auth.users` trigger that auto-inserts an empty `profiles` row (`is_complete = false`, email pre-filled) on signup. Verified live via `pg_trigger`.
  - RLS enabled on all four tables with `auth.uid()`-scoped policies (see Decisions below for exact verb coverage per table).
- Created the `resumes` storage bucket via `create-bucket` MCP tool with `isPublic: false`.
- Verified everything post-creation with `get-table-schema` on all four tables (columns, FKs, indexes, RLS policies, triggers all confirmed present and correct) and `list-buckets`.
- Updated `context/progress-tracker.md` — Phase 1 marked complete, moved to Phase 2, logged all decisions below in "Decisions Made During Build".

## Decisions made

- **`profiles.id` = auth user id directly** (1:1, no separate id/user_id pair) — confirmed with developer via `/architect` before building.
- **Profile rows are auto-created by a DB trigger on `auth.users`**, not by app code on first save. Every authenticated user has a `profiles` row from the moment they sign up — Phase 2/5 code never needs to handle a missing profile row.
- **CHECK constraints added on every enum-like column** (rather than plain `text` trusting app code) — directly enforces the invariants `architecture.md` already states in prose at the DB layer.
- **`resumes` bucket is private** (`isPublic: false`) — resume bytes only retrievable via authenticated `insforge.storage.download()`, matching architecture.md's "authenticated users only, own files only" literally. A public bucket would let anyone with the URL fetch the PDF without auth.
- **RLS verb coverage differs per table on purpose**: `profiles` = SELECT + UPDATE only (no INSERT/DELETE policy — the trigger, running as table owner, is the only writer of new rows; nothing in scope ever deletes a profile). `agent_runs` and `jobs` = SELECT + INSERT + UPDATE (UPDATE is needed — agent code updates `agent_runs.status/jobs_found/completed_at` after a run finishes, and `jobs.company_research` after research completes). `agent_logs` = SELECT + INSERT only (logs are write-once, never updated or deleted).
- All FKs cascade (`ON DELETE CASCADE`) down the chain `auth.users → profiles → agent_runs/jobs → agent_logs` — nothing in scope deletes a user, but keeps the DB consistent if it ever happens.

## Problems solved

- Confirmed InsForge's Postgres is Supabase-style under the hood: `auth.uid()` and `auth.jwt()` exist as real functions, `auth.users.id` is `uuid` — so standard Postgres RLS patterns (`auth.uid() = user_id`) work as expected. Verified via `run-raw-sql` against `information_schema`/`pg_catalog` before writing any policy.
- `run-raw-sql` accepts a full multi-statement script in one call (all 4 `CREATE TABLE`s, indexes, triggers, RLS, and policies ran as a single transaction successfully) — no need to split into many round trips.

## Current state

- Backend now has 4 tables + 1 private bucket, all verified correct (schema, FKs, indexes, RLS policies, triggers) via direct `get-table-schema` / `pg_trigger` queries — not just assumed from the SQL that was run.
- Noticed in passing (not part of this session's work, but worth flagging): `allowedRedirectUrls` in InsForge auth config is no longer empty (`http://localhost:3000/callback`, `http://localhost:3001/callback` are set) — the manual step flagged as outstanding in the `02 Auth` session is resolved. No action needed.
- **Carried over, still unresolved from `02 Auth`:**
  - `proxy.ts` cookie-loss bug — `updateSession()` runs against `NextResponse.next()`, but both redirect branches return a different `NextResponse.redirect(...)`, silently dropping cookie refresh/clear on those paths.
  - PKCE + "OAuth failed → redirect" logic duplicated across `actions/auth.ts` and `app/(auth)/callback/route.ts`, no shared helper.
  - `GoogleIcon` in `app/(auth)/login/page.tsx` hardcodes Google's 4 brand hex colors — documented exception, follow-up is `--color-google-*` tokens in `app/globals.css` matching the `--color-linkedin` precedent. Not done.
- **Carried over, still unresolved from `03 PostHog Initialization`:** `posthog.reset()` is wired in `app/providers.tsx` but unexercisable — no sign-out control exists anywhere in the UI yet (`signOutAction` in `actions/auth.ts` is defined but unused).
- No application code (`app/`, `actions/`, `components/`, `agent/`) was touched this session — zero risk of TS/lint regressions, nothing to test in a browser.

## Next session starts with

Phase 2 → **05 Profile Page — Full UI** (per `context/build-plan.md`/`progress-tracker.md`): build the complete profile page UI with mock data, no save logic yet — completion banner, resume upload area, the full Profile Information form (Personal Info / Professional Info / Work Experience / Education / Job Preferences sections). Check `context/designs/` first for a mockup before building from `ui-rules.md`/`ui-tokens.md` alone (per the `02 Auth` precedent — design assets take precedence when they exist).

## Open questions

- None blocking 05. The three carried-over issues (proxy.ts cookie loss, PKCE duplication, GoogleIcon hex) and the sign-out UI gap are still undecided on timing — fix now, batch into a cleanup pass, or defer further. Not addressed again this session.
