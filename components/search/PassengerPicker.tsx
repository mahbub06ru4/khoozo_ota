"use client";

import { Users } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Counter } from "@/components/ui/Counter";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn, totalPassengers } from "@/lib/utils";
import type { CabinClass, PassengerCount } from "@/types";

const CABINS: CabinClass[] = ["Economy", "Premium Economy", "Business", "First"];

interface Props {
  passengers: PassengerCount;
  cabin: CabinClass;
  onChange: (p: PassengerCount, c: CabinClass) => void;
  className?: string;
}

export function PassengerPicker({ passengers, cabin, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []), open);
  const total = totalPassengers(passengers);
  const seated = passengers.adults + passengers.children;

  const set = (patch: Partial<PassengerCount>) => {
    const next = { ...passengers, ...patch };
    next.infants = Math.min(next.infants, next.adults);
    onChange(next, cabin);
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-full w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-brand-400",
          open && "border-brand-500 ring-4 ring-brand-500/15",
        )}
      >
        <Users className="mt-0.5 size-5 shrink-0 text-brand-600" />
        <span className="min-w-0">
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Travellers & class</span>
          <span className="block truncate text-lg font-bold leading-tight">
            {total} Traveller{total > 1 ? "s" : ""}
          </span>
          <span className="block truncate text-xs text-ink-500">{cabin}</span>
        </span>
      </button>

      {open && (
        <div className="card absolute right-0 top-[calc(100%+6px)] z-40 w-80 p-4 animate-fade-up">
          <div className="divide-y divide-slate-100">
            <Counter label="Adults" hint="12 years & above" value={passengers.adults} min={1} max={9 - passengers.children} onChange={(adults) => set({ adults })} />
            <Counter label="Children" hint="2 – 11 years" value={passengers.children} min={0} max={9 - passengers.adults} onChange={(children) => set({ children })} />
            <Counter label="Infants" hint="Under 2 years, on lap" value={passengers.infants} min={0} max={passengers.adults} onChange={(infants) => set({ infants })} />
          </div>
          {seated >= 9 && <p className="mt-1 text-xs text-amber-600">Maximum 9 seated travellers per booking.</p>}
          <p className="label mt-4">Cabin class</p>
          <div className="grid grid-cols-2 gap-2">
            {CABINS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => onChange(passengers, c)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-semibold transition",
                  c === cabin ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:border-brand-300",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <button type="button" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
            Done
          </button>
        </div>
      )}
    </div>
  );
}
