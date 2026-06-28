export function PageHeader() {
  return (
    <section className="bg-background pt-32 pb-16 text-center">
      <div className="mx-auto max-w-3xl px-6">
        <span className="mb-4 inline-block rounded-full bg-accent-muted px-3 py-1 text-sm font-medium text-accent">
          How JobPilot Works
        </span>
        <h1 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Three steps from profile to perfect match
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-text-secondary">
          No job board scrolling. No spray-and-pray applications. Just AI that does the work.
        </p>
      </div>
    </section>
  );
}
