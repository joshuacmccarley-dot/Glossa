"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/learn", label: "Learn" },
  { href: "/connect", label: "Connect" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-surface-dark shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.svg"
              alt="Glossa — In-Depth Language Learning"
              width={120}
              height={48}
              priority
              className="h-12 w-auto"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-navy/70 hover:text-navy font-medium text-sm transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/get-started"
              className="text-sm font-semibold text-navy hover:text-navy-dark transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/get-started"
              className="bg-gold hover:bg-gold-light text-navy font-bold text-sm px-5 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Get Started Free
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-navy hover:bg-surface transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {open && (
          <div className="md:hidden pb-4 border-t border-surface-dark mt-1 pt-4">
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-navy/70 hover:text-navy font-medium px-2 py-2 rounded-lg hover:bg-surface transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href="/get-started"
                className="text-center text-sm font-semibold text-navy border border-navy/20 px-5 py-2.5 rounded-full hover:bg-surface transition-colors"
                onClick={() => setOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/get-started"
                className="text-center bg-gold hover:bg-gold-light text-navy font-bold text-sm px-5 py-2.5 rounded-full transition-colors"
                onClick={() => setOpen(false)}
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
