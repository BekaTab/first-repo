"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LocaleSync } from "@/i18n/LocaleSync";

export function Providers({ children }: { children: ReactNode }) {
  return (
    // Honour the OS "reduce motion" setting for every Framer Motion animation.
    <MotionConfig reducedMotion="user">
      <LocaleSync />
      <AuthProvider>{children}</AuthProvider>
    </MotionConfig>
  );
}
