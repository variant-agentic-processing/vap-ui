/**
 * Parses a VCF genotype string (e.g. "0/1", "1|1") and returns a small
 * Het / Hom badge with a Varis popover tooltip.
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { VarisPopover, type PopoverPos } from "./VarisPopover";

export function zygosity(genotype: string): "Het" | "Hom" | null {
  const alleles = genotype.split(/[/|]/);
  if (alleles.length !== 2) return null;
  const [a, b] = alleles;
  if (a === "." || b === ".") return null;
  return a === b ? "Hom" : "Het";
}

const CARD_HEIGHT = 72;

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
    setPos({ top: r.top - CARD_HEIGHT - 10, left: r.left + r.width / 2 });
  }

  const label = z === "Het" ? "Heterozygous" : "Homozygous";
  const description =
    z === "Het"
      ? "one reference allele and one alternate allele"
      : "two copies of the alternate allele";

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
      {pos && (
        <VarisPopover pos={pos}>
          <p className="text-[11px] leading-relaxed text-brand-text">
            <span className="font-semibold">{label}</span> — {description}.
          </p>
        </VarisPopover>
      )}
    </>
  );
}
