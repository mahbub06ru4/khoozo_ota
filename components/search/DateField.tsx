"use client";

import { CalendarDays } from "lucide-react";
import { useRef } from "react";
import { cn, formatDate } from "@/lib/utils";

interface DateFieldProps {
  label: string;
  value: string;
  min?: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  onActivate?: () => void;
  className?: string;
}

export function DateField({ label, value, min, onChange, placeholder = "Add date", disabled, onActivate, className }: DateFieldProps) {
  const ref = useRef<HTMLInputElement>(null);

  const open = () => {
    if (disabled) {
      onActivate?.();
      return;
    }
    try {
      ref.current?.showPicker();
    } catch {
      ref.current?.focus();
    }
  };

  return (
    <div
      onClick={open}
      className={cn(
        "relative flex h-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-brand-400 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15",
        className,
      )}
    >
      <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand-600" />
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">{label}</span>
        {value && !disabled ? (
          <>
            <span className="block truncate text-lg font-bold leading-tight">{formatDate(value, { day: "numeric", month: "short", year: "2-digit" })}</span>
            <span className="block text-xs text-ink-500">{formatDate(value, { weekday: "long" })}</span>
          </>
        ) : (
          <span className="block py-1 text-sm font-medium text-ink-500">{placeholder}</span>
        )}
      </span>
      <input
        ref={ref}
        type="date"
        value={disabled ? "" : value}
        min={min}
        disabled={disabled}
        onChange={(e) => e.target.value && onChange(e.target.value)}
        aria-label={label}
        className="pointer-events-none absolute inset-0 opacity-0"
        tabIndex={disabled ? -1 : 0}
      />
    </div>
  );
}
