"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/samples", label: "Samples" },
  { href: "/pipelines", label: "Tools" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-brand-border bg-brand-surface">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-16 items-center gap-8">
          {/* Logo + wordmark */}
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/logo.jpeg"
              alt="Genomic Variant Platform"
              width={36}
              height={36}
              className="rounded-lg"
              priority
            />
            <span className="text-base font-bold tracking-tight text-brand-text">
              Variant Platform
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-1">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={href}
                  href={href}
                  className={[
                    "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-brand-border text-brand-cyan shadow-cyan-sm"
                      : "text-brand-muted hover:bg-brand-border hover:text-brand-text",
                  ].join(" ")}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
