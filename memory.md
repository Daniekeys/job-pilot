# Memory — Framer Motion / Animation Setup

Last updated: 2026-06-28

## What was built

- Ran `npm install framer-motion` (added to `package.json` dependencies; install succeeded — only pre-existing, unrelated peer-dependency warnings from `@browserbasehq/stagehand`/`openai`/`zod`, nothing caused by this install).
- Updated `context/code-standards.md`:
  - Added `framer-motion` to the approved Dependencies list.
  - Added "Framer Motion components (motion.*, AnimatePresence, useScroll, useTransform, useInView)" to the `"use client"` trigger list under Next.js 16 Conventions.
  - Added a new `## Animation` section (reduced-motion rule, `useInView` scroll-trigger convention, opacity/transform-only animation rule, stagger-via-variants rule, and a note that product demo motion graphics live in `components/landing/ProductDemo.tsx`).
- Created `lib/animation-variants.ts` with four exported `Variants`: `fadeUpVariants`, `staggerContainerVariants`, `scaleInVariants`, `slideInLeftVariants` — exactly as specified in `context/animation-setup.md`.

## Decisions made

- Did **not** copy the "Approved Framer Motion APIs" reference table (section 5 of `context/animation-setup.md`) into `code-standards.md` — the spec only explicitly asked to add sections 2, 3, and 4 there. The table still exists in `context/animation-setup.md` itself as reference. Flagged this choice to the developer; no objection yet but not explicitly confirmed either.
- This was a setup/infrastructure task only — no landing page components (hero, ProductDemo, feature grid, etc.) were built yet. `context/animation-setup.md` is prep for an upcoming landing page rebuild, not the rebuild itself.

## Problems solved

- None — straightforward implementation of a fully-specified setup doc, no bugs encountered.

## Current state

- `framer-motion` is installed and usable. `lib/animation-variants.ts` exists and exports the four standard variants. `code-standards.md` now documents Framer Motion as an approved dependency, lists it in the `"use client"` trigger rules, and has the new Animation rules section.
- No actual landing page component yet imports `framer-motion` or `lib/animation-variants.ts` — this session only laid the groundwork.
- Per `progress-tracker.md` (as of the last working session, not re-verified this session), the project was tracking Phase 4 — Job Details Page as the active build-plan phase, with feature 12 (Job Details Page — Full UI) next, and an unresolved match-score color-threshold conflict between `ui-rules.md` and `ui-tokens.md` flagged as a blocker risk for that feature. This animation-setup task was a side task layered on top — it did not touch Phase 4 work. Confirm with the developer whether Phase 4 or the landing page rebuild is the actual next priority before starting new feature work.

## Next session starts with

Confirm with the developer which is the priority: (a) resuming Phase 4 — Job Details Page (feature 12, per `build-plan.md`/`progress-tracker.md`), or (b) starting the landing page rebuild now that Framer Motion is set up. If (b), read `context/landing-page-spec.md`, `context/how-it-works-spec.md`, and `context/pricing-spec.md` (new untracked files present in the repo as of this session) before building anything, since they likely define the landing page scope this animation setup was prep for.

## Open questions

- Should the "Approved Framer Motion APIs" table from `context/animation-setup.md` also be copied into `code-standards.md`, or is keeping it only in the setup doc acceptable long-term? Not explicitly confirmed by the developer.
- `context/landing-page-spec.md`, `context/how-it-works-spec.md`, `context/pricing-spec.md` exist as untracked files but haven't been read yet this session — unclear if they're finalized specs or drafts.
- Carried over and unverified (from prior context docs, not re-checked this session): the `ui-rules.md` vs `ui-tokens.md` match-score color conflict, and whether Phase 4 (Job Details Page) was ever actually started.
