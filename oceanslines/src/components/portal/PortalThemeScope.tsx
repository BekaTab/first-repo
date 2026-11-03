"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PortalContainerContext } from "@/components/ui/portal-container";
import { usePricingTier } from "@/hooks/use-pricing-tier";
import { usePortalThemeStore } from "@/store/portal-theme-store";

/**
 * Applies the role theme. Everything inside — including Radix portals, which
 * are mounted into this element — reads the `[data-portal-theme]` variables,
 * so the same markup renders as MEMBER (light corporate) or SUPER_MEMBER
 * (obsidian & gold).
 */
export function PortalThemeScope({ children }: { children: ReactNode }) {
  const { theme } = usePricingTier();
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    void usePortalThemeStore.persist.rehydrate();
  }, []);

  return (
    <div
      ref={setContainer}
      data-portal-theme={theme}
      className="min-h-[100dvh] bg-surface text-fg transition-colors duration-700 ease-luxe"
    >
      <PortalContainerContext.Provider value={container}>{children}</PortalContainerContext.Provider>
    </div>
  );
}
