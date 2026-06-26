import Image from "next/image";

import { Button } from "@/components/ui/Button";

export function Hero() {
  return (
    <section className="bg-gradient-to-br from-accent-light via-info-lightest to-accent-muted">
      <div className="mx-auto max-w-[1440px] px-6 pt-20 pb-24 text-center">
        <h1 className="text-4xl font-bold leading-tight text-text-primary sm:text-5xl">
          Job hunting is hard.
          <br />
          Your tools shouldn’t be.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-text-secondary sm:text-base">
          Stop applying blind. JobPilot finds the jobs, researches the companies, and gives you
          everything you need to stand out.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button href="/login" variant="primary" showIcon>
            Get Started
          </Button>
          <Button href="/login" variant="secondary">
            Find Your First Match
          </Button>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <Image
            src="/images/dashboard-demo.png"
            alt="JobPilot dashboard preview"
            width={4788}
            height={2416}
            className="w-full rounded-2xl shadow-xl"
            priority
          />
        </div>
      </div>
    </section>
  );
}
