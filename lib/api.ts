import { demoLatency, IS_STATIC } from "@/lib/runtime";
import type { HolidayBooking, HolidayConfig } from "@/lib/data/holidays";
import { generatePnr } from "@/lib/utils";
import type {
  FlightOffer,
  FlightSearchQuery,
  HotelOffer,
  HotelSearchQuery,
  SearchQuery,
  VisaApplicant,
  VisaApplication,
  VisaProduct,
  VisaTypeKey,
} from "@/types";

async function post<T>(url: string, body: unknown, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error ?? `Request failed (${res.status})`);
  return json as T;
}

export async function searchFlights(q: FlightSearchQuery, signal?: AbortSignal): Promise<FlightOffer[]> {
  if (IS_STATIC) {
    const { generateFlights } = await import("@/services/mock");
    return demoLatency(generateFlights(q));
  }
  return post<{ offers: FlightOffer[] }>("/api/flights/search", q, signal).then((r) => r.offers);
}

export async function searchHotels(q: HotelSearchQuery, signal?: AbortSignal): Promise<HotelOffer[]> {
  if (IS_STATIC) {
    const { generateHotels } = await import("@/services/mock");
    return demoLatency(generateHotels(q));
  }
  return post<{ offers: HotelOffer[] }>("/api/hotels/search", q, signal).then((r) => r.offers);
}

export function encodeQuery(q: SearchQuery): string {
  return encodeURIComponent(JSON.stringify(q));
}

export function decodeQuery(raw: string | null): SearchQuery | null {
  if (!raw) return null;
  try {
    const q = JSON.parse(decodeURIComponent(raw)) as SearchQuery;
    return q.kind === "flight" || q.kind === "hotel" ? q : null;
  } catch {
    return null;
  }
}

export function searchUrl(q: SearchQuery): string {
  return `/search/${q.kind === "flight" ? "flights" : "hotels"}?q=${encodeQuery(q)}`;
}

export async function getVisaProduct(country: string, type: VisaTypeKey, nationality: string): Promise<VisaProduct> {
  if (IS_STATIC) {
    const { buildVisaProduct } = await import("@/lib/visa-catalog");
    const p = buildVisaProduct(country, type, nationality);
    if (!p) throw new Error("This visa type is not offered for the selected country");
    return demoLatency(p, 250);
  }
  const r = await fetch(`/api/visa/product?country=${country}&type=${type}&nationality=${encodeURIComponent(nationality)}`);
  const j = await r.json();
  if (!r.ok) throw new Error(j.error ?? "Unable to load");
  return j.product;
}

export interface VisaApplicationInput {
  countryCode: string;
  type: VisaTypeKey;
  nationality: string;
  applicant: VisaApplicant;
  documents: string[];
}

export async function submitVisaApplication(input: VisaApplicationInput): Promise<VisaApplication> {
  if (IS_STATIC) {
    const { buildVisaProduct } = await import("@/lib/visa-catalog");
    const product = buildVisaProduct(input.countryCode, input.type, input.nationality);
    if (!product) throw new Error("Visa product unavailable");
    if (input.applicant.passportExpiry <= input.applicant.travelDate) throw new Error("Passport must be valid beyond your travel date");
    return demoLatency({
      id: `KZV-${generatePnr()}`,
      createdAt: new Date().toISOString(),
      product,
      applicant: input.applicant,
      documents: input.documents,
      status: "submitted",
      amount: product.governmentFee + product.serviceFee,
    });
  }
  return post<{ application: VisaApplication }>("/api/visa/applications", input).then((r) => r.application);
}

export interface HolidayBookingInput {
  config: HolidayConfig;
  leadName: string;
  email: string;
  phone: string;
  notes?: string;
  expectedTotal: number;
}

export async function submitHolidayBooking(input: HolidayBookingInput): Promise<HolidayBooking> {
  if (IS_STATIC) {
    const { quoteHoliday } = await import("@/lib/holiday-pricing");
    const quote = quoteHoliday(input.config);
    if (!quote) throw new Error("Unknown destination");
    if (quote.total !== input.expectedTotal) throw new Error("Price has changed — please review the updated total");
    const { expectedTotal: _ignored, ...rest } = input;
    void _ignored;
    return demoLatency({ ref: `KZH-${generatePnr()}`, createdAt: new Date().toISOString(), quote, ...rest });
  }
  return post<{ booking: HolidayBooking }>("/api/holidays/bookings", input).then((r) => r.booking);
}
