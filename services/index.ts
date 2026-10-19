import "server-only";
import { amadeusProvider } from "./amadeus";
import { duffelProvider } from "./duffel";
import { mockProvider } from "./mock";
import type { TravelProvider } from "./provider";

const providers: Record<string, TravelProvider> = {
  mock: mockProvider,
  amadeus: amadeusProvider,
  duffel: duffelProvider,
};

export function getProvider(): TravelProvider {
  return providers[process.env.TRAVEL_PROVIDER ?? "mock"] ?? mockProvider;
}

export { ProviderError } from "./provider";
