# Pricing Page Spec — app/pricing/page.tsx

## Overview

Three-tier pricing page: Free, Pro, Team. YC startup tone — confident, no fluff, feature-dense. Designed to convert visitors on Pro. Mock data only. Toggle for monthly/annual billing. All CTAs → `/login`.

**Stack:** Next.js App Router, TypeScript strict, Tailwind v4 (@theme tokens), Framer Motion, lucide-react, shadcn/ui. See `code-standards.md` and `ui-tokens.md`.

---

## File Structure to Create

```
app/pricing/page.tsx                          ← Page assembly (Server Component)
components/landing/pricing/PricingHeader.tsx  ← Page header + billing toggle
components/landing/pricing/PricingCards.tsx   ← "use client" — 3 tier cards
components/landing/pricing/FeatureTable.tsx   ← "use client" — comparison table
components/landing/pricing/FaqSection.tsx     ← "use client" — accordion FAQ
components/landing/pricing/PricingCta.tsx     ← "use client" — bottom CTA
```

Shared `Navbar` and `Footer` from `components/landing/`.

---

## Section 1 — Pricing Header + Billing Toggle (PricingHeader.tsx)

**"use client"** required (billing toggle state).

**Layout:** `bg-background pt-32 pb-12 text-center`

**Eyebrow:** "Pricing" — `bg-accent-muted text-accent rounded-full px-3 py-1 text-sm font-medium`

**Headline:** "Simple pricing. Serious results." — `text-4xl md:text-5xl font-bold text-text-primary`

**Sub:** "Start free. Upgrade when the AI starts finding jobs worth applying to." — `text-lg text-text-secondary`

### Billing Toggle

Monthly / Annual switch. Annual = 20% discount shown on Pro and Team.

```typescript
// State in PricingHeader, passed as prop to PricingCards
const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
```

**Toggle UI:** Two-option pill toggle — `bg-surface-secondary border border-border rounded-full p-1 inline-flex`. Active option: `bg-surface rounded-full px-4 py-1.5 text-text-primary font-medium shadow-sm`. Inactive: `text-text-muted px-4 py-1.5`.

**Annual badge:** When "Annual" selected, show "Save 20%" badge in `bg-success-lightest text-success-foreground rounded-full px-2 py-0.5 text-xs font-medium` next to "Annual" label.

---

## Section 2 — Pricing Cards (PricingCards.tsx)

**"use client"** required.

**Props:**
```typescript
type Props = {
  billing: "monthly" | "annual";
};
```

**Layout:** `py-8 px-6 max-w-5xl mx-auto`. Three cards in a row (`grid grid-cols-1 md:grid-cols-3 gap-6`).

**Animation:** Cards animate in with `scaleInVariants` + stagger 120ms, `useInView({ once: true })`. Pro card has a subtle entrance glow.

---

### Free Tier Card

```
bg-surface border border-border rounded-2xl p-8
```

- **Plan name:** "Free" — `text-text-primary text-lg font-semibold`
- **Price:** "$0 / month" — `text-4xl font-bold text-text-primary`
- **Tagline:** "For exploring what AI job search can do."
- **CTA:** "Get Started" → `/login` — `border border-border text-text-primary rounded-md h-10 w-full font-medium`
- **Features list** (use `Check` lucide in `text-success`):
  - 1 job search per day
  - Up to 10 saved jobs
  - Basic match scoring
  - Profile builder
  - ✗ AI match reasoning (use `X` lucide in `text-text-muted`)
  - ✗ Resume tailoring
  - ✗ Company research
  - ✗ Analytics dashboard

---

### Pro Tier Card — FEATURED

```
bg-accent rounded-2xl p-8 ring-2 ring-accent shadow-2xl shadow-accent/20 relative
```

**"Most Popular" badge:** Absolute positioned top: `-12px` center — `bg-accent-dark text-white text-xs font-bold px-4 py-1.5 rounded-full`.

- **Plan name:** "Pro" — `text-accent-foreground text-lg font-semibold`
- **Price:** Monthly: "$29/mo" · Annual: "$23/mo" (20% off, show strikethrough "$29") — `text-4xl font-bold text-white`
- **Annual note:** "Billed annually — $276/yr" — `text-white/60 text-sm` (only show when billing = "annual")
- **Tagline:** "For engineers actively searching for their next role."
- **CTA:** "Start Pro Free — 7 days" → `/login` — `bg-white text-accent font-semibold rounded-md h-10 w-full hover:bg-white/90`
- **Features list** (use `Check` lucide in `text-white`):
  - Unlimited job searches
  - Unlimited saved jobs
  - Full AI match scoring
  - AI match reasoning on every job
  - Resume tailoring (unlimited)
  - Company research (unlimited)
  - Analytics dashboard
  - Priority support

---

### Team Tier Card

```
bg-surface border border-border rounded-2xl p-8
```

- **Plan name:** "Team" — `text-text-primary text-lg font-semibold`
- **Price:** Monthly: "$79/mo" · Annual: "$63/mo" (strikethrough "$79") — `text-4xl font-bold text-text-primary`
- **Annual note:** "Billed annually — $756/yr" — `text-text-muted text-sm`
- **Tagline:** "For hiring managers, career coaches, and teams."
- **CTA:** "Contact Sales" → `mailto:hello@jobpilot.app` — `border border-border text-text-primary rounded-md h-10 w-full font-medium`
- **Features list** (use `Check` lucide in `text-success`):
  - Everything in Pro
  - Up to 10 team seats
  - Team analytics dashboard
  - Shared job pipeline
  - Dedicated onboarding
  - SLA support

---

## Section 3 — Feature Comparison Table (FeatureTable.tsx)

**"use client"** required.

**Layout:** `bg-surface py-20 px-6`. `max-w-5xl mx-auto`.

**Heading:** "Compare plans" — `text-2xl font-bold text-text-primary mb-8`

**Table structure:** Full-width table, sticky header row, alternating `bg-surface` / `bg-surface-secondary` rows.

**Columns:** Feature · Free · Pro · Team

**Header row:** `bg-surface-tertiary border border-border rounded-t-xl`. Column headers: `text-text-secondary text-sm font-semibold uppercase tracking-wide`. Pro column header: `text-accent font-bold`.

**Row data:**

| Feature | Free | Pro | Team |
|---|---|---|---|
| Daily searches | 1 | Unlimited | Unlimited |
| Saved jobs | 10 | Unlimited | Unlimited |
| Match scoring | Basic | Full AI | Full AI |
| AI match reasoning | ✗ | ✓ | ✓ |
| Resume tailoring | ✗ | Unlimited | Unlimited |
| Company research | ✗ | Unlimited | Unlimited |
| Analytics dashboard | ✗ | ✓ | ✓ |
| Team seats | — | 1 | Up to 10 |
| Priority support | ✗ | ✓ | ✓ |
| Dedicated onboarding | ✗ | ✗ | ✓ |

**Checkmark rendering:** `✓` = `Check` lucide in `text-success`. `✗` = `X` lucide in `text-text-muted`. Text values render as `text-text-primary text-sm`.

**Animation:** Table fades up on `useInView`.

---

## Section 4 — FAQ (FaqSection.tsx)

**"use client"** required. Use shadcn/ui `Accordion` component.

**Layout:** `bg-background py-20 px-6 max-w-3xl mx-auto`

**Heading:** "Frequently asked questions" — `text-2xl font-bold text-text-primary text-center mb-10`

**6 FAQ items:**

```
Q: Is the free plan actually free?
A: Yes. No credit card required. You get 1 search per day and up to 10 saved jobs — enough to see exactly how the AI works before committing.

Q: How does the 7-day Pro trial work?
A: You get full Pro access for 7 days. No charge until day 8. Cancel any time before then and you won't be billed.

Q: What job boards does JobPilot search?
A: We search Adzuna, which aggregates listings from over 1,000 job boards across 12 countries. We're adding more sources in Q2 2025.

Q: Can I upload my existing resume?
A: Yes. Upload a PDF and JobPilot will parse it to pre-fill your profile. You can also generate a fresh resume from your profile at any time.

Q: What is a match score exactly?
A: It's a 0–100 score the AI produces by comparing the full job description against your profile — skills, experience level, job type preferences, and location. 70+ is considered a strong match.

Q: How is Team pricing structured?
A: Team is $79/month (or $63/month billed annually) for up to 10 seats. Each seat gets full Pro access. For teams larger than 10, contact us.
```

**Accordion styling:** `border border-border rounded-xl overflow-hidden`. Each item: `border-b border-border last:border-0`. Trigger: `text-text-primary font-medium py-4 px-6`. Content: `text-text-secondary text-sm pb-4 px-6`. Open indicator: `ChevronDown` lucide, rotates 180° on open.

---

## Section 5 — Pricing CTA (PricingCta.tsx)

**"use client"** required.

Same pattern as landing page and how-it-works page:

- `bg-accent rounded-3xl p-12 max-w-4xl mx-auto`
- Heading: "Start searching smarter today." — `text-4xl font-bold text-white text-center`
- Sub: "7-day free trial on Pro. No credit card required." — `text-white/70 text-center`
- Button: "Get Started Free" → `/login` — `bg-white text-accent font-semibold h-12 px-8 rounded-md whileHover scale: 1.03`

---

## Page Assembly (app/pricing/page.tsx)

```typescript
// app/pricing/page.tsx
// Note: PricingHeader owns billing state and passes it to PricingCards
// Both must be rendered client-side — wrap in a client shell

"use client";

import { useState } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { PricingHeader } from "@/components/landing/pricing/PricingHeader";
import { PricingCards } from "@/components/landing/pricing/PricingCards";
import { FeatureTable } from "@/components/landing/pricing/FeatureTable";
import { FaqSection } from "@/components/landing/pricing/FaqSection";
import { PricingCta } from "@/components/landing/pricing/PricingCta";
import { Footer } from "@/components/landing/Footer";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <main>
      <Navbar />
      <PricingHeader billing={billing} setBilling={setBilling} />
      <PricingCards billing={billing} />
      <FeatureTable />
      <FaqSection />
      <PricingCta />
      <Footer />
    </main>
  );
}
```

**Note:** Because billing state is shared between `PricingHeader` and `PricingCards`, the page itself lifts the state. This is the only landing page where `app/pricing/page.tsx` needs `"use client"`. This is acceptable — the page has no server-side data requirements.

---

## Global Rules

- All colors via Tailwind tokens — never hardcode hex
- All animated components have `"use client"`
- `useReducedMotion()` respected in all animated components
- Mock data only — no DB, no API calls
- Named exports only (except page default export)
- Animation variants imported from `lib/animation-variants.ts`
- Pro card is always visually dominant — never let Free or Team compete with its hierarchy
