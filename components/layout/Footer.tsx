import { Headphones, Mail, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About us", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press & media", href: "#" },
      { label: "Blog", href: "#" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Flights", href: "/" },
      { label: "Hotels", href: "/?tab=hotels" },
      { label: "Holidays", href: "/holidays" },
      { label: "Visa services", href: "/visa" },
      { label: "Promotions", href: "/promotions" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help centre", href: "#" },
      { label: "My bookings", href: "/bookings" },
      { label: "Refund policy", href: "#" },
      { label: "Contact us", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms & conditions", href: "#" },
      { label: "Privacy policy", href: "#" },
      { label: "Cookie policy", href: "#" },
      { label: "EMI policy", href: "#" },
    ],
  },
];

const PAYMENTS = [
  { label: "VISA", className: "text-[#1a1f71] italic font-black tracking-tight" },
  { label: "Mastercard", className: "text-[#eb001b] font-bold" },
  { label: "AMEX", className: "text-[#2e77bc] font-black" },
  { label: "bKash", className: "text-[#e2136e] font-bold" },
  { label: "Nagad", className: "text-[#f6921e] font-bold" },
  { label: "Rocket", className: "text-[#8c3494] font-bold" },
  { label: "upay", className: "text-[#0057a8] font-bold" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-ink-900 pb-24 text-slate-300 lg:pb-0">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo light />
          <p className="max-w-xs text-sm leading-relaxed text-slate-400">
            Book flights, hotels and holiday packages at transparent prices with 24/7 travel support.
          </p>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2"><Headphones className="size-4 text-brand-400" /> 16XXX (24/7 hotline)</li>
            <li className="flex items-center gap-2"><Mail className="size-4 text-brand-400" /> support@khoozo.example</li>
            <li className="flex items-center gap-2"><MapPin className="size-4 text-brand-400" /> Gulshan-2, Dhaka 1212</li>
          </ul>
          <div className="flex gap-2 pt-1">
            {[
              { short: "f", label: "Facebook" },
              { short: "ig", label: "Instagram" },
              { short: "in", label: "LinkedIn" },
              { short: "yt", label: "YouTube" },
            ].map((s) => (
              <a key={s.label} href="#" aria-label={s.label} className="grid size-9 place-items-center rounded-full bg-white/5 text-xs font-bold transition hover:bg-brand-600 hover:text-white">
                {s.short}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">{col.title}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-slate-400 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">We accept</p>
            <div className="flex flex-wrap gap-2">
              {PAYMENTS.map((p) => (
                <span key={p.label} className={`grid h-9 min-w-16 place-items-center rounded-md bg-white px-3 text-sm ${p.className}`}>
                  {p.label}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Accreditations</p>
            <div className="flex flex-wrap gap-2">
              {["IATA Accredited Agent", "ATAB Member", "TOAB Member"].map((a) => (
                <span key={a} className="flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-semibold text-white">
                  <ShieldCheck className="size-4 text-brand-400" /> {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="container-page py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} Khoozo Travel Ltd. All rights reserved. Accreditation marks shown are placeholders.
        </p>
      </div>
    </footer>
  );
}
