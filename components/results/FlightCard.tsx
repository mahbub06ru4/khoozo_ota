"use client";

import { Briefcase, ChevronDown, Clock, Luggage, Plane, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppProvider";
import { findAirline, findAirport } from "@/lib/data/airports";
import { flightTotal } from "@/lib/filters";
import { cn, formatDuration, formatMoney, formatShortDate, formatTime } from "@/lib/utils";
import type { FlightOffer } from "@/types";

export function AirlineBadge({ code, size = "md" }: { code: string; size?: "sm" | "md" }) {
  const airline = findAirline(code);
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-xl font-extrabold text-white shadow-sm", size === "md" ? "size-12 text-sm" : "size-9 text-xs")}
      style={{ background: airline?.color ?? "#334155" }}
      aria-hidden
    >
      {code}
    </span>
  );
}

export function FlightCard({ offer, onBook }: { offer: FlightOffer; onBook: (o: FlightOffer) => void }) {
  const { currency } = useApp();
  const [open, setOpen] = useState(false);
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  const airline = findAirline(offer.airline);
  const total = flightTotal(offer);
  const dayShift = Math.round((new Date(last.arrival).setHours(0, 0, 0, 0) - new Date(first.departure).setHours(0, 0, 0, 0)) / 86_400_000);
  const via = offer.segments.slice(0, -1).map((s) => s.destination);

  return (
    <article className="card overflow-hidden transition duration-200 hover:border-brand-200 hover:shadow-float animate-fade-up">
      <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_auto]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <AirlineBadge code={offer.airline} />
            <div className="min-w-0">
              <p className="truncate font-bold">{airline?.name ?? offer.airline}</p>
              <p className="text-xs text-ink-500">
                {offer.segments.map((s) => s.flightNumber).join(" · ")} · {offer.cabin}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-left">
              <p className="text-xl font-extrabold tabular-nums sm:text-2xl">{formatTime(first.departure)}</p>
              <p className="text-xs font-semibold text-ink-500">{first.origin}</p>
            </div>
            <div className="flex flex-1 flex-col items-center">
              <p className="flex items-center gap-1 text-xs font-semibold text-ink-500">
                <Clock className="size-3" /> {formatDuration(offer.totalDurationMin)}
              </p>
              <div className="relative my-1.5 h-px w-full bg-slate-300">
                {via.map((_, i) => (
                  <span key={i} className="absolute top-1/2 size-2 -translate-y-1/2 rounded-full border-2 border-white bg-accent-500" style={{ left: `${((i + 1) / (via.length + 1)) * 100}%` }} />
                ))}
                <Plane className="absolute -right-1 top-1/2 size-4 -translate-y-1/2 text-brand-600" />
              </div>
              <p className={cn("text-xs font-semibold", offer.stops === 0 ? "text-brand-700" : "text-accent-600")}>
                {offer.stops === 0 ? "Non-stop" : `${offer.stops} stop · ${via.join(", ")}`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold tabular-nums sm:text-2xl">
                {formatTime(last.arrival)}
                {dayShift > 0 && <sup className="ml-0.5 text-xs font-bold text-accent-600">+{dayShift}</sup>}
              </p>
              <p className="text-xs font-semibold text-ink-500">{last.destination}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="chip bg-slate-100 text-ink-700">
              <Briefcase className="size-3.5" /> Cabin {offer.baggage.cabinKg}kg
            </span>
            <span className="chip bg-slate-100 text-ink-700">
              <Luggage className="size-3.5" /> Checked {offer.baggage.checkedKg}kg
            </span>
            <span className={cn("chip", offer.refundable ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600")}>
              <ShieldCheck className="size-3.5" /> {offer.refundable ? "Refundable" : "Non-refundable"}
            </span>
            {offer.seatsLeft <= 4 && <span className="chip bg-amber-50 text-amber-700">Only {offer.seatsLeft} seats left</span>}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-dashed border-slate-200 pt-4 md:min-w-44 md:flex-col md:items-end md:justify-center md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <div className="md:text-right">
            <p className="text-2xl font-extrabold text-ink-900">{formatMoney(total, currency)}</p>
            <p className="text-[11px] text-ink-500">Incl. taxes · all travellers</p>
          </div>
          <button onClick={() => onBook(offer)} className="btn btn-accent px-6 py-3">
            Book now
          </button>
        </div>
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-center gap-1 border-t border-slate-100 bg-slate-50/70 py-2 text-xs font-bold text-brand-700 transition hover:bg-brand-50"
      >
        Flight details <ChevronDown className={cn("size-4 transition", open && "rotate-180")} />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-slate-100 p-5 text-sm animate-fade-up md:grid-cols-[1.4fr_1fr]">
          <ol className="space-y-4">
            {offer.segments.map((s, i) => (
              <li key={i}>
                {i > 0 && (
                  <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                    Layover in {findAirport(s.origin)?.city ?? s.origin} ·{" "}
                    {formatDuration(Math.round((new Date(s.departure).getTime() - new Date(offer.segments[i - 1].arrival).getTime()) / 60_000))}
                  </p>
                )}
                <div className="flex gap-3">
                  <AirlineBadge code={s.airline} size="sm" />
                  <div className="flex-1">
                    <p className="font-bold">
                      {findAirport(s.origin)?.city} → {findAirport(s.destination)?.city}
                    </p>
                    <p className="text-xs text-ink-500">
                      {s.flightNumber} · {formatDuration(s.durationMin)}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <p>
                        <span className="block font-bold">
                          {formatTime(s.departure)} · {formatShortDate(s.departure)}
                        </span>
                        <span className="text-ink-500">{findAirport(s.origin)?.name}</span>
                      </p>
                      <p>
                        <span className="block font-bold">
                          {formatTime(s.arrival)} · {formatShortDate(s.arrival)}
                        </span>
                        <span className="text-ink-500">{findAirport(s.destination)?.name}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
          <div className="space-y-2 rounded-xl bg-slate-50 p-4 text-xs">
            <p className="text-sm font-bold">Fare summary</p>
            <Row label="Base fare" value={formatMoney(offer.price.base, currency)} />
            <Row label="Taxes & fees" value={formatMoney(offer.price.taxes, currency)} />
            <Row label="Total" value={formatMoney(total, currency)} bold />
            <p className="pt-2 text-ink-500">
              {offer.refundable ? "Cancellation fee from ৳3,000 + fare difference, up to 24h before departure." : "This fare is non-refundable. Date change allowed with penalty."}
            </p>
          </div>
        </div>
      )}
    </article>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <p className={cn("flex justify-between", bold && "border-t border-slate-200 pt-2 text-sm font-extrabold")}>
      <span>{label}</span>
      <span className="tabular-nums">{value}</span>
    </p>
  );
}
