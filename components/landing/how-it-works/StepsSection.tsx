"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Search, Target, User } from "lucide-react";

import { fadeUpVariants, staggerContainerVariants } from "@/lib/animation-variants";

type Step = {
  number: string;
  icon: typeof User;
  title: string;
  body: string;
  mockup: React.ReactNode;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: User,
    title: "Build your profile once",
    body: "Add your skills, experience, job preferences, and resume. JobPilot uses this as the benchmark for every match.",
    mockup: (
      <div className="mt-6 space-y-2">
        <div className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary">
          Daniel Ayeni
        </div>
        <div className="flex flex-wrap gap-1.5 rounded-md border border-border bg-surface-secondary px-3 py-2">
          {["React", "TypeScript", "Next.js"].map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-accent-light px-2 py-0.5 text-xs font-medium text-accent"
            >
              {skill}
            </span>
          ))}
        </div>
        <div className="rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary">
          Senior Frontend Engineer
        </div>
      </div>
    ),
  },
  {
    number: "02",
    icon: Search,
    title: "AI searches thousands of jobs",
    body: "Tell the AI your job title and location. It searches Adzuna across 12 countries, scores every result, and saves only strong matches.",
    mockup: (
      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary">
            Senior Frontend Engineer
          </div>
          <div className="flex-1 rounded-md border border-border bg-surface-secondary px-3 py-2 text-sm text-text-primary">
            Remote, New York
          </div>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
          <Search className="size-4" />
          Find Jobs
        </div>
        <div className="space-y-2 pt-2">
          {[0, 1, 2].map((row) => (
            <div key={row} className="h-4 animate-pulse rounded bg-surface-tertiary" />
          ))}
        </div>
      </div>
    ),
  },
  {
    number: "03",
    icon: Target,
    title: "Review only the best matches",
    body: "Every saved job comes with a match score, AI reasoning, and a skills gap analysis. No guessing — just signal.",
    mockup: (
      <div className="mt-6 space-y-3">
        {[
          { company: "Vercel", title: "Senior Frontend Engineer", score: 94, fill: "bg-success" },
          { company: "Notion", title: "Frontend Developer", score: 72, fill: "bg-warning" },
        ].map((job) => (
          <div
            key={job.company}
            className="rounded-md border border-border bg-surface-secondary px-3 py-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text-primary">
                {job.company} · {job.title}
              </span>
              <span className="font-semibold text-text-primary">{job.score}%</span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-border-light">
              <div className={`h-1.5 rounded-full ${job.fill}`} style={{ width: `${job.score}%` }} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
];

export function StepsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const shouldReduceMotion = useReducedMotion();
  const isVisible = isInView || shouldReduceMotion;

  return (
    <section className="bg-background py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <motion.div
          ref={ref}
          variants={staggerContainerVariants}
          transition={{ staggerChildren: 0.15 }}
          initial={shouldReduceMotion ? "visible" : "hidden"}
          animate={isVisible ? "visible" : "hidden"}
          className="relative flex flex-col gap-8 lg:flex-row lg:items-stretch"
        >
          <motion.div
            initial={shouldReduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: isVisible ? 1 : 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: "left" }}
            className="absolute top-1/2 hidden w-full border-t-2 border-dashed border-border lg:block"
          />

          {STEPS.map((step) => (
            <motion.div
              key={step.number}
              variants={fadeUpVariants}
              className="relative flex-1 rounded-2xl border border-border bg-surface p-8"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                  {step.number}
                </span>
                <span className="flex size-10 items-center justify-center rounded-full bg-accent-muted text-accent">
                  <step.icon className="size-5" />
                </span>
              </div>
              <h3 className="mt-4 text-xl font-semibold text-text-primary">{step.title}</h3>
              <p className="mt-2 text-sm text-text-secondary">{step.body}</p>
              {step.mockup}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
