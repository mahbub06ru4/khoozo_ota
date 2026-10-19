import { ArrowLeft, Check } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { HolidayBuilder } from "@/components/holidays/HolidayBuilder";
import { Photo } from "@/components/ui/Photo";
import { findDestination, findPackage, PACKAGES } from "@/lib/data/holidays";

export function generateStaticParams() {
  return PACKAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: findPackage(slug)?.name ?? "Holiday" };
}

export default async function PackagePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pkg = findPackage(slug);
  if (!pkg) notFound();
  const d = findDestination(pkg.destination)!;

  return (
    <>
      <section className={`relative overflow-hidden bg-gradient-to-br ${d.gradient} py-14 text-white sm:py-20`}>
        <Photo src={d.image} alt={d.name} priority />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" aria-hidden />
        <div className="container-page relative">
          <Link href="/holidays" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-white/90 hover:text-white">
            <ArrowLeft className="size-4" /> All holidays
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            {d.flag} {pkg.name}
          </h1>
          <p className="mt-1 text-white/85">
            {d.country} · {pkg.minNights}–{pkg.maxNights} nights · {pkg.tags.join(" · ")}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {pkg.highlights.map((h) => (
              <li key={h} className="flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Check className="size-3.5" /> {h}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="container-page py-8">
        <section className="card mb-6 p-5">
          <h2 className="mb-4 text-lg font-extrabold">Sample itinerary</h2>
          <ol className="relative space-y-4 border-l-2 border-brand-100 pl-6">
            {pkg.itinerary.map((day, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[33px] grid size-6 place-items-center rounded-full bg-brand-600 text-[11px] font-bold text-white">{i + 1}</span>
                <p className="font-bold">{day.title}</p>
                <p className="text-sm text-ink-500">{day.text}</p>
              </li>
            ))}
          </ol>
        </section>
        <h2 className="mb-4 text-xl font-extrabold">Customise this package</h2>
        <HolidayBuilder pkg={pkg} />
      </div>
    </>
  );
}
