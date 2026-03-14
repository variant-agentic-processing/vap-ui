"use client";

import { createPortal } from "react-dom";
import Image from "next/image";

export interface PopoverPos {
  top: number;
  left: number;
}

interface VarisPopoverProps {
  pos: PopoverPos;
  cardClassName?: string;
  placement?: "above" | "below" | "right";
  children: React.ReactNode;
}

export function VarisPopover({ pos, cardClassName = "w-56", placement = "right", children }: VarisPopoverProps) {
  const wrapStyle =
    placement === "right"
      ? { top: pos.top, left: pos.left, transform: "translateY(-50%)" }
      : placement === "below"
      ? { top: pos.top, left: pos.left, transform: "translateX(-50%)" }
      : { top: pos.top, left: pos.left, transform: "translateX(-50%)" };

  const tail =
    placement === "right" ? (
      // Left-pointing tail
      <div
        className="absolute h-0 w-0"
        style={{
          top: "50%",
          left: 0,
          transform: "translate(-100%, -50%)",
          borderTop: "6px solid transparent",
          borderBottom: "6px solid transparent",
          borderRight: "6px solid var(--color-brand-border, #2a3a4a)",
        }}
      />
    ) : placement === "below" ? (
      // Upward tail (card is below anchor)
      <div
        className="absolute h-0 w-0"
        style={{
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          borderLeft: "6px solid transparent",
          borderRight: "6px solid transparent",
          borderBottom: "6px solid var(--color-brand-border, #2a3a4a)",
        }}
      />
    ) : (
      // Downward tail (card is above anchor)
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
    );

  return createPortal(
    <div className="pointer-events-none fixed z-[9999]" style={wrapStyle}>
      <div className={`flex items-start gap-2.5 rounded-xl border border-brand-border bg-brand-navy px-3 py-2.5 shadow-2xl ${cardClassName}`}>
        <Image
          src="/varis.jpg"
          alt="Varis"
          width={28}
          height={28}
          className="mt-0.5 shrink-0 rounded-full object-cover ring-1 ring-brand-border"
        />
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-brand-cyan mb-1">Varis</p>
          {children}
        </div>
      </div>
      {tail}
    </div>,
    document.body,
  );
}
