import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/Button";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  return (
    <header className="h-16 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="JobPilot" width={496} height={168} className="h-8 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-dark hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Button href="/login" variant="primary">
          Start for free
        </Button>
      </div>
    </header>
  );
}
