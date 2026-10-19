import { ArrowRight, CalendarDays, Check, Sparkles, Wand2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { DESTINATIONS, findDestination, PACKAGES } from "@/lib/data/holidays";
import { quoteHoliday } from "@/lib/holiday-pricing";
import { addDays, todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Holiday packages" };
export const dynamic = "force-dynamic";

function fromPrice(slug: string): number {
  const p = PACKAGES.find((x) => x.slug === slug)!;
  const q = quoteHoliday({
    destination: p.destination,
    packageSlug: p.slug,
    startDate: addDays(todayISO(), 21),
    nights: p.defaultNights,
    adults: 2,
    children: 0,
    rooms: 1,
    tier: p.tier,
    meal: p.meal,
    includeFlights: true,
    addOns: p.includedAddOns,
  });
  return q?.perPerson ?? 0;
}

export default function HolidaysPage() {
  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Holiday packages</h1>
          <p className="mt-1 text-ink-500">Curated trips with flights, stays and experiences — or design your own.</p>
        </div>
        <Link href="/holidays/custom" className="btn btn-accent">
          <Wand2 className="size-4" /> Customise your holiday
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {PACKAGES.map((p) => {
          const d = findDestination(p.destination)!;
          return (
            <Link key={p.slug} href={`/holidays/${p.slug}`} className="card group overflow-hidden transition duration-200 hover:-translate-y-1 hover:shadow-float">
              <div className={`relative h-48 overflow-hidden bg-gradient-to-br ${d.gradient}`}>
                <Photo src={d.image} alt={d.name} className="transition duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" aria-hidden />
                <span className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-ink-900">
                  <CalendarDays className="size-3.5" /> {p.defaultNights}N / {p.defaultNights + 1}D
                </span>
                                <div className="absolute bottom-3 left-4 z-10 flex gap-1">
                  {p.tags.map((t) => (
                    <span key={t} className="rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase text-white backdrop-blur">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-lg font-bold">{p.name}</h2>
                <p className="text-sm text-ink-500">{d.country}</p>
                <ul className="mt-3 space-y-1 text-xs text-ink-700">
                  {p.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5">
                      <Check className="size-3.5 text-brand-600" /> {h}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs text-ink-500">
                    From, per person
                    <span className="block text-xl font-extrabold text-ink-900">৳{fromPrice(p.slug).toLocaleString("en-IN")}</span>
                  </p>
                  <span className="flex items-center gap-1 text-sm font-bold text-brand-700">
                    Customise <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-14 overflow-hidden rounded-3xl relative bg-gradient-to-br from-brand-700 to-accent-500 p-6 text-white sm:p-10">
        <Photo src="/images/destinations/maldives.jpg" alt="" className="opacity-25 mix-blend-overlay" />
        <div className="relative">
        <p className="flex items-center gap-2 text-sm font-bold text-amber-300">
          <Sparkles className="size-5" /> Build your own
        </p>
        <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Pick a destination and make it yours</h2>
        <p className="mt-1 max-w-xl text-white/75">Choose dates, hotel category, meals, flights and experiences — see the price update live.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => (
            <Link key={d.code} href={`/holidays/custom?dest=${d.code}`} className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 transition hover:bg-white/20">
              {d.flag} {d.name}
            </Link>
          ))}
        </div>
        </div>
      </section>
    </div>
  );
}
