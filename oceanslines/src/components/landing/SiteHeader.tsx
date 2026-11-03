"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";
import { PortalButton } from "./PortalButton";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-500 ease-luxe",
        scrolled ? "border-b border-charcoal/[0.06] bg-cashmere/75 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <div className="container flex h-[72px] items-center justify-between gap-6">
        <Link href="/" aria-label="Oceans Lines — home" className="text-[19px] sm:text-[21px]">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-9 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-sm text-slate-blue transition-colors duration-300 hover:text-charcoal after:absolute after:-bottom-1.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-gold after:transition-transform after:duration-500 after:ease-luxe hover:after:scale-x-100"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <PortalButton size="sm" className="h-10 px-4" />
      </div>
    </motion.header>
  );
}
