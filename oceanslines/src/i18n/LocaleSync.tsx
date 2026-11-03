"use client";

import { useEffect } from "react";
import { useLocaleStore, useT } from ".";

/** Restores the saved language after hydration and keeps <html lang> in sync. */
export function LocaleSync() {
  const t = useT();

  useEffect(() => {
    void useLocaleStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    document.documentElement.lang = t.meta.htmlLang;
  }, [t]);

  return null;
}
