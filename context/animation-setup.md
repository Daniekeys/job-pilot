# Animation Setup — Framer Motion + Code Standards Update

## 1. Install Framer Motion

```bash
npm install framer-motion
```

**Justification for code-standards.md dependency list:**
Framer Motion is required for the landing page rebuild. It powers the animated hero headline cycling, scroll-triggered section reveals, the product demo motion graphics sequence, staggered feature card entrances, and hover micro-interactions. No native CSS or Next.js solution covers orchestrated keyframe sequences and gesture-based animations at this fidelity. No shadcn/ui component covers this use case.

---

## 2. Update code-standards.md — Dependencies Section

Add this line to the approved dependencies list:

```
- `framer-motion` — Animation library for landing page hero, scroll reveals, product demo motion graphics, and hover micro-interactions
```

---

## 3. Update code-standards.md — "use client" Rules

Framer Motion components (`motion.div`, `motion.span`, `AnimatePresence`, `useScroll`, `useTransform`, `useInView`) are client-only. Any component that imports from `framer-motion` must have `"use client"` at the top.

Add this line to the existing `"use client"` trigger list in code-standards.md:

```
  - Framer Motion components (motion.*, AnimatePresence, useScroll, useTransform, useInView)
```

---

## 4. Animation Usage Rules (add to code-standards.md)

```
## Animation

- Framer Motion is the only animation library approved for this project
- All animated components must be Client Components ("use client")
- Always respect reduced motion — wrap motion variants with:
  const prefersReducedMotion = useReducedMotion();
  Use instant transitions when prefersReducedMotion is true
- Scroll-triggered animations use useInView with { once: true, margin: "-100px" }
- Never animate layout-affecting properties (width, height, padding) — use opacity and transform only
- Stagger children using variants with staggerChildren on the parent container
- Product demo motion graphics live in components/landing/ProductDemo.tsx — self-contained, no props required
```

---

## 5. Approved Framer Motion APIs for this project

| API | Usage |
|-----|-------|
| `motion.div / motion.span` | Animated wrappers |
| `AnimatePresence` | Hero title cycling, screen transitions in demo |
| `useInView` | Scroll-triggered reveals for all sections |
| `useScroll + useTransform` | Parallax on hero background |
| `useReducedMotion` | Accessibility — disable motion when user prefers |
| `variants` | Staggered children in feature grid, stats |
| `whileHover` | Card hover lifts, button scale |

---

## 6. Reusable Animation Variants (create lib/animation-variants.ts)

```typescript
// lib/animation-variants.ts

import { Variants } from "framer-motion";

export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: "easeOut" } },
};

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
```

Import these variants in every landing page component — never hardcode animation values inline.
