"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Brain, Building2, ChartColumn, FileText, Search, Target } from "lucide-react";

import { fadeUpVariants, staggerContainerVariants } from "@/lib/animation-variants";

type Feature = {
  icon: typeof Search;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    icon: Search,
    title: "AI Job Discovery",
    body: "Searches Adzuna across 12 countries. Runs in the background so you don't have to.",
  },
  {
    icon: Target,
    title: "Match Scoring",
    body: "Every job gets an AI match score against your profile. Only see jobs worth your time.",
  },
  {
    icon: Brain,
    title: "AI Match Reasoning",
    body: "Understand exactly why a job is a fit — or isn't — before you apply.",
  },
  {
    icon: FileText,
    title: "Resume Tailoring",
    body: "Generate a tailored resume for any job in one click. PDF-ready.",
  },
  {
    icon: Building2,
    title: "Company Research",
    body: "AI browses the company's public pages and builds a full dossier automatically.",
  },
  {
    icon: ChartColumn,
    title: "Search Analytics",
    body: "Track match trends, score distribution, and company research activity over time.",
  },
];

export function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const isVisible = isInView || shouldReduceMotion;

  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-text-primary md:text-4xl">
          Everything the job search is missing
        </h2>
      </div>

      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isVisible ? "visible" : "hidden"}
        className="mx-auto mt-12 grid max-w-[1440px] grid-cols-1 gap-6 px-6 md:grid-cols-3"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeUpVariants}
            whileHover={{ y: -4 }}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex size-10 items-center justify-center rounded-xl bg-accent-muted text-accent">
              <feature.icon className="size-5" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-primary">{feature.title}</h3>
            <p className="mt-2 text-sm text-text-secondary">{feature.body}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
