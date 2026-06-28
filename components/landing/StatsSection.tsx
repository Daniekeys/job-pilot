"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

type Stat = {
  label: string;
  value: number;
  suffix: string;
};

const STATS: Stat[] = [
  { label: "Professionals trained", value: 11000, suffix: "+" },
  { label: "Countries reached", value: 30, suffix: "+" },
  { label: "Avg. jobs found per search", value: 284, suffix: "" },
  { label: "Avg. AI match accuracy", value: 82, suffix: "%" },
];

export function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="bg-accent py-20">
      <div className="mx-auto max-w-[1440px] px-6 text-center">
        <h2 className="text-3xl font-bold text-white">
          Built for engineers who are serious about their next role
        </h2>

        <div ref={ref} className="mt-12 grid grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((stat) => (
            <StatItem key={stat.label} stat={stat} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}

type StatItemProps = {
  stat: Stat;
  isInView: boolean;
};

function StatItem({ stat, isInView }: StatItemProps) {
  const [count, setCount] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, stat.value, {
      duration: shouldReduceMotion ? 0 : 1.5,
      ease: "easeOut",
      onUpdate: (value) => setCount(Math.round(value)),
    });
    return () => controls.stop();
  }, [isInView, shouldReduceMotion, stat.value]);

  return (
    <div>
      <p className="text-5xl font-bold text-white">
        {count.toLocaleString()}
        {stat.suffix}
      </p>
      <p className="mt-2 text-base text-white/70">{stat.label}</p>
    </div>
  );
}
