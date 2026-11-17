import { ArrowRight, BadgeCheck, Headphones, Plane, ShieldCheck, Wallet } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { PromoGrid } from "@/components/home/PromoGrid";
import { SearchPanel } from "@/components/search/SearchPanel";
import { Photo } from "@/components/ui/Photo";
import { PopularRoutes } from "@/components/home/PopularRoutes";

const VALUE_PROPS = [
  { icon: Wallet, title: "Transparent fares", text: "Taxes & fees shown upfront. No surprises at checkout." },
  { icon: ShieldCheck, title: "Secure payments", text: "PCI-DSS compliant cards and local mobile wallets." },
  { icon: Headphones, title: "24/7 support", text: "Real travel experts on call, chat and email." },
  { icon: BadgeCheck, title: "IATA accredited", text: "Instant ticketing from 450+ airlines worldwide." },
];

export default function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-accent-500 pb-24 pt-14 sm:pb-32 sm:pt-20">
        <Photo src="/images/destinations/maldives.jpg" alt="" priority className="opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 via-brand-800/40 to-transparent" aria-hidden />
        <svg className="absolute inset-0 size-full opacity-[0.08]" aria-hidden>
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        <div className="absolute -right-32 -top-32 size-[28rem] rounded-full bg-accent-500/25 blur-3xl" aria-hidden />
        <div className="absolute -bottom-40 -left-20 size-[26rem] rounded-full bg-sky-300/25 blur-3xl" aria-hidden />
        <Plane className="absolute right-[8%] top-16 hidden size-28 -rotate-12 text-white/10 lg:block" aria-hidden />

        <div className="container-page relative text-white">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <span className="size-1.5 animate-pulse rounded-full bg-accent-500" /> Up to 15% off with partner banks this week
          </p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            Your journey starts with <span className="text-amber-300">one search.</span>
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">
            Compare flights and hotels across hundreds of airlines and properties — book in minutes, pay your way.
          </p>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-16 sm:-mt-20">
        <Suspense fallback={<div className="card h-72 animate-pulse" />}>
          <SearchPanel />
        </Suspense>
      </section>

      <section className="container-page mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {VALUE_PROPS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex gap-4 rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
              <Icon className="size-5" />
            </span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-0.5 text-sm text-ink-500">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section className="container-page mt-16">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Exclusive offers</h2>
            <p className="mt-1 text-ink-500">Flight deals, bank discounts and holiday packages picked for you.</p>
          </div>
          <Link href="/promotions" className="hidden items-center gap-1 text-sm font-bold text-brand-700 hover:underline sm:flex">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <PromoGrid limit={8} />
      </section>

      <section className="container-page mt-16">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Popular from Dhaka</h2>
        <p className="mt-1 text-ink-500">One-way economy fares, 2 weeks out.</p>
        <PopularRoutes />
      </section>
    </>
  );
}
