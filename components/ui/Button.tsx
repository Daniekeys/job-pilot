import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Props = {
  href: string;
  variant?: "primary" | "secondary";
  showIcon?: boolean;
  children: React.ReactNode;
};

export function Button({ href, variant = "primary", showIcon = false, children }: Props) {
  const base =
    "inline-flex items-center justify-center gap-1.5 rounded-md px-4 py-2 text-sm font-medium transition-colors";
  const variantClasses =
    variant === "primary"
      ? "bg-overlay text-white hover:bg-overlay-dark"
      : "bg-surface border border-border text-text-primary hover:bg-surface-secondary";

  return (
    <Link href={href} className={`${base} ${variantClasses}`}>
      {children}
      {showIcon && <ChevronRight className="size-4" />}
    </Link>
  );
}
