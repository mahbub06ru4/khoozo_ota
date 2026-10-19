"use client";

import { useState } from "react";
import { PROMOS, type PromoCategory } from "@/lib/data/promos";
import { cn } from "@/lib/utils";
import { PromoCard } from "./PromoCard";

const FILTERS: { key: PromoCategory | "all"; label: string }[] = [
  { key: "all", label: "All offers" },
  { key: "flight", label: "Flight deals" },
  { key: "bank", label: "Bank offers" },
  { key: "hotel", label: "Hotels" },
  { key: "holiday", label: "Holidays" },
];

export function PromoGrid({ limit, initial = "all" }: { limit?: number; initial?: PromoCategory | "all" }) {
  const [filter, setFilter] = useState<PromoCategory | "all">(initial);
  const list = PROMOS.filter((p) => filter === "all" || p.category === filter).slice(0, limit);

  return (
    <div>
      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold transition",
              filter === f.key ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-ink-700 hover:border-brand-400",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((p) => (
          <PromoCard key={p.id} promo={p} />
        ))}
      </div>
    </div>
  );
}
