"use client";

import { ArrowRight, Pencil, Repeat } from "lucide-react";
import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FlightSearchForm } from "@/components/search/FlightSearchForm";
import { HotelSearchForm } from "@/components/search/HotelSearchForm";
import { formatShortDate, nightsBetween, totalPassengers } from "@/lib/utils";
import type { SearchQuery } from "@/types";

export function SearchSummaryBar({ query }: { query: SearchQuery }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sticky top-16 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          {query.kind === "flight" ? (
            <>
              <p className="flex flex-wrap items-center gap-x-2 text-base font-extrabold sm:text-lg">
                {query.legs.map((l, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <span className="text-slate-300">|</span>}
                    {l.origin}
                    {query.tripType === "roundtrip" ? <Repeat className="size-4 text-brand-600" /> : <ArrowRight className="size-4 text-brand-600" />}
                    {l.destination}
                  </span>
                ))}
              </p>
              <p className="truncate text-xs text-ink-500 sm:text-sm">
                {formatShortDate(query.legs[0].date)}
                {query.tripType === "roundtrip" && query.returnDate && ` – ${formatShortDate(query.returnDate)}`}
                {" · "}
                {totalPassengers(query.passengers)} Passenger{totalPassengers(query.passengers) > 1 ? "s" : ""} · {query.cabin}
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-base font-extrabold sm:text-lg">{query.destination}</p>
              <p className="truncate text-xs text-ink-500 sm:text-sm">
                {formatShortDate(query.checkIn)} – {formatShortDate(query.checkOut)} · {nightsBetween(query.checkIn, query.checkOut)} night(s) ·{" "}
                {query.rooms.length} room(s) · {query.rooms.reduce((n, r) => n + r.adults + r.children, 0)} guest(s)
              </p>
            </>
          )}
        </div>
        <button onClick={() => setOpen(true)} className="btn btn-outline shrink-0">
          <Pencil className="size-4" /> <span className="hidden sm:inline">Modify search</span>
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Modify search" className="sm:max-w-5xl">
        {query.kind === "flight" ? (
          <FlightSearchForm initial={query} onSubmitted={() => setOpen(false)} />
        ) : (
          <HotelSearchForm initial={query} onSubmitted={() => setOpen(false)} />
        )}
      </Modal>
    </div>
  );
}
