"use client";

import { Moon, Sun, Sunrise, Sunset } from "lucide-react";
import { useApp } from "@/context/AppProvider";
import { findAirline } from "@/lib/data/airports";
import { EMPTY_FLIGHT_FILTERS, flightTotal } from "@/lib/filters";
import { cn, formatMoney, TIME_WINDOWS } from "@/lib/utils";
import type { TimeWindow } from "@/types";
import { CheckRow, FilterSection, PriceSlider, toggle } from "./FilterPrimitives";

const WINDOW_ICONS: Record<TimeWindow, typeof Sun> = { early: Moon, morning: Sunrise, afternoon: Sun, evening: Sunset };
const STOP_LABELS = ["Non-stop", "1 stop", "2+ stops"];

function WindowGrid({ selected, onToggle }: { selected: TimeWindow[]; onToggle: (w: TimeWindow) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {TIME_WINDOWS.map(({ key, label, range }) => {
        const Icon = WINDOW_ICONS[key];
        const on = selected.includes(key);
        return (
          <button
            key={key}
            onClick={() => onToggle(key)}
            aria-pressed={on}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2 text-[11px] font-semibold transition",
              on ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-ink-700 hover:border-brand-300",
            )}
          >
            <Icon className="size-4" />
            {label}
            <span className="font-normal text-ink-500">{range}</span>
          </button>
        );
      })}
    </div>
  );
}

export function FlightFilters() {
  const { flights, flightFilters: f, setFlightFilters, currency } = useApp();
  const prices = flights.map(flightTotal);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  const airlines = [...new Set(flights.map((o) => o.airline))]
    .map((code) => ({ code, name: findAirline(code)?.name ?? code, min: Math.min(...flights.filter((o) => o.airline === code).map(flightTotal)) }))
    .sort((a, b) => a.min - b.min);

  const stopCounts = [0, 1, 2].map((s) => flights.filter((o) => Math.min(o.stops, 2) === s).length);
  const active = JSON.stringify(f) !== JSON.stringify(EMPTY_FLIGHT_FILTERS);

  return (
    <div>
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-base font-extrabold">Filters</h2>
        <button onClick={() => setFlightFilters(EMPTY_FLIGHT_FILTERS)} disabled={!active} className="text-xs font-bold text-brand-700 hover:underline disabled:invisible">
          Reset all
        </button>
      </div>

      <FilterSection title="Stops">
        {STOP_LABELS.map((label, s) =>
          stopCounts[s] ? (
            <CheckRow key={s} label={label} meta={stopCounts[s]} checked={f.stops.includes(s)} onChange={() => setFlightFilters({ ...f, stops: toggle(f.stops, s) })} />
          ) : null,
        )}
      </FilterSection>

      <FilterSection title="Price range">
        <PriceSlider min={min} max={max} value={f.maxPrice} onChange={(maxPrice) => setFlightFilters({ ...f, maxPrice })} />
      </FilterSection>

      <FilterSection title="Airlines">
        {airlines.map((a) => (
          <CheckRow
            key={a.code}
            label={a.name}
            meta={formatMoney(a.min, currency)}
            checked={f.airlines.includes(a.code)}
            onChange={() => setFlightFilters({ ...f, airlines: toggle(f.airlines, a.code) })}
          />
        ))}
      </FilterSection>

      <FilterSection title="Departure time">
        <WindowGrid selected={f.departureWindows} onToggle={(w) => setFlightFilters({ ...f, departureWindows: toggle(f.departureWindows, w) })} />
      </FilterSection>

      <FilterSection title="Arrival time" defaultOpen={false}>
        <WindowGrid selected={f.arrivalWindows} onToggle={(w) => setFlightFilters({ ...f, arrivalWindows: toggle(f.arrivalWindows, w) })} />
      </FilterSection>

      <FilterSection title="Fare type" defaultOpen={false}>
        <CheckRow label="Refundable only" checked={f.refundableOnly} onChange={() => setFlightFilters({ ...f, refundableOnly: !f.refundableOnly })} />
      </FilterSection>
    </div>
  );
}
