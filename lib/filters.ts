import { timeWindowOf } from "@/lib/utils";
import type { FlightFilters, FlightOffer, HotelFilters, HotelOffer, SortKey } from "@/types";

export const EMPTY_FLIGHT_FILTERS: FlightFilters = {
  stops: [],
  maxPrice: null,
  airlines: [],
  departureWindows: [],
  arrivalWindows: [],
  refundableOnly: false,
};

export const EMPTY_HOTEL_FILTERS: HotelFilters = {
  stars: [],
  maxPrice: null,
  neighborhoods: [],
  amenities: [],
  freeCancellationOnly: false,
};

export const flightTotal = (o: FlightOffer) => o.price.base + o.price.taxes;
export const hotelNightly = (o: HotelOffer) => o.pricePerNight.base + o.pricePerNight.taxes;

export function applyFlightFilters(offers: FlightOffer[], f: FlightFilters, sort: SortKey): FlightOffer[] {
  const out = offers.filter((o) => {
    const first = o.segments[0];
    const last = o.segments[o.segments.length - 1];
    if (f.stops.length && !f.stops.includes(Math.min(o.stops, 2))) return false;
    if (f.maxPrice !== null && flightTotal(o) > f.maxPrice) return false;
    if (f.airlines.length && !f.airlines.includes(o.airline)) return false;
    if (f.departureWindows.length && !f.departureWindows.includes(timeWindowOf(first.departure))) return false;
    if (f.arrivalWindows.length && !f.arrivalWindows.includes(timeWindowOf(last.arrival))) return false;
    if (f.refundableOnly && !o.refundable) return false;
    return true;
  });

  const minPrice = Math.min(...out.map(flightTotal));
  const minDur = Math.min(...out.map((o) => o.totalDurationMin));
  const score = (o: FlightOffer) => flightTotal(o) / minPrice + (o.totalDurationMin / minDur) * 0.6;

  return out.sort((a, b) => {
    switch (sort) {
      case "cheapest":
        return flightTotal(a) - flightTotal(b);
      case "fastest":
        return a.totalDurationMin - b.totalDurationMin;
      case "earliest":
        return a.segments[0].departure.localeCompare(b.segments[0].departure);
      default:
        return score(a) - score(b);
    }
  });
}

export function applyHotelFilters(offers: HotelOffer[], f: HotelFilters, sort: SortKey): HotelOffer[] {
  const out = offers.filter((o) => {
    if (f.stars.length && !f.stars.includes(o.stars)) return false;
    if (f.maxPrice !== null && hotelNightly(o) > f.maxPrice) return false;
    if (f.neighborhoods.length && !f.neighborhoods.includes(o.neighborhood)) return false;
    if (f.amenities.length && !f.amenities.every((a) => o.amenities.includes(a))) return false;
    if (f.freeCancellationOnly && !o.freeCancellation) return false;
    return true;
  });
  return out.sort((a, b) => {
    if (sort === "cheapest") return hotelNightly(a) - hotelNightly(b);
    if (sort === "fastest") return b.stars - a.stars;
    return b.rating - a.rating || hotelNightly(a) - hotelNightly(b);
  });
}
