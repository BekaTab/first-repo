import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PricingTier, Role } from "@/types/domain";

export type PortalTheme = "member" | "super";

interface PortalThemeState {
  /** Which tier an ADMIN is previewing. Ignored for other roles. */
  adminPreviewTier: PricingTier;
  setAdminPreviewTier(tier: PricingTier): void;
}

export const usePortalThemeStore = create<PortalThemeState>()(
  persist(
    (set) => ({
      adminPreviewTier: "MEMBER",
      setAdminPreviewTier: (adminPreviewTier) => set({ adminPreviewTier }),
    }),
    {
      name: "oceanslines.portal-theme.v1",
      storage: createJSONStorage(() => localStorage),
      // Rehydrated on the client by <PortalThemeScope>, avoiding SSR mismatches.
      skipHydration: true,
    },
  ),
);

/** Members and super members get their own tier; admins get whichever tier they preview. */
export const resolvePricingTier = (role: Role, adminPreviewTier: PricingTier): PricingTier =>
  role === "ADMIN" ? adminPreviewTier : role;

export const themeForTier = (tier: PricingTier): PortalTheme => (tier === "SUPER_MEMBER" ? "super" : "member");
