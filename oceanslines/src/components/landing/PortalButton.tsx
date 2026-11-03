"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { buttonVariants, type ButtonSize } from "@/components/ui/button";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";

interface PortalButtonProps {
  size?: ButtonSize;
  /** Use the short label below `sm` (header on phones). */
  compact?: boolean;
  className?: string;
}

/** "Portal Login" for visitors; "Open portal" once signed in. */
export function PortalButton({ size = "md", compact, className }: PortalButtonProps) {
  const t = useT();
  const { status, user } = useAuth();
  const signedIn = status === "authenticated" && user;
  const href = signedIn ? (user.role === "ADMIN" ? "/admin" : "/portal") : "/login";
  const label = signedIn ? t.nav.openPortal : t.nav.portalLogin;

  return (
    <Link href={href} className={buttonVariants({ variant: "luxe", size, className: cn("group", className) })}>
      {compact && !signedIn ? (
        <>
          <span className="sm:hidden">{t.nav.portalLoginShort}</span>
          <span className="hidden sm:inline">{label}</span>
        </>
      ) : (
        label
      )}
      <ArrowUpRight
        aria-hidden
        className="h-4 w-4 text-gold transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
