import rawLocations from "./auction-locations.json";
import { isAuction, type Auction } from "@/types/domain";
import { isStateCode, type StateCode } from "./us-states";

/**
 * Copart & IAAI facility cities, keyed by state.
 *
 * The data lives in `auction-locations.json` (a flat array of
 * `{ auction, state, city }`) so it can be replaced wholesale — e.g. by an
 * export from an API — without touching code. It is validated once at
 * module load; a typo such as `"state": "TXX"` throws immediately instead of
 * silently producing an empty dropdown.
 */

export interface AuctionLocation {
  /** Stable id, e.g. `copart-tx-fort-worth`. Used as the City select value and pricing override key. */
  readonly id: string;
  readonly auction: Auction;
  readonly state: StateCode;
  readonly city: string;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const locationId = (auction: Auction, state: StateCode, city: string): string =>
  `${auction}-${state}-${slug(city)}`.toLowerCase();

function parseLocations(input: unknown): AuctionLocation[] {
  if (!Array.isArray(input)) throw new Error("auction-locations.json must be an array");

  const seen = new Set<string>();
  return input.map((row: unknown, i): AuctionLocation => {
    const r = row as Partial<Record<"auction" | "state" | "city", unknown>>;
    if (!isAuction(r.auction)) throw new Error(`auction-locations.json[${i}]: unknown auction "${String(r.auction)}"`);
    if (!isStateCode(r.state)) throw new Error(`auction-locations.json[${i}]: unknown state "${String(r.state)}"`);
    if (typeof r.city !== "string" || !r.city.trim()) throw new Error(`auction-locations.json[${i}]: missing city`);

    const id = locationId(r.auction, r.state, r.city);
    if (seen.has(id)) throw new Error(`auction-locations.json[${i}]: duplicate facility "${id}"`);
    seen.add(id);

    return Object.freeze({ id, auction: r.auction, state: r.state, city: r.city.trim() });
  });
}

export const AUCTION_LOCATIONS: readonly AuctionLocation[] = Object.freeze(parseLocations(rawLocations));

// --- Indexes (built once) -------------------------------------------------

type IndexKey = `${Auction}:${StateCode}`;

const byAuctionState = new Map<IndexKey, AuctionLocation[]>();
const byId = new Map<string, AuctionLocation>();

for (const loc of AUCTION_LOCATIONS) {
  const key: IndexKey = `${loc.auction}:${loc.state}`;
  const bucket = byAuctionState.get(key) ?? [];
  bucket.push(loc);
  byAuctionState.set(key, bucket);
  byId.set(loc.id, loc);
}
byAuctionState.forEach((list) => list.sort((a, b) => a.city.localeCompare(b.city)));

const EMPTY: readonly AuctionLocation[] = Object.freeze([]);

/** Facilities of one auction in one state, sorted by city. */
export const getLocations = (auction: Auction, state: StateCode): readonly AuctionLocation[] =>
  byAuctionState.get(`${auction}:${state}`) ?? EMPTY;

export const getLocationById = (id: string): AuctionLocation | undefined => byId.get(id);
