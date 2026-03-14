/**
 * Parses a VCF genotype string (e.g. "0/1", "1|1") and returns a small
 * Het / Hom badge with a Varis popover tooltip.
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export function zygosity(genotype: string): "Het" | "Hom" | null {
  const alleles = genotype.split(/[/|]/);
  if (alleles.length !== 2) return null;
  const [a, b] = alleles;
  if (a === "." || b === ".") return null;
  return a === b ? "Hom" : "Het";
}

interface PopoverPos {
  top: number;
  left: number;
  anchorCenterX: number;
}

function VarisPopover({ label, text, pos }: { label: string; text: string; pos: PopoverPos }) {
  return createPortal(
    <div
      className="pointer-events-none fixed z-[9999]"
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
    >
      {/* Card */}
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-border bg-brand-navy px-3 py-2.5 shadow-2xl w-56">
        <Image
          src="/varis.jpg"
          alt="Varis"
          width={28}
          height={28}
          className="mt-0.5 shrink-0 rounded-full object-cover ring-1 ring-brand-border"
        />
        <div>
          <p className="text-[11px] font-semibold text-brand-cyan mb-0.5">Varis</p>
          <p className="text-[11px] leading-relaxed text-brand-text">
            <span className="font-semibold">{label}</span> — {text}
          </p>
        </div>
      </div>
      {/* Speech-bubble tail */}
      <div
        className="absolute h-0 w-0"
        style={{
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "6px solid var(--color-brand-border, #2a3a4a)",
        }}
      />
    </div>,
    document.body,
  );
}

export function ZygosityBadge({ genotype }: { genotype: string }) {
  const z = zygosity(genotype);
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);

  useEffect(() => {
    if (!pos) return;
    function hide() { setPos(null); }
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [pos]);

  if (!z) return null;

  function handleMouseEnter() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const CARD_HEIGHT = 72; // approx card height + tail
    setPos({
      top: r.top - CARD_HEIGHT - 10,
      left: r.left + r.width / 2,
      anchorCenterX: r.left + r.width / 2,
    });
  }

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
        className={
          z === "Het"
            ? "ml-1.5 cursor-default rounded px-1 py-0.5 text-[10px] font-semibold leading-none bg-brand-cyan/15 text-brand-cyan"
            : "ml-1.5 cursor-default rounded px-1 py-0.5 text-[10px] font-semibold leading-none bg-brand-gold/15 text-brand-gold"
        }
      >
        {z}
      </span>
      {pos && <VarisPopover label={z === "Het" ? "Heterozygous" : "Homozygous"} text={z === "Het" ? "one reference allele and one alternate allele" : "two copies of the alternate allele"} pos={pos} />}
    </>
  );
}
