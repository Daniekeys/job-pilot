"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Is the free plan actually free?",
    answer:
      "Yes. No credit card required. You get 1 search per day and up to 10 saved jobs - enough to see exactly how the AI works before committing.",
  },
  {
    question: "How does the 7-day Pro trial work?",
    answer:
      "You get full Pro access for 7 days. No charge until day 8. Cancel any time before then and you won't be billed.",
  },
  {
    question: "What job boards does JobPilot search?",
    answer:
      "We search Adzuna, which aggregates listings from over 1,000 job boards across 12 countries. We're adding more sources in Q2 2025.",
  },
  {
    question: "Can I upload my existing resume?",
    answer:
      "Yes. Upload a PDF and JobPilot will parse it to pre-fill your profile. You can also generate a fresh resume from your profile at any time.",
  },
  {
    question: "What is a match score exactly?",
    answer:
      "It's a 0-100 score the AI produces by comparing the full job description against your profile - skills, experience level, job type preferences, and location. 70+ is considered a strong match.",
  },
  {
    question: "How is Team pricing structured?",
    answer:
      "Team is $79/month (or $63/month billed annually) for up to 10 seats. Each seat gets full Pro access. For teams larger than 10, contact us.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl bg-background px-6 py-20">
      <h2 className="mb-10 text-center text-2xl font-bold text-text-primary">
        Frequently asked questions
      </h2>
      <div className="overflow-hidden rounded-xl border border-border">
        {FAQ_ITEMS.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question} className="border-b border-border last:border-0">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between px-6 py-4 text-left font-medium text-text-primary"
              >
                <span>{item.question}</span>
                <ChevronDown
                  className={`size-5 shrink-0 text-text-secondary transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-6 pb-4 text-sm text-text-secondary">{item.answer}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
