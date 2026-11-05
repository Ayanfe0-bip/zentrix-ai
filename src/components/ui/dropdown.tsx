"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  width?: string;
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = "right",
  width = "w-56",
  className = "",
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-flex ${className}`}>
      <div
        onClick={() => setOpen((previous) => !previous)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          className={`absolute top-full z-[90] mt-2 ${width} ${
            align === "right" ? "right-0" : "left-0"
          } overflow-hidden rounded-xl border border-white/10 bg-[#11162c] p-1.5 shadow-2xl shadow-black/40 animate-in fade-in slide-in-from-top-2 duration-150`}
        >
          {items.map((item, index) => (
            <button
              key={`${item.label}-${index}`}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onClick();
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                item.danger
                  ? "text-red-400 hover:bg-red-500/10"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-40`}
            >
              {item.icon && (
                <span className="flex h-4 w-4 items-center justify-center">
                  {item.icon}
                </span>
              )}

              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
              }
