"use client";

import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useApp } from "@/context/AppProvider";
import { cn, formatMoney } from "@/lib/utils";

export function FilterSection({ title, children, defaultOpen = true }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="border-b border-slate-100 py-4 last:border-0">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-bold" aria-expanded={open}>
        {title}
        <ChevronDown className={cn("size-4 text-ink-500 transition", open && "rotate-180")} />
      </button>
      <div className={cn("grid transition-all duration-200", open ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </section>
  );
}

export function CheckRow({ label, checked, onChange, meta }: { label: ReactNode; checked: boolean; onChange: () => void; meta?: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm transition hover:bg-slate-50">
      <input type="checkbox" checked={checked} onChange={onChange} className="size-4 rounded accent-brand-600" />
      <span className="flex-1">{label}</span>
      {meta && <span className="text-xs text-ink-500">{meta}</span>}
    </label>
  );
}

export function PriceSlider({ min, max, value, onChange }: { min: number; max: number; value: number | null; onChange: (v: number | null) => void }) {
  const { currency } = useApp();
  const current = value ?? max;
  const step = Math.max(10, Math.round((max - min) / 100 / 10) * 10);
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return <p className="text-xs text-ink-500">Not enough results to filter by price.</p>;
  const pct = ((current - min) / (max - min)) * 100;

  return (
    <div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => {
          const v = Number(e.target.value);
          onChange(v >= max ? null : v);
        }}
        aria-label="Maximum price"
        className="w-full cursor-pointer accent-brand-600"
        style={{ background: `linear-gradient(to right, var(--color-brand-500) ${pct}%, var(--color-slate-200) ${pct}%)`, height: 6, borderRadius: 999, appearance: "none" }}
      />
      <div className="mt-2 flex justify-between text-xs font-semibold">
        <span className="text-ink-500">{formatMoney(min, currency)}</span>
        <span className="text-brand-700">up to {formatMoney(current, currency)}</span>
      </div>
    </div>
  );
}

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}
