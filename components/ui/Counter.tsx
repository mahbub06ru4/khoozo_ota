"use client";

import { Minus, Plus } from "lucide-react";

interface CounterProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}

export function Counter({ label, hint, value, min, max, onChange }: CounterProps) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        {hint && <p className="text-xs text-ink-500">{hint}</p>}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="grid size-8 place-items-center rounded-full border border-slate-300 text-ink-700 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
        >
          <Minus className="size-4" />
        </button>
        <span className="w-5 text-center text-sm font-bold tabular-nums" aria-live="polite">
          {value}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="grid size-8 place-items-center rounded-full border border-slate-300 text-ink-700 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-30"
        >
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}
