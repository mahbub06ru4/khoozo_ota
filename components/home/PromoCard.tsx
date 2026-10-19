"use client";

import { BadgePercent, Check, Copy, Palmtree, Plane, BedDouble, Landmark } from "lucide-react";
import { useState } from "react";
import { Photo } from "@/components/ui/Photo";
import type { Promo } from "@/lib/data/promos";
import { cn, formatDate } from "@/lib/utils";

const ICONS = { flight: Plane, hotel: BedDouble, bank: Landmark, holiday: Palmtree };

export function PromoCard({ promo }: { promo: Promo }) {
  const [copied, setCopied] = useState(false);
  const Icon = ICONS[promo.category];

  const copy = async () => {
    if (!promo.code) return;
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked */
    }
  };

  return (
    <article className="card group flex overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-float">
      <div className={cn("relative grid w-28 shrink-0 place-items-center overflow-hidden bg-gradient-to-br text-white sm:w-32", promo.gradient)}>
        <Icon className="size-10 opacity-90" />
        <Photo src={promo.image} alt="" className="transition duration-500 group-hover:scale-110" />
        <span className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" aria-hidden />
        <span className="absolute bottom-2 left-2 z-10 rounded-md bg-white/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur">
          {promo.category}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold leading-snug">{promo.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-500">{promo.subtitle}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          {promo.code ? (
            <button
              onClick={copy}
              className="flex items-center gap-1.5 rounded-lg border border-dashed border-brand-400 bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 transition hover:bg-brand-100"
              aria-label={`Copy promo code ${promo.code}`}
            >
              {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
              {copied ? "Copied" : promo.code}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-accent-600">
              <BadgePercent className="size-4" /> Save {promo.discountPct}%
            </span>
          )}
          <span className="text-[11px] text-ink-500">Till {formatDate(promo.validTill, { day: "numeric", month: "short" })}</span>
        </div>
      </div>
    </article>
  );
}
