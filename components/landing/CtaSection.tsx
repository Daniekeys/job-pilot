"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { fadeUpVariants } from "@/lib/animation-variants";

export function CtaSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const isVisible = isInView || shouldReduceMotion;

  return (
    <section className="bg-background py-24">
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isVisible ? "visible" : "hidden"}
        style={{ boxShadow: "0 0 80px rgba(124,92,252,0.3)" }}
        className="mx-auto max-w-4xl rounded-3xl bg-accent p-12 text-center md:p-16"
      >
        <h2 className="text-4xl font-bold text-white md:text-5xl">
          Your next role is already out there.
        </h2>
        <p className="mt-4 text-lg text-white/70">Let the AI find it while you sleep.</p>
        <motion.div whileHover={{ scale: 1.03 }} className="mt-8 inline-block">
          <Link
            href="/login"
            className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-semibold text-accent"
          >
            Get Started Free — No credit card
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
