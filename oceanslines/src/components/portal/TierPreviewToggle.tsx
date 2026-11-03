"use client";

import { useMemo } from "react";
import { SegmentedControl, type SegmentOption } from "@/components/ui/segmented-control";
import { useT } from "@/i18n";
import { usePortalThemeStore } from "@/store/portal-theme-store";
import { PRICING_TIERS, type PricingTier } from "@/types/domain";

/** Member / Super Member options in the active language. */
export function useTierOptions(): readonly SegmentOption<PricingTier>[] {
  const t = useT();
  return useMemo(() => PRICING_TIERS.map((tier) => ({ value: tier, label: t.roles[tier] })), [t]);
}

/** Admin-only: preview prices and theme as either member tier. */
export function TierPreviewToggle() {
  const tier = usePortalThemeStore((s) => s.adminPreviewTier);
  const setTier = usePortalThemeStore((s) => s.setAdminPreviewTier);
  const t = useT();
  const options = useTierOptions();
  return <SegmentedControl aria-label={t.portal.previewAs} value={tier} onChange={setTier} options={options} />;
}
