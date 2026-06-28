"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRef } from "react";

import { scaleInVariants, staggerContainerVariants } from "@/lib/animation-variants";

type Props = {
  billing: "monthly" | "annual";
};

type Feature = {
  label: string;
  included: boolean;
};

const FREE_FEATURES: Feature[] = [
  { label: "1 job search per day", included: true },
  { label: "Up to 10 saved jobs", included: true },
  { label: "Basic match scoring", included: true },
  { label: "Profile builder", included: true },
  { label: "AI match reasoning", included: false },
  { label: "Resume tailoring", included: false },
  { label: "Company research", included: false },
  { label: "Analytics dashboard", included: false },
];

const PRO_FEATURES = [
  "Unlimited job searches",
  "Unlimited saved jobs",
  "Full AI match scoring",
  "AI match reasoning on every job",
  "Resume tailoring (unlimited)",
  "Company research (unlimited)",
  "Analytics dashboard",
  "Priority support",
];

const TEAM_FEATURES = [
  "Everything in Pro",
  "Up to 10 team seats",
  "Team analytics dashboard",
  "Shared job pipeline",
  "Dedicated onboarding",
  "SLA support",
];

export function PricingCards({ billing }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="mx-auto max-w-5xl px-6 py-8">
      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isInView || shouldReduceMotion ? "visible" : "hidden"}
        transition={{ staggerChildren: 0.12 }}
        className="grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        <motion.article
          variants={scaleInVariants}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-lg font-semibold text-text-primary">Free</h2>
          <p className="mt-5 text-4xl font-bold text-text-primary">$0</p>
          <p className="mt-1 text-sm text-text-muted">/ month</p>
          <p className="mt-4 min-h-12 text-sm text-text-secondary">
            For exploring what AI job search can do.
          </p>
          <Link
            href="/login"
            className="mt-6 flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Get Started
          </Link>
          <ul className="mt-6 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature.label} className="flex items-start gap-2 text-sm text-text-secondary">
                {feature.included ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-success" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-text-muted" />
                )}
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          variants={scaleInVariants}
          className="relative rounded-2xl bg-accent p-8 shadow-2xl shadow-accent/20 ring-2 ring-accent"
        >
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-dark px-4 py-1.5 text-xs font-bold text-accent-foreground">
            Most Popular
          </span>
          <h2 className="text-lg font-semibold text-accent-foreground">Pro</h2>
          <p className="mt-5 text-4xl font-bold text-accent-foreground">
            {billing === "annual" ? (
              <>
                <span className="mr-2 text-2xl text-accent-foreground/60 line-through">$29</span>
                $23/mo
              </>
            ) : (
              "$29/mo"
            )}
          </p>
          {billing === "annual" && (
            <p className="mt-1 text-sm text-accent-foreground/60">Billed annually - $276/yr</p>
          )}
          <p className="mt-4 min-h-12 text-sm text-accent-foreground/80">
            For engineers actively searching for their next role.
          </p>
          <Link
            href="/login"
            className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-surface text-sm font-semibold text-accent hover:bg-surface/90"
          >
            Start Pro Free - 7 days
          </Link>
          <ul className="mt-6 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-accent-foreground/85">
                <Check className="mt-0.5 size-4 shrink-0 text-accent-foreground" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.article>

        <motion.article
          variants={scaleInVariants}
          className="rounded-2xl border border-border bg-surface p-8"
        >
          <h2 className="text-lg font-semibold text-text-primary">Team</h2>
          <p className="mt-5 text-4xl font-bold text-text-primary">
            {billing === "annual" ? (
              <>
                <span className="mr-2 text-2xl text-text-muted line-through">$79</span>
                $63/mo
              </>
            ) : (
              "$79/mo"
            )}
          </p>
          {billing === "annual" && (
            <p className="mt-1 text-sm text-text-muted">Billed annually - $756/yr</p>
          )}
          <p className="mt-4 min-h-12 text-sm text-text-secondary">
            For hiring managers, career coaches, and teams.
          </p>
          <Link
            href="mailto:hello@jobpilot.app"
            className="mt-6 flex h-10 w-full items-center justify-center rounded-md border border-border text-sm font-medium text-text-primary hover:bg-surface-secondary"
          >
            Contact Sales
          </Link>
          <ul className="mt-6 space-y-3">
            {TEAM_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-text-secondary">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </motion.article>
      </motion.div>
    </section>
  );
}
