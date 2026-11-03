"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { usePricingTier } from "@/hooks/use-pricing-tier";
import { useCalculatorStore } from "@/store/calculator-store";
import { ROLE_LABELS } from "@/types/domain";
import { cn } from "@/lib/utils";
import { TierPreviewToggle } from "./TierPreviewToggle";

export function PortalHeader() {
  const { user, logout } = useAuth();
  const { theme } = usePricingTier();
  const pathname = usePathname();
  const router = useRouter();
  const resetCalculator = useCalculatorStore((s) => s.reset);

  if (!user) return null;
  const isAdmin = user.role === "ADMIN";

  const links = [
    { href: "/portal", label: "Calculator" },
    ...(isAdmin ? [{ href: "/admin", label: "Users" }] : []),
  ];

  const signOut = () => {
    resetCalculator();
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface-raised/80 backdrop-blur-xl transition-colors duration-700">
      <div className="container flex h-16 items-center gap-4">
        <Link href="/" aria-label="Oceans Lines — home" className="shrink-0 text-[17px]">
          <Logo tone={theme === "super" ? "inverse" : "brand"} />
        </Link>

        <nav aria-label="Portal" className="ml-2 hidden items-center gap-1 sm:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? "page" : undefined}
              className={cn(
                "rounded-lg px-3 py-2 text-sm transition-colors duration-300",
                pathname === l.href ? "bg-surface-sunken text-fg" : "text-fg-muted hover:text-fg",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {isAdmin ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="text-xs text-fg-subtle">Preview as</span>
              <TierPreviewToggle />
            </div>
          ) : null}
          <div className="hidden text-right leading-tight lg:block">
            <p className="text-sm text-fg">{user.name}</p>
            <p className="text-xs text-accent">{ROLE_LABELS[user.role]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out" title="Sign out">
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Below md: admin nav + tier preview move to a second row. */}
      {isAdmin ? (
        <div className="container flex items-center justify-between gap-3 pb-3 md:hidden">
          <nav aria-label="Portal" className="flex items-center gap-1 sm:invisible">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-sm",
                  pathname === l.href ? "bg-surface-sunken text-fg" : "text-fg-muted",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <TierPreviewToggle />
        </div>
      ) : null}
    </header>
  );
}
