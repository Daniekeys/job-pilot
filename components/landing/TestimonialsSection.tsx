"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

import { scaleInVariants, staggerContainerVariants } from "@/lib/animation-variants";

type Testimonial = {
  quote: string;
  name: string;
  title: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "I applied to 3 jobs last week instead of 30. Every match was above 85%. This is how job searching should work.",
    name: "Marcus T.",
    title: "Senior Frontend Engineer, hired at Vercel",
  },
  {
    quote:
      "The AI match reasoning saved me from applying to jobs I wasn't qualified for. It's brutally honest in the best way.",
    name: "Aisha K.",
    title: "Product Engineer, hired at Linear",
  },
  {
    quote:
      "Company research used to take me 2 hours per application. Now it's one click. My interview conversion tripled.",
    name: "David O.",
    title: "Full Stack Engineer, hired at Stripe",
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const shouldReduceMotion = useReducedMotion();
  const isVisible = isInView || shouldReduceMotion;

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl font-bold text-text-primary">What job seekers are saying</h2>
      </div>

      <motion.div
        ref={ref}
        variants={staggerContainerVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isVisible ? "visible" : "hidden"}
        className="mx-auto mt-12 grid max-w-[1440px] grid-cols-1 gap-6 px-6 md:grid-cols-3"
      >
        {TESTIMONIALS.map((testimonial) => (
          <motion.div
            key={testimonial.name}
            variants={scaleInVariants}
            className="rounded-2xl border border-border bg-surface-secondary p-6"
          >
            <p className="text-base text-text-primary">&ldquo;{testimonial.quote}&rdquo;</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                {testimonial.name.charAt(0)}
              </span>
              <p className="text-sm text-text-secondary">
                {testimonial.name} — {testimonial.title}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
