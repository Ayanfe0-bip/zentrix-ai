"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = "top",
  className = "",
}: TooltipProps) {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 mb-3 -translate-x-1/2",
    bottom: "left-1/2 top-full mt-3 -translate-x-1/2",
    left: "right-full top-1/2 mr-3 -translate-y-1/2",
    right: "left-full top-1/2 ml-3 -translate-y-1/2",
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#171d35] px-3 py-2 text-xs font-medium text-white shadow-xl shadow-black/30 transition-all duration-200 ${
          positions[position]
        } ${
          visible
            ? "visible translate-y-0 opacity-100"
            : "invisible opacity-0"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
