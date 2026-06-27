"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";

import { signOutAction } from "@/actions/auth";

const NAV_LINKS = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Find Jobs", href: "/find-jobs" },
  { label: "Profile", href: "/profile" },
];

const BLUR_CLOSE_DELAY_MS = 150;

type Props = {
  userEmail: string;
};

export function AppNavbar({ userEmail }: Props) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleMenuBlur() {
    blurTimeoutRef.current = setTimeout(() => setIsMenuOpen(false), BLUR_CLOSE_DELAY_MS);
  }

  function handleMenuFocus() {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
  }

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

        <div className="flex items-center gap-8">
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              onFocus={handleMenuFocus}
              onBlur={handleMenuBlur}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-secondary"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-accent-light text-sm font-semibold text-accent">
                {userEmail.charAt(0).toUpperCase()}
              </span>
              <ChevronDown className="size-4 text-text-muted" />
            </button>

            {isMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-border bg-surface py-1 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)]"
              >
                <p className="truncate border-b border-border px-3 py-2 text-sm font-medium text-text-primary">
                  {userEmail}
                </p>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    onMouseDown={(event) => event.preventDefault()}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-text-primary hover:bg-surface-secondary"
                  >
                    <LogOut className="size-4 text-text-secondary" />
                    Sign Out
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
