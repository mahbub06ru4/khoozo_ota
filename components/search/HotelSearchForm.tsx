"use client";

import { BedDouble, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, type FormEvent } from "react";
import { Counter } from "@/components/ui/Counter";
import { useClickOutside } from "@/hooks/useClickOutside";
import { searchUrl } from "@/lib/api";
import { searchCities, type HotelCity } from "@/lib/data/hotels";
import { addDays, cn, nightsBetween, todayISO } from "@/lib/utils";
import type { HotelSearchQuery, RoomConfig } from "@/types";
import { AutoSuggest } from "./AutoSuggest";
import { DateField } from "./DateField";

function defaultQuery(): HotelSearchQuery {
  const checkIn = addDays(todayISO(), 7);
  return { kind: "hotel", destination: "Cox's Bazar", checkIn, checkOut: addDays(checkIn, 2), rooms: [{ adults: 2, children: 0 }] };
}

function RoomsPicker({ rooms, onChange }: { rooms: RoomConfig[]; onChange: (r: RoomConfig[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, useCallback(() => setOpen(false), []), open);
  const guests = rooms.reduce((n, r) => n + r.adults + r.children, 0);
  const update = (i: number, patch: Partial<RoomConfig>) => onChange(rooms.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          "flex h-full w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-brand-400",
          open && "border-brand-500 ring-4 ring-brand-500/15",
        )}
      >
        <BedDouble className="mt-0.5 size-5 shrink-0 text-brand-600" />
        <span>
          <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Rooms & guests</span>
          <span className="block text-lg font-bold leading-tight">
            {rooms.length} Room{rooms.length > 1 ? "s" : ""}
          </span>
          <span className="block text-xs text-ink-500">
            {guests} Guest{guests > 1 ? "s" : ""}
          </span>
        </span>
      </button>
      {open && (
        <div className="card absolute right-0 top-[calc(100%+6px)] z-40 max-h-[70vh] w-80 overflow-y-auto p-4 animate-fade-up">
          {rooms.map((r, i) => (
            <div key={i} className="border-b border-slate-100 pb-2 last:border-0">
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm font-bold">Room {i + 1}</p>
                {rooms.length > 1 && (
                  <button type="button" onClick={() => onChange(rooms.filter((_, idx) => idx !== i))} className="text-red-500 hover:text-red-700" aria-label={`Remove room ${i + 1}`}>
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>
              <Counter label="Adults" value={r.adults} min={1} max={4} onChange={(adults) => update(i, { adults })} />
              <Counter label="Children" hint="0 – 11 years" value={r.children} min={0} max={3} onChange={(children) => update(i, { children })} />
            </div>
          ))}
          <div className="mt-3 flex gap-2">
            <button type="button" disabled={rooms.length >= 6} onClick={() => onChange([...rooms, { adults: 1, children: 0 }])} className="btn btn-outline flex-1">
              <Plus className="size-4" /> Add room
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn btn-primary flex-1">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function HotelSearchForm({ initial, onSubmitted }: { initial?: HotelSearchQuery; onSubmitted?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState<HotelSearchQuery>(initial ?? defaultQuery);
  const [error, setError] = useState<string | null>(null);
  const today = todayISO();
  const nights = nightsBetween(q.checkIn, q.checkOut);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!q.destination) return setError("Please choose a destination");
    if (q.checkOut <= q.checkIn) return setError("Check-out must be after check-in");
    setError(null);
    router.push(searchUrl(q));
    onSubmitted?.();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-3 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.9fr]">
        <AutoSuggest<HotelCity>
          label="City / Hotel / Area"
          placeholder="Search a city or area"
          icon={<MapPin className="size-5" />}
          display={q.destination || "Where to?"}
          subDisplay="Bangladesh & international"
          search={searchCities}
          getKey={(c) => c.city}
          renderItem={(c) => (
            <div>
              <p className="text-sm font-semibold">{c.city}</p>
              <p className="truncate text-xs text-ink-500">
                {c.country} · {c.neighborhoods.slice(0, 3).join(", ")}
              </p>
            </div>
          )}
          onSelect={(c) => setQ((p) => ({ ...p, destination: c.city }))}
        />
        <DateField
          label="Check in"
          value={q.checkIn}
          min={today}
          onChange={(checkIn) => setQ((p) => ({ ...p, checkIn, checkOut: p.checkOut <= checkIn ? addDays(checkIn, 1) : p.checkOut }))}
        />
        <DateField label={`Check out · ${nights} night${nights > 1 ? "s" : ""}`} value={q.checkOut} min={addDays(q.checkIn, 1)} onChange={(checkOut) => setQ((p) => ({ ...p, checkOut }))} />
        <RoomsPicker rooms={q.rooms} onChange={(rooms) => setQ((p) => ({ ...p, rooms }))} />
      </div>
      <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <p role="alert" className={cn("text-sm font-medium text-red-600", !error && "invisible")}>
          {error ?? "–"}
        </p>
        <button type="submit" className="btn btn-accent w-full px-10 py-3.5 text-base sm:w-auto">
          <Search className="size-5" /> Search Hotels
        </button>
      </div>
    </form>
  );
}
