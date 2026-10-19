"use client";

import { BedDouble, CalendarDays, Info, MapPin, Plane, Tag, X } from "lucide-react";
import { useState } from "react";
import { AirlineBadge } from "@/components/results/FlightCard";
import { useApp } from "@/context/AppProvider";
import { findAirline, findAirport } from "@/lib/data/airports";
import { findPromoByCode, type Promo } from "@/lib/data/promos";
import { cn, formatDuration, formatMoney, formatShortDate, formatTime, totalPassengers } from "@/lib/utils";
import type { CartItem, FareBreakdown } from "@/types";

interface Props {
  item: CartItem;
  fare: FareBreakdown;
  promo: Promo | null;
  onPromo: (p: Promo | null) => void;
  locked?: boolean;
}

export function BookingSummary({ item, fare, promo, onPromo, locked }: Props) {
  const { currency } = useApp();
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);

  const apply = () => {
    const p = findPromoByCode(code);
    if (!p) return setCodeError("Invalid or expired promo code");
    const applicable = p.category === "bank" || (item.kind === "flight" ? p.category === "flight" : p.category === "hotel");
    if (!applicable) return setCodeError(`This code is valid for ${p.category} bookings only`);
    setCodeError(null);
    onPromo(p);
    setCode("");
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <h2 className="mb-4 text-base font-extrabold">Trip summary</h2>
        {item.kind === "flight" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <AirlineBadge code={item.offer.airline} />
              <div className="min-w-0">
                <p className="truncate font-bold">{findAirline(item.offer.airline)?.name}</p>
                <p className="text-xs text-ink-500">
                  {item.offer.cabin} · {item.offer.stops === 0 ? "Non-stop" : `${item.offer.stops} stop`}
                </p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p className="flex items-center gap-2 font-bold">
                <Plane className="size-4 text-brand-600" />
                {findAirport(item.offer.segments[0].origin)?.city} → {findAirport(item.offer.segments.at(-1)!.destination)?.city}
              </p>
              <p className="mt-1 text-xs text-ink-500">
                {formatShortDate(item.offer.segments[0].departure)} · {formatTime(item.offer.segments[0].departure)} – {formatTime(item.offer.segments.at(-1)!.arrival)} ·{" "}
                {formatDuration(item.offer.totalDurationMin)}
              </p>
              {item.query.tripType === "roundtrip" && item.query.returnDate && (
                <p className="mt-1 text-xs text-ink-500">Return {formatShortDate(item.query.returnDate)} (same carrier)</p>
              )}
            </div>
            <p className="text-xs text-ink-500">
              {totalPassengers(item.query.passengers)} traveller(s) · Cabin {item.offer.baggage.cabinKg}kg · Checked {item.offer.baggage.checkedKg}kg
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="flex items-start gap-2 font-bold">
              <BedDouble className="mt-0.5 size-4 shrink-0 text-brand-600" /> {item.offer.name}
            </p>
            <p className="flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="size-3.5" /> {item.offer.neighborhood}, {item.offer.city}
            </p>
            <div className="rounded-xl bg-slate-50 p-3 text-xs">
              <p className="flex items-center gap-2 font-semibold">
                <CalendarDays className="size-4 text-brand-600" />
                {formatShortDate(item.query.checkIn)} → {formatShortDate(item.query.checkOut)} · {item.nights} night(s)
              </p>
              <p className="mt-1 text-ink-500">
                {item.query.rooms.length} room(s) · {item.query.rooms.reduce((n, r) => n + r.adults + r.children, 0)} guest(s)
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <Info className="size-4 shrink-0" />
          <p>
            {item.kind === "flight"
              ? item.offer.refundable
                ? "Refundable fare. Airline cancellation fee + ৳500 service fee applies; refunds in 7–10 working days."
                : "Non-refundable fare. Only taxes may be refunded on cancellation. Date change with penalty."
              : item.offer.freeCancellation
                ? "Free cancellation until 48h before check-in. Later cancellations charged one night."
                : "Non-refundable rate. No refund on cancellation or no-show."}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-base font-extrabold">Fare summary</h2>
        <dl className="space-y-2 text-sm">
          <Line label={item.kind === "hotel" ? `Room charges (${item.nights} night${item.nights > 1 ? "s" : ""})` : "Base fare"} value={formatMoney(fare.base, currency)} />
          <Line label="Taxes & fees" value={formatMoney(fare.taxes, currency)} />
          <Line label="Service charge" value={formatMoney(fare.serviceFee, currency)} />
          {fare.discount > 0 && <Line label={`Promo discount${promo ? ` (${promo.code})` : ""}`} value={`– ${formatMoney(fare.discount, currency)}`} className="text-emerald-700" />}
          <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
            <dt className="font-bold">Total payable</dt>
            <dd className="text-2xl font-extrabold tabular-nums">{formatMoney(fare.total, currency)}</dd>
          </div>
        </dl>

        {!locked && (
          <div className="mt-4 border-t border-slate-100 pt-4">
            {promo ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-semibold text-emerald-800">
                  <Tag className="size-4" /> {promo.code} applied
                </span>
                <button onClick={() => onPromo(null)} aria-label="Remove promo" className="text-emerald-800 hover:text-red-600">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <label className="label" htmlFor="promo">
                  Promo code
                </label>
                <div className="flex gap-2">
                  <input
                    id="promo"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), apply())}
                    className={cn("input uppercase", codeError && "input-error")}
                    placeholder="e.g. DOM500"
                  />
                  <button type="button" onClick={apply} disabled={!code} className="btn btn-outline">
                    Apply
                  </button>
                </div>
                {codeError && <p className="mt-1 text-xs font-medium text-red-600">{codeError}</p>}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Line({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between", className)}>
      <dt className="text-ink-700">{label}</dt>
      <dd className="font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
