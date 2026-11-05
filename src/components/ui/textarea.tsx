"use client";

import { useId, useRef, useEffect } from "react";
import type { TextareaHTMLAttributes } from "react";

interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  autoResize?: boolean;
}

export default function Textarea({
  label,
  error,
  helperText,
  autoResize = false,
  className = "",
  id,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id || generatedId;
  const descriptionId = `${textareaId}-description`;
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const element = textareaRef.current;
      element.style.height = "auto";
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [value, autoResize]);

  const handleChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    onChange?.(event);

    if (autoResize && textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <textarea
        ref={textareaRef}
        id={textareaId}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-invalid={!!error}
        aria-describedby={
          error || helperText ? descriptionId : undefined
        }
        className={`w-full min-h-[120px] resize-y rounded-xl border bg-[#101529] px-4 py-3.5 text-sm leading-7 text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50 ${
          error
            ? "border-red-500/60"
            : "border-white/10 hover:border-white/20"
        } ${autoResize ? "resize-none overflow-hidden" : ""} ${className}`}
        {...props}
      />

      {(error || helperText) && (
        <p
          id={descriptionId}
          className={`text-xs ${
            error ? "text-red-400" : "text-slate-500"
          }`}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
    }
