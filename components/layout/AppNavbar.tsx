"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

export function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="h-16 w-full border-b border-border bg-surface">
      <div className="mx-auto flex h-full max-w-360 items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo.png"
            alt="JobPilot"
            width={496}
            height={168}
            className="h-8 w-auto"
          />
        </Link>

        <nav className="flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={
                  isActive
                    ? "text-sm font-medium text-accent"
                    : "text-sm font-medium text-text-dark hover:text-accent"
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
