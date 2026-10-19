"use client";

import { Mail, Phone, UserRound } from "lucide-react";
import type { Errors } from "@/lib/validation";
import { cn, todayISO } from "@/lib/utils";
import type { ContactInfo, Traveller } from "@/types";

const NATIONALITIES = ["Bangladeshi", "Indian", "Pakistani", "Nepali", "Sri Lankan", "Malaysian", "British", "American", "Canadian", "Other"];
const TYPE_LABEL = { adult: "Adult", child: "Child", infant: "Infant" };
const TITLES: Record<Traveller["type"], Traveller["title"][]> = {
  adult: ["Mr", "Ms", "Mrs"],
  child: ["Mstr", "Miss"],
  infant: ["Mstr", "Miss"],
};

interface Props {
  travellers: Traveller[];
  contact: ContactInfo;
  errors: Errors;
  requirePassport: boolean;
  guestMode: boolean;
  onTraveller: (i: number, patch: Partial<Traveller>) => void;
  onContact: (patch: Partial<ContactInfo>) => void;
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}
    </label>
  );
}

export function TravellerForm({ travellers, contact, errors, requirePassport, guestMode, onTraveller, onContact }: Props) {
  const today = todayISO();

  return (
    <div className="space-y-4">
      {travellers.map((t, i) => {
        const err = (f: string) => errors[`t${i}.${f}`];
        return (
          <section key={i} className="card p-5" aria-labelledby={`trav-${i}`}>
            <h3 id={`trav-${i}`} className="mb-4 flex items-center gap-2 font-extrabold">
              <span className="grid size-7 place-items-center rounded-full bg-brand-50 text-brand-700">
                <UserRound className="size-4" />
              </span>
              {guestMode ? `Lead guest${travellers.length > 1 ? ` · Room ${i + 1}` : ""}` : `Traveller ${i + 1}`}
              {!guestMode && <span className="chip bg-slate-100 text-ink-500">{TYPE_LABEL[t.type]}</span>}
            </h3>
            <div className="grid gap-4 sm:grid-cols-[110px_1fr_1fr]">
              <Field label="Title">
                <select className="input" value={t.title} onChange={(e) => onTraveller(i, { title: e.target.value as Traveller["title"] })}>
                  {TITLES[t.type].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="First / given name" error={err("firstName")}>
                <input className={cn("input", err("firstName") && "input-error")} value={t.firstName} onChange={(e) => onTraveller(i, { firstName: e.target.value })} autoComplete={i === 0 ? "given-name" : "off"} />
              </Field>
              <Field label="Last / surname" error={err("lastName")}>
                <input className={cn("input", err("lastName") && "input-error")} value={t.lastName} onChange={(e) => onTraveller(i, { lastName: e.target.value })} autoComplete={i === 0 ? "family-name" : "off"} />
              </Field>
              {!guestMode && (
                <>
                  <Field label="Date of birth" error={err("dob")} className="sm:col-span-1">
                    <input type="date" max={today} className={cn("input", err("dob") && "input-error")} value={t.dob} onChange={(e) => onTraveller(i, { dob: e.target.value })} />
                  </Field>
                  {requirePassport && (
                    <>
                      <Field label="Nationality" error={err("nationality")}>
                        <select className={cn("input", err("nationality") && "input-error")} value={t.nationality} onChange={(e) => onTraveller(i, { nationality: e.target.value })}>
                          <option value="">Select</option>
                          {NATIONALITIES.map((n) => (
                            <option key={n}>{n}</option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Passport number" error={err("passportNumber")}>
                        <input
                          className={cn("input uppercase", err("passportNumber") && "input-error")}
                          value={t.passportNumber}
                          maxLength={9}
                          onChange={(e) => onTraveller(i, { passportNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })}
                        />
                      </Field>
                      <Field label="Passport expiry" error={err("passportExpiry")} className="sm:col-start-2">
                        <input type="date" min={today} className={cn("input", err("passportExpiry") && "input-error")} value={t.passportExpiry} onChange={(e) => onTraveller(i, { passportExpiry: e.target.value })} />
                      </Field>
                    </>
                  )}
                </>
              )}
            </div>
          </section>
        );
      })}

      <section className="card p-5">
        <h3 className="mb-1 font-extrabold">Contact details</h3>
        <p className="mb-4 text-xs text-ink-500">Your e-ticket / voucher and updates will be sent here.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email" error={errors["contact.email"]}>
            <span className="relative block">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
              <input type="email" autoComplete="email" className={cn("input pl-10", errors["contact.email"] && "input-error")} value={contact.email} onChange={(e) => onContact({ email: e.target.value })} />
            </span>
          </Field>
          <Field label="Mobile number" error={errors["contact.phone"]}>
            <span className="relative block">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" className={cn("input pl-10", errors["contact.phone"] && "input-error")} value={contact.phone} onChange={(e) => onContact({ phone: e.target.value })} />
            </span>
          </Field>
        </div>
      </section>
    </div>
  );
}
