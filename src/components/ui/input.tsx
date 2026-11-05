import { useId } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Input({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const descriptionId = `${inputId}-description`;

  return (
    <div className="w-full space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-300"
        >
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-4 flex items-center text-slate-500">
            {leftIcon}
          </span>
        )}

        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={
            error || helperText ? descriptionId : undefined
          }
          className={`w-full rounded-xl border bg-[#101529] px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/15 disabled:cursor-not-allowed disabled:opacity-50 ${
            error
              ? "border-red-500/60 focus:border-red-400 focus:ring-red-500/10"
              : "border-white/10 hover:border-white/20"
          } ${leftIcon ? "pl-11" : ""} ${
            rightIcon ? "pr-11" : ""
          } ${className}`}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-4 flex items-center text-slate-400">
            {rightIcon}
          </span>
        )}
      </div>

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
