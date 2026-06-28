"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion, Variants } from "framer-motion";
import { Building2, CircleCheck } from "lucide-react";

import { slideInLeftVariants, slideInRightVariants } from "@/lib/animation-variants";

type DeepDive = {
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  reverse: boolean;
  visual: React.ReactNode;
};

const DEEP_DIVES: DeepDive[] = [
  {
    eyebrow: "Match Scoring",
    title: "Your profile is the standard. Every job is measured against it.",
    body: "JobPilot's AI reads the full job description and your profile, then produces a match score from 0–100. Jobs above 70 are saved. Everything else is filtered out so your list stays clean.",
    bullets: [
      "Scores based on skills, experience level, and job type",
      "Filters out jobs below your match threshold automatically",
      "Match reasoning explains every score in plain English",
    ],
    reverse: false,
    visual: (
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <p className="text-sm font-medium text-text-secondary">Senior Frontend Engineer at Vercel</p>
        <p className="mt-4 text-5xl font-bold text-success">94%</p>
        <div className="mt-4 h-2 rounded-full bg-border-light">
          <div className="h-2 w-full rounded-full bg-success" />
        </div>
        <div className="mt-6 rounded-lg bg-surface-secondary p-4 text-sm text-text-secondary">
          <p className="font-semibold text-text-primary">AI Match Reasoning</p>
          <p className="mt-1">
            Strong alignment on React, TypeScript, and Next.js. Your 5 years of experience matches
            the senior level requirement, and full remote support fits your preference.
          </p>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Resume Tailoring",
    title: "One-click resumes. Tailored to each job.",
    body: "Upload your existing resume or generate one from your profile. JobPilot rewrites it to match the specific language and requirements of each job. PDF-ready in seconds.",
    bullets: [
      "Rewrites to match job description keywords",
      "Highlights your most relevant experience first",
      "Download as a formatted PDF instantly",
    ],
    reverse: true,
    visual: (
      <div className="flex flex-col items-start gap-4">
        <div className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          Generate Resume from Profile
        </div>
        <div className="w-full rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-text-primary">Daniel Ayeni</p>
              <p className="text-sm text-text-secondary">Senior Frontend Engineer</p>
            </div>
            <span className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent">
              Tailored
            </span>
          </div>
          <div className="mt-3 flex gap-1.5">
            <span className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
              React
            </span>
            <span className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
              TypeScript
            </span>
          </div>
        </div>
      </div>
    ),
  },
  {
    eyebrow: "Company Research",
    title: "Know the company before you apply.",
    body: "Click 'Research Company' on any job. The AI browses the company's public pages and builds a dossier — culture, mission, recent news, and what they look for in candidates.",
    bullets: [
      "Browses company website, LinkedIn, and news",
      "Surfaces culture fit signals and red flags",
      "Saves research to the job for your reference",
    ],
    reverse: false,
    visual: (
      <div className="rounded-2xl border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="size-5 text-text-secondary" />
          <p className="font-semibold text-text-primary">Company Research — Stripe</p>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            Mission: Increase the GDP of the internet
          </div>
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            Culture: High autonomy, high output, remote-friendly
          </div>
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            Recent news: Raised Series I at $50B valuation
          </div>
        </div>
        <div className="mt-6 rounded-md bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground">
          Research Company
        </div>
      </div>
    ),
  },
];

function DeepDiveRow({ eyebrow, title, body, bullets, reverse, visual }: DeepDive) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const isVisible = isInView || shouldReduceMotion;

  const textVariants: Variants = reverse ? slideInRightVariants : slideInLeftVariants;
  const visualVariants: Variants = reverse ? slideInLeftVariants : slideInRightVariants;

  const textBlock = (
    <motion.div
      variants={textVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate={isVisible ? "visible" : "hidden"}
    >
      <p className="text-sm font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      <h3 className="mt-3 text-2xl font-bold text-text-primary">{title}</h3>
      <p className="mt-4 text-text-secondary">{body}</p>
      <ul className="mt-6 space-y-3">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2 text-sm text-text-secondary">
            <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />
            {bullet}
          </li>
        ))}
      </ul>
    </motion.div>
  );

  const visualBlock = (
    <motion.div
      variants={visualVariants}
      initial={shouldReduceMotion ? "visible" : "hidden"}
      animate={isVisible ? "visible" : "hidden"}
    >
      {visual}
    </motion.div>
  );

  return (
    <div
      ref={ref}
      className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 lg:grid-cols-2"
    >
      {reverse ? (
        <>
          {visualBlock}
          {textBlock}
        </>
      ) : (
        <>
          {textBlock}
          {visualBlock}
        </>
      )}
    </div>
  );
}

export function DeepDiveSection() {
  return (
    <section className="bg-surface py-24">
      <h2 className="mb-16 text-center text-3xl font-bold text-text-primary">
        Every feature, explained
      </h2>
      <div className="flex flex-col gap-24">
        {DEEP_DIVES.map((deepDive) => (
          <DeepDiveRow key={deepDive.title} {...deepDive} />
        ))}
      </div>
    </section>
  );
}
