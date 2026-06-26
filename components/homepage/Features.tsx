import Image from "next/image";

type FeatureItem = {
  title: string;
  description: string;
};

const SEARCH_FEATURES: FeatureItem[] = [
  {
    title: "Find jobs that actually fit",
    description:
      "Search by title and location or paste a job link. Get matched roles you can quickly scan.",
  },
  {
    title: "Know the Company Before You Apply",
    description:
      "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence.",
  },
  {
    title: "Keep track of every application",
    description:
      "Keep a clear view of every job you’ve found, tailored, your activity and progress all stay in one simple place.",
  },
];

const MATCHING_FEATURES: FeatureItem[] = [
  {
    title: "Understand your match score",
    description:
      "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what’s missing.",
  },
  {
    title: "AI-Powered Job Matching",
    description:
      "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter.",
  },
  {
    title: "Focus on the right roles",
    description:
      "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying.",
  },
];

export function Features() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            Manage Your Job Search With Ease
          </h2>
          <div className="mt-8 space-y-6">
            {SEARCH_FEATURES.map((feature) => (
              <div key={feature.title} className="border-l-2 border-border pl-4">
                <h3 className="text-base font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-surface-tertiary p-8">
          <Image
            src="/images/jobs-lists.png"
            alt="JobPilot matched jobs list"
            width={2364}
            height={1778}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-24 grid items-center gap-12 lg:grid-cols-2">
        <div className="rounded-2xl bg-surface-tertiary p-8">
          <Image
            src="/images/agnet-log.png"
            alt="JobPilot agent activity log"
            width={2144}
            height={1656}
            className="w-full"
          />
        </div>

        <div>
          <h2 className="text-3xl font-bold text-text-primary">
            Apply With More Confidence, Every Time
          </h2>
          <div className="mt-8 space-y-6">
            {MATCHING_FEATURES.map((feature) => (
              <div key={feature.title} className="border-l-2 border-border pl-4">
                <h3 className="text-base font-semibold text-text-primary">{feature.title}</h3>
                <p className="mt-1 text-sm text-text-secondary">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
