import type { FlightOffer, FlightSearchQuery, HotelOffer, HotelSearchQuery } from "@/types";

export interface TravelProvider {
  readonly name: string;
  searchFlights(query: FlightSearchQuery): Promise<FlightOffer[]>;
  searchHotels(query: HotelSearchQuery): Promise<HotelOffer[]>;
}

export class ProviderError extends Error {
  constructor(
    message: string,
    readonly status = 502,
  ) {
    super(message);
    this.name = "ProviderError";
  }
}
