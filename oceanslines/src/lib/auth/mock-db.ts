import { isRole } from "@/types/domain";
import { hashPassword, randomId, randomSalt } from "./crypto";
import type { PublicUser, Session, StoredUser } from "./types";

/**
 * MOCK persistence for users and the current session, backed by localStorage.
 * Everything lives in the visitor's browser — swap this module for real API
 * calls when a backend exists; the AuthProvider only uses the exports below.
 */

const USERS_KEY = "oceanslines.users.v1";
const SESSION_KEY = "oceanslines.session.v1";
export const STORAGE_KEYS = [USERS_KEY, SESSION_KEY] as const;

export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

/** Demo accounts seeded on first visit. Shown on the login page while the auth layer is mocked. */
export const DEMO_ACCOUNTS = [
  { name: "Oceans Lines Admin", email: "admin@oceanslines.ge", password: "Admin#2026", role: "ADMIN" },
  { name: "Giorgi Beridze", email: "member@oceanslines.ge", password: "Member#2026", role: "MEMBER" },
  { name: "Nino Kapanadze", email: "super@oceanslines.ge", password: "Super#2026", role: "SUPER_MEMBER" },
] as const;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode / quota: the session simply won't persist across reloads.
  }
}

function isStoredUser(u: unknown): u is StoredUser {
  if (!u || typeof u !== "object") return false;
  const r = u as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.email === "string" &&
    typeof r.name === "string" &&
    typeof r.passwordHash === "string" &&
    typeof r.salt === "string" &&
    isRole(r.role)
  );
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const toPublicUser = ({ passwordHash: _h, salt: _s, ...user }: StoredUser): PublicUser => user;

export async function buildUser(
  input: Pick<StoredUser, "name" | "email" | "role">,
  password: string,
): Promise<StoredUser> {
  const salt = randomSalt();
  return {
    id: randomId("usr"),
    name: input.name.trim(),
    email: normalizeEmail(input.email),
    role: input.role,
    salt,
    passwordHash: await hashPassword(password, salt),
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
}

/** Returns the user table, seeding the demo accounts the first time. */
export async function loadUsers(): Promise<StoredUser[]> {
  const stored = read<unknown[]>(USERS_KEY);
  const valid = Array.isArray(stored) ? stored.filter(isStoredUser) : [];
  if (valid.some((u) => u.role === "ADMIN")) return valid;

  // First run (or the table was wiped / corrupted): seed so an admin always exists.
  const seeded = await Promise.all(DEMO_ACCOUNTS.map(({ password, ...u }) => buildUser(u, password)));
  saveUsers(seeded);
  return seeded;
}

export const saveUsers = (users: StoredUser[]): void => write(USERS_KEY, users);

export function loadSession(): Session | null {
  const s = read<Session>(SESSION_KEY);
  if (!s || typeof s.userId !== "string" || typeof s.expiresAt !== "number") return null;
  if (s.expiresAt <= Date.now()) {
    write(SESSION_KEY, null);
    return null;
  }
  return s;
}

export function startSession(userId: string): Session {
  const now = Date.now();
  const session: Session = { userId, issuedAt: now, expiresAt: now + SESSION_TTL_MS };
  write(SESSION_KEY, session);
  return session;
}

export const endSession = (): void => write(SESSION_KEY, null);
