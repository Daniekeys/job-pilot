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

### Login page

`app/(auth)/login/page.tsx`

No design mockup exists for this page. Centered single card on `bg-background`: `max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]` — this is the exact card shadow value from ui-rules.md's Cards spec, written as an arbitrary value since no `shadow-card` utility exists yet. Logo linking home, heading (`text-lg font-semibold text-text-primary`) + subtext (`text-sm text-text-secondary`), then two stacked `OAuthButton`s with `gap-3`. Error state (`?error=oauth_failed`) renders a `rounded-md bg-error/10 px-3 py-2 text-sm text-error` banner above the buttons — never the raw error message. Google/GitHub marks are inline SVGs (brand icons aren't in the installed `lucide-react` version); Google's 4 brand colors are hardcoded hex inline since they're externally mandated and don't fit the single-hue token system — flagged in progress-tracker.md as a documented exception, same precedent as the `--color-linkedin` token.

**Note:** if a `shadow-card` (or similarly named) utility gets added to `app/globals.css`'s `@theme` block later, this page's inline arbitrary shadow value should be migrated to it along with any other card that hand-rolls this same shadow string.
