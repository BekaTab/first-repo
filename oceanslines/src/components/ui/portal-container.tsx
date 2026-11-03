"use client";

import { createContext, useContext } from "react";

/**
 * Radix portals (select menus, dialogs) render outside the React tree's DOM
 * position. Mounting them inside the themed scope element keeps them inside
 * the `[data-portal-theme]` CSS variables. `null` = document.body.
 */
export const PortalContainerContext = createContext<HTMLElement | null>(null);

export const usePortalContainer = () => useContext(PortalContainerContext);
