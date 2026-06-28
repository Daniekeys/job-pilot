"use client";

type Billing = "monthly" | "annual";

type Props = {
  billing: Billing;
  setBilling: (billing: Billing) => void;
};

export function PricingHeader({ billing, setBilling }: Props) {
  return (
    <section className="bg-background pt-32 pb-12 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <span className="inline-flex rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent">
          Pricing
        </span>
        <h1 className="mt-6 text-4xl font-bold text-text-primary md:text-5xl">
          Simple pricing. Serious results.
        </h1>
        <p className="mt-4 text-lg text-text-secondary">
          Start free. Upgrade when the AI starts finding jobs worth applying to.
        </p>

        <div className="mt-8 inline-flex rounded-full border border-border bg-surface-secondary p-1">
          <button
            type="button"
            onClick={() => setBilling("monthly")}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              billing === "monthly"
                ? "bg-surface font-medium text-text-primary shadow-sm"
                : "text-text-muted"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBilling("annual")}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm transition-colors ${
              billing === "annual"
                ? "bg-surface font-medium text-text-primary shadow-sm"
                : "text-text-muted"
            }`}
          >
            Annual
            {billing === "annual" && (
              <span className="rounded-full bg-success-lightest px-2 py-0.5 text-xs font-medium text-success-foreground">
                Save 20%
              </span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
