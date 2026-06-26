type Props = {
  action: () => Promise<void>;
  icon: React.ReactNode;
  children: React.ReactNode;
};

export function OAuthButton({ action, icon, children }: Props) {
  return (
    <form action={action} className="w-full">
      <button
        type="submit"
        className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary"
      >
        {icon}
        {children}
      </button>
    </form>
  );
}
