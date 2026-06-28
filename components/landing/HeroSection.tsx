"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const CYCLE_WORDS = [
  "match your skills",
  "fit your salary",
  "want your experience",
  "need your stack",
];

const CYCLE_INTERVAL_MS = 2500;
const AVATAR_INITIALS = ["J", "K", "M"];

export function HeroSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((index) => (index + 1) % CYCLE_WORDS.length);
    }, CYCLE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative flex min-h-screen flex-col items-center justify-center bg-background px-6 pt-16"
      style={{
        backgroundImage:
          "radial-gradient(ellipse at 50% 0%, rgba(124,92,252,0.08) 0%, transparent 70%)",
      }}
    >
      <motion.span
        initial={shouldReduceMotion ? false : { opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent"
      >
        AI-Powered Job Search
      </motion.span>

      <h1 className="mt-6 max-w-3xl text-center text-5xl font-bold tracking-tight text-text-primary md:text-7xl">
        <span className="block">Find jobs that actually</span>
        <span className="relative mt-2 block h-16 overflow-hidden text-accent md:h-24">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={shouldReduceMotion ? false : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={shouldReduceMotion ? undefined : { y: -40, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {CYCLE_WORDS[wordIndex]}
            </motion.span>
          </AnimatePresence>
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-center text-lg text-text-secondary">
        JobPilot&apos;s AI agent searches thousands of jobs, scores them against your profile, and
        surfaces only the ones worth your time.
      </p>

      <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-6 text-sm font-medium text-accent-foreground hover:bg-accent-dark"
        >
          Start Finding Jobs
        </Link>
        <Link
          href="/how-it-works"
          className="inline-flex h-11 items-center justify-center rounded-md border border-border px-6 text-sm font-medium text-text-primary hover:bg-surface-secondary"
        >
          See how it works
        </Link>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <div className="flex -space-x-2">
          {AVATAR_INITIALS.map((initial, index) => (
            <span
              key={initial}
              style={{ zIndex: AVATAR_INITIALS.length - index }}
              className="flex size-7 items-center justify-center rounded-full border-2 border-surface bg-accent-light text-xs font-semibold text-accent"
            >
              {initial}
            </span>
          ))}
        </div>
        <p className="text-sm text-text-muted">Join 11,000+ professionals already using JobPilot</p>
      </div>

      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 text-text-muted"
      >
        <ChevronDown className="size-6" />
      </motion.div>
    </section>
  );
}
