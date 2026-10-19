"use client";

import { BedDouble, Palmtree, Plane, Stamp, Ticket } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { useApp } from "@/context/AppProvider";
import { findAirport } from "@/lib/data/airports";
import { findDestination } from "@/lib/data/holidays";
import { findVisaCountry, VISA_TYPE_LABEL } from "@/lib/data/visas";
import { formatDate, formatMoney } from "@/lib/utils";

function Row({ icon, title, sub, refNo, amount, status }: { icon: ReactNode; title: string; sub: string; refNo: string; amount: string; status?: string }) {
  return (
    <li className="card flex items-center gap-4 p-4">
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-bold">{title}</p>
        <p className="truncate text-xs text-ink-500">{sub}</p>
      </div>
      <div className="text-right">
        <p className="font-mono text-xs font-black tracking-wider sm:text-sm">{refNo}</p>
        <p className="text-sm font-bold">{amount}</p>
        {status && <span className="chip mt-1 bg-amber-50 text-amber-700">{status}</span>}
      </div>
    </li>
  );
}

export default function BookingsPage() {
  const { bookings, visaApplications, holidayBookings, hydrated, currency } = useApp();
  const empty = bookings.length + visaApplications.length + holidayBookings.length === 0;

  return (
    <div className="container-page max-w-3xl py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">My bookings</h1>
      <p className="mb-6 mt-1 text-ink-500">Flights, hotels, holidays and visa applications made in this browser (demo storage).</p>

      {!hydrated ? (
        <div className="skeleton h-32 rounded-2xl" />
      ) : empty ? (
        <div className="card p-10 text-center">
          <Ticket className="mx-auto size-10 text-slate-400" />
          <p className="mt-3 font-bold">No bookings yet</p>
          <Link href="/" className="btn btn-primary mt-4">
            Start exploring
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {bookings.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-500">Flights & hotels</h2>
              <ul className="space-y-3">
                {bookings.map((b) => (
                  <Row
                    key={b.pnr}
                    icon={b.item.kind === "flight" ? <Plane className="size-5" /> : <BedDouble className="size-5" />}
                    title={
                      b.item.kind === "flight"
                        ? `${findAirport(b.item.offer.segments[0].origin)?.city} → ${findAirport(b.item.offer.segments.at(-1)!.destination)?.city}`
                        : b.item.offer.name
                    }
                    sub={`${formatDate(b.item.kind === "flight" ? b.item.offer.segments[0].departure : b.item.query.checkIn)} · ${b.paymentMethod}`}
                    refNo={b.pnr}
                    amount={formatMoney(b.amount, currency)}
                  />
                ))}
              </ul>
            </section>
          )}
          {holidayBookings.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-500">Holidays</h2>
              <ul className="space-y-3">
                {holidayBookings.map((h) => {
                  const d = findDestination(h.config.destination);
                  return (
                    <Row
                      key={h.ref}
                      icon={<Palmtree className="size-5" />}
                      title={`${d?.flag ?? ""} ${d?.name ?? h.config.destination} · ${h.config.nights}N`}
                      sub={`${formatDate(h.config.startDate)} · ${h.config.adults + h.config.children} traveller(s) · ${h.config.tier}★`}
                      refNo={h.ref}
                      amount={formatMoney(h.quote.total, currency)}
                      status="Awaiting confirmation"
                    />
                  );
                })}
              </ul>
            </section>
          )}
          {visaApplications.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-500">Visa applications</h2>
              <ul className="space-y-3">
                {visaApplications.map((v) => {
                  const c = findVisaCountry(v.product.countryCode);
                  return (
                    <Row
                      key={v.id}
                      icon={<Stamp className="size-5" />}
                      title={`${c?.flag ?? ""} ${c?.name} · ${VISA_TYPE_LABEL[v.product.type]} visa`}
                      sub={`${v.applicant.firstName} ${v.applicant.lastName} · travel ${formatDate(v.applicant.travelDate)}`}
                      refNo={v.id}
                      amount={formatMoney(v.amount, currency)}
                      status="Document review"
                    />
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
