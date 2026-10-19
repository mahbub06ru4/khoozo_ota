import { AIRLINES, DOMESTIC_CODES, findAirport } from "@/lib/data/airports";
import { HOTEL_AMENITIES, HOTEL_CITIES, HOTEL_NAME_PARTS } from "@/lib/data/hotels";
import { hashString, seededRandom } from "@/lib/utils";
import type { FlightOffer, FlightSearchQuery, FlightSegment, HotelOffer, HotelSearchQuery } from "@/types";
import type { TravelProvider } from "./provider";

const DOMESTIC_AIRLINES = ["BG", "BS", "2A", "VQ"];
const REGIONAL_AIRLINES = ["BG", "BS", "EK", "QR", "FZ", "SQ", "MH", "6E", "SV", "TK"];
const HUBS: Record<string, string> = { EK: "DXB", QR: "DOH", FZ: "DXB", SQ: "SIN", MH: "KUL", TK: "IST", SV: "JED", "6E": "CCU", BG: "DAC", BS: "DAC" };

const LONG_HAUL = new Set(["JFK", "YYZ", "LHR", "SYD", "NRT", "IST"]);

const CABIN_MULTIPLIER = { Economy: 1, "Premium Economy": 1.6, Business: 3.2, First: 5.5 } as const;

function estimateDuration(origin: string, destination: string, rand: () => number): number {
  const domestic = DOMESTIC_CODES.has(origin) && DOMESTIC_CODES.has(destination);
  if (domestic) return 45 + Math.round(rand() * 25);
  const seed = hashString([origin, destination].sort().join("-"));
  const longHaul = LONG_HAUL.has(origin) || LONG_HAUL.has(destination);
  return longHaul ? 480 + (seed % 300) : 120 + (seed % 240);
}

function buildSegments(
  airline: string,
  origin: string,
  destination: string,
  date: string,
  stops: number,
  rand: () => number,
): FlightSegment[] {
  const departHour = Math.floor(rand() * 24);
  const departMin = [0, 10, 15, 25, 30, 40, 45, 55][Math.floor(rand() * 8)];
  let cursor = new Date(`${date}T${String(departHour).padStart(2, "0")}:${String(departMin).padStart(2, "0")}:00`);
  const hub = HUBS[airline];
  const via = stops > 0 && hub && hub !== origin && hub !== destination ? hub : stops > 0 ? "DXB" : null;
  const points = via && via !== origin && via !== destination ? [origin, via, destination] : [origin, destination];

  return points.slice(0, -1).map((from, i) => {
    const to = points[i + 1];
    const durationMin = estimateDuration(from, to, rand);
    const departure = new Date(cursor);
    const arrival = new Date(departure.getTime() + durationMin * 60_000);
    cursor = new Date(arrival.getTime() + (90 + Math.floor(rand() * 180)) * 60_000);
    return {
      flightNumber: `${airline}${100 + Math.floor(rand() * 899)}`,
      airline,
      origin: from,
      destination: to,
      departure: departure.toISOString(),
      arrival: arrival.toISOString(),
      durationMin,
    };
  });
}

export function generateFlights(query: FlightSearchQuery): FlightOffer[] {
  const leg = query.legs[0];
  const rand = seededRandom(hashString(JSON.stringify(query)));
  const domestic = DOMESTIC_CODES.has(leg.origin) && DOMESTIC_CODES.has(leg.destination);
  const carriers = domestic ? DOMESTIC_AIRLINES : REGIONAL_AIRLINES;
  const count = domestic ? 14 : 22;
  const pax = query.passengers.adults + query.passengers.children * 0.75 + query.passengers.infants * 0.1;
  const tripMultiplier = query.tripType === "roundtrip" ? 1.85 : query.tripType === "multicity" ? query.legs.length * 0.95 : 1;

  return Array.from({ length: count }, (_, i) => {
    const airline = carriers[Math.floor(rand() * carriers.length)];
    const stops = domestic ? 0 : rand() < 0.4 ? 0 : rand() < 0.85 ? 1 : 2;
    const segments = buildSegments(airline, leg.origin, leg.destination, leg.date, Math.min(stops, 1), rand);
    const effectiveStops = segments.length - 1;
    const first = segments[0];
    const last = segments[segments.length - 1];
    const totalDurationMin = Math.round((new Date(last.arrival).getTime() - new Date(first.departure).getTime()) / 60_000);
    const baseUnit = domestic ? 3800 + rand() * 4200 : 22000 + totalDurationMin * 55 + rand() * 18000;
    const stopDiscount = effectiveStops === 0 ? 1.12 : 0.92;
    const base = Math.round((baseUnit * stopDiscount * CABIN_MULTIPLIER[query.cabin] * pax * tripMultiplier) / 10) * 10;
    const taxes = Math.round((base * (domestic ? 0.12 : 0.22)) / 10) * 10;

    return {
      id: `MK-${hashString(`${i}-${first.flightNumber}-${leg.date}`).toString(36)}`,
      airline,
      segments,
      stops: effectiveStops,
      totalDurationMin,
      cabin: query.cabin,
      baggage: { cabinKg: 7, checkedKg: domestic ? 20 : query.cabin === "Economy" ? 30 : 40 },
      refundable: rand() > 0.45,
      seatsLeft: 1 + Math.floor(rand() * 9),
      price: { base, taxes, currency: "BDT" as const },
    };
  }).filter((o) => findAirport(o.segments[0].origin) && AIRLINES.some((a) => a.code === o.airline));
}

export function generateHotels(query: HotelSearchQuery): HotelOffer[] {
  const term = query.destination.toLowerCase();
  const city =
    HOTEL_CITIES.find((c) => c.city.toLowerCase() === term) ??
    HOTEL_CITIES.find((c) => term.includes(c.city.toLowerCase()) || c.neighborhoods.some((n) => term.includes(n.toLowerCase())));
  if (!city) return [];

  const rand = seededRandom(hashString(`${city.city}-${query.checkIn}`));
  const guests = query.rooms.reduce((n, r) => n + r.adults + r.children, 0);

  return Array.from({ length: 18 }, (_, i) => {
    const stars = 2 + Math.floor(rand() * 4);
    const prefix = HOTEL_NAME_PARTS.prefix[Math.floor(rand() * HOTEL_NAME_PARTS.prefix.length)];
    const suffix = HOTEL_NAME_PARTS.suffix[Math.floor(rand() * HOTEL_NAME_PARTS.suffix.length)];
    const neighborhood = city.neighborhoods[Math.floor(rand() * city.neighborhoods.length)];
    const amenities = HOTEL_AMENITIES.filter(() => rand() > 0.45);
    const breakfastIncluded = amenities.includes("Breakfast");
    const base =
      Math.round((city.baseRate * (0.45 + stars * 0.28) * (0.85 + rand() * 0.5) * query.rooms.length * (guests > query.rooms.length * 2 ? 1.15 : 1)) / 10) * 10;
    return {
      id: `HT-${hashString(`${city.city}-${i}`).toString(36)}`,
      name: `${prefix} ${neighborhood} ${suffix}`.replace(/\s+/g, " "),
      city: city.city,
      neighborhood,
      stars,
      rating: Math.round((6.5 + rand() * 3.4) * 10) / 10,
      reviews: 40 + Math.floor(rand() * 2400),
      amenities: amenities.length ? amenities : ["Free WiFi", "Air Conditioning"],
      image: `/images/hotels/hotel-${(i % 6) + 1}.jpg`,
      freeCancellation: rand() > 0.4,
      breakfastIncluded,
      pricePerNight: { base, taxes: Math.round((base * 0.15) / 10) * 10, currency: "BDT" as const },
    };
  });
}

export const mockProvider: TravelProvider = {
  name: "mock",
  async searchFlights(query) {
    return generateFlights(query);
  },
  async searchHotels(query) {
    return generateHotels(query);
  },
};
