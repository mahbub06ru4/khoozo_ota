"use client";

import { AlertTriangle, BadgeDollarSign, CalendarClock, Check, FileText, GraduationCap, Info, Repeat, Timer } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useApp } from "@/context/AppProvider";
import { VISA_TYPE_LABEL, type VisaCountry, type VisaType } from "@/lib/data/visas";
import { cn, formatMoney } from "@/lib/utils";
import type { VisaProduct } from "@/types";
import { VisaApplyForm } from "./VisaApplyForm";

type Loaded = { key: string; product: VisaProduct | null; error: string | null };

export function VisaDetails({ country }: { country: VisaCountry }) {
  const params = useSearchParams();
  const router = useRouter();
  const { currency } = useApp();
  const requested = params.get("type") as VisaType | null;
  const type: VisaType = requested && country.types.includes(requested) ? requested : (country.popularFor ?? country.types[0]);
  const nationality = params.get("nationality") ?? "Bangladeshi";
  const key = `${country.code}|${type}|${nationality}`;
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [applying, setApplying] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch(`/api/visa/product?country=${country.code}&type=${type}&nationality=${encodeURIComponent(nationality)}`, { signal: ctrl.signal })
      .then(async (r) => {
        const j = await r.json();
        setLoaded({ key, product: r.ok ? j.product : null, error: r.ok ? null : (j.error ?? "Unable to load") });
      })
      .catch((e) => {
        if (!ctrl.signal.aborted) setLoaded({ key, product: null, error: e instanceof Error ? e.message : "Unable to load" });
      });
    return () => ctrl.abort();
  }, [country.code, type, nationality, key]);

  const ready = loaded?.key === key ? loaded : null;
  const p = ready?.product;
  const showForm = applying === key && p;

  return (
    <div className="container-page py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <span className="text-5xl">{country.flag}</span>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{country.name} visa</h1>
          <p className="text-sm text-ink-500">For {nationality} passport holders · applying from Bangladesh</p>
        </div>
      </div>

      <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]" role="tablist">
        {country.types.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={t === type}
            onClick={() => router.replace(`/visa/${country.code.toLowerCase()}?type=${t}&nationality=${encodeURIComponent(nationality)}`, { scroll: false })}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-bold transition",
              t === type ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white hover:border-brand-400",
            )}
          >
            {t === "student" && <GraduationCap className="size-4" />}
            {VISA_TYPE_LABEL[t]}
          </button>
        ))}
      </div>

      {!ready && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            <div className="skeleton h-28 rounded-2xl" />
            <div className="skeleton h-64 rounded-2xl" />
          </div>
          <div className="skeleton h-72 rounded-2xl" />
        </div>
      )}

      {ready && !p && (
        <div className="card flex flex-col items-center p-10 text-center">
          <AlertTriangle className="size-10 text-amber-500" />
          <p className="mt-3 font-bold">{ready.error}</p>
        </div>
      )}

      {p && (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-4">
            {showForm ? (
              <VisaApplyForm key={key} product={p} />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { icon: Timer, label: "Processing", value: `${p.processingDays.min}–${p.processingDays.max} days` },
                    { icon: CalendarClock, label: "Validity", value: p.validity },
                    { icon: Info, label: "Max stay", value: p.maxStay },
                    { icon: Repeat, label: "Entry", value: p.entry },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="card p-4">
                      <Icon className="size-5 text-brand-600" />
                      <p className="mt-2 text-xs font-semibold uppercase text-ink-500">{label}</p>
                      <p className="font-bold leading-snug">{value}</p>
                    </div>
                  ))}
                </div>

                {p.student && (
                  <section className="card overflow-hidden">
                    <h2 className="flex items-center gap-2 bg-brand-50 px-5 py-3 font-extrabold text-brand-800">
                      <GraduationCap className="size-5" /> {p.permitName} — key requirements
                    </h2>
                    <dl className="divide-y divide-slate-100 text-sm">
                      {[
                        ["Acceptance document", p.student.acceptanceDoc],
                        ["Proof of funds", p.student.proofOfFunds],
                        ["Language", p.student.language],
                        ["Work rights", p.student.workRights],
                        ["Post-study", p.student.postStudy],
                      ].map(([k, v]) => (
                        <div key={k} className="grid gap-1 px-5 py-3 sm:grid-cols-[180px_1fr]">
                          <dt className="font-semibold text-ink-500">{k}</dt>
                          <dd className="font-medium">{v}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                )}

                <section className="card p-5">
                  <h2 className="mb-3 flex items-center gap-2 font-extrabold">
                    <FileText className="size-5 text-brand-600" /> Document checklist
                  </h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {p.documents.map((d) => (
                      <li key={d} className="flex gap-2 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-brand-600" /> {d}
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  <ul className="list-disc space-y-1 pl-4">
                    {p.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </section>
              </>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card p-5">
              <p className="chip mb-2 bg-brand-50 text-brand-700">{p.mode}</p>
              <h2 className="text-lg font-extrabold">{p.permitName}</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-700">Government / embassy fee</dt>
                  <dd className="font-semibold">{formatMoney(p.governmentFee, currency)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-700">Khoozo service fee</dt>
                  <dd className="font-semibold">{formatMoney(p.serviceFee, currency)}</dd>
                </div>
                <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                  <dt className="font-bold">Total</dt>
                  <dd className="text-2xl font-extrabold">{formatMoney(p.governmentFee + p.serviceFee, currency)}</dd>
                </div>
              </dl>
              {showForm ? (
                <button onClick={() => setApplying(null)} className="btn btn-outline mt-4 w-full">
                  Back to requirements
                </button>
              ) : (
                <button onClick={() => setApplying(key)} className="btn btn-accent mt-4 w-full py-3">
                  <BadgeDollarSign className="size-4" /> Apply now
                </button>
              )}
              <p className="mt-3 text-center text-xs text-ink-500">Pay after our experts verify your documents.</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
