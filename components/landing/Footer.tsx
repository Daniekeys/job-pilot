import Link from "next/link";
import { Plane } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "How it Works", href: "/how-it-works" },
      { label: "Pricing", href: "/pricing" },
      { label: "Find Jobs", href: "/find-jobs" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-12">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span
              className="flex size-9 items-center justify-center rounded-[10px]"
              style={{ background: "linear-gradient(45deg, #7C5CFC 0%, #4A2EC5 100%)" }}
            >
              <Plane className="size-5 text-white" />
            </span>
            <span className="text-lg font-bold text-text-darkest">JobPilot</span>
          </Link>
          <p className="mt-3 text-sm text-text-secondary">
            AI-powered job search for engineers who mean business.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.heading}>
            <h3 className="text-sm font-semibold text-text-primary">{column.heading}</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto max-w-[1440px] px-6">
        <p className="mt-10 border-t border-border pt-6 text-sm text-text-muted">
          © 2025 JobPilot. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
