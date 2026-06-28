import { redirect } from "next/navigation";

import { Navbar } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProductDemo } from "@/components/landing/ProductDemo";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { StatsSection } from "@/components/landing/StatsSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaSection } from "@/components/landing/CtaSection";
import { Footer } from "@/components/landing/Footer";
import { createInsforgeServer } from "@/lib/insforge-server";

export default async function HomePage() {
  const insforge = await createInsforgeServer();
  const { data } = await insforge.auth.getCurrentUser();

  if (data.user) {
    redirect("/dashboard");
  }

  return (
    <main>
      <Navbar />
      <HeroSection />
      <ProductDemo />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <CtaSection />
      <Footer />
    </main>
  );
}
