"use client";

import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, Search, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { TIER_OPTIONS } from "@/components/portal/TierPreviewToggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { IssuedCredentials, PublicUser } from "@/lib/auth/types";
import { EASE_LUXE } from "@/lib/motion";
import { ROLE_LABELS, type Role } from "@/types/domain";

const ROLE_ORDER: Record<Role, number> = { ADMIN: 0, SUPER_MEMBER: 1, MEMBER: 2 };

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const formatDate = (iso: string | null) => (iso ? dateFmt.format(new Date(iso)) : "Never");

interface UsersTableProps {
  onCredentials: (credentials: IssuedCredentials) => void;
}

export function UsersTable({ onCredentials }: UsersTableProps) {
  const { users, user: me, setUserRole, resetPassword, deleteUser } = useAuth();
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.includes(q))
      .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.name.localeCompare(b.name));
  }, [users, query]);

  const counts = useMemo(
    () => users.reduce<Record<Role, number>>((acc, u) => ({ ...acc, [u.role]: acc[u.role] + 1 }), { ADMIN: 0, MEMBER: 0, SUPER_MEMBER: 0 }),
    [users],
  );

  const onReset = async (u: PublicUser) => {
    const res = await resetPassword(u.id);
    if (res.ok) onCredentials(res.credentials);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface-raised shadow-soft transition-colors duration-700">
      <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <dl className="flex gap-6 text-sm">
          {(["MEMBER", "SUPER_MEMBER", "ADMIN"] as const).map((r) => (
            <div key={r}>
              <dt className="text-xs text-fg-subtle">{ROLE_LABELS[r]}s</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums text-fg">{counts[r]}</dd>
            </div>
          ))}
        </dl>
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <Input
            type="search"
            placeholder="Search name or email"
            aria-label="Search users"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 pl-10 text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-[0.08em] text-fg-subtle">
              <th scope="col" className="px-6 py-3 font-medium">User</th>
              <th scope="col" className="px-6 py-3 font-medium">Role</th>
              <th scope="col" className="px-6 py-3 font-medium">Last sign-in</th>
              <th scope="col" className="px-6 py-3 font-medium">Created</th>
              <th scope="col" className="px-6 py-3 text-right font-medium">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((u) => {
                const isAdmin = u.role === "ADMIN";
                const confirming = confirmDelete === u.id;
                return (
                  <motion.tr
                    key={u.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_LUXE }}
                    className="border-b border-line last:border-0 transition-colors hover:bg-surface-sunken/60"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-fg">
                        {u.name}
                        {u.id === me?.id ? <span className="ml-2 text-xs font-normal text-fg-subtle">(you)</span> : null}
                      </p>
                      <p className="text-fg-muted">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {isAdmin ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-medium text-fg-muted">
                          <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
                          Admin
                        </span>
                      ) : (
                        <SegmentedControl
                          aria-label={`Role for ${u.name}`}
                          value={u.role === "SUPER_MEMBER" ? "SUPER_MEMBER" : "MEMBER"}
                          onChange={(role) => setUserRole(u.id, role)}
                          options={TIER_OPTIONS}
                        />
                      )}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-fg-muted">{formatDate(u.lastLoginAt)}</td>
                    <td className="px-6 py-4 tabular-nums text-fg-muted">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onReset(u)} title="Generate a new password">
                          <KeyRound className="h-4 w-4" aria-hidden />
                          <span>Reset password</span>
                        </Button>
                        {!isAdmin ? (
                          confirming ? (
                            <>
                              <Button variant="danger" size="sm" onClick={() => { deleteUser(u.id); setConfirmDelete(null); }}>
                                Confirm delete
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button variant="danger" size="icon" onClick={() => setConfirmDelete(u.id)} aria-label={`Delete ${u.name}`} title="Delete user">
                              <Trash2 className="h-4 w-4" aria-hidden />
                            </Button>
                          )
                        ) : null}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
        {rows.length === 0 ? <p className="px-6 py-10 text-center text-sm text-fg-muted">No users match “{query}”.</p> : null}
      </div>
    </div>
  );
}
