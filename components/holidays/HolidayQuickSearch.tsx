"use client";

import { Search, Wand2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { DESTINATIONS, findDestination, PACKAGES } from "@/lib/data/holidays";
import { cn } from "@/lib/utils";

export function HolidayQuickSearch() {
  const router = useRouter();
  const [dest, setDest] = useState(DESTINATIONS[0].code);
  const packages = PACKAGES.filter((p) => p.destination === dest);

  return (
    <div>
      <p className="label">Where would you like to go?</p>
      <div className="-mx-1 flex flex-wrap gap-2">
        {DESTINATIONS.map((d) => (
          <button
            key={d.code}
            type="button"
            onClick={() => setDest(d.code)}
            aria-pressed={dest === d.code}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition",
              dest === d.code ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white hover:border-brand-400",
            )}
          >
            {d.flag} {d.name}
          </button>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-500">
          {packages.length
            ? packages.map((p) => (
                <Link key={p.slug} href={`/holidays/${p.slug}`} className="mr-3 font-semibold text-brand-700 hover:underline">
                  {p.name} →
                </Link>
              ))
            : `No ready-made package for ${findDestination(dest)?.name} yet — build your own.`}
        </p>
        <div className="flex gap-2">
          <Link href="/holidays" className="btn btn-outline">
            <Search className="size-4" /> All packages
          </Link>
          <button type="button" onClick={() => router.push(`/holidays/custom?dest=${dest}`)} className="btn btn-accent px-6">
            <Wand2 className="size-4" /> Customise trip
          </button>
        </div>
      </div>
    </div>
  );
}
