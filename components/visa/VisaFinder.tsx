"use client";

import { Flag, Globe2, Search, Stamp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { findVisaCountry, VISA_COUNTRIES, VISA_TYPE_LABEL, type VisaType } from "@/lib/data/visas";

const NATIONALITIES = ["Bangladeshi", "Indian", "Pakistani", "Nepali", "Sri Lankan"];

export function VisaFinder({ defaultType = "tourist" }: { defaultType?: VisaType }) {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [type, setType] = useState<VisaType>(defaultType);
  const [nationality, setNationality] = useState("Bangladeshi");
  const [error, setError] = useState<string | null>(null);

  const available = country ? (findVisaCountry(country)?.types ?? []) : (Object.keys(VISA_TYPE_LABEL) as VisaType[]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!country) return setError("Choose a destination country");
    if (!available.includes(type)) return setError(`${VISA_TYPE_LABEL[type]} visa isn't offered for this country`);
    setError(null);
    router.push(`/visa/${country.toLowerCase()}?type=${type}&nationality=${encodeURIComponent(nationality)}`);
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr]">
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <Globe2 className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Destination country</span>
            <select value={country} onChange={(e) => setCountry(e.target.value)} className="w-full bg-transparent py-1 text-lg font-bold outline-none">
              <option value="">Select country</option>
              {VISA_COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <Stamp className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Visa type</span>
            <select value={type} onChange={(e) => setType(e.target.value as VisaType)} className="w-full bg-transparent py-1 text-lg font-bold outline-none">
              {(Object.keys(VISA_TYPE_LABEL) as VisaType[]).map((t) => (
                <option key={t} value={t} disabled={!available.includes(t)}>
                  {VISA_TYPE_LABEL[t]}
                  {!available.includes(t) ? " (n/a)" : ""}
                </option>
              ))}
            </select>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
          <Flag className="mt-0.5 size-5 shrink-0 text-brand-600" />
          <span className="min-w-0 flex-1">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-500">Your nationality</span>
            <select value={nationality} onChange={(e) => setNationality(e.target.value)} className="w-full bg-transparent py-1 text-lg font-bold outline-none">
              {NATIONALITIES.map((n) => (
                <option key={n}>{n}</option>
              ))}
            </select>
          </span>
        </label>
      </div>
      <div className="mt-5 flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
        <p role="alert" className={error ? "text-sm font-medium text-red-600" : "invisible text-sm"}>
          {error ?? "–"}
        </p>
        <button type="submit" className="btn btn-accent w-full px-10 py-3.5 text-base sm:w-auto">
          <Search className="size-5" /> Check requirements
        </button>
      </div>
    </form>
  );
}
