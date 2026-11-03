import type { Auction, CarType, PricingTier } from "@/types/domain";
import type { StateCode } from "@/data/us-states";
import type { AuctionLocation } from "@/data/locations";

/**
 * Shape of `src/config/pricing-matrix.json`.
 *
 * Price flow for one quote:
 *   inland   = (location override ?? state.inland) × carType.inlandMultiplier × tier.inlandMultiplier
 *   ocean    = ports[state.port].ocean[carType]                              × tier.oceanMultiplier
 *   handling = auctionHandlingFee[auction]                                   × tier.auctionHandlingMultiplier
 *   service  = tier.serviceFee
 * Each line is rounded up to `rounding`; total = sum of lines.
 */
export interface PricingMatrix {
  meta: {
    version: string;
    currency: string;
    destination: string;
  };
  /** Each line is rounded UP to a multiple of this (e.g. 5 → $1,237 becomes $1,240). Use 1 to disable. */
  rounding: number;
  /** US export ports. Keys are referenced by `states[*].port`. */
  ports: Record<string, PortPricing>;
  /** Every state must be present — enforced by the type. */
  states: Record<StateCode, StatePricing>;
  /** Optional absolute inland price for a specific facility, keyed by location id (`copart-tx-houston`). */
  locationInlandOverrides: Record<string, number>;
  auctionHandlingFee: Record<Auction, number>;
  carTypes: Record<CarType, { inlandMultiplier: number }>;
  /** One independent price list per tier. */
  tiers: Record<PricingTier, TierPricing>;
}

export interface PortPricing {
  label: string;
  /** Ocean freight from this port to the destination, per car type. */
  ocean: Record<CarType, number>;
}

export interface StatePricing {
  /** Key into `ports`. */
  port: string;
  /** Default inland towing from any facility in the state to its port. */
  inland: number;
}

export interface TierPricing {
  serviceFee: number;
  inlandMultiplier: number;
  oceanMultiplier: number;
  auctionHandlingMultiplier: number;
}

// --- Output -----------------------------------------------------------------

export type QuoteLineKey = "inland" | "ocean" | "handling" | "service";

export interface QuoteLine {
  key: QuoteLineKey;
  label: string;
  detail: string;
  amount: number;
}

export interface ShippingQuote {
  tier: PricingTier;
  currency: string;
  location: AuctionLocation;
  carType: CarType;
  port: { code: string; label: string };
  destination: string;
  /** Always the same four lines, in the same order, for every tier. */
  lines: readonly [QuoteLine, QuoteLine, QuoteLine, QuoteLine];
  total: number;
  pricingVersion: string;
}

export type QuoteErrorCode = "UNKNOWN_LOCATION" | "LOCATION_MISMATCH";

export type QuoteResult =
  | { ok: true; quote: ShippingQuote }
  | { ok: false; code: QuoteErrorCode; message: string };
