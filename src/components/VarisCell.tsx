/**
 * A table cell (<td>) that shows a Varis popover when hovered,
 * if a varisNote is provided. Mirrors the Cell component API.
 */

"use client";

import { useRef, useState, useEffect } from "react";
import { VarisPopover, type PopoverPos } from "./VarisPopover";

const CARD_HEIGHT = 80;

interface VarisCellProps {
  value: string | number | null | undefined;
  varisNote?: string | null;
  className?: string;
  mono?: boolean;
}

export function VarisCell({
  value,
  varisNote,
  className = "text-brand-muted",
  mono = false,
}: VarisCellProps) {
  const display = value != null && value !== "" ? String(value) : "—";
  const ref = useRef<HTMLTableCellElement>(null);
  const [pos, setPos] = useState<PopoverPos | null>(null);

  useEffect(() => {
    if (!pos) return;
    function hide() { setPos(null); }
    window.addEventListener("scroll", hide, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", hide, { capture: true });
  }, [pos]);

  function handleMouseEnter() {
    if (!varisNote || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - CARD_HEIGHT - 10, left: r.left + r.width / 2 });
  }

  return (
    <>
      <td
        ref={ref}
        title={display !== "—" ? display : undefined}
        className={`px-3 py-1.5 overflow-hidden ${className} ${mono ? "font-mono" : ""}`}
        style={{ whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setPos(null)}
      >
        {display}
      </td>
      {pos && varisNote && (
        <VarisPopover pos={pos} cardClassName="w-72">
          <p className="text-[11px] leading-relaxed text-brand-text">{varisNote}</p>
        </VarisPopover>
      )}
    </>
  );
}
