"use client";

import { useEffect, useState } from "react";
import { animate, AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { fadeUpVariants, staggerContainerVariants } from "@/lib/animation-variants";

type Phase = "search" | "processing" | "results" | "detail";

const PHASE_ORDER: Phase[] = ["search", "processing", "results", "detail"];

const PHASE_DURATION_MS: Record<Phase, number> = {
  search: 3000,
  processing: 2000,
  results: 5000,
  detail: 4000,
};

const SEARCH_TITLE = "Senior Frontend Engineer";
const SEARCH_LOCATION = "Remote, New York";
const TYPE_SPEED_MS = 80;

type MockResult = {
  company: string;
  score: number;
  highlighted?: boolean;
};

const MOCK_RESULTS: MockResult[] = [
  { company: "Vercel", score: 94 },
  { company: "Stripe", score: 88 },
  { company: "Linear", score: 96, highlighted: true },
  { company: "Notion", score: 72 },
  { company: "OpenAI", score: 91 },
  { company: "Figma", score: 85 },
];

function scoreColorClasses(score: number): { text: string; bar: string } {
  if (score >= 70) return { text: "text-success", bar: "bg-success" };
  if (score >= 50) return { text: "text-warning", bar: "bg-warning" };
  return { text: "text-text-muted", bar: "bg-border-light" };
}

export function ProductDemo() {
  const [phase, setPhase] = useState<Phase>("search");
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const currentIndex = PHASE_ORDER.indexOf(phase);
      setPhase(PHASE_ORDER[(currentIndex + 1) % PHASE_ORDER.length]);
    }, PHASE_DURATION_MS[phase]);
    return () => clearTimeout(timeout);
  }, [phase]);

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
          Watch the AI work in real time
        </h2>
        <p className="mt-3 text-text-secondary">From job title to ranked matches in seconds.</p>
      </div>

      <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex h-10 items-center gap-2 rounded-t-2xl bg-surface-secondary px-4">
          <span className="size-2.5 rounded-full bg-error" />
          <span className="size-2.5 rounded-full bg-warning" />
          <span className="size-2.5 rounded-full bg-success" />
          <span className="ml-3 truncate text-xs text-text-muted">jobpilot.app/find-jobs</span>
        </div>

        <div className="relative h-[420px] overflow-hidden p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={
                shouldReduceMotion
                  ? false
                  : phase === "detail"
                    ? { opacity: 0, x: 40 }
                    : { opacity: 0 }
              }
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4 }}
              className="h-full"
            >
              {phase === "search" && <SearchPhase />}
              {phase === "processing" && <ProcessingPhase />}
              {phase === "results" && <ResultsPhase />}
              {phase === "detail" && <DetailPhase />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function SearchPhase() {
  const [typedTitle, setTypedTitle] = useState("");
  const [typedLocation, setTypedLocation] = useState("");
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedTitle(SEARCH_TITLE.slice(0, index));
      if (index >= SEARCH_TITLE.length) clearInterval(interval);
    }, TYPE_SPEED_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typedTitle !== SEARCH_TITLE) return;
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setTypedLocation(SEARCH_LOCATION.slice(0, index));
      if (index >= SEARCH_LOCATION.length) clearInterval(interval);
    }, TYPE_SPEED_MS);
    return () => clearInterval(interval);
  }, [typedTitle]);

  useEffect(() => {
    if (typedLocation !== SEARCH_LOCATION) return;
    const timeout = setTimeout(() => setIsPressed(true), 400);
    return () => clearTimeout(timeout);
  }, [typedLocation]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="w-full max-w-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Job Title
        </p>
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary">
          {typedTitle}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      <div className="w-full max-w-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-text-secondary">
          Location
        </p>
        <div className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary">
          {typedLocation}
          {typedTitle === SEARCH_TITLE && <span className="animate-pulse">|</span>}
        </div>
      </div>

      <motion.button
        type="button"
        animate={isPressed ? { scale: 0.97 } : { scale: [1, 1.03, 1] }}
        transition={isPressed ? { duration: 0.2 } : { duration: 1, repeat: Infinity }}
        className="rounded-md bg-accent px-6 py-2 text-sm font-medium text-accent-foreground"
      >
        Find Jobs
      </motion.button>
    </div>
  );
}

function ProcessingPhase() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, 2400, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (value) => setCount(Math.round(value)),
    });
    return () => controls.stop();
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6">
      <Loader2 className="size-10 animate-spin text-accent" />
      <p className="text-sm font-medium text-text-primary">
        AI is scanning {count.toLocaleString()} jobs...
      </p>
      <div className="w-full max-w-sm space-y-2">
        {[0, 1, 2].map((row) => (
          <motion.div
            key={row}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: row * 0.15 }}
            className="h-10 animate-pulse rounded-md bg-surface-tertiary"
          />
        ))}
      </div>
    </div>
  );
}

function ResultsPhase() {
  return (
    <motion.div
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="flex h-full flex-col gap-2 overflow-y-auto"
    >
      {MOCK_RESULTS.map((result, index) => {
        const colors = scoreColorClasses(result.score);
        return (
          <motion.div
            key={result.company}
            variants={fadeUpVariants}
            animate={result.highlighted ? { opacity: [1, 0.6, 1] } : undefined}
            transition={result.highlighted ? { duration: 0.6, delay: 0.5 } : undefined}
            className={`flex items-center justify-between rounded-lg border border-border px-4 py-3 ${
              result.highlighted ? "bg-accent-muted" : "bg-surface"
            }`}
          >
            <span className="text-sm font-medium text-text-primary">{result.company}</span>
            <div className="flex items-center gap-3">
              <div className="h-1 w-20 rounded-full bg-border-light">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${result.score}%` }}
                  transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.08 }}
                  className={`h-1 rounded-full ${colors.bar}`}
                />
              </div>
              <span className={`text-sm font-semibold ${colors.text}`}>{result.score}%</span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function DetailPhase() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto">
      <div>
        <p className="text-lg font-semibold text-text-primary">Senior Frontend Engineer</p>
        <p className="text-sm text-text-secondary">Linear</p>
      </div>

      <span className="inline-flex w-fit items-center rounded-full bg-success-lightest px-3 py-1 text-sm font-semibold text-success-foreground">
        96% Match
      </span>

      <div className="rounded-lg border border-border bg-surface-secondary p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
          AI Match Reasoning
        </p>
        <p className="mt-2 text-sm text-text-primary">
          Strong alignment on React, TypeScript, and design systems experience. Your past work on
          component libraries closely matches this role&apos;s core responsibilities.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {["React", "TypeScript", "GraphQL"].map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground"
          >
            {skill}
          </span>
        ))}
        <span className="rounded-full bg-accent-muted px-2 py-0.5 text-xs font-medium text-accent">
          Rust
        </span>
      </div>
    </div>
  );
}
