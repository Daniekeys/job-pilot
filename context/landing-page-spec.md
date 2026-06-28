# Landing Page Spec — app/page.tsx

## Overview

Full rebuild of the JobPilot homepage. Target feel: funded YC startup — sharp, confident, product-led. Every section exists to move a visitor from "what is this?" to "I need this." Mock data only — no DB queries. All CTAs route to `/login` (unauthenticated) or `/dashboard` (authenticated) using the existing auth pattern.

**Stack:** Next.js App Router, TypeScript strict, Tailwind v4 (@theme tokens from globals.css), Framer Motion, lucide-react, shadcn/ui. See `code-standards.md` and `ui-tokens.md` for all rules.

---

## File Structure to Create

```
app/page.tsx                              ← Page assembly (Server Component)
components/landing/Navbar.tsx             ← Updated shared navbar
components/landing/Footer.tsx             ← Updated shared footer
components/landing/HeroSection.tsx        ← "use client" — animated headline
components/landing/ProductDemo.tsx        ← "use client" — motion graphics demo
components/landing/FeaturesSection.tsx    ← "use client" — scroll-triggered grid
components/landing/StatsSection.tsx       ← "use client" — counting numbers
components/landing/TestimonialsSection.tsx← "use client" — testimonial cards
components/landing/CtaSection.tsx         ← "use client" — final CTA
lib/animation-variants.ts                 ← Shared animation variants (see animation-setup.md)
```

**Never** import these from the old `components/homepage/` path — the old files are replaced.

---

## Section 1 — Navbar (components/landing/Navbar.tsx)

**Layout:** Fixed top, full width, blur backdrop. Logo left, nav links center, CTA right.

**Logo:**
- Purple gradient icon (match existing app logo: `linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)`, 36×36px, `rounded-[10px]`)
- Text "JobPilot" — Inter 700, `text-text-darkest`

**Nav links:** How it Works · Pricing · Sign In — `text-text-secondary`, hover `text-text-primary`, 14px Inter 500

**CTA button:** "Get Started Free" → `/login` — `bg-accent text-accent-foreground`, `rounded-md`, `px-4 py-2`

**Behavior:**
- Background: `bg-surface/80 backdrop-blur-md` at scroll > 0, transparent at top
- Use `useScroll` from framer-motion to detect scroll position — this requires `"use client"`
- On mobile: hamburger menu collapses nav links

**Do not** add `"use client"` to layout files — Navbar is a standalone component, not a layout wrapper.

---

## Section 2 — Hero (components/landing/HeroSection.tsx)

**"use client"** required.

**Layout:** Full viewport height, centered column, `bg-background`.

**Eyebrow badge:** Pill badge above headline — "AI-Powered Job Search" — `bg-accent-muted text-accent`, `rounded-full`, `px-3 py-1`, `text-sm font-medium`. Animate: fade in from top, 300ms delay.

**Headline:** Two lines:
- Line 1 (static): "Find jobs that actually" — `text-5xl md:text-7xl font-bold text-text-primary tracking-tight`
- Line 2 (animated cycling): Cycles through → **"match your skills"** / **"fit your salary"** / **"want your experience"** / **"need your stack"**
  - Animated with `AnimatePresence` + `motion.span`
  - Each word slides in from bottom (y: 40 → 0), fades in, then slides out upward (y: 0 → -40) on exit
  - Interval: 2500ms
  - Color: `text-accent`

**Subheadline:** "JobPilot's AI agent searches thousands of jobs, scores them against your profile, and surfaces only the ones worth your time." — `text-lg text-text-secondary max-w-xl text-center`

**CTAs (row):**
- Primary: "Start Finding Jobs" → `/login` — `bg-accent text-accent-foreground`, `h-11 px-6`, `rounded-md`
- Secondary: "See how it works" → `/how-it-works` — `border border-border text-text-primary`, `h-11 px-6`, `rounded-md`

**Social proof micro-line below CTAs:** "Join 11,000+ professionals already using JobPilot" — `text-sm text-text-muted`. Show 3 mock avatar circles (colored initials) + the text inline.

**Background treatment:** Subtle radial gradient behind hero — `radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 70%)` applied to section wrapper.

**Scroll indicator:** Animated bouncing chevron-down at bottom of section — `text-text-muted`.

---

## Section 3 — Product Demo (components/landing/ProductDemo.tsx)

**"use client"** required. This is the centerpiece of the page.

**Layout:** Full-width section, `bg-surface`, `py-24`. Centered heading above the demo window.

**Section heading:** "Watch the AI work in real time" — `text-3xl md:text-4xl font-bold text-text-primary text-center`
**Subheading:** "From job title to ranked matches in seconds." — `text-text-secondary text-center`

### Demo Window

A rounded browser-chrome mockup container:
- `bg-surface border border-border rounded-2xl shadow-xl overflow-hidden`
- Max width: `max-w-5xl mx-auto`
- Browser chrome bar: 3 colored dots (red/yellow/green, 10px circles), URL bar showing "jobpilot.app/find-jobs" — `bg-surface-secondary`, `h-10`, `rounded-t-2xl`

### Motion Graphics Sequence (self-running, loops)

The demo runs a 4-step cinematic sequence automatically. Use `useEffect` + state machine with these phases. Each phase auto-advances. Total loop: ~14 seconds.

**Phase 1 — Search (0–3s)**
- Render the Find Jobs UI (from the find-jobs.png design):
  - "JOB TITLE" input field animates typing "Senior Frontend Engineer" character by character (typewriter effect, 80ms per char)
  - "LOCATION" field types "Remote, New York" after job title completes
  - "Find Jobs" button pulses with a subtle scale animation (1.0 → 1.03 → 1.0)
  - Then button click animates (scale down 0.97, release)

**Phase 2 — AI Processing (3–5s)**
- Transition: current screen fades out, replaced by a loading state
- Show: centered spinner (`border-accent`) + text "AI is scanning 2,400 jobs..." that counts up from 0 to 2,400 over 1.5s
- Below: three shimmer skeleton rows animate in (loading state for job results)

**Phase 3 — Results (5–10s)**
- Transition: shimmer fades out, 6 job result rows animate in with staggered fade-up (stagger 80ms each)
- Rows match find-jobs.png data: Vercel 94%, Stripe 88%, Linear 96%, Notion 72%, OpenAI 91%, Figma 85%
- Match score bars animate width from 0% to their target value (600ms ease-out per bar, staggered)
- Score colors follow ui-tokens.md match score rules (90–100% = success, 70–89% = success, 50–69% = warning)
- Highlight the top row (Linear 96%) with a subtle `bg-accent-muted` row highlight that pulses once

**Phase 4 — Job Detail (10–14s)**
- Click animation on Linear row (scale 0.98 release)
- Transition: slide in from right, showing Job Details view (from job-details.png design)
- Show: role title, company, match score badge, AI Match Reasoning card, skills breakdown (matched vs gap)
- After 3s: fade back to Phase 1 (loop)

**Implementation notes:**
- All UI inside the demo is **pure JSX mock data** — no real components, no DB, no API calls
- Build simplified versions of the screens inline using Tailwind tokens — do not import real app components
- Use `motion.div` with `AnimatePresence` for phase transitions
- Typewriter effect: `useState` + `useEffect` interval on a string slice
- Counter animation: `useEffect` with `requestAnimationFrame` or framer-motion's `useMotionValue` + `animate`

---

## Section 4 — Features Grid (components/landing/FeaturesSection.tsx)

**"use client"** required (scroll-triggered animations).

**Layout:** `bg-background py-24`. Centered heading, then 3-column grid on desktop, 1-column on mobile.

**Section heading:** "Everything the job search is missing" — `text-3xl md:text-4xl font-bold text-text-primary text-center`

**6 feature cards** (use `bg-surface border border-border rounded-2xl p-6 shadow-sm`):

| Icon (lucide) | Title | Body |
|---|---|---|
| `Search` | AI Job Discovery | Searches Adzuna across 12 countries. Runs in the background so you don't have to. |
| `Target` | Match Scoring | Every job gets an AI match score against your profile. Only see jobs worth your time. |
| `Brain` | AI Match Reasoning | Understand exactly why a job is a fit — or isn't — before you apply. |
| `FileText` | Resume Tailoring | Generate a tailored resume for any job in one click. PDF-ready. |
| `Building2` | Company Research | AI browses the company's public pages and builds a full dossier automatically. |
| `BarChart2` | Search Analytics | Track match trends, score distribution, and company research activity over time. |

**Animation:** Each card uses `fadeUpVariants` from `lib/animation-variants.ts`. Parent grid uses `staggerContainerVariants`. Trigger with `useInView({ once: true, margin: "-80px" })`.

**Card hover:** `whileHover={{ y: -4 }}` — subtle lift only, no color change.

**Icon treatment:** Each icon in a `bg-accent-muted` circle, `text-accent`, 40×40px container, `rounded-xl`.

---

## Section 5 — Stats Section (components/landing/StatsSection.tsx)

**"use client"** required.

**Layout:** `bg-accent py-20`. Full-width, centered. White text throughout (`text-accent-foreground`).

**Heading:** "Built for engineers who are serious about their next role" — `text-3xl font-bold text-white text-center`

**4 stats in a row** (2×2 on mobile):

| Number | Label |
|---|---|
| 11,000+ | Professionals trained |
| 30+ | Countries reached |
| 284 | Avg. jobs found per search |
| 82% | Avg. AI match accuracy |

**Animation:** Numbers count up from 0 to their value when section enters viewport. Use framer-motion `animate` on a `useMotionValue`. Trigger with `useInView({ once: true })`.

**Number style:** `text-5xl font-bold text-white`. Label: `text-base text-white/70`.

---

## Section 6 — Testimonials (components/landing/TestimonialsSection.tsx)

**"use client"** required.

**Layout:** `bg-surface py-24`. Centered heading, then 3-column card grid.

**Section heading:** "What job seekers are saying" — `text-3xl font-bold text-text-primary text-center`

**3 testimonial cards** (`bg-surface-secondary border border-border rounded-2xl p-6`):

```
1. "I applied to 3 jobs last week instead of 30. Every match was above 85%. This is how job searching should work."
   — Marcus T., Senior Frontend Engineer, hired at Vercel

2. "The AI match reasoning saved me from applying to jobs I wasn't qualified for. It's brutally honest in the best way."
   — Aisha K., Product Engineer, hired at Linear

3. "Company research used to take me 2 hours per application. Now it's one click. My interview conversion tripled."
   — David O., Full Stack Engineer, hired at Stripe
```

**Card anatomy:** Quote text (`text-text-primary text-base`), then avatar row below — colored initial circle + name + title on one line, `text-text-secondary text-sm`.

**Animation:** `scaleInVariants` from `lib/animation-variants.ts`, staggered, triggered by `useInView`.

---

## Section 7 — Final CTA (components/landing/CtaSection.tsx)

**"use client"** required.

**Layout:** `bg-background py-24`. Centered column.

**Container:** `bg-accent rounded-3xl p-12 md:p-16 max-w-4xl mx-auto` with radial glow: `box-shadow: 0 0 80px rgba(124,92,252,0.3)`.

**Heading:** "Your next role is already out there." — `text-4xl md:text-5xl font-bold text-white text-center`
**Sub:** "Let the AI find it while you sleep." — `text-white/70 text-lg text-center`

**CTA button:** "Get Started Free — No credit card" → `/login` — `bg-white text-accent font-semibold`, `h-12 px-8 rounded-md`, `whileHover={{ scale: 1.03 }}`.

**Animation:** Entire container fades up with `fadeUpVariants` on `useInView`.

---

## Section 8 — Footer (components/landing/Footer.tsx)

**Server Component** — no animations needed.

**Layout:** `bg-surface border-t border-border py-12`. 4-column grid.

**Columns:**
1. Logo + tagline: "AI-powered job search for engineers who mean business."
2. Product: How it Works · Pricing · Find Jobs · Dashboard
3. Company: About · Blog · Careers · Contact
4. Legal: Privacy Policy · Terms of Service

**Bottom bar:** "© 2025 JobPilot. All rights reserved." — `text-text-muted text-sm`

---

## Page Assembly (app/page.tsx)

```typescript
// app/page.tsx
// Server Component — no "use client"

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProductDemo />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
```

---

## Global Rules

- All colors via Tailwind tokens from `ui-tokens.md` — never hardcode hex
- Font: Inter via `next/font/google`
- All animated components have `"use client"`
- Reduced motion: every component reads `useReducedMotion()` and skips animation if true
- All CTAs → `/login` if unauthenticated, `/dashboard` if authenticated — reuse existing auth pattern
- Mock data only — no DB, no API calls, no Server Actions on landing pages
- Named exports only — no default exports except `app/page.tsx`
