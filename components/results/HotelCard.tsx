"use client";

import { BedDouble, Check, Coffee, MapPin, Star } from "lucide-react";
import { Photo } from "@/components/ui/Photo";
import { useApp } from "@/context/AppProvider";
import { hotelNightly } from "@/lib/filters";
import { formatMoney } from "@/lib/utils";
import type { HotelOffer } from "@/types";

function ratingLabel(r: number) {
  if (r >= 9) return "Exceptional";
  if (r >= 8.5) return "Excellent";
  if (r >= 8) return "Very good";
  if (r >= 7) return "Good";
  return "Pleasant";
}

export function HotelCard({ offer, nights, onBook }: { offer: HotelOffer; nights: number; onBook: (o: HotelOffer) => void }) {
  const { currency } = useApp();
  const nightly = hotelNightly(offer);

  return (
    <article className="card flex flex-col overflow-hidden transition duration-200 hover:border-brand-200 hover:shadow-float animate-fade-up sm:flex-row">
      <div className="group/img relative grid h-48 shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-brand-400 to-accent-500 text-white sm:h-auto sm:w-64">
        <BedDouble className="size-14 opacity-70" />
        <Photo src={offer.image} alt={offer.name} className="transition duration-500 group-hover/img:scale-105" />
        {offer.freeCancellation && <span className="absolute left-3 top-3 z-10 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-bold">Free cancellation</span>}
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5 md:flex-row">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-0.5" aria-label={`${offer.stars} star hotel`}>
            {Array.from({ length: offer.stars }, (_, i) => (
              <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <h3 className="mt-1 text-lg font-bold leading-snug">{offer.name}</h3>
          <p className="flex items-center gap-1 text-sm text-ink-500">
            <MapPin className="size-3.5" /> {offer.neighborhood}, {offer.city}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {offer.amenities.slice(0, 5).map((a) => (
              <span key={a} className="chip bg-slate-100 text-ink-700">
                {a}
              </span>
            ))}
            {offer.amenities.length > 5 && <span className="chip text-ink-500">+{offer.amenities.length - 5} more</span>}
          </div>
          <div className="mt-3 space-y-1 text-xs font-semibold">
            {offer.breakfastIncluded && (
              <p className="flex items-center gap-1 text-emerald-700">
                <Coffee className="size-3.5" /> Breakfast included
              </p>
            )}
            {offer.freeCancellation && (
              <p className="flex items-center gap-1 text-emerald-700">
                <Check className="size-3.5" /> Free cancellation until 48h before check-in
              </p>
            )}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-t border-dashed border-slate-200 pt-4 md:min-w-44 md:flex-col md:items-end md:border-l md:border-t-0 md:pl-5 md:pt-0">
          <div className="flex items-center gap-2 md:flex-row-reverse">
            <span className="rounded-lg bg-brand-600 px-2 py-1 text-sm font-extrabold text-white">{offer.rating.toFixed(1)}</span>
            <span className="text-xs md:text-right">
              <span className="block font-bold">{ratingLabel(offer.rating)}</span>
              <span className="text-ink-500">{offer.reviews.toLocaleString()} reviews</span>
            </span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold">{formatMoney(nightly, currency)}</p>
            <p className="text-[11px] text-ink-500">per night · incl. taxes</p>
            <p className="text-xs font-semibold text-ink-700">
              {formatMoney(nightly * nights, currency)} for {nights} night{nights > 1 ? "s" : ""}
            </p>
            <button onClick={() => onBook(offer)} className="btn btn-accent mt-2 px-6">
              Select room
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
