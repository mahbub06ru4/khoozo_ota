import "server-only";
import type { CabinClass, FlightOffer, FlightSearchQuery, HotelOffer, HotelSearchQuery } from "@/types";
import { mockProvider } from "./mock";
import { ProviderError, type TravelProvider } from "./provider";

const BASE_URL = "https://api.duffel.com";
const CABIN_MAP: Record<CabinClass, string> = {
  Economy: "economy",
  "Premium Economy": "premium_economy",
  Business: "business",
  First: "first",
};

interface DuffelSegment {
  origin: { iata_code: string };
  destination: { iata_code: string };
  departing_at: string;
  arriving_at: string;
  duration: string;
  marketing_carrier: { iata_code: string };
  marketing_carrier_flight_number: string;
  passengers: { baggages: { type: string; quantity: number }[] }[];
}

interface DuffelOffer {
  id: string;
  base_amount: string;
  tax_amount: string;
  owner: { iata_code: string };
  slices: { duration: string; segments: DuffelSegment[] }[];
  conditions?: { refund_before_departure?: { allowed: boolean } | null };
}

function parseIsoDuration(d: string): number {
  const m = /P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(d);
  return m ? Number(m[1] ?? 0) * 1440 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0) : 0;
}

function mapOffer(o: DuffelOffer, cabin: CabinClass): FlightOffer {
  const slice = o.slices[0];
  const checked = slice.segments[0]?.passengers[0]?.baggages.find((b) => b.type === "checked")?.quantity ?? 0;
  return {
    id: `DF-${o.id}`,
    airline: o.owner.iata_code,
    segments: slice.segments.map((s) => ({
      flightNumber: `${s.marketing_carrier.iata_code}${s.marketing_carrier_flight_number}`,
      airline: s.marketing_carrier.iata_code,
      origin: s.origin.iata_code,
      destination: s.destination.iata_code,
      departure: s.departing_at,
      arrival: s.arriving_at,
      durationMin: parseIsoDuration(s.duration),
    })),
    stops: slice.segments.length - 1,
    totalDurationMin: parseIsoDuration(slice.duration),
    cabin,
    baggage: { cabinKg: 7, checkedKg: checked * 23 },
    refundable: Boolean(o.conditions?.refund_before_departure?.allowed),
    seatsLeft: 9,
    price: { base: Math.round(Number(o.base_amount)), taxes: Math.round(Number(o.tax_amount)), currency: "BDT" },
  };
}

export const duffelProvider: TravelProvider = {
  name: "duffel",

  async searchFlights(query: FlightSearchQuery) {
    const token = process.env.DUFFEL_ACCESS_TOKEN;
    if (!token) throw new ProviderError("Duffel access token is not configured", 500);

    const slices = query.legs.map((l) => ({ origin: l.origin, destination: l.destination, departure_date: l.date }));
    if (query.tripType === "roundtrip" && query.returnDate) {
      const l = query.legs[0];
      slices.push({ origin: l.destination, destination: l.origin, departure_date: query.returnDate });
    }
    const passengers = [
      ...Array.from({ length: query.passengers.adults }, () => ({ type: "adult" })),
      ...Array.from({ length: query.passengers.children }, () => ({ age: 8 })),
      ...Array.from({ length: query.passengers.infants }, () => ({ age: 1 })),
    ];

    const res = await fetch(`${BASE_URL}/air/offer_requests?return_offers=true&supplier_timeout=20000`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Duffel-Version": "v2",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ data: { slices, passengers, cabin_class: CABIN_MAP[query.cabin] } }),
      cache: "no-store",
    });
    if (!res.ok) throw new ProviderError(`Duffel offer request failed (${res.status})`);
    const json = (await res.json()) as { data: { offers: DuffelOffer[] } };
    return json.data.offers.map((o) => mapOffer(o, query.cabin));
  },

  // Duffel Stays requires separate access; fall back to mock until enabled.
  async searchHotels(query: HotelSearchQuery): Promise<HotelOffer[]> {
    return mockProvider.searchHotels(query);
  },
};
