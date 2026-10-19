"use client";

import { ArrowLeftRight, PlaneLanding, PlaneTakeoff, Plus, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { findAirport, searchAirports } from "@/lib/data/airports";
import { searchUrl } from "@/lib/api";
import { addDays, cn, todayISO } from "@/lib/utils";
import type { Airport, CabinClass, FlightLeg, FlightSearchQuery, PassengerCount, TripType } from "@/types";
import { AutoSuggest } from "./AutoSuggest";
import { DateField } from "./DateField";
import { PassengerPicker } from "./PassengerPicker";

const TRIP_TYPES: { key: TripType; label: string }[] = [
  { key: "oneway", label: "One Way" },
  { key: "roundtrip", label: "Round Trip" },
  { key: "multicity", label: "Multi City" },
];

function defaultQuery(): FlightSearchQuery {
  const d = addDays(todayISO(), 7);
  return {
    kind: "flight",
    tripType: "oneway",
    legs: [{ origin: "DAC", destination: "CXB", date: d }],
    passengers: { adults: 1, children: 0, infants: 0 },
    cabin: "Economy",
  };
}

function AirportItem({ a }: { a: Airport }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-12 shrink-0 place-items-center rounded-lg bg-slate-100 text-sm font-bold text-ink-700">{a.code}</span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {a.city}, {a.country}
        </span>
        <span className="block truncate text-xs text-ink-500">{a.name}</span>
      </span>
    </div>
  );
}

function AirportField({ label, code, onSelect, icon, error }: { label: string; code: string; onSelect: (c: string) => void; icon: React.ReactNode; error?: boolean }) {
  const a = findAirport(code);
  return (
    <AutoSuggest<Airport>
      label={label}
      placeholder="City or airport code"
      icon={icon}
      display={a ? a.city : "Select"}
      subDisplay={a ? `${a.code}, ${a.name}` : "City or airport"}
      search={searchAirports}
      getKey={(x) => x.code}
      renderItem={(x) => <AirportItem a={x} />}
      onSelect={(x) => onSelect(x.code)}
      error={error}
    />
  );
}

export function FlightSearchForm({ initial, onSubmitted }: { initial?: FlightSearchQuery; onSubmitted?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState<FlightSearchQuery>(initial ?? defaultQuery);
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();

  const setTrip = (tripType: TripType) => {
    setError(null);
    setQ((prev) => {
      const first = prev.legs[0];
      if (tripType === "multicity") {
        const legs = prev.legs.length > 1 ? prev.legs : [first, { origin: first.destination, destination: "", date: addDays(first.date, 3) }];
        return { ...prev, tripType, legs, returnDate: undefined };
      }
      return {
        ...prev,
        tripType,
        legs: [first],
        returnDate: tripType === "roundtrip" ? (prev.returnDate ?? addDays(first.date, 3)) : undefined,
      };
    });
  };

  const updateLeg = (i: number, patch: Partial<FlightLeg>) =>
    setQ((prev) => {
      const legs = prev.legs.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
      let returnDate = prev.returnDate;
      if (i === 0 && patch.date && returnDate && returnDate < patch.date) returnDate = patch.date;
      return { ...prev, legs, returnDate };
    });

  const swap = (i: number) => {
    const l = q.legs[i];
    updateLeg(i, { origin: l.destination, destination: l.origin });
  };

  const addLeg = () =>
    setQ((prev) => {
      const last = prev.legs[prev.legs.length - 1];
      return { ...prev, legs: [...prev.legs, { origin: last.destination, destination: "", date: addDays(last.date, 3) }] };
    });

  const removeLeg = (i: number) => setQ((prev) => ({ ...prev, legs: prev.legs.filter((_, idx) => idx !== i) }));

  const validate = (): string | null => {
    for (const [i, l] of q.legs.entries()) {
      if (!l.origin || !l.destination) return `Please select origin and destination${q.legs.length > 1 ? ` for flight ${i + 1}` : ""}`;
      if (l.origin === l.destination) return "Origin and destination can't be the same";
      if (!l.date) return "Please select a departure date";
      if (i > 0 && l.date < q.legs[i - 1].date) return `Flight ${i + 1} can't depart before flight ${i}`;
    }
    if (q.tripType === "roundtrip" && !q.returnDate) return "Please select a return date";
    return null;
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = validate();
    setError(err);
    if (err) return;
    router.push(searchUrl(q));
    onSubmitted?.();
  };

  const isMulti = q.tripType === "multicity";

  return (
    <form onSubmit={submit} noValidate>
      <div className="mb-4 flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Trip type">
        {TRIP_TYPES.map((t) => (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={q.tripType === t.key}
            onClick={() => setTrip(t.key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-semibold transition",
              q.tripType === t.key ? "bg-brand-600 text-white shadow-sm" : "bg-slate-100 text-ink-700 hover:bg-slate-200",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {q.legs.map((leg, i) => (
          <div key={i} className={cn("grid gap-3", isMulti ? "lg:grid-cols-[1fr_1fr_0.8fr_auto]" : "lg:grid-cols-[1fr_1fr_0.7fr_0.7fr_0.9fr]")}>
            <div className="relative grid gap-3 sm:grid-cols-2 sm:col-span-full lg:col-span-2">
              <AirportField label={isMulti ? `From · Flight ${i + 1}` : "From"} code={leg.origin} onSelect={(origin) => updateLeg(i, { origin })} icon={<PlaneTakeoff className="size-5" />} error={!!error && !leg.origin} />
              <button
                type="button"
                onClick={() => swap(i)}
                aria-label="Swap origin and destination"
                className="absolute left-1/2 top-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-slate-200 bg-white text-brand-600 shadow-sm transition hover:rotate-180 hover:border-brand-400 max-sm:left-auto max-sm:right-6 max-sm:rotate-90 max-sm:hover:rotate-[270deg]"
              >
                <ArrowLeftRight className="size-4" />
              </button>
              <AirportField label="To" code={leg.destination} onSelect={(destination) => updateLeg(i, { destination })} icon={<PlaneLanding className="size-5" />} error={!!error && !leg.destination} />
            </div>

            <div className={cn("grid gap-3", !isMulti && "grid-cols-2 sm:col-span-full lg:col-span-2")}>
              <DateField label="Departure" value={leg.date} min={i > 0 ? q.legs[i - 1].date : today} onChange={(date) => updateLeg(i, { date })} />
              {!isMulti && (
                <DateField
                  label="Return"
                  value={q.returnDate ?? ""}
                  min={leg.date}
                  disabled={q.tripType !== "roundtrip"}
                  placeholder="Save more on return"
                  onActivate={() => setTrip("roundtrip")}
                  onChange={(returnDate) => setQ((p) => ({ ...p, returnDate }))}
                />
              )}
            </div>

            {!isMulti && (
              <PassengerPicker
                className="sm:col-span-full lg:col-span-1"
                passengers={q.passengers}
                cabin={q.cabin}
                onChange={(passengers: PassengerCount, cabin: CabinClass) => setQ((p) => ({ ...p, passengers, cabin }))}
              />
            )}
            {isMulti && (
              <div className="flex items-center">
                {i > 1 ? (
                  <button type="button" onClick={() => removeLeg(i)} className="btn btn-ghost text-red-600" aria-label={`Remove flight ${i + 1}`}>
                    <X className="size-4" /> <span className="lg:hidden">Remove</span>
                  </button>
                ) : (
                  <span className="hidden w-10 lg:block" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {isMulti && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <button type="button" onClick={addLeg} disabled={q.legs.length >= 5} className="btn btn-outline border-dashed">
            <Plus className="size-4" /> Add another flight
          </button>
          <PassengerPicker
            className="sm:ml-auto sm:w-72"
            passengers={q.passengers}
            cabin={q.cabin}
            onChange={(passengers, cabin) => setQ((p) => ({ ...p, passengers, cabin }))}
          />
        </div>
      )}

      <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <p role="alert" className={cn("text-sm font-medium text-red-600", !error && "invisible")}>
          {error ?? "–"}
        </p>
        <button type="submit" className="btn btn-accent w-full px-10 py-3.5 text-base sm:w-auto">
          <Search className="size-5" /> Search Flights
        </button>
      </div>
    </form>
  );
}
