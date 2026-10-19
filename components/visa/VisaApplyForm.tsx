"use client";

import { CheckCircle2, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useApp } from "@/context/AppProvider";
import { findVisaCountry, VISA_TYPE_LABEL } from "@/lib/data/visas";
import { addDays, cn, formatMoney, todayISO } from "@/lib/utils";
import type { VisaApplicant, VisaApplication, VisaProduct } from "@/types";

type Errors = Record<string, string>;

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function VisaApplyForm({ product }: { product: VisaProduct }) {
  const { user, currency, addVisaApplication } = useApp();
  const isStudent = product.type === "student";
  const [a, setA] = useState<VisaApplicant>({
    firstName: "",
    lastName: "",
    dob: "",
    passportNumber: "",
    passportExpiry: "",
    email: user?.email ?? "",
    phone: "",
    travelDate: addDays(todayISO(), 30),
    institution: "",
    course: "",
    intake: "",
  });
  const [docs, setDocs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<VisaApplication | null>(null);
  const set = (patch: Partial<VisaApplicant>) => setA((p) => ({ ...p, ...patch }));
  const total = product.governmentFee + product.serviceFee;
  const required = product.documents.slice(0, 4);

  const validate = (): Errors => {
    const e: Errors = {};
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(a.firstName.trim())) e.firstName = "Letters only, as on passport";
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(a.lastName.trim())) e.lastName = "Letters only, as on passport";
    if (!a.dob || a.dob >= todayISO()) e.dob = "Valid date of birth required";
    if (!/^[A-Z0-9]{6,9}$/.test(a.passportNumber)) e.passportNumber = "6–9 letters/digits";
    if (!a.passportExpiry) e.passportExpiry = "Required";
    else if (a.passportExpiry < addDays(a.travelDate, 180)) e.passportExpiry = "Must be valid 6 months beyond travel";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email)) e.email = "Valid email required";
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(a.phone.replace(/[\s-]/g, ""))) e.phone = "Valid BD mobile (01XXXXXXXXX)";
    if (!a.travelDate || a.travelDate <= todayISO()) e.travelDate = "Choose a future date";
    if (isStudent) {
      if (!a.institution?.trim()) e.institution = "Institution is required";
      if (!a.course?.trim()) e.course = "Course is required";
    }
    for (const d of required) if (!docs[d]) e[`doc:${d}`] = "Please attach this document";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    setServerError(null);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector(".input-error, [data-doc-error]")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/visa/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: product.countryCode,
          type: product.type,
          nationality: product.nationality,
          applicant: { ...a, phone: a.phone.replace(/[\s-]/g, ""), firstName: a.firstName.trim(), lastName: a.lastName.trim() },
          documents: Object.keys(docs),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Submission failed");
      addVisaApplication(json.application);
      setResult(json.application);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const c = findVisaCountry(result.product.countryCode);
    return (
      <div className="card overflow-hidden text-center">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-white">
          <CheckCircle2 className="mx-auto size-14" />
          <h2 className="mt-3 text-2xl font-extrabold">Application submitted</h2>
          <p className="text-white/80">
            {c?.flag} {c?.name} · {VISA_TYPE_LABEL[result.product.type]} visa
          </p>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Application ID</p>
          <p className="text-2xl font-black tracking-widest">{result.id}</p>
          <p className="text-sm text-ink-500">
            Our visa desk will review your documents within 1 working day and contact you at {result.applicant.email}. Estimated decision in {result.product.processingDays.min}–
            {result.product.processingDays.max} working days after lodgement.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/bookings" className="btn btn-outline">
              Track in My bookings
            </Link>
            <Link href="/visa" className="btn btn-primary">
              Apply for another visa
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const err = (k: string) => errors[k];

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <section className="card p-5">
        <h3 className="mb-4 font-extrabold">Applicant details</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Given name" error={err("firstName")}>
            <input className={cn("input", err("firstName") && "input-error")} value={a.firstName} onChange={(e) => set({ firstName: e.target.value })} />
          </Field>
          <Field label="Surname" error={err("lastName")}>
            <input className={cn("input", err("lastName") && "input-error")} value={a.lastName} onChange={(e) => set({ lastName: e.target.value })} />
          </Field>
          <Field label="Date of birth" error={err("dob")}>
            <input type="date" max={todayISO()} className={cn("input", err("dob") && "input-error")} value={a.dob} onChange={(e) => set({ dob: e.target.value })} />
          </Field>
          <Field label="Intended travel date" error={err("travelDate")}>
            <input type="date" min={addDays(todayISO(), 1)} className={cn("input", err("travelDate") && "input-error")} value={a.travelDate} onChange={(e) => set({ travelDate: e.target.value })} />
          </Field>
          <Field label="Passport number" error={err("passportNumber")}>
            <input
              maxLength={9}
              className={cn("input uppercase", err("passportNumber") && "input-error")}
              value={a.passportNumber}
              onChange={(e) => set({ passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
            />
          </Field>
          <Field label="Passport expiry" error={err("passportExpiry")}>
            <input type="date" className={cn("input", err("passportExpiry") && "input-error")} value={a.passportExpiry} onChange={(e) => set({ passportExpiry: e.target.value })} />
          </Field>
          <Field label="Email" error={err("email")}>
            <input type="email" className={cn("input", err("email") && "input-error")} value={a.email} onChange={(e) => set({ email: e.target.value })} />
          </Field>
          <Field label="Mobile" error={err("phone")}>
            <input type="tel" placeholder="01XXXXXXXXX" className={cn("input", err("phone") && "input-error")} value={a.phone} onChange={(e) => set({ phone: e.target.value })} />
          </Field>
        </div>
      </section>

      {isStudent && (
        <section className="card p-5">
          <h3 className="mb-4 font-extrabold">Study details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="University / institution" error={err("institution")} className="sm:col-span-2">
              <input className={cn("input", err("institution") && "input-error")} value={a.institution} onChange={(e) => set({ institution: e.target.value })} placeholder="e.g. University of Toronto" />
            </Field>
            <Field label="Course / program" error={err("course")}>
              <input className={cn("input", err("course") && "input-error")} value={a.course} onChange={(e) => set({ course: e.target.value })} placeholder="e.g. MSc Computer Science" />
            </Field>
            <Field label="Intake">
              <select className="input" value={a.intake} onChange={(e) => set({ intake: e.target.value })}>
                <option value="">Select intake</option>
                {["January 2027", "May 2027", "September 2027", "January 2028"].map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>
      )}

      <section className="card p-5">
        <h3 className="mb-1 font-extrabold">Documents</h3>
        <p className="mb-4 text-xs text-ink-500">PDF/JPG up to 5 MB. Files stay on your device in this demo — only file names are sent.</p>
        <ul className="space-y-2">
          {product.documents.map((d) => {
            const isReq = required.includes(d);
            const e = err(`doc:${d}`);
            return (
              <li key={d} data-doc-error={e ? "" : undefined} className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-3", e ? "border-red-300 bg-red-50/40" : "border-slate-200")}>
                <span className="min-w-0 flex-1 text-sm">
                  {d} {isReq && <span className="text-red-600">*</span>}
                  {docs[d] && <span className="block truncate text-xs text-emerald-700">✓ {docs[d]}</span>}
                  {e && <span className="block text-xs text-red-600">{e}</span>}
                </span>
                <label className="btn btn-outline cursor-pointer px-3 py-1.5 text-xs">
                  <Upload className="size-3.5" /> {docs[d] ? "Replace" : "Attach"}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(ev) => {
                      const f = ev.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) return setErrors((x) => ({ ...x, [`doc:${d}`]: "File exceeds 5 MB" }));
                      setDocs((x) => ({ ...x, [d]: f.name }));
                      setErrors((x) => {
                        const n = { ...x };
                        delete n[`doc:${d}`];
                        return n;
                      });
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ul>
      </section>

      {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{serverError}</p>}

      <div className="card flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
        <div>
          <p className="text-xs text-ink-500">Government fee + service fee</p>
          <p className="text-2xl font-extrabold">{formatMoney(total, currency)}</p>
        </div>
        <button type="submit" disabled={submitting} className="btn btn-accent w-full px-8 py-3.5 sm:w-auto">
          {submitting && <Loader2 className="size-4 animate-spin" />} Submit application
        </button>
      </div>
    </form>
  );
}
