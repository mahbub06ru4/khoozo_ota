"use client";

import { AlertTriangle, SearchX, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { decodeQuery } from "@/lib/api";
import { applyFlightFilters, applyHotelFilters, flightTotal, hotelNightly } from "@/lib/filters";
import { cn, formatDuration, formatMoney, nightsBetween } from "@/lib/utils";
import type { FlightOffer, HotelOffer, SearchKind, SortKey } from "@/types";
import { FlightCard } from "./FlightCard";
import { FlightFilters } from "./FlightFilters";
import { HotelCard } from "./HotelCard";
import { HotelFilters } from "./HotelFilters";
import { SearchSummaryBar } from "./SearchSummaryBar";
import { ResultsSkeleton } from "./Skeletons";

const PAGE = 10;

export function ResultsView({ kind }: { kind: SearchKind }) {
  const params = useSearchParams();
  const router = useRouter();
  const raw = params.get("q");
  const query = useMemo(() => decodeQuery(raw), [raw]);
  const app = useApp();
  const { runSearch, status, error, flights, hotels, flightFilters, hotelFilters, sort, setSort, setCart, currency } = app;
  const [drawer, setDrawer] = useState(false);
  const pagerKey = JSON.stringify([raw, flightFilters, hotelFilters, sort]);
  const [pager, setPager] = useState({ key: pagerKey, n: PAGE });
  const visible = pager.key === pagerKey ? pager.n : PAGE;

  useEffect(() => {
    if (query && query.kind === kind) runSearch(query);
  }, [query, kind, runSearch]);

  const filteredFlights = useMemo(() => applyFlightFilters(flights, flightFilters, sort), [flights, flightFilters, sort]);
  const filteredHotels = useMemo(() => applyHotelFilters(hotels, hotelFilters, sort), [hotels, hotelFilters, sort]);

  if (!query || query.kind !== kind) {
    return (
      <div className="container-page py-24 text-center">
        <SearchX className="mx-auto size-12 text-slate-400" />
        <h1 className="mt-4 text-2xl font-bold">No search to show</h1>
        <p className="mt-1 text-ink-500">This link is missing or has an invalid search. Start a new one.</p>
        <Link href={kind === "hotel" ? "/?tab=hotels" : "/"} className="btn btn-primary mt-6">
          New search
        </Link>
      </div>
    );
  }

  const nights = query.kind === "hotel" ? nightsBetween(query.checkIn, query.checkOut) : 1;
  const list: (FlightOffer | HotelOffer)[] = kind === "flight" ? filteredFlights : filteredHotels;
  const totalCount = kind === "flight" ? flights.length : hotels.length;
  const stale = JSON.stringify(app.query) !== JSON.stringify(query);
  const loading = stale || status === "loading" || status === "idle";

  const bookFlight = (offer: FlightOffer) => {
    if (query.kind !== "flight") return;
    setCart({ kind: "flight", offer, query });
    router.push("/checkout");
  };
  const bookHotel = (offer: HotelOffer) => {
    if (query.kind !== "hotel") return;
    setCart({ kind: "hotel", offer, query, nights });
    router.push("/checkout");
  };

  const sortTabs: { key: SortKey; label: string; sub?: string }[] =
    kind === "flight"
      ? [
          { key: "best", label: "Recommended" },
          { key: "cheapest", label: "Cheapest", sub: filteredFlights.length ? formatMoney(Math.min(...filteredFlights.map(flightTotal)), currency) : undefined },
          { key: "fastest", label: "Fastest", sub: filteredFlights.length ? formatDuration(Math.min(...filteredFlights.map((o) => o.totalDurationMin))) : undefined },
          { key: "earliest", label: "Earliest" },
        ]
      : [
          { key: "best", label: "Top rated" },
          { key: "cheapest", label: "Lowest price", sub: filteredHotels.length ? formatMoney(Math.min(...filteredHotels.map(hotelNightly)), currency) : undefined },
          { key: "fastest", label: "Star rating" },
        ];

  const filters = kind === "flight" ? <FlightFilters /> : <HotelFilters />;

  return (
    <>
      <SearchSummaryBar query={query} />

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="card sticky top-36 max-h-[calc(100vh-10rem)] overflow-y-auto p-5">
            {loading ? <div className="space-y-3">{Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-5" />)}</div> : filters}
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex items-center gap-3">
            <div className="grid flex-1 auto-cols-fr grid-flow-col overflow-hidden rounded-2xl border border-slate-200 bg-white" role="tablist" aria-label="Sort results">
              {sortTabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  aria-selected={sort === t.key}
                  onClick={() => setSort(t.key)}
                  className={cn(
                    "border-b-2 px-2 py-2.5 text-center text-xs font-bold transition sm:text-sm",
                    sort === t.key ? "border-brand-600 bg-brand-50/60 text-brand-700" : "border-transparent text-ink-700 hover:bg-slate-50",
                  )}
                >
                  {t.label}
                  {t.sub && !loading && <span className="block text-[11px] font-semibold text-ink-500">{t.sub}</span>}
                </button>
              ))}
            </div>
            <button onClick={() => setDrawer(true)} className="btn btn-outline lg:hidden" aria-label="Open filters">
              <SlidersHorizontal className="size-4" />
            </button>
          </div>

          {!loading && status === "success" && (
            <p className="mb-3 text-sm text-ink-500">
              Showing <span className="font-bold text-ink-900">{list.length}</span> of {totalCount} {kind === "flight" ? "flights" : "properties"}
            </p>
          )}

          {loading && <ResultsSkeleton />}

          {!loading && status === "error" && (
            <div className="card flex flex-col items-center p-10 text-center">
              <AlertTriangle className="size-10 text-amber-500" />
              <p className="mt-3 font-bold">{error}</p>
              <button onClick={() => runSearch(query)} className="btn btn-primary mt-4">
                Try again
              </button>
            </div>
          )}

          {!loading && status === "success" && list.length === 0 && (
            <div className="card flex flex-col items-center p-10 text-center">
              <SearchX className="size-10 text-slate-400" />
              <p className="mt-3 font-bold">{totalCount === 0 ? "No availability for this search" : "No results match your filters"}</p>
              <p className="mt-1 text-sm text-ink-500">{totalCount === 0 ? "Try different dates or a nearby destination." : "Try removing a filter or widening the price range."}</p>
            </div>
          )}

          {!loading && status === "success" && (
            <div className="space-y-4">
              {kind === "flight"
                ? filteredFlights.slice(0, visible).map((o) => <FlightCard key={o.id} offer={o} onBook={bookFlight} />)
                : filteredHotels.slice(0, visible).map((o) => <HotelCard key={o.id} offer={o} nights={nights} onBook={bookHotel} />)}
              {list.length > visible && (
                <button onClick={() => setPager({ key: pagerKey, n: visible + PAGE })} className="btn btn-outline w-full py-3">
                  Show more ({list.length - visible} remaining)
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {drawer && (
        <div className="fixed inset-0 z-[90] lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50 animate-fade-up" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-24 animate-fade-up">
            <button onClick={() => setDrawer(false)} className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-slate-100" aria-label="Close filters">
              <X className="size-5" />
            </button>
            {filters}
            <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white p-4">
              <button onClick={() => setDrawer(false)} className="btn btn-primary w-full py-3">
                Show {list.length} results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
