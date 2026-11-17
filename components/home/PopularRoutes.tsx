"use client";

import { Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { Photo } from "@/components/ui/Photo";
import { searchUrl } from "@/lib/api";
import { addDays, todayISO } from "@/lib/utils";
import type { FlightSearchQuery } from "@/types";

const POPULAR = [
  { from: "DAC", to: "CXB", city: "Cox's Bazar", tag: "Beach", price: "3,999", gradient: "from-amber-300 to-orange-500", image: "/images/destinations/coxs-bazar.jpg" },
  { from: "DAC", to: "DXB", city: "Dubai", tag: "City break", price: "38,500", gradient: "from-sky-400 to-indigo-600", image: "/images/destinations/dubai.jpg" },
  { from: "DAC", to: "BKK", city: "Bangkok", tag: "Food & culture", price: "24,900", gradient: "from-fuchsia-400 to-purple-600", image: "/images/destinations/bangkok.jpg" },
  { from: "DAC", to: "KUL", city: "Kuala Lumpur", tag: "Shopping", price: "27,300", gradient: "from-teal-400 to-emerald-600", image: "/images/destinations/kuala-lumpur.jpg" },
  { from: "DAC", to: "MLE", city: "Maldives", tag: "Islands", price: "41,200", gradient: "from-cyan-300 to-sky-600", image: "/images/destinations/maldives.jpg" },
  { from: "DAC", to: "KTM", city: "Kathmandu", tag: "Mountains", price: "19,800", gradient: "from-rose-400 to-red-600", image: "/images/destinations/kathmandu.jpg" },
];

// Date is computed on click so a static build never links to a past departure date.
function routeQuery(from: string, to: string): FlightSearchQuery {
  return {
    kind: "flight",
    tripType: "oneway",
    legs: [{ origin: from, destination: to, date: addDays(todayISO(), 14) }],
    passengers: { adults: 1, children: 0, infants: 0 },
    cabin: "Economy",
  };
}


export function PopularRoutes() {
  const router = useRouter();
  return (
    <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {POPULAR.map((p) => (
        <button
          key={p.to}
          type="button"
          onClick={() => router.push(searchUrl(routeQuery(p.from, p.to)))}
          className={`group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-left text-white shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-float ${p.gradient}`}
        >
          <Photo src={p.image} alt={p.city} className="transition duration-500 group-hover:scale-110" />
          <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
          <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold uppercase backdrop-blur">{p.tag}</span>
          <Plane className="absolute left-4 top-4 size-6 -rotate-45 opacity-80 transition duration-500 group-hover:translate-x-2 group-hover:-translate-y-2" />
          <span className="relative block text-lg font-extrabold leading-tight">{p.city}</span>
          <span className="relative block text-xs text-white/80">
            {p.from} → {p.to}
          </span>
          <span className="relative mt-2 block text-sm">
            from <span className="font-extrabold">৳{p.price}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
