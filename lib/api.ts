import type { FlightOffer, FlightSearchQuery, HotelOffer, HotelSearchQuery, SearchQuery } from "@/types";

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

export function searchFlights(q: FlightSearchQuery, signal?: AbortSignal) {
  return post<{ offers: FlightOffer[] }>("/api/flights/search", q, signal).then((r) => r.offers);
}

export function searchHotels(q: HotelSearchQuery, signal?: AbortSignal) {
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
