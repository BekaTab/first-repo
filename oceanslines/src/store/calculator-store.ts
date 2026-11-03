import { create } from "zustand";
import type { Auction, CarType, PricingTier } from "@/types/domain";
import type { StateCode } from "@/data/us-states";
import { getLocations } from "@/data/locations";
import { calculateShipping, type QuoteResult } from "@/lib/pricing";

interface CalculatorFields {
  auction: Auction | null;
  state: StateCode | null;
  /** City name, scoped to (auction, state). */
  city: string | null;
  carType: CarType | null;
}

interface CalculatorState extends CalculatorFields {
  result: QuoteResult | null;
  setAuction(auction: Auction): void;
  setState(state: StateCode): void;
  setCity(city: string): void;
  setCarType(carType: CarType): void;
  /** Prices the current selection; no-op (returns null) until every field is set. */
  calculate(tier: PricingTier): QuoteResult | null;
  reset(): void;
}

const EMPTY: CalculatorFields & { result: null } = {
  auction: null,
  state: null,
  city: null,
  carType: null,
  result: null,
};

/** Keep the city only if the same city still exists for the new auction/state. */
const keepCityIfAvailable = (auction: Auction | null, state: StateCode | null, city: string | null) =>
  auction && state && city && getLocations(auction, state).some((l) => l.city === city) ? city : null;

export const useCalculatorStore = create<CalculatorState>()((set, get) => ({
  ...EMPTY,

  // Any input change invalidates the last quote.
  setAuction: (auction) =>
    set((s) => ({ auction, city: keepCityIfAvailable(auction, s.state, s.city), result: null })),
  setState: (state) => set({ state, city: null, result: null }),
  setCity: (city) => set({ city, result: null }),
  setCarType: (carType) => set({ carType, result: null }),

  calculate: (tier) => {
    const { auction, state, city, carType } = get();
    if (!auction || !state || !city || !carType) return null;
    const result = calculateShipping(auction, state, city, carType, tier);
    set({ result });
    return result;
  },

  reset: () => set(EMPTY),
}));

export const selectIsComplete = (s: CalculatorFields): boolean =>
  !!(s.auction && s.state && s.city && s.carType);
