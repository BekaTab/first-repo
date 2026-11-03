import rawMatrix from "@/config/pricing-matrix.json";
import { CAR_TYPES } from "@/types/domain";
import { US_STATES } from "@/data/us-states";
import type { PricingMatrix } from "./types";

/**
 * The active price list.
 *
 * Assigning the JSON import to `PricingMatrix` makes TypeScript check its
 * structure at build time (e.g. a missing state or car type is a compile
 * error). `assertMatrix` then checks what types can't: port references,
 * non-negative numbers, and the business rule that SUPER_MEMBER is never
 * priced above MEMBER.
 */
const matrix: PricingMatrix = rawMatrix;

function assertMatrix(m: PricingMatrix): PricingMatrix {
  const fail = (msg: string): never => {
    throw new Error(`pricing-matrix.json: ${msg}`);
  };
  const money = (v: number, where: string) => {
    if (!Number.isFinite(v) || v < 0) fail(`${where} must be a non-negative number (got ${v})`);
  };

  if (!Number.isInteger(m.rounding) || m.rounding < 1) fail("rounding must be a positive integer");

  for (const [code, port] of Object.entries(m.ports)) {
    for (const t of CAR_TYPES) money(port.ocean[t], `ports.${code}.ocean.${t}`);
  }
  for (const { code } of US_STATES) {
    const s = m.states[code];
    if (!m.ports[s.port]) fail(`states.${code}.port "${s.port}" is not defined in ports`);
    money(s.inland, `states.${code}.inland`);
  }
  for (const [id, v] of Object.entries(m.locationInlandOverrides)) money(v, `locationInlandOverrides.${id}`);
  for (const [a, v] of Object.entries(m.auctionHandlingFee)) money(v, `auctionHandlingFee.${a}`);
  for (const t of CAR_TYPES) money(m.carTypes[t].inlandMultiplier, `carTypes.${t}.inlandMultiplier`);

  const member = m.tiers.MEMBER;
  const superMember = m.tiers.SUPER_MEMBER;
  for (const key of Object.keys(member) as (keyof typeof member)[]) {
    money(member[key], `tiers.MEMBER.${key}`);
    money(superMember[key], `tiers.SUPER_MEMBER.${key}`);
    if (superMember[key] > member[key]) {
      fail(`tiers.SUPER_MEMBER.${key} (${superMember[key]}) must not exceed tiers.MEMBER.${key} (${member[key]})`);
    }
  }
  return m;
}

export const PRICING_MATRIX: Readonly<PricingMatrix> = assertMatrix(matrix);
