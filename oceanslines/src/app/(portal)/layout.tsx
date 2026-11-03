import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { PortalHeader } from "@/components/portal/PortalHeader";
import { PortalThemeScope } from "@/components/portal/PortalThemeScope";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalThemeScope>
      <RequireAuth>
        <PortalHeader />
        <main className="container py-10 sm:py-14">{children}</main>
      </RequireAuth>
    </PortalThemeScope>
  );
}
