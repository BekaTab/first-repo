"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { PricingTier, Role } from "@/types/domain";
import { generatePassword, hashPassword, randomSalt, safeEqual } from "@/lib/auth/crypto";
import {
  STORAGE_KEYS,
  buildUser,
  endSession,
  loadSession,
  loadUsers,
  normalizeEmail,
  saveUsers,
  startSession,
  toPublicUser,
} from "@/lib/auth/mock-db";
import type {
  AuthStatus,
  IssuedCredentials,
  NewUserInput,
  PublicUser,
  Result,
  StoredUser,
} from "@/lib/auth/types";

type LoginError = "INVALID_CREDENTIALS";
type AdminError = "FORBIDDEN" | "NOT_FOUND" | "EMAIL_TAKEN" | "INVALID_INPUT" | "PROTECTED_USER";

export interface AuthContextValue {
  status: AuthStatus;
  user: PublicUser | null;
  /** Full user list. Empty unless the current user is an ADMIN. */
  users: PublicUser[];
  login(email: string, password: string): Promise<Result<{ user: PublicUser }, LoginError>>;
  logout(): void;
  hasRole(...roles: Role[]): boolean;
  // Admin-only actions — each re-checks the caller's role.
  createUser(input: NewUserInput): Promise<Result<{ user: PublicUser; credentials: IssuedCredentials }, AdminError>>;
  setUserRole(userId: string, role: PricingTier): Result<{ user: PublicUser }, AdminError>;
  resetPassword(userId: string): Promise<Result<{ credentials: IssuedCredentials }, AdminError>>;
  deleteUser(userId: string): Result<object, AdminError>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [sessionUserId, setSessionUserId] = useState<string | null>(null);

  // Latest users for async actions, so they never act on a stale closure.
  const usersRef = useRef<StoredUser[]>([]);
  const commitUsers = useCallback((next: StoredUser[]) => {
    usersRef.current = next;
    saveUsers(next);
    setUsers(next);
  }, []);

  const hydrate = useCallback(async () => {
    const all = await loadUsers();
    usersRef.current = all;
    setUsers(all);

    const session = loadSession();
    const valid = session && all.some((u) => u.id === session.userId);
    if (session && !valid) endSession();
    setSessionUserId(valid ? session.userId : null);
    setStatus(valid ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    void hydrate();
    // Keep tabs in sync: logging out (or an admin changing a role) in one tab applies to all.
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || (STORAGE_KEYS as readonly string[]).includes(e.key)) void hydrate();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [hydrate]);

  // The current user is derived from the table, so role changes apply immediately.
  const stored = useMemo(() => users.find((u) => u.id === sessionUserId) ?? null, [users, sessionUserId]);
  const user = useMemo(() => (stored ? toPublicUser(stored) : null), [stored]);
  const isAdmin = stored?.role === "ADMIN";

  // If the signed-in user is deleted, sign them out.
  useEffect(() => {
    if (status === "authenticated" && !stored) {
      endSession();
      setSessionUserId(null);
      setStatus("unauthenticated");
    }
  }, [status, stored]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const all = usersRef.current.length ? usersRef.current : await loadUsers();
      const candidate = all.find((u) => u.email === normalizeEmail(email));
      // Hash even when the user doesn't exist, so timing doesn't reveal which emails are registered.
      const hash = await hashPassword(password, candidate?.salt ?? randomSalt());
      if (!candidate || !safeEqual(hash, candidate.passwordHash)) return { ok: false, error: "INVALID_CREDENTIALS" };

      const updated: StoredUser = { ...candidate, lastLoginAt: new Date().toISOString() };
      commitUsers(all.map((u) => (u.id === updated.id ? updated : u)));
      startSession(updated.id);
      setSessionUserId(updated.id);
      setStatus("authenticated");
      return { ok: true, user: toPublicUser(updated) };
    },
    [commitUsers],
  );

  const logout = useCallback(() => {
    endSession();
    setSessionUserId(null);
    setStatus("unauthenticated");
  }, []);

  const hasRole = useCallback((...roles: Role[]) => !!stored && roles.includes(stored.role), [stored]);

  const createUser = useCallback<AuthContextValue["createUser"]>(
    async ({ name, email, role }) => {
      if (!isAdmin) return { ok: false, error: "FORBIDDEN" };
      if (!name.trim() || !EMAIL_RE.test(email.trim())) return { ok: false, error: "INVALID_INPUT" };
      if (usersRef.current.some((u) => u.email === normalizeEmail(email))) return { ok: false, error: "EMAIL_TAKEN" };

      const password = generatePassword();
      const created = await buildUser({ name, email, role }, password);
      commitUsers([...usersRef.current, created]);
      return { ok: true, user: toPublicUser(created), credentials: { email: created.email, password } };
    },
    [isAdmin, commitUsers],
  );

  const setUserRole = useCallback<AuthContextValue["setUserRole"]>(
    (userId, role) => {
      if (!isAdmin) return { ok: false, error: "FORBIDDEN" };
      const target = usersRef.current.find((u) => u.id === userId);
      if (!target) return { ok: false, error: "NOT_FOUND" };
      if (target.role === "ADMIN") return { ok: false, error: "PROTECTED_USER" };

      const updated: StoredUser = { ...target, role };
      commitUsers(usersRef.current.map((u) => (u.id === userId ? updated : u)));
      return { ok: true, user: toPublicUser(updated) };
    },
    [isAdmin, commitUsers],
  );

  const resetPassword = useCallback<AuthContextValue["resetPassword"]>(
    async (userId) => {
      if (!isAdmin) return { ok: false, error: "FORBIDDEN" };
      const target = usersRef.current.find((u) => u.id === userId);
      if (!target) return { ok: false, error: "NOT_FOUND" };

      const password = generatePassword();
      const salt = randomSalt();
      const updated: StoredUser = { ...target, salt, passwordHash: await hashPassword(password, salt) };
      commitUsers(usersRef.current.map((u) => (u.id === userId ? updated : u)));
      return { ok: true, credentials: { email: updated.email, password } };
    },
    [isAdmin, commitUsers],
  );

  const deleteUser = useCallback<AuthContextValue["deleteUser"]>(
    (userId) => {
      if (!isAdmin) return { ok: false, error: "FORBIDDEN" };
      const target = usersRef.current.find((u) => u.id === userId);
      if (!target) return { ok: false, error: "NOT_FOUND" };
      if (target.role === "ADMIN") return { ok: false, error: "PROTECTED_USER" };
      commitUsers(usersRef.current.filter((u) => u.id !== userId));
      return { ok: true };
    },
    [isAdmin, commitUsers],
  );

  const publicUsers = useMemo(() => (isAdmin ? users.map(toPublicUser) : []), [isAdmin, users]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      users: publicUsers,
      login,
      logout,
      hasRole,
      createUser,
      setUserRole,
      resetPassword,
      deleteUser,
    }),
    [status, user, publicUsers, login, logout, hasRole, createUser, setUserRole, resetPassword, deleteUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
