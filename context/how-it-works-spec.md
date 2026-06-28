# How It Works Page Spec — app/how-it-works/page.tsx

## Overview

A dedicated page that walks visitors through exactly how JobPilot works — from profile setup to ranked job matches. Tone: clear, confident, product-led. Show the real UI at every step. Mock data only. All CTAs → `/login` if unauthenticated, `/dashboard` if authenticated.

**Stack:** Next.js App Router, TypeScript strict, Tailwind v4 (@theme tokens), Framer Motion, lucide-react, shadcn/ui. See `code-standards.md` and `ui-tokens.md`.

---

## File Structure to Create

```
app/how-it-works/page.tsx                          ← Page assembly (Server Component)
components/landing/how-it-works/PageHeader.tsx      ← Hero header for this page
components/landing/how-it-works/StepsSection.tsx    ← "use client" — animated 3-step flow
components/landing/how-it-works/DeepDiveSection.tsx ← "use client" — feature deep dives
components/landing/how-it-works/HowItWorksCta.tsx   ← "use client" — bottom CTA
```

Shared `Navbar` and `Footer` from `components/landing/` — same as homepage.

---

## Section 1 — Page Header (PageHeader.tsx)

**Server Component.**

**Layout:** `bg-background pt-32 pb-16 text-center`

**Eyebrow:** "How JobPilot Works" — `bg-accent-muted text-accent rounded-full px-3 py-1 text-sm font-medium inline-block mb-4`

**Headline:** "Three steps from profile to perfect match" — `text-4xl md:text-5xl font-bold text-text-primary tracking-tight`

**Sub:** "No job board scrolling. No spray-and-pray applications. Just AI that does the work." — `text-lg text-text-secondary max-w-xl mx-auto`

---

## Section 2 — Steps Section (StepsSection.tsx)

**"use client"** required.

**Layout:** `bg-background py-16`. Three steps displayed as a vertical timeline on mobile, horizontal on desktop (lg: flex-row).

### Connector Line (desktop only)
A dashed horizontal line connects the three step cards on `lg:` screens. Use `border-t-2 border-dashed border-border` positioned absolutely between cards. Animate: draw left-to-right using `scaleX: 0 → 1` with `transformOrigin: "left"` when section enters viewport.

### Step Cards

Each card: `bg-surface border border-border rounded-2xl p-8 flex-1`

Animate each card with `fadeUpVariants` + `staggerContainerVariants` (stagger 150ms), triggered by `useInView({ once: true })`.

---

**Step 1 — Build Your Profile**

- Step number badge: `"01"` — `bg-accent text-accent-foreground text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center`
- Icon: `User` (lucide) in `bg-accent-muted text-accent` circle
- Title: "Build your profile once" — `text-xl font-semibold text-text-primary`
- Body: "Add your skills, experience, job preferences, and resume. JobPilot uses this as the benchmark for every match."
- Mini UI mockup inside card: Simplified profile fields (name, skills badges: React / TypeScript / Next.js, job title) rendered as styled divs — not a real form, just visual representation. Use `bg-surface-secondary border border-border rounded-md` for field rows.

---

**Step 2 — AI Searches for You**

- Step number badge: `"02"` — same style
- Icon: `Search` (lucide)
- Title: "AI searches thousands of jobs" — `text-xl font-semibold text-text-primary`
- Body: "Tell the AI your job title and location. It searches Adzuna across 12 countries, scores every result, and saves only strong matches."
- Mini UI mockup inside card: Search bar with "Senior Frontend Engineer" + "Remote, New York" + purple Find Jobs button. Below: 3 shimmer skeleton rows to suggest loading — `bg-surface-tertiary animate-pulse rounded h-4`.

---

**Step 3 — Review Ranked Matches**

- Step number badge: `"03"` — same style
- Icon: `Target` (lucide)
- Title: "Review only the best matches" — `text-xl font-semibold text-text-primary`
- Body: "Every saved job comes with a match score, AI reasoning, and a skills gap analysis. No guessing — just signal."
- Mini UI mockup inside card: Two job rows with match score bars:
  - Vercel · Senior Frontend Engineer · 94% (green bar, full width)
  - Notion · Frontend Developer · 72% (orange bar, ~72% width)
  - Bars use `bg-border-light` track, fill color per ui-tokens.md match score rules, `h-1.5 rounded-full`

---

## Section 3 — Deep Dive Features (DeepDiveSection.tsx)

**"use client"** required.

**Layout:** `bg-surface py-24`. Alternating left/right image+text rows. Each row: `grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-6`. Alternate text side between rows.

**Section heading:** "Every feature, explained" — `text-3xl font-bold text-text-primary text-center mb-16`

---

### Deep Dive 1 — AI Match Scoring (text left, visual right)

**Text side:**
- Eyebrow: "Match Scoring" — `text-accent text-sm font-semibold uppercase tracking-wide`
- Title: "Your profile is the standard. Every job is measured against it." — `text-2xl font-bold text-text-primary`
- Body: "JobPilot's AI reads the full job description and your profile, then produces a match score from 0–100. Jobs above 70 are saved. Everything else is filtered out so your list stays clean."
- Bullet points (use `CheckCircle` lucide icon in `text-success`):
  - Scores based on skills, experience level, and job type
  - Filters out jobs below your match threshold automatically
  - Match reasoning explains every score in plain English

**Visual side:** Styled card showing:
- Job: "Senior Frontend Engineer at Vercel"
- Large match score: "94%" in `text-success text-5xl font-bold`
- Progress bar: full green, `bg-success h-2 rounded-full`
- Below: "AI Match Reasoning" block with 2–3 lines of mock reasoning text in `text-text-secondary text-sm bg-surface-secondary rounded-lg p-4`

Animate: text fades in from left (`slideInLeftVariants`), visual fades in from right, on `useInView`.

---

### Deep Dive 2 — Resume Tailoring (visual left, text right)

**Text side:**
- Eyebrow: "Resume Tailoring" — `text-accent text-sm font-semibold uppercase tracking-wide`
- Title: "One-click resumes. Tailored to each job." — `text-2xl font-bold text-text-primary`
- Body: "Upload your existing resume or generate one from your profile. JobPilot rewrites it to match the specific language and requirements of each job. PDF-ready in seconds."
- Bullets (`CheckCircle text-success`):
  - Rewrites to match job description keywords
  - Highlights your most relevant experience first
  - Download as a formatted PDF instantly

**Visual side:** Styled mockup showing:
- "Generate Resume from Profile" button — `bg-accent text-accent-foreground rounded-md px-4 py-2`
- Below: A simplified resume card (`bg-surface border border-border rounded-xl p-4`) with:
  - Name: "Daniel Ayeni" (mock)
  - Title: "Senior Frontend Engineer"
  - Two skill badges: `React` `TypeScript` in `bg-success-lightest text-success-foreground rounded-full px-2 py-0.5 text-xs`
  - A "Tailored" badge in `bg-accent-light text-accent`

---

### Deep Dive 3 — Company Research (text left, visual right)

**Text side:**
- Eyebrow: "Company Research" — `text-accent text-sm font-semibold uppercase tracking-wide`
- Title: "Know the company before you apply." — `text-2xl font-bold text-text-primary`
- Body: "Click 'Research Company' on any job. The AI browses the company's public pages and builds a dossier — culture, mission, recent news, and what they look for in candidates."
- Bullets (`CheckCircle text-success`):
  - Browses company website, LinkedIn, and news
  - Surfaces culture fit signals and red flags
  - Saves research to the job for your reference

**Visual side:** Styled card showing:
- Header: "Company Research — Stripe" with `Building2` lucide icon
- Three info rows with mock data:
  - "Mission: Increase the GDP of the internet"
  - "Culture: High autonomy, high output, remote-friendly"
  - "Recent news: Raised Series I at $50B valuation"
  - Each row: `flex gap-2 items-start text-sm text-text-secondary`
- "Research Company" button below: `bg-accent text-accent-foreground rounded-md px-4 py-2`

---

## Section 4 — How It Works CTA (HowItWorksCta.tsx)

**"use client"** required.

Reuse the same CTA pattern from the landing page `CtaSection.tsx`:
- `bg-accent rounded-3xl p-12 max-w-4xl mx-auto`
- Heading: "Ready to let AI do the searching?" — `text-4xl font-bold text-white text-center`
- Sub: "Set up your profile in 5 minutes. The AI handles the rest." — `text-white/70`
- Button: "Start for Free" → `/login` — `bg-white text-accent font-semibold h-12 px-8 rounded-md`

---

## Page Assembly (app/how-it-works/page.tsx)

```typescript
// app/how-it-works/page.tsx
// Server Component

import { Navbar } from "@/components/landing/Navbar";
import { PageHeader } from "@/components/landing/how-it-works/PageHeader";
import { StepsSection } from "@/components/landing/how-it-works/StepsSection";
import { DeepDiveSection } from "@/components/landing/how-it-works/DeepDiveSection";
import { HowItWorksCta } from "@/components/landing/how-it-works/HowItWorksCta";
import { Footer } from "@/components/landing/Footer";

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar />
      <PageHeader />
      <StepsSection />
      <DeepDiveSection />
      <HowItWorksCta />
      <Footer />
    </main>
  );
}
```

---

## Global Rules

- All colors via Tailwind tokens from `ui-tokens.md` — never hardcode hex
- All animated components have `"use client"`
- `useReducedMotion()` respected in every animated component
- Mock data only — no DB, no API calls
- Named exports only
- Animation variants imported from `lib/animation-variants.ts`
