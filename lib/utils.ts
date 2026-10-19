import type { Currency, FareBreakdown, PassengerCount, TimeWindow } from "@/types";

export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export const USD_RATE = 122;

export function formatMoney(amountBdt: number, currency: Currency): string {
  if (currency === "USD") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
      amountBdt / USD_RATE,
    );
  }
  return `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Math.round(amountBdt))}`;
}

export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seededRandom(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatDuration(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions): string {
  return new Date(iso).toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  return formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const ms = new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime();
  return Math.max(1, Math.round(ms / 86_400_000));
}

export function totalPassengers(p: PassengerCount): number {
  return p.adults + p.children + p.infants;
}

export function timeWindowOf(iso: string): TimeWindow {
  const h = new Date(iso).getHours();
  if (h < 6) return "early";
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}

export const TIME_WINDOWS: { key: TimeWindow; label: string; range: string }[] = [
  { key: "early", label: "Early Morning", range: "00–06" },
  { key: "morning", label: "Morning", range: "06–12" },
  { key: "afternoon", label: "Afternoon", range: "12–18" },
  { key: "evening", label: "Evening", range: "18–24" },
];

export const SERVICE_FEE_RATE = 0.015;

export function computeFare(base: number, taxes: number, discount = 0): FareBreakdown {
  const serviceFee = Math.round((base + taxes) * SERVICE_FEE_RATE);
  const safeDiscount = Math.min(discount, base);
  return { base, taxes, serviceFee, discount: safeDiscount, total: base + taxes + serviceFee - safeDiscount };
}

export function generatePnr(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const buf = new Uint32Array(6);
  crypto.getRandomValues(buf);
  for (const n of buf) out += chars[n % chars.length];
  return out;
}
