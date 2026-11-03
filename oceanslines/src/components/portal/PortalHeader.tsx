"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { usePricingTier } from "@/hooks/use-pricing-tier";
import { useCalculatorStore } from "@/store/calculator-store";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useT } from "@/i18n";
import { cn } from "@/lib/utils";
import { TierPreviewToggle } from "./TierPreviewToggle";

export function PortalHeader() {
  const t = useT();
  const { user, logout } = useAuth();
  const { theme } = usePricingTier();
  const pathname = usePathname();
  const router = useRouter();
  const resetCalculator = useCalculatorStore((s) => s.reset);

  if (!user) return null;
  const isAdmin = user.role === "ADMIN";

  const links = [
    { href: "/portal", label: t.portal.calculator },
    ...(isAdmin ? [{ href: "/admin", label: t.portal.users }] : []),
  ];

  const signOut = () => {
    resetCalculator();
    logout();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface-raised/80 backdrop-blur-xl transition-colors duration-700">
      <div className="container flex h-16 items-center gap-3 sm:gap-4">
        <Link href="/" aria-label={t.common.homeAria} className="shrink-0 text-[15px] sm:text-[17px]">
          <Logo tone={theme === "super" ? "inverse" : "brand"} />
        </Link>

        <nav aria-label={t.portal.navAria} className="ml-2 hidden items-center gap-1 sm:flex">
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
              <span className="text-xs text-fg-subtle">{t.portal.previewAs}</span>
              <TierPreviewToggle />
            </div>
          ) : null}
          <div className="hidden text-right leading-tight lg:block">
            <p className="text-sm text-fg">{user.name}</p>
            <p className="text-xs text-accent">{t.roles[user.role]}</p>
          </div>
          <LanguageSwitch tone="portal" />
          <Button variant="ghost" size="icon" onClick={signOut} aria-label={t.portal.signOut} title={t.portal.signOut}>
            <LogOut className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      {/* Below md: admin nav + tier preview move to a second row. */}
      {isAdmin ? (
        <div className="container flex items-center justify-between gap-3 pb-3 md:hidden">
          <nav aria-label={t.portal.navAria} className="flex items-center gap-1 sm:invisible">
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
