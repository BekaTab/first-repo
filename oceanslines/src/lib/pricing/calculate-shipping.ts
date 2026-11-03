import type { Auction, CarType, PricingTier } from "@/types/domain";
import type { StateCode } from "@/data/us-states";
import { getLocationById, locationId } from "@/data/locations";
import { PRICING_MATRIX } from "./pricing-matrix";
import type { PricingMatrix, QuoteLine, QuoteResult } from "./types";

const roundUp = (value: number, step: number) => Math.ceil(value / step) * step;

/**
 * Quote door-to-port-to-destination shipping for one car.
 *
 * Pure and synchronous: same inputs → same output, no I/O. Swap the price list
 * by editing `src/config/pricing-matrix.json`, or pass another matrix as the
 * last argument (e.g. one fetched from an API, or a fixture in tests).
 *
 * MEMBER and SUPER_MEMBER are priced from independent tier configs; the matrix
 * validator guarantees SUPER_MEMBER ≤ MEMBER on every component.
 *
 * @param userRole  The pricing tier. Admins pick the tier they are previewing
 *                  (see `resolvePricingTier`).
 */
export function calculateShipping(
  auction: Auction,
  state: StateCode,
  city: string,
  carType: CarType,
  userRole: PricingTier,
  matrix: Readonly<PricingMatrix> = PRICING_MATRIX,
): QuoteResult {
  const location = getLocationById(locationId(auction, state, city));
  if (!location) {
    return {
      ok: false,
      code: "UNKNOWN_LOCATION",
      message: `${auction} has no facility in ${city}, ${state}.`,
    };
  }

  const statePricing = matrix.states[state];
  const port = matrix.ports[statePricing.port];
  if (!port) {
    // Unreachable with the validated default matrix; guards custom matrices.
    return { ok: false, code: "LOCATION_MISMATCH", message: `No export port configured for ${state}.` };
  }

  const tier = matrix.tiers[userRole];
  const step = matrix.rounding;
  const baseInland = matrix.locationInlandOverrides[location.id] ?? statePricing.inland;

  const inland: QuoteLine = {
    key: "inland",
    amount: roundUp(baseInland * matrix.carTypes[carType].inlandMultiplier * tier.inlandMultiplier, step),
  };
  const ocean: QuoteLine = {
    key: "ocean",
    amount: roundUp(port.ocean[carType] * tier.oceanMultiplier, step),
  };
  const handling: QuoteLine = {
    key: "handling",
    amount: roundUp(matrix.auctionHandlingFee[auction] * tier.auctionHandlingMultiplier, step),
  };
  const service: QuoteLine = {
    key: "service",
    amount: roundUp(tier.serviceFee, step),
  };

  const lines = [inland, ocean, handling, service] as const;

  return {
    ok: true,
    quote: {
      tier: userRole,
      currency: matrix.meta.currency,
      location,
      carType,
      port: { code: statePricing.port, label: port.label },
      destination: matrix.meta.destination,
      lines,
      total: lines.reduce((sum, l) => sum + l.amount, 0),
      pricingVersion: matrix.meta.version,
    },
  };
}
