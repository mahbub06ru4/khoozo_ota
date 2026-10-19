"use client";

import { Star } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { EMPTY_HOTEL_FILTERS, hotelNightly } from "@/lib/filters";
import { cn } from "@/lib/utils";
import { CheckRow, FilterSection, PriceSlider, toggle } from "./FilterPrimitives";

export function HotelFilters() {
  const { hotels, hotelFilters: f, setHotelFilters } = useApp();
  const prices = hotels.map(hotelNightly);
  const neighborhoods = [...new Set(hotels.map((h) => h.neighborhood))].sort();
  const amenities = [...new Set(hotels.flatMap((h) => h.amenities))].sort();
  const active = JSON.stringify(f) !== JSON.stringify(EMPTY_HOTEL_FILTERS);

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-extrabold">Filters</h2>
        <button onClick={() => setHotelFilters(EMPTY_HOTEL_FILTERS)} disabled={!active} className="text-xs font-bold text-brand-700 hover:underline disabled:invisible">
          Reset all
        </button>
      </div>

      <FilterSection title="Star rating">
        <div className="flex flex-wrap gap-2">
          {[5, 4, 3, 2].map((s) => (
            <button
              key={s}
              onClick={() => setHotelFilters({ ...f, stars: toggle(f.stars, s) })}
              aria-pressed={f.stars.includes(s)}
              className={cn(
                "flex items-center gap-1 rounded-xl border px-3 py-1.5 text-sm font-semibold transition",
                f.stars.includes(s) ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:border-brand-300",
              )}
            >
              {s} <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Price per night">
        <PriceSlider min={Math.min(...prices)} max={Math.max(...prices)} value={f.maxPrice} onChange={(maxPrice) => setHotelFilters({ ...f, maxPrice })} />
      </FilterSection>

      <FilterSection title="Neighbourhood">
        {neighborhoods.map((n) => (
          <CheckRow
            key={n}
            label={n}
            meta={hotels.filter((h) => h.neighborhood === n).length}
            checked={f.neighborhoods.includes(n)}
            onChange={() => setHotelFilters({ ...f, neighborhoods: toggle(f.neighborhoods, n) })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Amenities" defaultOpen={false}>
        {amenities.map((a) => (
          <CheckRow key={a} label={a} checked={f.amenities.includes(a)} onChange={() => setHotelFilters({ ...f, amenities: toggle(f.amenities, a) })} />
        ))}
      </FilterSection>

      <FilterSection title="Policies" defaultOpen={false}>
        <CheckRow label="Free cancellation" checked={f.freeCancellationOnly} onChange={() => setHotelFilters({ ...f, freeCancellationOnly: !f.freeCancellationOnly })} />
      </FilterSection>
    </div>
  );
}
