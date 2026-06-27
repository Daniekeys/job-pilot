# UI Registry

Living document. Updated after every component is built. Read this before building any new component — match existing patterns exactly before inventing new ones.

---

## How to Use

Before building any component:

1. Check if a similar component already exists here
2. If yes — match its exact classes
3. If no — build it following ui-rules.md and ui-tokens.md, then add it here

After building any component — update this file with the component name, file path, and exact classes used.

---

## Components

### Button

`components/ui/Button.tsx`

Link-based CTA button (no native button behavior needed yet — every instance navigates).

- Base: `inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors`
- `variant="primary"`: `bg-overlay text-white hover:bg-overlay-dark` — used for "Get Started" / "Start for free". Matches the dark CTA button color from the landing page design (not the purple `bg-accent` primary used elsewhere in-app).
- `variant="secondary"`: `bg-surface border border-border text-text-primary hover:bg-surface-secondary`
- `showIcon` prop renders a trailing `lucide-react` `ChevronRight` (`size-4`)

### Navbar

`components/layout/Navbar.tsx`

Marketing/logged-out navbar variant used on the homepage. `h-16 w-full border-b border-border bg-surface`, inner container `max-w-[1440px] mx-auto flex items-center justify-between px-6`. Logo rendered via `/logo.png` (combined icon+wordmark asset) at `h-8 w-auto`. Center nav links `text-sm font-medium text-text-dark hover:text-accent`. Right side: primary `Button` ("Start for free").

### Footer

`components/layout/Footer.tsx`

`border-t border-border bg-surface`, inner container `max-w-[1440px] mx-auto flex items-center justify-between px-6 py-6`. Logo via `/logo.png` at `h-7 w-auto`. Right side links `text-sm text-text-secondary hover:text-text-primary`.

### Hero (homepage)

`components/homepage/Hero.tsx`

Gradient section `bg-gradient-to-br from-accent-light via-info-lightest to-accent-muted`. Centered headline `text-4xl sm:text-5xl font-bold`, subhead `text-text-secondary`, two `Button`s, and the dashboard preview screenshot (`/images/dashboard-demo.png`) below at `max-w-4xl` with `rounded-2xl shadow-xl`.

### Features (homepage)

`components/homepage/Features.tsx`

Two alternating image/text rows in a `grid lg:grid-cols-2 gap-12` layout — "Manage Your Job Search With Ease" (text left, `/images/jobs-lists.png` right) and "Apply With More Confidence, Every Time" (`/images/agnet-log.png` left, text right). Each feature item: `border-l-2 border-border pl-4` with `text-base font-semibold` title and `text-sm text-text-secondary` description. Images sit in a `rounded-2xl bg-surface-tertiary p-8` frame.

### Testimonial (homepage)

`components/homepage/Testimonial.tsx`

Not in the original architecture.md component list — added to match the design. Centered `max-w-2xl` quote (`text-lg font-medium`), avatar (`/images/user-icon.png`, `size-10 rounded-full`) + name/title below.

### CTA (homepage)

`components/homepage/CTA.tsx`

Not in the original architecture.md component list — added to match the design (bottom banner). Same gradient treatment as Hero, wrapped in a `rounded-2xl` card, reuses the same two `Button`s as Hero.

**Note:** `HowItWorks.tsx` from architecture.md's planned file list was not built — the actual design has no 1-2-3 "how it works" steps section, only the two alternating feature blocks above. Design (`context/designs/landing-page.png`) took precedence per ui-rules.md.

### OAuthButton

`components/auth/OAuthButton.tsx`

Form-wrapped submit button bound directly to a Server Action (`action` prop), used for "Continue with Google/GitHub" — distinct from the link-based `Button` component since OAuth sign-in needs an actual form submit, not navigation. `w-full inline-flex items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary`. No shadow. Takes an `icon` node (brand SVG) + label children.

**Consistency note:** these classes are identical to `Button`'s `variant="secondary"` (`components/ui/Button.tsx`) — same bg/border/radius/text/hover. The duplication is structural, not drift: `Button` renders a `<Link>` (navigates), `OAuthButton` renders a real `<button type="submit">` inside a `<form>` (submits a Server Action). If a third variant needing this exact look-and-feel shows up, consider extracting the shared class string into one constant both components reference, rather than copying it a third time.

### AppNavbar

`components/layout/AppNavbar.tsx`

Logged-in app navbar variant used on `/profile`, `/dashboard`, `/find-jobs` — distinct from the marketing `Navbar` (no CTA button, three nav links with active-state highlighting). `"use client"` (needs `usePathname`). Same `h-16 w-full border-b border-border bg-surface` shell and `max-w-[1440px] mx-auto px-6` inner container as `Navbar`, but right side is just the three nav links (`Dashboard`, `Find Jobs`, `Profile`) instead of nav links + button. Active link (`pathname.startsWith(href)`): `text-sm font-medium text-accent`. Inactive: `text-sm font-medium text-text-dark hover:text-accent` — same inactive color as marketing `Navbar` (`text-text-dark`, not the `#4A5565` literal in ui-rules.md, since that hex has no matching token and the codebase already established this color for inactive nav links).

### ComingSoon

`components/layout/ComingSoon.tsx`

Temporary placeholder for routes not yet built (`/dashboard`, `/find-jobs` until Phases 3/5 land). Centered card, `rounded-2xl border border-border bg-surface p-10 text-center` with the standard card shadow, heading + description text props. **Delete this component and its usages once the real Dashboard and Find Jobs page UIs are built — it exists only so `AppNavbar` links don't 404 during Phase 2.**

### CompletionIndicator

`components/profile/CompletionIndicator.tsx`

"Profile needs attention" banner on `/profile`. Card (standard shadow/border/radius) with `flex items-center justify-between`. Left: `AlertCircle` (lucide) + heading, description text, and missing-field pills (`rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium uppercase text-warning`). Right: `size-24` SVG ring (two stacked circles, `stroke-border-light` track + `stroke-warning` progress arc via `strokeDasharray`/`strokeDashoffset`, `-rotate-90` so the arc starts at 12 o'clock) with the percentage centered absolutely inside. Warning (orange) tokens used throughout for both the ring and the pills — chosen as the semantic "needs attention" color since ui-tokens.md doesn't define one explicitly for profile completion (distinct from the green/blue/orange match-score-bar scale, which is a different concept). Props: `percentage: number`, `missingFields: string[]` — caller computes both (currently hardcoded mock values in `app/profile/page.tsx`; Phase 2 feature 06 will compute them for real from the saved profile).

### ProfileEditor

`components/profile/ProfileEditor.tsx`

`"use client"` wrapper introduced in feature 07 that owns the single `profile` state shared by `ResumeUpload` and `ProfileForm`. Renders no markup of its own beyond the two children in a fragment — `app/profile/page.tsx` renders `ProfileEditor` directly where `ResumeUpload`/`ProfileForm` used to sit side by side. Holds `withMinimumWorkExperience()` (seeds one blank role when the array is empty — moved here from `ProfileForm` since this is now where `profile` state is constructed/updated) and `handleExtracted()`, which merges `Partial<Profile>` from `ResumeUpload`'s `onExtracted` callback into state (`{ ...prev, ...extracted }` — only the keys the AI actually returned are overwritten, `id`/`email`/`resumePdfUrl`/`isComplete` are never part of that partial so they're untouched). This revises feature 06's "fully decoupled siblings" decision — necessary once 07 required AI-extracted data to land inside `ProfileForm`'s fields for review before saving.

### ResumeUpload

`components/profile/ResumeUpload.tsx`

Resume card on `/profile`. `"use client"` for the dashed dropzone's drag-over highlight state (`isDragging` swaps `border-border` → `border-accent bg-accent-muted`), the upload action's pending/error state (feature 06), and the extraction pending/status state (feature 07). Dropzone: `rounded-xl border-2 border-dashed`, `UploadCloud` (lucide) icon, "Click to upload or drag and drop" + helper text (swaps to "Uploading..." while pending), "Select Resume" as a `<label>` wrapping a hidden `<input type="file" accept="application/pdf">` styled like `Button`'s secondary variant — both the file input's `onChange` and the dropzone's `onDrop` call `uploadResume()` from `actions/profile.ts` immediately. Takes `resumePdfUrl: string | null` prop — the caller (`ProfileEditor`) passes a freshly-minted 24h `createSignedUrl()` here, never the raw `profiles.resume_pdf_url` column value (that column stores a storage path, not a usable URL, since `resumes` is a private bucket — see `progress-tracker.md`'s 06 fix). When present, a "View current resume" link (`FileText` lucide icon, `text-accent`) renders below the dropzone, opening the signed URL in a new tab. Upload errors render as `text-error` text in the dropzone.

**Feature 07 addition:** when `resumePdfUrl` is present, an "Extract from Resume" secondary button (`Sparkles` lucide icon) appears in its own row above the "Generate Resume from Profile" row. `onClick` POSTs to `app/api/resume/extract/route.ts`, shows "Extracting..." while pending, then calls the `onExtracted(data: Partial<Profile>)` prop (wired to `ProfileEditor`'s state merge) on success or renders a `text-error` message via the same status-line pattern as `ProfileForm`'s save status (`text-success`/`text-error` below the buttons) on failure.

**Feature 08 addition:** "Generate Resume from Profile" primary button (`bg-accent`) now wired — `onClick` POSTs to `app/api/resume/generate/route.ts`, shows "Generating..." while pending, then either updates the displayed resume link or renders a `text-error` message via its own `text-success`/`text-error` status line (same pattern as the extract row, kept separate since the two actions are independent). The component now tracks a local `generatedUrl` override (`useState`, seeded `null`) — the "View current resume" link renders `generatedUrl ?? resumePdfUrl` rather than the prop directly, because `/api/resume/generate` is a Route Handler, not a Server Action, so it doesn't get the automatic page refresh `uploadResume()`'s `revalidatePath` triggers. `handleFile` (the upload dropzone path) resets `generatedUrl` back to `null` so a fresh manual upload isn't masked by a stale generated link.

**Feature 08 follow-up (`/review`):** added a "Download" link (`Download` lucide icon, same `text-accent`/`text-xs`/`size-3.5` classes as "View current resume") next to it, both now inside a `flex items-center gap-3` row. Points at `GET /api/resume/download` (plain navigation, no `onClick`/state) rather than the signed `viewUrl` with a `download` attribute — that would have been unreliable since the signed URL is cross-origin (InsForge's storage domain) and browsers ignore `download` on cross-origin links unless the remote response sets `Content-Disposition` itself, which isn't under this app's control. The route re-downloads the file server-side from storage and sets that header itself, so the link works as a normal same-origin attachment download.

### ProfileForm

`components/profile/ProfileForm.tsx`

The `/profile` page's main form — all of Personal Info, Professional Info (incl. Skills/Industries tag inputs), Work Experience (up to 3 roles, "+ Add role"), Education, and Job Preferences in one card, ending in a "Save Profile" button. `"use client"`. **As of feature 07, this is a controlled component** — takes `profile: Profile` and `onChange: Dispatch<SetStateAction<Profile>>` props instead of owning `useState<Profile>` internally (state moved up to the new `ProfileEditor` wrapper so "Extract from Resume" results can reach these fields). Destructures `onChange` as `setProfile` so the rest of the component's body — every `setProfile((prev) => ...)` call — is unchanged from feature 06. Local `useState` is still used for genuinely form-local UI state that has no reason to live in the parent: `skillInput`, `industryInput`, and the save `isPending`/`status` line. Save Profile button calls `saveProfile()` from `actions/profile.ts` via `useTransition`, showing "Saving..." while pending and a `text-success`/`text-error` status line below the button after it resolves. Sections are plain JSX blocks inside this one file, not separate components — they're not reused anywhere else and architecture.md doesn't call for separate files per section.

Shared style constants defined at module scope (`inputClass`, `labelClass`, `sectionHeadingClass`, `fieldGridClass`) rather than a separate `Input`/`Label` component — every field in this form needs the exact same classes and there's no other form in the app yet to share a real component with; revisit if a second form appears.

**Canonical form-field pattern — match these exact classes in any future form (e.g. Find Jobs search controls, phase 09):**

| Property         | Class                                                                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input background | `bg-surface`, disabled → `disabled:bg-surface-secondary disabled:text-text-muted`                                                                    |
| Input border     | `border border-border`                                                                                                                               |
| Input radius     | `rounded-md`                                                                                                                                         |
| Input padding    | `px-3 py-2`                                                                                                                                          |
| Input text       | `text-sm text-text-primary`, placeholder `placeholder:text-text-muted`                                                                               |
| Input focus      | `focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`                                                                              |
| Field label      | `mb-1.5 block text-xs font-medium uppercase tracking-wide text-text-secondary`                                                                       |
| Section heading  | `text-base font-semibold text-text-primary` (same as card title)                                                                                     |
| Field grid       | `grid grid-cols-1 gap-4 md:grid-cols-2` (paired fields), single column for full-width fields                                                         |
| Tag pill         | `inline-flex items-center gap-1 rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent`                                            |
| Secondary button | `rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary` (matches `Button` secondary) |
| Primary button   | `rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark`                                                     |

Skills/Industries use the same tag-input pattern: text input + "Add" button (adds on click or Enter, dedupes, clears input) + pills below (`bg-accent-light text-accent`, lucide `X` to remove). Work Experience roles are capped at 3 (`MAX_WORK_EXPERIENCE_ROLES`, matches architecture.md's `work_experience jsonb` — "array of up to 3 roles"); "+ Add role" hides once the cap is hit. No per-role remove control — not present in `context/designs/profile.png`, so not built (same "design takes precedence" precedent as the homepage's missing `HowItWorks`).

Start/End Date fields are plain text inputs (e.g. "January 2022"), not `<input type="month">` — native month pickers render inconsistently across browsers and the design shows plain text, not picker chrome. "Currently working here" checkbox disables (and greys, via `inputClass`'s `disabled:` variants) the End Date field.

**Note:** `cover_letter_tone` (in architecture.md's `profiles` table and build-plan.md's Job Preferences field list) is **not** in this form — `context/designs/profile.png`'s Job Preferences section ends at Preferred Locations with no Cover Letter Tone dropdown visible. Design took precedence per ui-rules.md, same precedent as the homepage's missing `HowItWorks` section. Flagging here in case this was a design omission rather than an intentional scope cut — worth confirming with the developer before Phase 2 feature 06 wires the save action, since the DB column exists but nothing in the UI will ever populate it.

### Login page

`app/(auth)/login/page.tsx`

No design mockup exists for this page. Centered single card on `bg-background`: `max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` — this is the exact card shadow value from ui-rules.md's Cards spec, written as an arbitrary value since no `shadow-card` utility exists yet. Logo linking home, heading (`text-lg font-semibold text-text-primary`) + subtext (`text-sm text-text-secondary`), then two stacked `OAuthButton`s with `gap-3`. Error state (`?error=oauth_failed`) renders a `rounded-md bg-error/10 px-3 py-2 text-sm text-error` banner above the buttons — never the raw error message. Google/GitHub marks are inline SVGs (brand icons aren't in the installed `lucide-react` version); Google's 4 brand colors are hardcoded hex inline since they're externally mandated and don't fit the single-hue token system — flagged in progress-tracker.md as a documented exception, same precedent as the `--color-linkedin` token.

**Note:** if a `shadow-card` (or similarly named) utility gets added to `app/globals.css`'s `@theme` block later, this page's inline arbitrary shadow value should be migrated to it along with any other card that hand-rolls this same shadow string.

### SearchControls (Find Jobs)

`components/find-jobs/SearchControls.tsx`

Top card on `/find-jobs`. Standard card shell (`rounded-2xl border border-border bg-surface p-6` + standard shadow). Job Title input has a `lucide-react` `Search` icon absolutely positioned inside (`absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted`, input gets `pl-9` to clear it) — Location input has no icon, matching the design exactly. Find Jobs button is the same primary-button classes as `ProfileForm`'s Save Profile button (`bg-accent text-accent-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-accent-dark`) plus a leading `Search` icon and `inline-flex items-center gap-1.5`. Success banner below: `inline-flex items-center gap-2 rounded-md bg-success-lightest px-4 py-2.5 text-sm font-medium text-success-foreground` with a `Sparkles` icon — new color pairing (`bg-success-lightest`/`text-success-foreground`), not used elsewhere yet; reuse this exact pairing for any future inline success banner rather than inventing another success-color combination.

**Feature 10 addition:** now `"use client"` — owns controlled `jobTitle`/`location` inputs, `isSearching`/`result`/`error` state, and a `handleSearch()` that POSTs to `/api/agent/find` then calls `router.refresh()` on success so the Server Component parent (`app/find-jobs/page.tsx`) re-fetches the real job list. Button shows a spinning `Loader2` + "Searching..." while pending. The success banner is now conditional (`result &&`) instead of always-rendered, showing the real message returned by the API (`"Found X jobs and saved Y strong matches."` or the no-results copy). **New error banner** for failed searches: `bg-error text-error-foreground` with a `TriangleAlert` icon — there is no `error-lightest`/light-error token pair in ui-tokens.md (only `success`/`info` have light variants; `error` is solid-only), so this uses the solid `error`/`error-foreground` pair rather than inventing an unbacked light variant. Use this same solid `bg-error`/`text-error-foreground` pairing for any future inline error banner.

**Bug-fix follow-up — `router.refresh()` replaced with `router.push(\`${pathname}?sort=newest\`)`.** A bare refresh kept whatever `JobFilters`/`JobsPagination` state the table happened to be on; with the default sort (Match Score, descending), a fresh search's jobs could score lower than dozens of older saved jobs and land on page 2+ — or be hidden outright by a leftover "High Match" filter — making a 100%-successful search look like nothing happened. Forcing `sort=newest` (and implicitly resetting `q`/`match`/`page` to defaults via the navigation) guarantees the just-found jobs sit at the very top of page 1 every time, since they all share a near-identical `found_at` from the same insert.

**Post-11 bug-fix addition:** button is only disabled while `isSearching` now — Job Title can be submitted blank, since the API falls back to the user's profile (`jobTitlesSeeking`/`currentTitle`) when empty. Placeholder updated to say so explicitly ("Leave blank to use your profile") so the relaxed validation is visible, not a silent behavior change a user could mistake for a bug.

**Follow-up — Location field replaced with a Country `<select>`:** the free-text Location input (and its "no icon" detail above) is gone. Now a plain `<select>` using `ProfileForm`'s rectangular `inputClass` pattern verbatim (`w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent`, native browser appearance, no custom chevron) — not the `JobFilters` pill-select pattern, since this is a full form field sitting next to Job Title, not a compact list filter. First option is `"Use my profile"` (value `""`), followed by `ADZUNA_COUNTRIES` (from `lib/utils.ts`) mapped to `<option>`s. **"Remote" is deliberately not an option** — confirmed against Adzuna's own docs that their location filter has no remote/work-from-home support, so adding it would just be a dropdown option that silently returns 0 results every time, the same class of bug this change was meant to fix.

**Follow-up — Job Title input is now an autocomplete (Google-style suggestions), not a plain text field.** New `lib/job-titles.ts` exports `SUPPORTED_JOB_TITLES` (a curated, non-exhaustive list spanning both Adzuna categories this app searches — see `ADZUNA_CATEGORIES` in `lib/adzuna.ts`) and `filterJobTitles(query)`, which ranks prefix matches above plain substring matches and caps results at 8. This is an autocomplete _assist_, not a whitelist — typing something not in the list still searches Adzuna's full free-text engine exactly as before; the list only drives the suggestion dropdown.

- **Dropdown markup**: `<ul role="listbox" id="job-title-suggestions">` absolutely positioned (`absolute z-10 mt-1 w-full`) directly under the input, using the same standard card shadow/border as every other surface in this app (`rounded-md border border-border bg-surface` + the project's one shadow value) — no new shadow token introduced. Each suggestion is a `role="option"` `<li>` wrapping a full-width `<button>` (not a styled `<li>` directly) so it's natively focusable/clickable; the active item (keyboard-highlighted or mouse-hovered) gets `bg-accent-light text-accent`, otherwise `text-text-primary hover:bg-surface-secondary` — same active/inactive pairing `JobsPagination` already uses for its current-page pill.
- **Input gets `role="combobox"` + `aria-expanded`/`aria-controls`/`aria-autocomplete="list"`**, `autoComplete="off"` (to suppress the browser's own native autofill dropdown, which would otherwise visually stack with this one).
- **Clicking a suggestion both fills the field and immediately runs the search** — `selectSuggestion()` calls `handleSearch(title)` directly with the clicked value rather than relying on `setJobTitle` + a stale `jobTitle` closure, since state updates aren't synchronous. `handleSearch` now takes an optional `titleOverride` param for exactly this reason.
- **Keyboard nav**: ArrowDown/ArrowUp cycle `highlightedIndex` (wrapping), Enter selects the highlighted suggestion if one is active, Escape closes the dropdown. If the dropdown isn't open (no matches, or input not focused), Enter just runs a normal search instead — typed free text always remains a valid path, the dropdown never blocks it.
- **Closing on blur uses a 150ms `setTimeout` delay** (`BLUR_CLOSE_DELAY_MS`), not an immediate hide — the standard fix for the classic "blur fires before the suggestion's click event" race; a `<button>` inside the list is still clicked successfully within that window.
- **Each suggestion's `<button>` also has `onMouseDown={(e) => e.preventDefault()}`** — stops the browser from shifting focus off the input at all when a suggestion is clicked, so there's no blur race to depend on the 150ms delay for in the first place. Added after a developer bug report ("clicking a suggestion doesn't update the title"); verified via a real headless-Chromium Playwright session (against a temporary unauthenticated route mounting this exact component, since `/find-jobs` requires login) that the click-to-select flow works correctly both with and without this guard, across both a synthetic single click and a slower human-like mouse-path click — the original report could not be reproduced even pre-fix, but the guard is strictly more correct regardless and costs nothing, so it stays. If this resurfaces, suspect a stale dev bundle (hard-refresh) before re-investigating the event logic.

### JobFilters (Find Jobs)

`components/find-jobs/JobFilters.tsx`

Sits inside the jobs-list card, above `JobsTable`, separated by `border-b border-border` on its own wrapping `div` (`flex items-center gap-3 p-4`). Text search input matches `SearchControls`' icon-input pattern exactly (`Search` icon absolutely positioned, `pl-9`). The two filter dropdowns are real `<select>` elements styled as pills, not the `ProfileForm` rectangular `inputClass` pattern — **new pill-select pattern**: `appearance-none rounded-full border border-border bg-surface py-1.5 pl-3 pr-8 text-sm font-medium text-text-primary` wrapped in a `relative` div with a `ChevronDown` (`lucide-react`) absolutely positioned at `right-3` (`pointer-events-none` so clicks pass through to the native select). Use this exact pill-select pattern for any future compact dropdown that isn't a full form field (form fields keep using `ProfileForm`'s rectangular `inputClass`).

**Feature 11 addition:** now `"use client"` — reads/writes `q`/`match`/`sort` via `useSearchParams`/`useRouter` (`next/navigation`), no local component state for the selects (their `value` is the URL param directly, defaulting to `"all"`/`"score"`). The text input is debounced 350ms before pushing a URL update, using a React-recommended "adjust state during render" pattern (compare incoming `searchParams.get("q")` against a `syncedQuery` ref-state each render, not a `useEffect`, since `eslint`'s `react-hooks/set-state-in-effect` rule flags setState-in-effect) so typing feels instant while the URL update is debounced. Any change to `q`/`match`/`sort` strips the `page` param, resetting pagination to page 1 — changing filters while on page 3 of a now-shorter result set would otherwise show stale/empty rows. Wrapped in `useTransition`; the whole filter bar dims to `opacity-60` while a navigation is pending, giving a lightweight loading cue without a layout shift or spinner.

### JobsTable (Find Jobs)

`components/find-jobs/JobsTable.tsx`

Plain HTML `<table>`, not a shadcn data-table — matches ui-rules.md's Table spec directly (`border-b border-border` between header and rows, no header `border-b` on the last row, `hover:bg-surface-secondary` per row). Column headers: `px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-text-secondary`. Row cells: `px-4 py-3`, primary text `text-sm font-medium text-text-primary` (company, match %), secondary `text-sm text-text-primary` (role) or `text-sm text-text-secondary` (salary), muted `text-sm text-text-muted` (date found). Company icon is a generic `Building2` (`lucide-react`) inside `flex size-8 items-center justify-center rounded-md bg-surface-tertiary` — there are no real company logos yet (Adzuna doesn't provide them), this placeholder pattern should be reused anywhere else a company icon is needed until real logos exist.

**Feature 10 addition:** `job.foundAt` is now a real ISO timestamp from `jobs.found_at`, formatted via the new `formatRelativeTime()` in `lib/utils.ts` ("Just now" / "X minutes/hours ago" / "Yesterday" / "X days ago" / falls back to a short date past a week) instead of the feature 09 mock's hardcoded relative strings. **New empty state**: when `jobs.length === 0`, a single `colSpan={6}` row renders "No jobs found yet — search above to get started." (`px-4 py-10 text-center text-sm text-text-muted`) instead of a bare header with no rows — needed now that the table renders real (possibly empty) data for new users.

**Feature 11 addition:** new required `hasActiveFilters: boolean` prop (computed in `app/find-jobs/page.tsx` as `q !== "" || match !== "all"`) splits the empty state in two: the feature-10 "No jobs found yet — search above to get started." copy only shows when the user truly has zero jobs and no filters active; "No jobs match your filters — try adjusting your search or match filter." shows when filters/search are active but the filtered query returned zero rows. Avoids telling a user with 40 saved jobs to "search above to get started" just because their filter combination matched nothing.

**Match score bar — new color-threshold decision, confirmed with the developer:** ui-rules.md and ui-tokens.md each publish a _different_ threshold table for match-score colors, and neither matches the actual `find-jobs.png` mockup's sample scores (94/96/91%→green, 88/85%→blue, 72%→orange). Built to match the design pixels instead of either doc: `scoreColorClass()` returns `bg-success` for `>=90`, `bg-info` for `80-89`, `bg-warning` for `<80`. Track is `h-1 w-24 rounded-full bg-border-light`, fill is `h-1 rounded-full` with the score-based bg class, `width: ${score}%` inline (the one acceptable inline style — this is a computed numeric value, not a static design value, same precedent as `CompletionIndicator`'s SVG arc). **ui-rules.md/ui-tokens.md should be reconciled into one shared threshold table before the next feature (job details page, 12) that also needs a match-score bar** — right now there are three different answers to "what color is an 85% match" across the codebase's own docs.

**Source badge — new pattern, no existing token mapping for `'search'`:** architecture.md's `jobs.source` enum is `'search' | 'url'`, but ui-tokens.md's "Source Badges" table only defines colors for `LinkedIn` and `URL`, not `search`. Chose `bg-info-lightest text-info-foreground` for `'search'` (all mock rows, since Adzuna/feature 10 is the only source built so far) and kept ui-tokens.md's existing `bg-surface-secondary text-text-secondary` for `'url'`. Both are `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium`, matching ui-rules.md's general badge spec. **Deviation from the design**, flagged for the developer: `find-jobs.png` shows no Source column at all (5 columns, not 6) — built anyway per build-plan.md's explicit column list, since the developer confirmed this over matching the mockup exactly.

### JobsPagination (Find Jobs)

`components/find-jobs/JobsPagination.tsx`

`flex items-center justify-between p-4` footer inside the jobs-list card. Left: `text-sm text-text-secondary` results count. Right: Previous/page-number/Next links, all `rounded-md px-3 py-1.5 text-sm font-medium`. Active page: `bg-accent-light text-accent` (same pairing as tag pills elsewhere). Inactive page: `text-text-secondary hover:bg-surface-secondary`. Disabled Previous/Next: `text-text-muted cursor-not-allowed` (rendered as a `<span>`, not a link, so there's nothing to click).

**Feature 11 rewrite:** no longer static — takes `page`/`pageSize`/`totalCount`/`searchParams` props from the Server Component parent and stays a Server Component itself (no `"use client"` needed; pagination is just navigation). Real "Showing X to Y of Z results" computed from `page`/`pageSize`/`totalCount`. Page-number links are real `next/link` `<Link>`s built by `buildHref()`, which copies every existing search param except `page` onto the target URL so filters/search/sort survive pagination. **New `getPageNumbers()` windowing helper** (local to this file, not exported elsewhere — it's UI-rendering logic, not shared business logic): shows all pages when `totalPages <= 7`; otherwise always shows page 1 and the last page plus a window of `current-1`/`current`/`current+1`, with `...` filling any gap — same visual shape as the feature-09 mock ("1 2 3 ... 8") but now computed from the real page count instead of hardcoded.

**Note on `/find-jobs/page.tsx`:** deleted the `ComingSoon` placeholder usage per its own documented instruction in this file ("delete once the real Find Jobs page UI is built"). The `ComingSoon` component itself is untouched — `/dashboard` still uses it until Phase 5. **Documented deviation from project-overview.md:** the "Jobs by Adzuna" credit that project-overview.md says must appear "on all job listings" was deliberately omitted — it doesn't appear anywhere in `find-jobs.png`, and the developer chose to match the design exactly here (opposite call from the Source-column decision above). Revisit if a later screenshot/design shows where this credit is actually meant to sit.

**Feature 12 addition:** row-level navigation is now anchored on the job title itself, not the whole row. Each title renders as a real `<a href="/find-jobs/[id]">` so keyboard and screen-reader users get standard link behavior without client-side row click handlers.

---

## Job Details Page (`/find-jobs/[id]`) — Feature 12

Built pixel-for-pixel from `context/designs/job-details.png` (colors confirmed via cropping/sampling the actual PNG, not eyeballed) per architecture.md's planned `components/job-details/` folder. Every card uses the same standard shell as every other card in the app: `rounded-2xl border border-border bg-surface shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]`, `p-6` (or `p-4` for the smaller info cards), stacked with `gap-6` between sections (`gap-4` for JobInfo's internal header-card/info-row spacing).

### JobInfo

`components/job-details/JobInfo.tsx`

Header card + the 4-card info row, both server-rendered, no state. Header: `size-16 rounded-xl bg-surface-secondary` company-logo placeholder (`Building2` icon, `text-text-muted` — same placeholder pattern as `JobsTable`'s company icon, just bigger), `text-2xl font-bold` title, then `company • badge` line. **Match score badge resolved via pixel-sampling, not either conflicting threshold table in ui-rules.md/ui-tokens.md** — sampled `#EBFDF5`/`#007A55` from the design's actual "85% Match Score" pill, an exact match for ui-tokens.md's pre-existing **Status Badges** "High Match" pairing (`bg-success-lightest`/`text-success-foreground`). Gated on the existing `MATCH_THRESHOLD` (70): `>= 70` → High Match pairing, else `bg-surface-secondary`/`text-text-secondary` (Low Match pairing). This is a **binary** badge, distinct from `JobsTable`'s three-tier bar `scoreColorClass()` — the two were confirmed (via pixel sampling) to be genuinely different concepts, so no shared helper was extracted. "View Job Post" button: identical classes to `OAuthButton`/`Button`'s secondary variant (`bg-surface border border-border text-text-primary hover:bg-surface-secondary rounded-md`) plus a leading `ExternalLink` icon, `target="_blank"`, links to `job.sourceUrl`.

Info row: `grid grid-cols-2 md:grid-cols-4 gap-4`, each card `flex items-center gap-3 p-4` with a `size-10 rounded-lg` icon chip. Icon chip colors were pixel-sampled against the actual design (no existing ui-tokens.md mapping for this element existed): Salary → `bg-success-lightest`/`text-success` (`DollarSign`), Location → `bg-info-lightest`/`text-info-medium` (`MapPin`), Job Type → `bg-accent-muted`/`text-accent` (`Briefcase`), Date Found → `bg-surface-secondary`/`text-text-secondary` (`Calendar`). Value text is `truncate` with a `title` attribute (handles long locations like "Newark, Essex County" exactly as the design's own truncated "Newark, Ess..." sample shows). Job Type value goes through a local `JOB_TYPE_LABELS` map (`fulltime`→"Full-time" etc.) since the DB stores the lowercase enum value, not the display label; falls back to `"—"` for missing data, matching the design's own `—` placeholder for an unset field.

### MatchScore

`components/job-details/MatchScore.tsx`

Two stacked cards. "AI Match Reasoning": small uppercase `text-xs tracking-wide text-text-secondary` label (not a full section heading — matches the design's smaller header style for this card, distinct from `JobDescription`/`CompanyResearch`'s larger heading style below) with a `size-8 rounded-full bg-success-lightest` `Sparkles` icon chip, then `job.matchReason` as a plain paragraph. "Required Skills vs Your Profile": same small-label heading style, no icon. Skills render as two optional groups (only shown if the array is non-empty) — **labeled "You have" / "Gap skills" per the design**, not build-plan.md's "matched/missing skills" wording (data fields unchanged, only on-screen copy). Both groups pixel-matched ui-tokens.md's existing Skills Badges table exactly: matched → `bg-success-lightest text-success-foreground` with a leading `Check` icon; gap → `bg-accent-muted text-accent` with a leading `X` icon — **sized larger than the project's usual small badge** (`px-3 py-1.5 text-sm`, not `px-2 py-0.5 text-xs`) to match the bigger chip size actually visible in the design.

### JobDescription

`components/job-details/JobDescription.tsx`

Single card, larger heading style (`text-base font-semibold text-text-primary`, matching `CompanyResearch`'s heading — distinct from `MatchScore`'s smaller uppercase labels) with a `size-9 rounded-lg bg-surface-secondary` `FileText` icon chip, then `job.aboutRole` as one `whitespace-pre-line` paragraph. **Renders one continuous block, not separate Responsibilities/Requirements/Benefits subsections** — project-overview.md's prose describes a more structured breakdown, but feature 10 never built those fields (`about_role` is Adzuna's raw description snippet, confirmed in `lib/job-mapper.ts`), and the design itself shows one undifferentiated paragraph. Building separate sections would require data that doesn't exist in this pipeline.

### CompanyResearch — Feature 13

`components/job-details/CompanyResearch.tsx`

Now `"use client"` (was a pure Server Component in feature 12) — owns the `POST /api/agent/research` fetch and a local `isResearching`/`error` state, mirroring `SearchControls.tsx`'s established async-trigger pattern exactly (fetch → check `body.success` → `router.refresh()` on success, error banner on failure).

Header row unchanged (`size-9 rounded-lg bg-accent-muted` `Building2` icon chip, larger heading style matching `JobDescription`). The button now has three states: empty (`bg-accent text-accent-foreground` primary, `Search` icon, "Research Company"), researching (`Loader2 animate-spin`, "Researching...", disabled), and **post-dossier** — a smaller secondary "Re-research" action (`border border-border text-text-secondary hover:bg-surface-secondary`, `RefreshCw` icon) since re-running and overwriting `company_research` is allowed, not one-shot.

Three body states: empty-state (unchanged from feature 12 — centered `Building2` icon, "No research yet"), a loading state (centered spinner + "Researching {company}... this can take up to a couple of minutes"), and the filled dossier. Error banner (`bg-error text-error-foreground`, same classes as `SearchControls`' error banner) renders above the body on failure, independent of which body state is showing.

**Dossier rendering — no design mockup exists for this state** (`job-details.png` only shows the empty state), built from build-plan.md's 9-field list using established tokens: a local `Section` (uppercase `text-xs font-semibold tracking-wide text-text-secondary` label) and `BulletList` (dot-marker `<li>`, `text-sm text-text-primary`) helper used across most fields. **Tech Stack** tags use `bg-info-lightest text-info-foreground` (a new color choice for this file — deliberately distinct from `MatchScore`'s `success`/`accent` skill-badge pairing, since tech-stack tags aren't a matched/missing-skill judgment, just neutral company fact). **Your Edge** gets its own highlighted treatment per build-plan.md's "highlight — specific to this candidate" — wrapped in a `rounded-xl bg-success-lightest p-4` block with a `Sparkles`/`text-success` icon, the only field styled this way. **Sources** renders each string as a clickable `text-info-foreground` link if it starts with `http`, else plain `text-text-muted` text (the model isn't guaranteed to return bare URLs for every source).

### JobActions

`components/job-details/JobActions.tsx`

Single full-width "Apply Now at {company}" link (`<a target="_blank">`, not a button — it's pure navigation), `bg-accent text-accent-foreground rounded-lg px-6 py-3` — the one place on this page using `rounded-lg` (12px) instead of the standard `rounded-md` (8px) buttons elsewhere, matching the visibly larger corner radius on this specific full-width bar in the design. Links to `job.externalApplyUrl`, distinct from `JobInfo`'s "View Job Post" which links to `job.sourceUrl` — both currently resolve to the same Adzuna `redirect_url` per feature 10's mapping, but kept as separate fields/buttons matching their distinct names and design positions (header vs. page-bottom).

### `app/find-jobs/[id]/page.tsx`

Async Server Component. `params` is awaited as `Promise<{ id: string }>` (confirmed against the installed Next.js 16 docs in `node_modules/next/dist/docs`, same pattern as `app/find-jobs/page.tsx`'s `searchParams`). Auth-redirects to `/login` if no user; queries `jobs` scoped to **both** `id` and `user_id` (never `id` alone, even though it's already a unique key — code-standards.md's "always scope to user" invariant applies so one user can never view another's job by guessing a UUID) via `.single()`, and calls `notFound()` if the row doesn't exist or doesn't belong to the current user. "Back to Jobs" is a plain `next/link` with a `ChevronLeft` icon, `text-text-secondary hover:text-text-primary` — not its own component, same precedent as other one-off navigational links in this codebase.
