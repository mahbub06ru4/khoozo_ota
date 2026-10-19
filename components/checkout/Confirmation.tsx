"use client";

import { CheckCircle2, Download, Home, Ticket } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/context/AppProvider";
import { findAirport } from "@/lib/data/airports";
import { formatDate, formatMoney } from "@/lib/utils";
import type { Booking } from "@/types";

export function Confirmation({ booking }: { booking: Booking }) {
  const { currency } = useApp();
  const item = booking.item;
  const title =
    item.kind === "flight"
      ? `${findAirport(item.offer.segments[0].origin)?.city} → ${findAirport(item.offer.segments.at(-1)!.destination)?.city}`
      : item.offer.name;

  return (
    <div className="container-page max-w-2xl py-12">
      <div className="card overflow-hidden text-center">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-10 text-white">
          <CheckCircle2 className="mx-auto size-16 animate-fade-up" />
          <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Booking confirmed!</h1>
          <p className="mt-1 text-white/80">A confirmation has been sent to {booking.contact.email}</p>
        </div>
        <div className="space-y-5 p-6 text-left">
          <div className="flex items-center justify-between rounded-2xl border-2 border-dashed border-brand-300 bg-brand-50 p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">{item.kind === "flight" ? "Booking ref (PNR)" : "Confirmation no."}</p>
              <p className="text-3xl font-black tracking-[0.2em] text-ink-900">{booking.pnr}</p>
            </div>
            <Ticket className="size-10 text-brand-500" />
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-ink-500">{item.kind === "flight" ? "Route" : "Hotel"}</dt>
              <dd className="font-bold">{title}</dd>
            </div>
            <div>
              <dt className="text-ink-500">{item.kind === "flight" ? "Departure" : "Check-in"}</dt>
              <dd className="font-bold">{formatDate(item.kind === "flight" ? item.offer.segments[0].departure : item.query.checkIn)}</dd>
            </div>
            <div>
              <dt className="text-ink-500">{item.kind === "flight" ? "Travellers" : "Lead guest"}</dt>
              <dd className="font-bold">
                {item.kind === "flight" ? booking.travellers.length : `${booking.travellers[0].firstName} ${booking.travellers[0].lastName}`}
              </dd>
            </div>
            <div>
              <dt className="text-ink-500">Paid via</dt>
              <dd className="font-bold">{booking.paymentMethod}</dd>
            </div>
            <div className="col-span-2 flex items-baseline justify-between border-t border-slate-100 pt-4">
              <dt className="font-bold">Amount paid</dt>
              <dd className="text-2xl font-extrabold">{formatMoney(booking.amount, currency)}</dd>
            </div>
          </dl>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={() => window.print()} className="btn btn-outline flex-1">
              <Download className="size-4" /> Print / save {item.kind === "flight" ? "e-ticket" : "voucher"}
            </button>
            <Link href="/bookings" className="btn btn-outline flex-1">
              <Ticket className="size-4" /> My bookings
            </Link>
            <Link href="/" className="btn btn-primary flex-1">
              <Home className="size-4" /> Back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
