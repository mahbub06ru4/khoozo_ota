"use client";

import { BedDouble, CalendarDays, CheckCircle2, Loader2, Plane, Sparkles, Star, Users, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Counter } from "@/components/ui/Counter";
import { Photo } from "@/components/ui/Photo";
import { useApp } from "@/context/AppProvider";
import { submitHolidayBooking } from "@/lib/api";
import { ADD_ONS, DESTINATIONS, findDestination, MEAL_LABEL, type HolidayBooking, type HolidayConfig, type HolidayPackage, type HotelTier, type MealPlan } from "@/lib/data/holidays";
import { quoteHoliday } from "@/lib/holiday-pricing";
import { addDays, cn, formatDate, formatMoney, todayISO } from "@/lib/utils";

function initialConfig(pkg?: HolidayPackage, dest?: string): HolidayConfig {
  return {
    destination: pkg?.destination ?? dest ?? DESTINATIONS[0].code,
    packageSlug: pkg?.slug,
    startDate: addDays(todayISO(), 21),
    nights: pkg?.defaultNights ?? 4,
    adults: 2,
    children: 0,
    rooms: 1,
    tier: pkg?.tier ?? 4,
    meal: pkg?.meal ?? "breakfast",
    includeFlights: true,
    addOns: pkg?.includedAddOns ?? ["transfer"],
  };
}

function Section({ icon: Icon, title, children }: { icon: typeof Plane; title: string; children: React.ReactNode }) {
  return (
    <section className="card p-5">
      <h3 className="mb-4 flex items-center gap-2 font-extrabold">
        <Icon className="size-5 text-brand-600" /> {title}
      </h3>
      {children}
    </section>
  );
}

export function HolidayBuilder({ pkg, initialDestination }: { pkg?: HolidayPackage; initialDestination?: string }) {
  const { currency, user, addHolidayBooking } = useApp();
  const [c, setC] = useState<HolidayConfig>(() => initialConfig(pkg, initialDestination));
  const [step, setStep] = useState<"build" | "details">("build");
  const [lead, setLead] = useState({ leadName: user?.name ?? "", email: user?.email ?? "", phone: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [booking, setBooking] = useState<HolidayBooking | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const scrollToTop = () => requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  const set = (patch: Partial<HolidayConfig>) => setC((p) => ({ ...p, ...patch }));
  const dest = findDestination(c.destination)!;
  const quote = useMemo(() => quoteHoliday(c), [c]);
  const minN = pkg?.minNights ?? 1;
  const maxN = pkg?.maxNights ?? 14;
  const people = c.adults + c.children;
  const roomsMax = Math.min(c.adults, 8);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (lead.leadName.trim().length < 2) er.leadName = "Enter the lead traveller's name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email)) er.email = "Valid email required";
    if (!/^(?:\+?88)?01[3-9]\d{8}$/.test(lead.phone.replace(/[\s-]/g, ""))) er.phone = "Valid BD mobile (01XXXXXXXXX)";
    setErrors(er);
    if (Object.keys(er).length || !quote) return;
    setSubmitting(true);
    setServerError(null);
    try {
      const booked = await submitHolidayBooking({
        config: c,
        ...lead,
        phone: lead.phone.replace(/[\s-]/g, ""),
        notes: lead.notes || undefined,
        expectedTotal: quote.total,
      });
      addHolidayBooking(booked);
      setBooking(booked);
      scrollToTop();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (booking) {
    return (
      <div ref={rootRef} className="card mx-auto max-w-xl scroll-mt-24 overflow-hidden text-center">
        <div className="bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-white">
          <CheckCircle2 className="mx-auto size-14" />
          <h2 className="mt-3 text-2xl font-extrabold">Holiday request confirmed</h2>
          <p className="text-white/80">
            {dest.flag} {dest.name} · {c.nights} nights from {formatDate(c.startDate)}
          </p>
        </div>
        <div className="space-y-4 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Booking reference</p>
          <p className="text-2xl font-black tracking-widest">{booking.ref}</p>
          <p className="text-sm text-ink-500">
            A holiday specialist will call {booking.phone} within 2 hours to confirm availability and collect payment of {formatMoney(booking.quote.total, currency)}.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/bookings" className="btn btn-outline">
              My bookings
            </Link>
            <Link href="/holidays" className="btn btn-primary">
              More holidays
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={rootRef} className="grid scroll-mt-24 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-4">
        {step === "build" ? (
          <>
            {!pkg && (
              <Section icon={Sparkles} title="Where to?">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DESTINATIONS.map((d) => (
                    <button
                      key={d.code}
                      type="button"
                      onClick={() => set({ destination: d.code, includeFlights: d.flightPP > 0 && c.includeFlights })}
                      aria-pressed={c.destination === d.code}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition",
                        c.destination === d.code ? "border-brand-500 bg-brand-50 ring-2 ring-brand-500/20" : "border-slate-200 hover:border-brand-300",
                      )}
                    >
                      <span className="text-2xl">{d.flag}</span>
                      <span className="min-w-0">
                        <span className="block truncate font-bold">{d.name}</span>
                        <span className="text-xs text-ink-500">{d.country}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </Section>
            )}

            <Section icon={CalendarDays} title="Dates & duration">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="label">Start date</span>
                  <input type="date" min={addDays(todayISO(), 3)} className="input" value={c.startDate} onChange={(e) => e.target.value && set({ startDate: e.target.value })} />
                </label>
                <div>
                  <span className="label">
                    {c.nights} night{c.nights > 1 ? "s" : ""} · back {formatDate(addDays(c.startDate, c.nights), { day: "numeric", month: "short" })}
                  </span>
                  <input type="range" min={minN} max={maxN} value={c.nights} onChange={(e) => set({ nights: Number(e.target.value) })} className="mt-3 w-full accent-brand-600" aria-label="Nights" />
                </div>
              </div>
            </Section>

            <Section icon={Users} title="Travellers & rooms">
              <div className="grid gap-x-8 sm:grid-cols-3">
                <Counter label="Adults" value={c.adults} min={1} max={12} onChange={(adults) => set({ adults, rooms: Math.min(c.rooms, adults) })} />
                <Counter label="Children" hint="2–11 yrs" value={c.children} min={0} max={8} onChange={(children) => set({ children, rooms: Math.max(c.rooms, Math.ceil((c.adults + children) / 4)) })} />
                <Counter label="Rooms" value={c.rooms} min={Math.ceil(people / 4)} max={roomsMax} onChange={(rooms) => set({ rooms })} />
              </div>
            </Section>

            <Section icon={BedDouble} title="Hotel & meals">
              <span className="label">Hotel category</span>
              <div className="mb-4 grid grid-cols-3 gap-2">
                {([3, 4, 5] as HotelTier[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set({ tier: t })}
                    aria-pressed={c.tier === t}
                    className={cn("rounded-xl border p-3 text-center transition", c.tier === t ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300")}
                  >
                    <span className="flex justify-center gap-0.5">
                      {Array.from({ length: t }, (_, i) => (
                        <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </span>
                    <span className="mt-1 block text-xs text-ink-500">{formatMoney(dest.hotelNight[t], currency)}/night</span>
                  </button>
                ))}
              </div>
              <span className="label flex items-center gap-1">
                <UtensilsCrossed className="size-3.5" /> Meal plan
              </span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(MEAL_LABEL) as MealPlan[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set({ meal: m })}
                    aria-pressed={c.meal === m}
                    className={cn("rounded-xl border px-3 py-2 text-sm font-semibold transition", c.meal === m ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 hover:border-brand-300")}
                  >
                    {MEAL_LABEL[m]}
                  </button>
                ))}
              </div>
            </Section>

            <Section icon={Plane} title="Flights & extras">
              <label className={cn("mb-4 flex items-center gap-3 rounded-xl border p-3", dest.flightPP === 0 ? "opacity-50" : "border-slate-200")}>
                <input
                  type="checkbox"
                  disabled={dest.flightPP === 0}
                  checked={c.includeFlights && dest.flightPP > 0}
                  onChange={(e) => set({ includeFlights: e.target.checked })}
                  className="size-4 accent-brand-600"
                />
                <span className="flex-1 text-sm">
                  <span className="font-bold">Return flights from Dhaka</span>
                  <span className="block text-xs text-ink-500">{dest.flightPP > 0 ? `DAC ⇄ ${dest.airport} · economy · ~${formatMoney(dest.flightPP, currency)} per adult` : "Road transfer destination — no flights needed"}</span>
                </span>
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ADD_ONS.filter((a) => a.key !== "visa" || dest.visaRequired).map((a) => {
                  const on = c.addOns.includes(a.key);
                  return (
                    <label key={a.key} className={cn("flex cursor-pointer gap-3 rounded-xl border p-3 transition", on ? "border-brand-500 bg-brand-50/60" : "border-slate-200 hover:border-brand-300")}>
                      <input type="checkbox" checked={on} onChange={() => set({ addOns: on ? c.addOns.filter((k) => k !== a.key) : [...c.addOns, a.key] })} className="mt-0.5 size-4 accent-brand-600" />
                      <span className="text-sm">
                        <span className="font-bold">{a.label}</span>
                        <span className="block text-xs text-ink-500">{a.description}</span>
                        <span className="text-xs font-semibold text-brand-700">
                          {formatMoney(a.price, currency)} / {a.unit === "night" ? "day" : a.unit}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </Section>
          </>
        ) : (
          <form id="holiday-details" onSubmit={submit} noValidate className="card space-y-4 p-5">
            <h3 className="font-extrabold">Lead traveller</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="label">Full name</span>
                <input className={cn("input", errors.leadName && "input-error")} value={lead.leadName} onChange={(e) => setLead({ ...lead, leadName: e.target.value })} />
                {errors.leadName && <span className="mt-1 block text-xs text-red-600">{errors.leadName}</span>}
              </label>
              <label className="block">
                <span className="label">Email</span>
                <input type="email" className={cn("input", errors.email && "input-error")} value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}
              </label>
              <label className="block">
                <span className="label">Mobile</span>
                <input type="tel" placeholder="01XXXXXXXXX" className={cn("input", errors.phone && "input-error")} value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
                {errors.phone && <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>}
              </label>
              <label className="block sm:col-span-2">
                <span className="label">Special requests (optional)</span>
                <textarea rows={3} maxLength={500} className="input" value={lead.notes} onChange={(e) => setLead({ ...lead, notes: e.target.value })} placeholder="Anniversary, dietary needs, connecting rooms…" />
              </label>
            </div>
            {serverError && <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{serverError}</p>}
          </form>
        )}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="card overflow-hidden">
          <div className={cn("relative overflow-hidden bg-gradient-to-br p-4 pt-16 text-white", dest.gradient)}>
            <Photo src={dest.image} alt={dest.name} />
            <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/0" aria-hidden />
            <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{pkg ? "Package" : "Custom trip"}</p>
            <p className="text-lg font-extrabold">
              {dest.flag} {pkg?.name ?? dest.name}
            </p>
            <p className="text-xs text-white/90">
              {c.nights}N/{c.nights + 1}D · {people} traveller{people > 1 ? "s" : ""} · {c.rooms} room{c.rooms > 1 ? "s" : ""}
            </p>
            </div>
          </div>
          {quote && (
            <dl className="space-y-2 p-5 text-sm">
              {quote.flights > 0 && <Row label="Flights" value={formatMoney(quote.flights, currency)} />}
              <Row label={`Hotel ${c.tier}★ × ${c.nights}N`} value={formatMoney(quote.hotel, currency)} />
              {quote.meals > 0 && <Row label={MEAL_LABEL[c.meal]} value={formatMoney(quote.meals, currency)} />}
              {quote.addOns.map((a) => (
                <Row key={a.key} label={a.label} value={formatMoney(a.amount, currency)} />
              ))}
              {quote.packageDiscount > 0 && <Row label="Package saving" value={`– ${formatMoney(quote.packageDiscount, currency)}`} className="text-emerald-700" />}
              <Row label="VAT & taxes" value={formatMoney(quote.taxes, currency)} />
              <div className="flex items-baseline justify-between border-t border-slate-200 pt-3">
                <dt className="font-bold">Total</dt>
                <dd className="text-2xl font-extrabold">{formatMoney(quote.total, currency)}</dd>
              </div>
              <p className="text-right text-xs text-ink-500">≈ {formatMoney(quote.perPerson, currency)} per person</p>
              {step === "build" ? (
                <button type="button" onClick={() => {
                    setStep("details");
                    scrollToTop();
                  }} className="btn btn-accent mt-3 w-full py-3">
                  Continue
                </button>
              ) : (
                <div className="mt-3 space-y-2">
                  <button type="submit" form="holiday-details" disabled={submitting} className="btn btn-accent w-full py-3">
                    {submitting && <Loader2 className="size-4 animate-spin" />} Confirm request
                  </button>
                  <button type="button" onClick={() => {
                      setStep("build");
                      scrollToTop();
                    }} className="btn btn-ghost w-full">
                    Edit trip
                  </button>
                </div>
              )}
              <p className="pt-1 text-center text-[11px] text-ink-500">No payment now — a specialist confirms availability first.</p>
            </dl>
          )}
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("flex justify-between gap-3", className)}>
      <dt className="text-ink-700">{label}</dt>
      <dd className="shrink-0 font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
