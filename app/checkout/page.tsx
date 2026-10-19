"use client";

import { ArrowLeft, Check, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookingSummary } from "@/components/checkout/BookingSummary";
import { Confirmation } from "@/components/checkout/Confirmation";
import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { TravellerForm } from "@/components/checkout/TravellerForm";
import { useApp } from "@/context/AppProvider";
import { DOMESTIC_CODES } from "@/lib/data/airports";
import type { Promo } from "@/lib/data/promos";
import { cn, computeFare, generatePnr } from "@/lib/utils";
import { validateContact, validateTraveller, type Errors } from "@/lib/validation";
import type { Booking, CartItem, ContactInfo, Traveller } from "@/types";

const STEPS = ["Traveller details", "Payment", "Confirmation"];
const HOLD_SECONDS = 15 * 60;

function blankTraveller(type: Traveller["type"]): Traveller {
  return { title: type === "adult" ? "Mr" : "Mstr", firstName: "", lastName: "", dob: "", nationality: "Bangladeshi", passportNumber: "", passportExpiry: "", type };
}

function initialTravellers(item: CartItem): Traveller[] {
  if (item.kind === "hotel") return item.query.rooms.map(() => blankTraveller("adult"));
  const p = item.query.passengers;
  return [
    ...Array.from({ length: p.adults }, () => blankTraveller("adult")),
    ...Array.from({ length: p.children }, () => blankTraveller("child")),
    ...Array.from({ length: p.infants }, () => blankTraveller("infant")),
  ];
}

export default function CheckoutPage() {
  const { cart, hydrated } = useApp();
  const [booking, setBooking] = useState<Booking | null>(null);

  if (booking) return <Confirmation booking={booking} />;

  if (!hydrated) {
    return (
      <div className="container-page py-10">
        <div className="skeleton h-96 rounded-2xl" />
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-2xl font-bold">Nothing to check out</h1>
        <p className="mt-1 text-ink-500">Your selection may have expired. Start a new search to continue.</p>
        <Link href="/" className="btn btn-primary mt-6">
          Search flights & hotels
        </Link>
      </div>
    );
  }

  return <CheckoutFlow key={cart.offer.id} cart={cart} onBooked={setBooking} />;
}

function CheckoutFlow({ cart, onBooked }: { cart: CartItem; onBooked: (b: Booking) => void }) {
  const { user, confirmBooking } = useApp();
  const [step, setStep] = useState(0);
  const [travellers, setTravellers] = useState<Traveller[]>(() => initialTravellers(cart));
  const [contact, setContact] = useState<ContactInfo>({ email: user?.email ?? "", phone: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [promo, setPromo] = useState<Promo | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(HOLD_SECONDS);

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const fare = useMemo(() => {
    const base = cart.kind === "flight" ? cart.offer.price.base : cart.offer.pricePerNight.base * cart.nights;
    const taxes = cart.kind === "flight" ? cart.offer.price.taxes : cart.offer.pricePerNight.taxes * cart.nights;
    const discount = promo ? Math.min(Math.round((base * promo.discountPct) / 100), promo.maxDiscount) : 0;
    return computeFare(base, taxes, discount);
  }, [cart, promo]);

  const isFlight = cart.kind === "flight";
  const travelDate = isFlight ? cart.query.legs[0].date : cart.query.checkIn;
  const international = isFlight && cart.query.legs.some((l) => !DOMESTIC_CODES.has(l.origin) || !DOMESTIC_CODES.has(l.destination));
  const expired = secondsLeft === 0;

  const continueToPayment = () => {
    const e: Errors = isFlight
      ? Object.assign({}, ...travellers.map((t, i) => validateTraveller(t, i, travelDate, international)), validateContact(contact))
      : Object.assign(
          {},
          ...travellers.map((t, i) => {
            const all = validateTraveller({ ...t, dob: "1990-01-01" }, i, travelDate, false);
            return Object.fromEntries(Object.entries(all).filter(([k]) => !k.endsWith(".dob")));
          }),
          validateContact(contact),
        );
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => document.querySelector(".input-error")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onPaid = (paymentMethod: string) => {
    const b: Booking = {
      pnr: generatePnr(),
      createdAt: new Date().toISOString(),
      item: cart,
      travellers: travellers.map((t) => ({ ...t, firstName: t.firstName.trim(), lastName: t.lastName.trim() })),
      contact,
      amount: fare.total,
      paymentMethod,
    };
    onBooked(b);
    confirmBooking(b);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="container-page py-6 sm:py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <button onClick={() => (step === 0 ? history.back() : setStep(0))} className="btn btn-ghost -ml-3">
          <ArrowLeft className="size-4" /> {step === 0 ? "Back to results" : "Edit travellers"}
        </button>
        <ol className="flex items-center gap-2 text-xs font-bold sm:text-sm">
          {STEPS.map((s, i) => (
            <li key={s} className="flex items-center gap-2">
              <span className={cn("grid size-7 place-items-center rounded-full", i < step ? "bg-brand-600 text-white" : i === step ? "bg-ink-900 text-white" : "bg-slate-200 text-ink-500")}>
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("hidden sm:inline", i === step ? "text-ink-900" : "text-ink-500")}>{s}</span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-slate-300 sm:w-10" />}
            </li>
          ))}
        </ol>
      </div>

      <div className={cn("mb-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold", expired ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800")}>
        <Clock className="size-4" />
        {expired ? (
          <>
            Your fare hold has expired. Prices may have changed —{" "}
            <Link href="/" className="underline">
              search again
            </Link>
          </>
        ) : (
          <>
            Fare held for{" "}
            <span className="tabular-nums">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
            </span>{" "}
            — complete booking before it expires.
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          {step === 0 && (
            <>
              <TravellerForm
                travellers={travellers}
                contact={contact}
                errors={errors}
                requirePassport={international}
                guestMode={!isFlight}
                onTraveller={(i, patch) => setTravellers((ts) => ts.map((t, idx) => (idx === i ? { ...t, ...patch } : t)))}
                onContact={(patch) => setContact((c) => ({ ...c, ...patch }))}
              />
              {Object.keys(errors).length > 0 && <p className="mt-4 text-sm font-semibold text-red-600">Please fix the highlighted fields.</p>}
              <button onClick={continueToPayment} disabled={expired} className="btn btn-primary mt-5 w-full py-3.5 text-base sm:w-auto sm:px-12">
                Continue to payment
              </button>
            </>
          )}
          {step === 1 && (expired ? <p className="card p-6 text-center font-semibold text-red-700">Fare hold expired. Please search again.</p> : <PaymentPanel amount={fare.total} onPaid={onPaid} />)}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <BookingSummary item={cart} fare={fare} promo={promo} onPromo={setPromo} locked={step > 0} />
        </aside>
      </div>
    </div>
  );
}
