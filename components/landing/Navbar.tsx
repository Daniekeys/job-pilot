"use client";

import { useState } from "react";
import Link from "next/link";
import { useMotionValueEvent, useScroll } from "framer-motion";
import { Menu, Plane, X } from "lucide-react";

const NAV_LINKS = [
  { label: "How it Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Sign In", href: "/login" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 0);
  });

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors ${
        isScrolled ? "bg-surface/80 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span
            className="flex size-9 items-center justify-center rounded-[10px]"
            style={{ background: "linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)" }}
          >
            <Plane className="size-5 text-white" />
          </span>
          <span className="text-lg font-bold text-text-darkest">JobPilot</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/login"
          className="hidden rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark md:inline-flex"
        >
          Get Started Free
        </Link>

        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle menu"
          className="md:hidden"
        >
          {isMenuOpen ? (
            <X className="size-6 text-text-primary" />
          ) : (
            <Menu className="size-6 text-text-primary" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <nav className="flex flex-col gap-4 border-t border-border bg-surface px-6 py-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-sm font-medium text-text-secondary hover:text-text-primary"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="rounded-md bg-accent px-4 py-2 text-center text-sm font-medium text-accent-foreground hover:bg-accent-dark"
          >
            Get Started Free
          </Link>
        </nav>
      )}
    </header>
  );
}
