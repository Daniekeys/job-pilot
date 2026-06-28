import { Navbar } from "@/components/landing/Navbar";
import { PageHeader } from "@/components/landing/how-it-works/PageHeader";
import { StepsSection } from "@/components/landing/how-it-works/StepsSection";
import { DeepDiveSection } from "@/components/landing/how-it-works/DeepDiveSection";
import { HowItWorksCta } from "@/components/landing/how-it-works/HowItWorksCta";
import { Footer } from "@/components/landing/Footer";

export default function HowItWorksPage() {
  return (
    <main>
      <Navbar />
      <PageHeader />
      <StepsSection />
      <DeepDiveSection />
      <HowItWorksCta />
      <Footer />
    </main>
  );
}
