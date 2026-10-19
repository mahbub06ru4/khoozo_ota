import { ArrowRight, BookOpenCheck, FileCheck2, GraduationCap, Headphones, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Photo } from "@/components/ui/Photo";
import { VisaFinder } from "@/components/visa/VisaFinder";
import { VISA_COUNTRIES, VISA_TYPE_LABEL } from "@/lib/data/visas";

export const metadata: Metadata = { title: "Visa services" };

const REGIONS = ["Asia", "Middle East", "Europe", "North America", "Oceania"] as const;
const STUDY = ["GB", "US", "CA", "AU", "DE", "MY"];

const STEPS = [
  { icon: BookOpenCheck, title: "Check requirements", text: "Country-specific checklist, fees and timelines." },
  { icon: FileCheck2, title: "Submit documents", text: "Fill one form; our experts review every file." },
  { icon: ShieldCheck, title: "We lodge & track", text: "Appointment, submission and status updates." },
  { icon: Headphones, title: "Visa delivered", text: "Passport return or e-visa straight to your inbox." },
];

export default function VisaPage() {
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-accent-500 pb-28 pt-14 text-white sm:pt-20">
        <Photo src="/images/hero/visa.jpg" alt="" priority className="opacity-30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-900/80 to-transparent" aria-hidden />
        <div className="container-page relative">
          <h1 className="max-w-2xl text-3xl font-extrabold tracking-tight sm:text-5xl">Visa services for {VISA_COUNTRIES.length}+ countries</h1>
          <p className="mt-3 max-w-xl text-white/80">Tourist, business, work, transit and student visas — expert document review and end-to-end processing.</p>
        </div>
      </section>

      <section className="container-page relative z-10 -mt-16">
        <div className="card p-4 shadow-float sm:p-6">
          <VisaFinder />
        </div>
      </section>

      <section className="container-page mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ icon: Icon, title, text }, i) => (
          <div key={title} className="rounded-2xl bg-white p-5 ring-1 ring-slate-200/80">
            <span className="mb-3 flex items-center gap-2 text-xs font-bold text-brand-700">
              <span className="grid size-9 place-items-center rounded-xl bg-brand-50">
                <Icon className="size-5" />
              </span>
              STEP {i + 1}
            </span>
            <h3 className="font-bold">{title}</h3>
            <p className="mt-0.5 text-sm text-ink-500">{text}</p>
          </div>
        ))}
      </section>

      <section className="container-page mt-16">
        <div className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-10">
          <Photo src="/images/hero/study.jpg" alt="" className="opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-900 via-ink-900/85 to-brand-900/60" aria-hidden />
          <div className="relative">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-bold text-amber-300">
                <GraduationCap className="size-5" /> Study abroad
              </p>
              <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">Student visa assistance</h2>
              <p className="mt-1 max-w-xl text-white/70">CAS, I-20, CoE, LOA, blocked accounts, SOP review and interview prep — we handle the paperwork.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {STUDY.map((code) => {
              const c = VISA_COUNTRIES.find((x) => x.code === code)!;
              return (
                <Link
                  key={code}
                  href={`/visa/${code.toLowerCase()}?type=student`}
                  className="group flex items-center gap-4 rounded-2xl bg-white/10 p-3 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/20"
                >
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-white/10">
                    <Photo src={`/images/study/${code.toLowerCase()}.jpg`} alt={`${c.name} university`} />
                  </span>
                  <span className="flex-1">
                    <span className="block font-bold">
                      {c.flag} {c.name}
                    </span>
                    <span className="text-xs text-white/70">Student visa · requirements & fees</span>
                  </span>
                  <ArrowRight className="size-5 transition group-hover:translate-x-1" />
                </Link>
              );
            })}
          </div>
          </div>
        </div>
      </section>

      <section className="container-page mt-16">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Browse by destination</h2>
        {REGIONS.map((region) => (
          <div key={region} className="mt-6">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-500">{region}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {VISA_COUNTRIES.filter((c) => c.region === region).map((c) => (
                <Link
                  key={c.code}
                  href={`/visa/${c.code.toLowerCase()}?type=${c.popularFor ?? c.types[0]}`}
                  className="card flex items-center gap-3 p-4 transition hover:-translate-y-0.5 hover:shadow-float"
                >
                  <span className="text-3xl">{c.flag}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-bold">{c.name}</span>
                    <span className="block truncate text-xs text-ink-500">{c.types.map((t) => VISA_TYPE_LABEL[t]).join(" · ")}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
