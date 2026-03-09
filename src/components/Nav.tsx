"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/pipelines", label: "Pipelines" },
  { href: "/query", label: "Query" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex h-14 items-center gap-8">
          <span className="text-sm font-semibold tracking-tight text-gray-900">
            Genomic Variant Platform
          </span>
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
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
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
