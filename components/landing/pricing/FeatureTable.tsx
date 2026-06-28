"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useRef } from "react";

import { fadeUpVariants } from "@/lib/animation-variants";

type CellValue = string | boolean;

type FeatureRow = {
  feature: string;
  free: CellValue;
  pro: CellValue;
  team: CellValue;
};

const ROWS: FeatureRow[] = [
  { feature: "Daily searches", free: "1", pro: "Unlimited", team: "Unlimited" },
  { feature: "Saved jobs", free: "10", pro: "Unlimited", team: "Unlimited" },
  { feature: "Match scoring", free: "Basic", pro: "Full AI", team: "Full AI" },
  { feature: "AI match reasoning", free: false, pro: true, team: true },
  { feature: "Resume tailoring", free: false, pro: "Unlimited", team: "Unlimited" },
  { feature: "Company research", free: false, pro: "Unlimited", team: "Unlimited" },
  { feature: "Analytics dashboard", free: false, pro: true, team: true },
  { feature: "Team seats", free: "-", pro: "1", team: "Up to 10" },
  { feature: "Priority support", free: false, pro: true, team: true },
  { feature: "Dedicated onboarding", free: false, pro: false, team: true },
];

function TableValue({ value }: { value: CellValue }) {
  if (value === true) {
    return <Check className="mx-auto size-5 text-success" />;
  }

  if (value === false) {
    return <X className="mx-auto size-5 text-text-muted" />;
  }

  return <span className="text-sm text-text-primary">{value}</span>;
}

export function FeatureTable() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="bg-surface px-6 py-20">
      <motion.div
        ref={ref}
        variants={fadeUpVariants}
        initial={shouldReduceMotion ? "visible" : "hidden"}
        animate={isInView || shouldReduceMotion ? "visible" : "hidden"}
        className="mx-auto max-w-5xl"
      >
        <h2 className="mb-8 text-2xl font-bold text-text-primary">Compare plans</h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-surface-tertiary">
              <tr>
                {["Feature", "Free", "Pro", "Team"].map((heading) => (
                  <th
                    key={heading}
                    className={`px-4 py-4 text-left text-sm font-semibold uppercase tracking-wide ${
                      heading === "Pro" ? "text-accent font-bold" : "text-text-secondary"
                    } ${heading !== "Feature" ? "text-center" : ""}`}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, index) => (
                <tr
                  key={row.feature}
                  className={`${index % 2 === 0 ? "bg-surface" : "bg-surface-secondary"}`}
                >
                  <td className="px-4 py-4 text-sm font-medium text-text-primary">
                    {row.feature}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <TableValue value={row.free} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <TableValue value={row.pro} />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <TableValue value={row.team} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </section>
  );
}
