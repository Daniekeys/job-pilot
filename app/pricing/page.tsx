"use client";

import { useState } from "react";

import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";
import { FaqSection } from "@/components/landing/pricing/FaqSection";
import { FeatureTable } from "@/components/landing/pricing/FeatureTable";
import { PricingCards } from "@/components/landing/pricing/PricingCards";
import { PricingCta } from "@/components/landing/pricing/PricingCta";
import { PricingHeader } from "@/components/landing/pricing/PricingHeader";

export default function PricingPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <main>
      <Navbar />
      <PricingHeader billing={billing} setBilling={setBilling} />
      <PricingCards billing={billing} />
      <FeatureTable />
      <FaqSection />
      <PricingCta />
      <Footer />
    </main>
  );
}
