import { Button } from "@/components/ui/Button";

export function CTA() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-12">
      <div className="rounded-2xl bg-gradient-to-br from-accent-light via-info-lightest to-accent-muted px-6 py-16 text-center">
        <h2 className="text-3xl font-bold text-text-primary">
          Your next job search can feel a lot less overwhelming
        </h2>
        <p className="mx-auto mt-3 max-w-md text-sm text-text-secondary">
          Set up your profile, upload your resume, and start finding matches in minutes.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Button href="/login" variant="primary" showIcon>
            Get Started
          </Button>
          <Button href="/login" variant="secondary">
            Find Your First Match
          </Button>
        </div>
      </div>
    </section>
  );
}
