"use client";

import { BedDouble, ChevronDown, Globe, LogOut, Palmtree, Plane, Stamp, Tag, Ticket, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { useApp } from "@/context/AppProvider";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import type { Currency } from "@/types";

export const NAV_ITEMS = [
  { key: "flights", label: "Flights", href: "/", icon: Plane },
  { key: "hotels", label: "Hotels", href: "/?tab=hotels", icon: BedDouble },
  { key: "holidays", label: "Holidays", href: "/holidays", icon: Palmtree },
  { key: "visa", label: "Visa", href: "/visa", icon: Stamp },
  { key: "promotions", label: "Promotions", href: "/promotions", icon: Tag },
] as const;

export function useActiveNav(): string {
  const pathname = usePathname();
  const params = useSearchParams();
  if (pathname.startsWith("/search/hotels") || (pathname === "/" && params.get("tab") === "hotels")) return "hotels";
  if (pathname.startsWith("/holidays") || (pathname === "/" && params.get("tab") === "holidays")) return "holidays";
  if (pathname.startsWith("/visa") || (pathname === "/" && params.get("tab") === "visa")) return "visa";
  if (pathname.startsWith("/promotions")) return "promotions";
  if (pathname === "/" || pathname.startsWith("/search/flights")) return "flights";
  return "";
}

const CURRENCIES: { code: Currency; label: string }[] = [
  { code: "BDT", label: "৳ BDT – Bangladeshi Taka" },
  { code: "USD", label: "$ USD – US Dollar" },
];

export function Navbar() {
  const { currency, setCurrency, user, openAuth, logout } = useApp();
  const active = useActiveNav();
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const prefsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  useClickOutside(prefsRef, useCallback(() => setPrefsOpen(false), []), prefsOpen);
  useClickOutside(userRef, useCallback(() => setUserOpen(false), []), userOpen);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition",
                active === key ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-slate-100 hover:text-ink-900",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div ref={prefsRef} className="relative">
            <button
              onClick={() => setPrefsOpen((o) => !o)}
              className="btn btn-ghost px-3"
              aria-haspopup="menu"
              aria-expanded={prefsOpen}
            >
              <Globe className="size-4" />
              <span className="hidden sm:inline">EN</span>
              <span className="text-ink-500">·</span>
              <span>{currency}</span>
              <ChevronDown className={cn("size-3.5 transition", prefsOpen && "rotate-180")} />
            </button>
            {prefsOpen && (
              <div className="card absolute right-0 top-12 w-72 p-4 animate-fade-up" role="menu">
                <p className="label">Language</p>
                <div className="mb-4 flex gap-2">
                  <span className="chip bg-brand-50 text-brand-700 ring-1 ring-brand-200">English</span>
                  <span className="chip bg-slate-100 text-ink-500" title="Coming soon">বাংলা (soon)</span>
                </div>
                <p className="label">Currency</p>
                <div className="space-y-1">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c.code}
                      role="menuitemradio"
                      aria-checked={currency === c.code}
                      onClick={() => {
                        setCurrency(c.code);
                        setPrefsOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition",
                        currency === c.code ? "bg-brand-50 font-semibold text-brand-700" : "hover:bg-slate-100",
                      )}
                    >
                      {c.label}
                      {currency === c.code && <span className="size-2 rounded-full bg-brand-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <div ref={userRef} className="relative">
              <button onClick={() => setUserOpen((o) => !o)} className="btn btn-outline px-2.5 sm:px-3" aria-expanded={userOpen}>
                <span className="grid size-7 place-items-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="hidden max-w-28 truncate sm:inline">{user.name}</span>
              </button>
              {userOpen && (
                <div className="card absolute right-0 top-12 w-56 p-2 animate-fade-up">
                  <p className="truncate px-3 py-2 text-xs text-ink-500">{user.email}</p>
                  <Link href="/bookings" onClick={() => setUserOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-100">
                    <Ticket className="size-4" /> My bookings
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="size-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={openAuth} className="btn btn-primary">
              <UserRound className="size-4" />
              <span className="hidden sm:inline">Login / Sign up</span>
              <span className="sm:hidden">Login</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileTabBar() {
  const active = useActiveNav();
  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {NAV_ITEMS.map(({ key, label, href, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          className={cn(
            "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition",
            active === key ? "text-brand-600" : "text-ink-500",
          )}
        >
          <Icon className={cn("size-5 transition", active === key && "scale-110")} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
