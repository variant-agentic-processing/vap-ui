import type { Metadata } from "next";
import { Nav } from "@/components/Nav";
import { HealthBanner } from "@/components/HealthBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Genomic Variant Platform",
  description: "Internal tool for variant pipeline management and analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Nav />
        <HealthBanner />
        <main className="mx-auto max-w-7xl px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
