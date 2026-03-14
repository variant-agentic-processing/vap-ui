"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { VarisPopover, type PopoverPos } from "./VarisPopover";
import { getSample, type Sample } from "@/lib/sample-client";

const CARD_HEIGHT = 84;

export function IndividualIdCell({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);
  const [sample, setSample] = useState<Sample | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!pos) return;
    function hide() { setPos(null); }
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [pos]);

  function handleMouseEnter() {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - CARD_HEIGHT - 10, left: r.left + r.width / 2 });
    if (!fetched.current) {
      fetched.current = true;
      getSample(id).then(setSample).catch(() => {});
    }
  }

  const meta = sample
    ? [
        sample.sex ? sample.sex.charAt(0).toUpperCase() + sample.sex.slice(1) : null,
        sample.population_name && sample.population_code
          ? `${sample.population_name} (${sample.population_code})`
          : sample.population_name ?? sample.population_code,
        sample.superpopulation_name && sample.superpopulation_code
          ? `${sample.superpopulation_name} (${sample.superpopulation_code})`
          : sample.superpopulation_name ?? sample.superpopulation_code,
      ]
        .filter(Boolean)
        .join(" · ")
    : null;

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
        className="inline-block"
      >
        <Link
          href={`/individuals/${encodeURIComponent(id)}`}
          className="text-brand-cyan hover:underline"
        >
          {id}
        </Link>
      </span>
      {pos && (
        <VarisPopover pos={pos} cardClassName="w-72">
          {sample ? (
            <>
              <p className="text-[11px] font-semibold text-brand-text truncate">{sample.display_name}</p>
              {meta && <p className="text-[11px] text-brand-muted mt-0.5 leading-relaxed">{meta}</p>}
            </>
          ) : (
            <p className="text-[11px] text-brand-muted animate-pulse">Loading…</p>
          )}
        </VarisPopover>
      )}
    </>
  );
}
