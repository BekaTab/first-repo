"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useT } from "@/i18n";
import type { Role } from "@/types/domain";
import { useAuth } from "./AuthProvider";

interface RequireAuthProps {
  /** Omit to allow any signed-in user. */
  roles?: readonly Role[];
  children: ReactNode;
}

/**
 * Client-side route guard for the mock auth layer.
 * - arrived signed out  → /login?next=<current path>
 * - just signed out     → /login (no `next`: the next person to sign in starts at their own home)
 * - signed in, wrong role → /portal
 * With a real backend, enforce the same rules on the server (middleware or
 * route handlers) — a client guard only controls what is rendered.
 */
export function RequireAuth({ roles, children }: RequireAuthProps) {
  const t = useT();
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = status === "authenticated" && !!user && (!roles || roles.includes(user.role));

  const wasSignedIn = useRef(false);

  useEffect(() => {
    if (status === "authenticated") wasSignedIn.current = true;
    if (status === "unauthenticated") {
      router.replace(wasSignedIn.current ? "/login" : `/login?next=${encodeURIComponent(pathname)}`);
    } else if (status === "authenticated" && !allowed) {
      router.replace("/portal");
    }
  }, [status, allowed, pathname, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-live="polite">
        <Loader2 className="h-5 w-5 animate-spin text-fg-subtle" aria-hidden />
        <span className="sr-only">{t.login.checking}</span>
      </div>
    );
  }
  return <>{children}</>;
}
