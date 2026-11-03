"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { resolvePricingTier, themeForTier, usePortalThemeStore, type PortalTheme } from "@/store/portal-theme-store";
import type { PricingTier } from "@/types/domain";

/** The tier that drives both pricing and the portal theme for the signed-in user. */
export function usePricingTier(): { tier: PricingTier; theme: PortalTheme } {
  const { user } = useAuth();
  const preview = usePortalThemeStore((s) => s.adminPreviewTier);
  const tier = resolvePricingTier(user?.role ?? "MEMBER", preview);
  return { tier, theme: themeForTier(tier) };
}
