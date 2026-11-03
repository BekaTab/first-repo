/**
 * Core domain vocabulary. Every union is derived from a `const` tuple so the
 * runtime list (used by dropdowns and validators) and the type never drift.
 */

export const AUCTIONS = ["IAAI", "Copart"] as const;
export type Auction = (typeof AUCTIONS)[number];

export const CAR_TYPES = ["SUV", "Sedan"] as const;
export type CarType = (typeof CAR_TYPES)[number];

export const ROLES = ["ADMIN", "MEMBER", "SUPER_MEMBER"] as const;
export type Role = (typeof ROLES)[number];

/** Roles that have their own price list and portal theme. */
export const PRICING_TIERS = ["MEMBER", "SUPER_MEMBER"] as const;
export type PricingTier = (typeof PRICING_TIERS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
  SUPER_MEMBER: "Super Member",
};

export const isAuction = (v: unknown): v is Auction =>
  typeof v === "string" && (AUCTIONS as readonly string[]).includes(v);

export const isCarType = (v: unknown): v is CarType =>
  typeof v === "string" && (CAR_TYPES as readonly string[]).includes(v);

export const isRole = (v: unknown): v is Role =>
  typeof v === "string" && (ROLES as readonly string[]).includes(v);

export const isPricingTier = (v: unknown): v is PricingTier =>
  typeof v === "string" && (PRICING_TIERS as readonly string[]).includes(v);
