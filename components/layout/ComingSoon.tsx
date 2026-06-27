type Props = {
  title: string;
  description: string;
};

export function ComingSoon({ title, description }: Props) {
  return (
    <div className="mx-auto flex max-w-[1440px] flex-1 items-center justify-center p-8">
      <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]">
        <h1 className="text-base font-semibold text-text-primary">{title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{description}</p>
      </div>
    </div>
  );
}
