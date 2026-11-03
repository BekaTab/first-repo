import type { PricingTier, Role } from "@/types/domain";

/** A user as persisted by the mock store. Never leaves `mock-db.ts` / the provider. */
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string | null;
}

/** What the UI may see. */
export type PublicUser = Omit<StoredUser, "passwordHash" | "salt">;

export interface Session {
  userId: string;
  issuedAt: number;
  expiresAt: number;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type Result<T, E extends string = string> = ({ ok: true } & T) | { ok: false; error: E };

export interface NewUserInput {
  name: string;
  email: string;
  role: PricingTier;
}

/** Credentials are only ever returned once — at creation or reset. */
export interface IssuedCredentials {
  email: string;
  password: string;
}
