import "server-only";
import type { CabinClass, FlightOffer, FlightSearchQuery, HotelOffer, HotelSearchQuery } from "@/types";
import { mockProvider } from "./mock";
import { ProviderError, type TravelProvider } from "./provider";

const BASE_URL = process.env.AMADEUS_BASE_URL ?? "https://test.api.amadeus.com";
const CABIN_MAP: Record<CabinClass, string> = {
  Economy: "ECONOMY",
  "Premium Economy": "PREMIUM_ECONOMY",
  Business: "BUSINESS",
  First: "FIRST",
};

let tokenCache: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 30_000) return tokenCache.token;
  const id = process.env.AMADEUS_CLIENT_ID;
  const secret = process.env.AMADEUS_CLIENT_SECRET;
  if (!id || !secret) throw new ProviderError("Amadeus credentials are not configured", 500);

  const res = await fetch(`${BASE_URL}/v1/security/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: id, client_secret: secret }),
    cache: "no-store",
  });
  if (!res.ok) throw new ProviderError(`Amadeus auth failed (${res.status})`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  tokenCache = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

function parseIsoDuration(d: string): number {
  const m = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(d);
  return m ? Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0) : 0;
}

interface AmadeusSegment {
  departure: { iataCode: string; at: string };
  arrival: { iataCode: string; at: string };
  carrierCode: string;
  number: string;
  duration: string;
}

interface AmadeusOffer {
  id: string;
  numberOfBookableSeats: number;
  validatingAirlineCodes: string[];
  itineraries: { duration: string; segments: AmadeusSegment[] }[];
  price: { base: string; grandTotal: string };
  pricingOptions?: { refundableFare?: boolean };
  travelerPricings: {
    fareDetailsBySegment: { cabin: string; includedCheckedBags?: { weight?: number; quantity?: number } }[];
  }[];
}

function mapOffer(o: AmadeusOffer, cabin: CabinClass, rate: number): FlightOffer {
  const itin = o.itineraries[0];
  const bags = o.travelerPricings[0]?.fareDetailsBySegment[0]?.includedCheckedBags;
  const base = Math.round(Number(o.price.base) * rate);
  const total = Math.round(Number(o.price.grandTotal) * rate);
  return {
    id: `AM-${o.id}`,
    airline: o.validatingAirlineCodes[0] ?? itin.segments[0].carrierCode,
    segments: itin.segments.map((s) => ({
      flightNumber: `${s.carrierCode}${s.number}`,
      airline: s.carrierCode,
      origin: s.departure.iataCode,
      destination: s.arrival.iataCode,
      departure: s.departure.at,
      arrival: s.arrival.at,
      durationMin: parseIsoDuration(s.duration),
    })),
    stops: itin.segments.length - 1,
    totalDurationMin: parseIsoDuration(itin.duration),
    cabin,
    baggage: { cabinKg: 7, checkedKg: bags?.weight ?? (bags?.quantity ? bags.quantity * 23 : 0) },
    refundable: Boolean(o.pricingOptions?.refundableFare),
    seatsLeft: o.numberOfBookableSeats,
    price: { base, taxes: total - base, currency: "BDT" },
  };
}

export const amadeusProvider: TravelProvider = {
  name: "amadeus",

  async searchFlights(query: FlightSearchQuery) {
    const token = await getToken();
    const leg = query.legs[0];
    const params = new URLSearchParams({
      originLocationCode: leg.origin,
      destinationLocationCode: leg.destination,
      departureDate: leg.date,
      adults: String(query.passengers.adults),
      children: String(query.passengers.children),
      infants: String(query.passengers.infants),
      travelClass: CABIN_MAP[query.cabin],
      currencyCode: "BDT",
      max: "50",
    });
    if (query.tripType === "roundtrip" && query.returnDate) params.set("returnDate", query.returnDate);

    const res = await fetch(`${BASE_URL}/v2/shopping/flight-offers?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) throw new ProviderError(`Amadeus flight search failed (${res.status})`);
    const json = (await res.json()) as { data: AmadeusOffer[] };
    return json.data.map((o) => mapOffer(o, query.cabin, 1));
  },

  // Hotel content needs Amadeus Hotel List + Hotel Offers (two calls, city-code based); until wired, fall back to mock.
  async searchHotels(query: HotelSearchQuery): Promise<HotelOffer[]> {
    return mockProvider.searchHotels(query);
  },
};
