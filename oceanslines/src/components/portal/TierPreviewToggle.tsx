"use client";

import { SegmentedControl, type SegmentOption } from "@/components/ui/segmented-control";
import { usePortalThemeStore } from "@/store/portal-theme-store";
import { PRICING_TIERS, ROLE_LABELS, type PricingTier } from "@/types/domain";

export const TIER_OPTIONS: readonly SegmentOption<PricingTier>[] = PRICING_TIERS.map((t) => ({ value: t, label: ROLE_LABELS[t] }));

/** Admin-only: preview prices and theme as either member tier. */
export function TierPreviewToggle() {
  const tier = usePortalThemeStore((s) => s.adminPreviewTier);
  const setTier = usePortalThemeStore((s) => s.setAdminPreviewTier);
  return <SegmentedControl aria-label="Preview portal as" value={tier} onChange={setTier} options={TIER_OPTIONS} />;
}
