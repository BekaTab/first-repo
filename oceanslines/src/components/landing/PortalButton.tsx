"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { buttonVariants, type ButtonSize } from "@/components/ui/button";

/** "Portal Login" for visitors; "Open portal" once signed in. */
export function PortalButton({ size = "md", className }: { size?: ButtonSize; className?: string }) {
  const { status, user } = useAuth();
  const signedIn = status === "authenticated" && user;
  const href = signedIn ? (user.role === "ADMIN" ? "/admin" : "/portal") : "/login";

  return (
    <Link href={href} className={buttonVariants({ variant: "luxe", size, className: `group ${className ?? ""}` })}>
      {signedIn ? "Open portal" : "Portal Login"}
      <ArrowUpRight
        aria-hidden
        className="h-4 w-4 text-gold transition-transform duration-500 ease-luxe group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </Link>
  );
}
