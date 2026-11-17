import "server-only";
import { buildVisaProduct } from "@/lib/visa-catalog";
import type { VisaProduct, VisaTypeKey } from "@/types";

export interface VisaProvider {
  readonly name: string;
  getProduct(countryCode: string, type: VisaTypeKey, nationality: string): Promise<VisaProduct | null>;
}

export const mockVisaProvider: VisaProvider = {
  name: "mock",
  async getProduct(countryCode, type, nationality) {
    return buildVisaProduct(countryCode, type, nationality);
  },
};

export function getVisaProvider(): VisaProvider {
  return mockVisaProvider;
}
