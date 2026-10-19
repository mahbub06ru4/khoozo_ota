"use client";

import { BedDouble, History, Palmtree, Plane, Stamp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppProvider";
import { searchUrl } from "@/lib/api";
import { cn, formatShortDate, totalPassengers } from "@/lib/utils";
import type { SearchQuery } from "@/types";
import { HolidayQuickSearch } from "@/components/holidays/HolidayQuickSearch";
import { VisaFinder } from "@/components/visa/VisaFinder";
import { FlightSearchForm } from "./FlightSearchForm";
import { HotelSearchForm } from "./HotelSearchForm";

type Tab = "flight" | "hotel" | "holiday" | "visa";
const TABS: { key: Tab; label: string; icon: typeof Plane; param: string | null }[] = [
  { key: "flight", label: "Flight", icon: Plane, param: null },
  { key: "hotel", label: "Hotel", icon: BedDouble, param: "hotels" },
  { key: "holiday", label: "Holiday", icon: Palmtree, param: "holidays" },
  { key: "visa", label: "Visa", icon: Stamp, param: "visa" },
];

function describe(q: SearchQuery): string {
  if (q.kind === "flight") {
    const l = q.legs[0];
    return `${l.origin} → ${q.legs[q.legs.length - 1].destination} · ${formatShortDate(l.date)} · ${totalPassengers(q.passengers)} pax`;
  }
  return `${q.destination} · ${formatShortDate(q.checkIn)} · ${q.rooms.length} room${q.rooms.length > 1 ? "s" : ""}`;
}

export function SearchPanel() {
  const params = useSearchParams();
  const router = useRouter();
  const tab: Tab = TABS.find((t) => t.param && t.param === params.get("tab"))?.key ?? "flight";
  const { history, hydrated } = useApp();
  const recent = history.filter((h) => h.kind === tab).slice(0, 3);

  return (
    <div className="card relative p-4 shadow-float sm:p-6">
      <div className="-mt-10 mb-5 inline-flex max-w-full overflow-x-auto rounded-2xl [scrollbar-width:none] bg-white p-1.5 shadow-card ring-1 ring-slate-200 sm:-mt-12" role="tablist">
        {TABS.map(({ key, label, icon: Icon, param }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => router.replace(param ? `/?tab=${param}` : "/", { scroll: false })}
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition sm:px-5",
              tab === key ? "bg-brand-600 text-white shadow-md shadow-brand-600/30" : "text-ink-700 hover:bg-slate-100",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      {tab === "flight" && <FlightSearchForm key="f" />}
      {tab === "hotel" && <HotelSearchForm key="h" />}
      {tab === "holiday" && <HolidayQuickSearch />}
      {tab === "visa" && <VisaFinder />}

      {hydrated && recent.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-ink-500">
            <History className="size-3.5" /> Recent:
          </span>
          {recent.map((q, i) => (
            <Link key={i} href={searchUrl(q)} className="chip bg-slate-100 text-ink-700 transition hover:bg-brand-50 hover:text-brand-700">
              {describe(q)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
