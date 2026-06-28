"use client";

import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { fadeUpVariants } from "@/lib/animation-variants";

export function PricingCta() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-background px-6 py-20">
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isInView || shouldReduceMotion ? "visible" : "hidden"}
        className="mx-auto max-w-4xl rounded-3xl bg-accent p-12 text-center"
      >
        <h2 className="text-4xl font-bold text-accent-foreground">
          Start searching smarter today.
        </h2>
        <p className="mt-4 text-accent-foreground/70">
          7-day free trial on Pro. No credit card required.
        </p>
        <motion.div whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }} className="mt-8">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-surface px-8 font-semibold text-accent hover:bg-surface/90"
          >
            Get Started Free
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
