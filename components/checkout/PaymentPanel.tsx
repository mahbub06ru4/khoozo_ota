"use client";

import { CreditCard, Loader2, Lock, ShieldCheck, Smartphone } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useApp } from "@/context/AppProvider";
import { cn, formatMoney } from "@/lib/utils";
import { cardBrand, expiryValid, luhnValid, type Errors } from "@/lib/validation";

type Method = "card" | "mfs";
const WALLETS = [
  { key: "bKash", color: "#e2136e" },
  { key: "Nagad", color: "#f6921e" },
  { key: "Rocket", color: "#8c3494" },
  { key: "upay", color: "#0057a8" },
] as const;

export function PaymentPanel({ amount, onPaid }: { amount: number; onPaid: (methodLabel: string) => void }) {
  const { currency } = useApp();
  const [method, setMethod] = useState<Method>("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [wallet, setWallet] = useState<(typeof WALLETS)[number]["key"]>("bKash");
  const [walletNo, setWalletNo] = useState("");
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [processing, setProcessing] = useState(false);
  const brand = cardBrand(card.number);

  const validate = (): Errors => {
    const e: Errors = {};
    if (method === "card") {
      if (!luhnValid(card.number)) e.number = "Enter a valid card number";
      if (card.name.trim().length < 2) e.name = "Name on card is required";
      if (!expiryValid(card.expiry)) e.expiry = "Invalid or expired";
      if (!/^\d{3,4}$/.test(card.cvv)) e.cvv = "3–4 digits";
    } else if (!/^01[3-9]\d{8}$/.test(walletNo)) {
      e.walletNo = `Enter your ${wallet} account number`;
    }
    if (!agree) e.agree = "Please accept the terms to continue";
    return e;
  };

  const submit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1800));
    const digits = card.number.replace(/\D/g, "");
    onPaid(method === "card" ? `${(brand ?? "card").toUpperCase()} •••• ${digits.slice(-4)}` : `${wallet} •••• ${walletNo.slice(-3)}`);
  };

  const formatCard = (v: string) =>
    v
      .replace(/\D/g, "")
      .slice(0, 19)
      .replace(/(\d{4})(?=\d)/g, "$1 ");
  const formatExpiry = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 4);
    return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  };

  return (
    <form onSubmit={submit} noValidate className="card overflow-hidden">
      <div className="grid grid-cols-2 border-b border-slate-200" role="tablist">
        {[
          { key: "card" as const, label: "Credit / Debit card", icon: CreditCard },
          { key: "mfs" as const, label: "Mobile banking", icon: Smartphone },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={method === key}
            onClick={() => {
              setMethod(key);
              setErrors({});
            }}
            className={cn(
              "flex items-center justify-center gap-2 border-b-2 py-4 text-sm font-bold transition",
              method === key ? "border-brand-600 text-brand-700" : "border-transparent text-ink-500 hover:text-ink-900",
            )}
          >
            <Icon className="size-4" /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-5">
        {method === "card" ? (
          <>
            <label className="block">
              <span className="label">Card number</span>
              <span className="relative block">
                <input
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="4242 4242 4242 4242"
                  className={cn("input pr-24 tabular-nums tracking-wider", errors.number && "input-error")}
                  value={card.number}
                  onChange={(e) => setCard({ ...card, number: formatCard(e.target.value) })}
                />
                {brand && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-slate-100 px-2 py-0.5 text-[11px] font-black uppercase text-ink-700">{brand}</span>}
              </span>
              {errors.number && <span className="mt-1 block text-xs font-medium text-red-600">{errors.number}</span>}
            </label>
            <label className="block">
              <span className="label">Name on card</span>
              <input autoComplete="cc-name" className={cn("input uppercase", errors.name && "input-error")} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} />
              {errors.name && <span className="mt-1 block text-xs font-medium text-red-600">{errors.name}</span>}
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block">
                <span className="label">Expiry (MM/YY)</span>
                <input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" className={cn("input", errors.expiry && "input-error")} value={card.expiry} onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })} />
                {errors.expiry && <span className="mt-1 block text-xs font-medium text-red-600">{errors.expiry}</span>}
              </label>
              <label className="block">
                <span className="label">CVV</span>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  className={cn("input", errors.cvv && "input-error")}
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                />
                {errors.cvv && <span className="mt-1 block text-xs font-medium text-red-600">{errors.cvv}</span>}
              </label>
            </div>
            <p className="text-xs text-ink-500">Sandbox: use test card 4242 4242 4242 4242, any future expiry and any CVV. No real charge is made.</p>
          </>
        ) : (
          <>
            <div>
              <span className="label">Choose wallet</span>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {WALLETS.map((w) => (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => setWallet(w.key)}
                    aria-pressed={wallet === w.key}
                    className={cn("rounded-xl border-2 py-3 text-sm font-extrabold transition", wallet === w.key ? "bg-slate-50" : "border-slate-200 hover:border-slate-300")}
                    style={{ color: w.color, borderColor: wallet === w.key ? w.color : undefined }}
                  >
                    {w.key}
                  </button>
                ))}
              </div>
            </div>
            <label className="block">
              <span className="label">{wallet} account number</span>
              <input
                inputMode="numeric"
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={cn("input", errors.walletNo && "input-error")}
                value={walletNo}
                onChange={(e) => setWalletNo(e.target.value.replace(/\D/g, ""))}
              />
              {errors.walletNo && <span className="mt-1 block text-xs font-medium text-red-600">{errors.walletNo}</span>}
            </label>
            <p className="text-xs text-ink-500">Sandbox: you&apos;d normally approve this in the {wallet} app with OTP & PIN. Here it&apos;s simulated.</p>
          </>
        )}

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 size-4 accent-brand-600" />
          <span>
            I agree to the fare rules, Terms & Conditions and Privacy Policy.
            {errors.agree && <span className="block text-xs font-medium text-red-600">{errors.agree}</span>}
          </span>
        </label>

        <button type="submit" disabled={processing} className="btn btn-accent w-full py-3.5 text-base">
          {processing ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-4" />}
          {processing ? "Processing payment…" : `Pay ${formatMoney(amount, currency)}`}
        </button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-ink-500">
          <ShieldCheck className="size-4 text-brand-600" /> 256-bit SSL encrypted · PCI-DSS compliant gateway
        </p>
      </div>
    </form>
  );
}
