import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, MotionConfig, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { ArrowRight, Check, Menu, Minus, Plus, ShoppingBag, X } from "lucide-react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/*  Brand — change the name, currency and default language here        */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: "LuxePet",
  currency: "USD",
  locale: "en-US", // price formatting, the same in both languages
  defaultLang: "ka", // "ka" or "en"; a visitor's own choice is remembered
};

/* ------------------------------------------------------------------ */
/*  Site text — Georgian and English                                   */
/* ------------------------------------------------------------------ */
export const TEXT = {
  ka: {
    title: "LuxePet — ნივთები ოთხფეხა მეგობრებისთვის",
    tagline: "გააზრებული ნივთები ოთხფეხა მეგობრებისთვის, რომლებთანაც სახლს ვიზიარებთ.",
    season: "შემოდგომა — ზამთარი 2026",
    nav: { collection: "კოლექცია", walk: "სეირნობა", sleep: "ძილი", eat: "კვება", about: "ჩვენ შესახებ" },
    all: "ყველა",
    menuOpen: "მენიუს გახსნა",
    menuClose: "მენიუს დახურვა",
    home: "მთავარი",
    bagOpen: (n) => `კალათის გახსნა, ${n} ნივთი`,
    headline: ["მშვიდი ნივთები", "ერთგული", "მეგობრებისთვის."],
    heroCopy: "ტყავი, მატყლი და კერამიკა, მცირე რაოდენობით დამზადებული სახელოსნოებში, რომლებსაც ვენდობით. შექმნილია იმისთვის, რომ წლობით გემსახუროთ.",
    cta: "კოლექციის ნახვა",
    heroAlt: "ნაცრისფერი ძაღლი მზით განათებულ ოთახში",
    captionLeft: "ატელიეს კოლექცია — № 04",
    captionRight: "ბუკლე, მუხა და მატყლი",
    houseEyebrow: "ჩვენ შესახებ",
    statement: ["ვქმნით ცოტას და ნელა, იმ ცხოველებისთვის, ვინც სახლს ", "სითბოთი", " ავსებს."],
    principles: [
      { title: "მასალები", text: "ნატურალური ტყავი, შეუღებავი მატყლი და კერამიკა, შერჩეული იმის მიხედვით, როგორ ლამაზდება დროთა განმავლობაში." },
      { title: "ატელიე", text: "თითოეული ნივთი ხელით მზადდება ტოსკანაში, კიოტოში ან შოტლანდიაში, მაქსიმუმ რამდენიმე ასეული ეგზემპლარით." },
      { title: "მოვლა", text: "უფასო შეკეთება ნივთის მთელი სიცოცხლის განმავლობაში. ტყავს ხელახლა ვკერავთ, მატყლს ვაღდგენთ, არაფერს ვყრით." },
    ],
    collectionEyebrow: "კოლექცია",
    collectionTitle: ["ყოველდღიური ", "ფუფუნება"],
    filterLabel: "კატეგორიის ფილტრი",
    no: "№",
    addToBag: "კალათაში დამატება",
    added: "დამატებულია",
    addAria: (name) => `${name} — კალათაში დამატება`,
    bagTitle: "კალათა",
    bagClose: "კალათის დახურვა",
    decrease: (name) => `${name} — რაოდენობის შემცირება`,
    increase: (name) => `${name} — რაოდენობის გაზრდა`,
    quantity: (q) => `რაოდენობა ${q}`,
    remove: "წაშლა",
    doneTitle: "გმადლობთ",
    doneText: (o, total) => `შეკვეთა ${o.number} დადასტურებულია: ${o.items} ნივთი, ${total}. დადასტურებას ელფოსტით მიიღებთ.`,
    demoNote: "ეს სადემონსტრაციო ვერსიაა, თანხა არ ჩამოგეჭრებათ.",
    continue: "დათვალიერების გაგრძელება",
    emptyTitle: "კალათა ცარიელია",
    emptyText: "აქ დაგხვდებათ ნივთები, რომლებსაც დაამატებთ.",
    emptyCta: "კოლექციის ნახვა",
    subtotal: "ჯამი",
    shippingNote: "მიწოდება და დაბრუნება უფასოა. გადასახადები გამოითვლება გადახდისას.",
    checkout: "გადახდაზე გადასვლა",
    processing: "მუშავდება",
    letterEyebrow: "სიახლეები",
    letterText: "იშვიათი წერილები ახალ ნივთებზე, მასალებსა და სახელოსნოებზე.",
    emailLabel: "ელფოსტა",
    subscribe: "გამოწერა",
    emailError: "შეიყვანეთ სწორი ელფოსტის მისამართი.",
    thanks: "გმადლობთ, სიაში ხართ.",
    footerLinks: [
      { heading: "მომხმარებლებს", links: ["მიწოდება და დაბრუნება", "მოვლა და შეკეთება", "კონტაქტი"] },
      { heading: "ბრენდი", links: ["ჩვენი ისტორია", "სახელოსნოები", "ჟურნალი"] },
    ],
    rights: "ყველა უფლება დაცულია.",
    langLabel: "ენა",
  },
  en: {
    title: "LuxePet — Objects for the considered companion",
    tagline: "Considered objects for the companions who share our homes.",
    season: "Autumn — Winter 2026",
    nav: { collection: "Collection", walk: "Walk", sleep: "Sleep", eat: "Eat", about: "About" },
    all: "All",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    home: "home",
    bagOpen: (n) => `Open bag, ${n} ${n === 1 ? "item" : "items"}`,
    headline: ["Quiet objects", "for loyal", "companions."],
    heroCopy: "Leather, wool and stoneware, made in small numbers by the workshops we trust. Designed to be lived with — and kept — for a lifetime.",
    cta: "Explore Collection",
    heroAlt: "A grey dog resting in a sunlit interior",
    captionLeft: "The Atelier Edit — No. 04",
    captionRight: "Bouclé, oak & wool",
    houseEyebrow: "The House",
    statement: ["We make very few things, slowly, for the animals who make a house a ", "home", "."],
    principles: [
      { title: "Materials", text: "Full-grain leathers, undyed wools and stoneware clays, chosen for how they age rather than how they arrive." },
      { title: "Atelier", text: "Every piece is made by hand in Tuscany, Kyoto or the Scottish Borders, in runs of a few hundred at most." },
      { title: "Care", text: "Complimentary repairs for the life of the piece. Leather is re-stitched, wool re-felted, nothing thrown away." },
    ],
    collectionEyebrow: "The Collection",
    collectionTitle: ["Considered ", "essentials"],
    filterLabel: "Filter by category",
    no: "No.",
    addToBag: "Add to Bag",
    added: "Added",
    addAria: (name) => `Add ${name} to bag`,
    bagTitle: "Your Bag",
    bagClose: "Close bag",
    decrease: (name) => `Decrease quantity of ${name}`,
    increase: (name) => `Increase quantity of ${name}`,
    quantity: (q) => `Quantity ${q}`,
    remove: "Remove",
    doneTitle: "Thank you",
    doneText: (o, total) => `Order ${o.number} is confirmed — ${o.items} ${o.items === 1 ? "piece" : "pieces"}, ${total}. A confirmation will follow by email.`,
    demoNote: "This is a demonstration; no payment was taken.",
    continue: "Continue Exploring",
    emptyTitle: "Your bag is empty",
    emptyText: "Pieces you add will rest here until you are ready.",
    emptyCta: "Explore the Collection",
    subtotal: "Subtotal",
    shippingNote: "Complimentary delivery and returns. Duties and taxes calculated at checkout.",
    checkout: "Proceed to Checkout",
    processing: "Processing",
    letterEyebrow: "The Letter",
    letterText: "Occasional notes on new pieces, materials and the workshops behind them.",
    emailLabel: "Email address",
    subscribe: "Subscribe",
    emailError: "Please enter a valid email address.",
    thanks: "Thank you — you are on the list.",
    footerLinks: [
      { heading: "Client Services", links: ["Shipping & Returns", "Care & Repairs", "Contact"] },
      { heading: "The House", links: ["About", "Workshops", "Journal"] },
    ],
    rights: "All rights reserved.",
    langLabel: "Language",
  },
};
const LANGS = [
  { id: "ka", short: "ქა", name: "ქართული" },
  { id: "en", short: "EN", name: "English" },
];

/*
  Palette (used as Tailwind arbitrary values throughout):
    #F9F9F8  alabaster background      #2C2C2C  deep charcoal text
    #E6E2DD  cashmere beige accent     #A9A297  subtle taupe accent
    #1A1A1A  CTA charcoal              #E5E5E5  1px dividers
*/

// one easing curve for every transition: a long, soft deceleration
const EASE = [0.22, 1, 0.36, 1];
const MAX_QTY = 10;

/* ------------------------------------------------------------------ */
/*  Catalogue                                                          */
/* ------------------------------------------------------------------ */
// Unsplash CDN image; `w` is the rendered width requested from the CDN
const unsplash = (id, w) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
const srcSetFor = (id) => [600, 900, 1400].map((w) => `${unsplash(id, w)} ${w}w`).join(", ");

// labels come from TEXT[lang].nav (and TEXT[lang].all)
export const CATEGORIES = ["all", "walk", "sleep", "eat"];

// name and material are given per language
export const PRODUCTS = [
  {
    id: "leash-01",
    name: { ka: "ხელით ნაკერი ტყავის საბელი", en: "Hand-stitched Leather Leash" },
    category: "walk",
    material: { ka: "ტოსკანური ნატურალური ტყავი, თითბერი", en: "Vegetable-tanned Tuscan leather, solid brass" },
    price: 340,
    image: "1601758228041-f3b2795255f1",
  },
  {
    id: "collar-02",
    name: { ka: "ინგლისური ტყავის საყელური", en: "Bridle Leather Collar" },
    category: "walk",
    material: { ka: "ინგლისური ტყავი, ხელით ნაკერი", en: "English bridle leather, saddle-stitched" },
    price: 280,
    image: "1587300003388-59208cc962cb",
  },
  {
    id: "coat-03",
    name: { ka: "კაშმირის ნაქსოვი პალტო", en: "Cashmere Rib Coat" },
    category: "walk",
    material: { ka: "მონღოლური კაშმირი, ხელით დასრულებული", en: "Mongolian cashmere, hand-finished" },
    price: 620,
    image: "1583337130417-3346a1be7dee",
  },
  {
    id: "bed-04",
    name: { ka: "ბუკლეს ორთოპედიული საწოლი", en: "Memory Foam Bouclé Bed" },
    category: "sleep",
    material: { ka: "მატყლის ბუკლე, მუხის ძირი, მოსახსნელი გადასაკრავი", en: "Wool bouclé, oak base, removable cover" },
    price: 1450,
    image: "1541781774459-bb2af2f05b55",
  },
  {
    id: "throw-05",
    name: { ka: "მერინოს სამოგზაურო პლედი", en: "Merino Travel Throw" },
    category: "sleep",
    material: { ka: "შოტლანდიური მერინო, ხელით დამუშავებული კიდე", en: "Scottish merino, blanket-stitched edge" },
    price: 390,
    image: "1514888286974-6c03e2ca1dba",
  },
  {
    id: "dining-06",
    name: { ka: "მქრქალი კერამიკის სასადილო ნაკრები", en: "Matte Ceramic Dining Set" },
    category: "eat",
    material: { ka: "კერამიკა, ხელით მოჭიქული კიოტოში", en: "Stoneware, hand-glazed in Kyoto" },
    price: 260,
    image: "1548199973-03cce0bbc87b",
  },
  {
    id: "feeder-07",
    name: { ka: "კაკლის ხის სადგამი ჯამებით", en: "Walnut Elevated Feeder" },
    category: "eat",
    material: { ka: "მასიური ამერიკული კაკალი, ორი კერამიკული ჯამი", en: "Solid American walnut, two ceramic bowls" },
    price: 520,
    image: "1543466835-00a7907e9de1",
  },
  {
    id: "carafe-08",
    name: { ka: "ხელით ნაბერი მინის სურა", en: "Mouth-blown Water Carafe" },
    category: "eat",
    material: { ka: "ბოჰემური ბროლი, ტრავერტინის საფენი", en: "Bohemian crystal glass, travertine coaster" },
    price: 210,
    image: "1574158622682-e40e69881006",
  },
];

const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const HERO_IMAGE = "1450778869180-41d0601e046e";

const money = new Intl.NumberFormat(BRAND.locale, { style: "currency", currency: BRAND.currency, maximumFractionDigits: 0 });
const formatPrice = (n) => money.format(n);

/* ------------------------------------------------------------------ */
/*  Bag store (Zustand) — the cart persists in localStorage            */
/* ------------------------------------------------------------------ */
const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

export const useBag = create(
  persist(
    (set) => ({
      // lines keep the order in which pieces were added: [{ id, qty }]
      lines: [],
      isOpen: false,
      add: (id) =>
        set((s) => {
          if (!PRODUCT_BY_ID[id]) return s;
          const found = s.lines.find((l) => l.id === id);
          return {
            lines: found ? s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(l.qty + 1) } : l)) : [...s.lines, { id, qty: 1 }],
          };
        }),
      setQty: (id, qty) => set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "luxepet-bag",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      // drop anything stale or malformed (e.g. a product that was removed from the catalogue)
      merge: (persisted, current) => {
        const raw = persisted && Array.isArray(persisted.lines) ? persisted.lines : [];
        const lines = raw.filter((l) => l && PRODUCT_BY_ID[l.id] && Number.isFinite(l.qty)).map((l) => ({ id: l.id, qty: clampQty(l.qty) }));
        return { ...current, lines };
      },
    },
  ),
);

/* ------------------------------------------------------------------ */
/*  Language (Zustand) — the visitor's choice persists in localStorage */
/* ------------------------------------------------------------------ */
export const useLang = create(
  persist((set) => ({ lang: BRAND.defaultLang, setLang: (lang) => set({ lang }) }), {
    name: "luxepet-lang",
    storage: createJSONStorage(() => localStorage),
    merge: (persisted, current) => ({ ...current, lang: persisted && TEXT[persisted.lang] ? persisted.lang : current.lang }),
  }),
);
// the current language's text, plus `lang` for per-language product fields
const useT = () => {
  const lang = useLang((s) => s.lang);
  return { ...TEXT[lang], lang };
};

const selectCount = (s) => s.lines.reduce((n, l) => n + l.qty, 0);
const selectSubtotal = (s) => s.lines.reduce((sum, l) => sum + PRODUCT_BY_ID[l.id].price * l.qty, 0);

/* ------------------------------------------------------------------ */
/*  Logo — one continuous line: a seated greyhound                     */
/* ------------------------------------------------------------------ */
const GREYHOUND =
  "M4.5 41.8C6.2 44.2 9 45 12 44.6C8.4 41.2 8.6 34.2 13.2 30.4C16.8 27.6 19.2 23.6 20.6 19.2C21.8 15.2 23.2 11.4 25.8 9.6Q24.4 8.4 22.8 9.2Q24.8 7.6 27.4 8.2C30.6 8.6 34.6 10 38.8 11.8C36 12.9 32.4 12.7 29.8 13.8C29 17.2 29.6 21 31.2 24.4C32.6 27.6 31.6 31 28.8 32.8C28.2 36.4 28.6 40.6 29 44.6H32.2";

function LogoMark({ className = "", strokeWidth = 1.6 }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={GREYHOUND} />
    </svg>
  );
}

function Logo({ onClick }) {
  const t = useT();
  return (
    <a href="#top" onClick={onClick} className="group inline-flex items-center gap-2.5 text-[#2C2C2C]" aria-label={`${BRAND.name} — ${t.home}`}>
      <LogoMark className="h-8 w-8 transition-transform duration-700 ease-out group-hover:-translate-y-0.5" />
      <span className="font-serif text-[21px] leading-none tracking-[0.08em]">{BRAND.name}</span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared pieces                                                      */
/* ------------------------------------------------------------------ */
// Image with a quiet branded fallback, so a missing photo never shows a broken icon
function Photo({ id, alt, sizes, eager = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-[#E6E2DD] ${className}`}>
        <LogoMark className="w-1/3 max-w-[160px] text-[#A9A297]" strokeWidth={0.7} />
      </div>
    );
  }
  return (
    <img
      src={unsplash(id, 900)}
      srcSet={srcSetFor(id)}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}

function Eyebrow({ children, className = "" }) {
  return <p className={`text-[11px] font-medium uppercase tracking-[0.28em] text-[#A9A297] ${className}`}>{children}</p>;
}

// Fades and lifts its children once, when they first scroll into view
function Reveal({ children, delay = 0, className = "", as = "div" }) {
  const Tag = motion[as];
  return (
    <Tag initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-10% 0px" }} transition={{ duration: 1.1, ease: EASE, delay }} className={className}>
      {children}
    </Tag>
  );
}

// Smooth-scrolls to a section, leaving room for the fixed header
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */
const NAV = ["walk", "sleep", "eat"];

// ქა / EN switch; the active language is solid, the other one taupe
function LangSwitch() {
  const t = useT();
  const setLang = useLang((s) => s.setLang);
  return (
    <div role="group" aria-label={t.langLabel} className="flex items-center text-[11px] font-medium tracking-[0.12em]">
      {LANGS.map((l, i) => (
        <React.Fragment key={l.id}>
          {i > 0 && (
            <span className="px-1 text-[#E5E5E5]" aria-hidden="true">
              /
            </span>
          )}
          <button
            type="button"
            lang={l.id}
            onClick={() => setLang(l.id)}
            aria-pressed={t.lang === l.id}
            aria-label={l.name}
            className={`inline-flex h-11 items-center px-1 transition-colors duration-500 ${t.lang === l.id ? "text-[#2C2C2C]" : "text-[#A9A297] hover:text-[#2C2C2C]"}`}
          >
            {l.short}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

function BagButton() {
  const t = useT();
  const count = useBag(selectCount);
  const open = useBag((s) => s.open);
  return (
    <button
      type="button"
      onClick={open}
      className="relative -mr-2 inline-flex h-11 w-11 items-center justify-center text-[#2C2C2C] transition-opacity duration-500 hover:opacity-60"
      aria-label={t.bagOpen(count)}
    >
      <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.25} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute right-0.5 top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#1A1A1A] px-1 text-[9.5px] font-medium tabular-nums leading-none text-[#F9F9F8]"
            aria-hidden="true"
          >
            {count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function Header({ onPickCategory }) {
  const t = useT();
  const [scrolled, setScrolled] = useState(() => typeof window !== "undefined" && window.scrollY > 24);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // the mobile menu locks page scroll and closes with Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const pick = (category) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    onPickCategory(category);
  };
  const goTo = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    scrollToId(id);
  };

  const linkClass =
    "relative py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C] after:absolute after:inset-x-0 after:bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-[#2C2C2C] after:transition-transform after:delay-100 after:duration-700 after:ease-[cubic-bezier(.22,1,.36,1)] hover:after:scale-x-100";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-700 ease-out ${
          scrolled || menuOpen ? "border-b border-[#E5E5E5]/70 bg-[#F9F9F8]/75 backdrop-blur-xl backdrop-saturate-150" : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto grid h-[72px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-8 lg:px-14">
          {/* left: links on desktop, menu toggle on mobile */}
          <nav className="hidden items-center gap-7 md:flex lg:gap-9" aria-label={t.nav.collection}>
            <a href="#collection" onClick={pick("all")} className={linkClass}>
              {t.nav.collection}
            </a>
            {NAV.map((c) => (
              <a key={c} href="#collection" onClick={pick(c)} className={linkClass}>
                {t.nav[c]}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="-ml-2 inline-flex h-11 w-11 items-center justify-center text-[#2C2C2C] md:hidden"
            aria-label={menuOpen ? t.menuClose : t.menuOpen}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X className="h-5 w-5" strokeWidth={1.25} /> : <Menu className="h-5 w-5" strokeWidth={1.25} />}
          </button>

          <Logo onClick={goTo("top")} />

          <div className="flex items-center justify-end gap-3 sm:gap-6 lg:gap-9">
            <a href="#about" onClick={goTo("about")} className={`${linkClass} hidden lg:inline-block`}>
              {t.nav.about}
            </a>
            {/* on phones the language switch lives in the menu, leaving room for the logo */}
            <div className="hidden sm:block">
              <LangSwitch />
            </div>
            <BagButton />
          </div>
        </div>
      </header>

      {/* mobile menu: full-screen, large serif links */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-30 bg-[#F9F9F8] px-5 pt-[120px] sm:px-8 md:hidden"
          >
            <nav aria-label={t.nav.collection}>
              <ul className="space-y-1">
                {["all", ...NAV].map((c, i) => (
                  <motion.li key={c} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.08 + i * 0.06 }}>
                    <a href="#collection" onClick={pick(c)} className="block border-b border-[#E5E5E5] py-5 font-serif text-[34px] leading-none text-[#2C2C2C] [&:lang(ka)]:text-[28px]">
                      {c === "all" ? t.nav.collection : t.nav[c]}
                    </a>
                  </motion.li>
                ))}
                <motion.li initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.32 }}>
                  <a href="#about" onClick={goTo("about")} className="block border-b border-[#E5E5E5] py-5 font-serif text-[34px] leading-none text-[#2C2C2C] [&:lang(ka)]:text-[28px]">
                    {t.nav.about}
                  </a>
                </motion.li>
              </ul>
            </nav>
            <p className="mt-12 max-w-[30ch] text-[13px] leading-relaxed text-[#A9A297]">{t.tagline}</p>
            <div className="mt-6">
              <LangSwitch />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */
function Hero() {
  const t = useT();
  // Georgian words run longer, so the Georgian headline is set a size smaller with more leading
  const headlineSize = t.lang === "ka" ? "text-[34px] leading-[1.22] sm:text-[46px] lg:text-[58px]" : "text-[44px] leading-[1.04] sm:text-[56px] lg:text-[76px]";
  return (
    <section id="top" className="mx-auto max-w-[1440px] px-5 pb-24 pt-[104px] sm:px-8 md:pb-36 md:pt-[136px] lg:px-14">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10 lg:gap-16">
        {/* copy column — sits low, letting the image lead */}
        <div className="order-2 flex flex-col justify-end md:order-1 md:col-span-5 md:pb-6">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, ease: EASE, delay: 0.1 }}>
            <Eyebrow>{t.season}</Eyebrow>
          </motion.div>

          {/* keyed by language so the line reveal replays when the language changes */}
          <h1 key={t.lang} className={`mt-6 font-serif font-normal tracking-[-0.015em] text-[#2C2C2C] ${headlineSize}`}>
            {t.headline.map((line, i) => (
              <span key={line} className="block overflow-hidden pb-[0.08em]">
                <motion.span className={`block ${i === 2 ? "italic" : ""}`} initial={{ y: "110%" }} animate={{ y: "0%" }} transition={{ duration: 1.3, ease: EASE, delay: 0.25 + i * 0.14 }}>
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: EASE, delay: 0.85 }}>
            <p className="mt-8 max-w-[38ch] text-[15px] font-light leading-[1.8] text-[#2C2C2C]/75">{t.heroCopy}</p>
            <a
              href="#collection"
              onClick={(e) => {
                e.preventDefault();
                scrollToId("collection");
              }}
              className="group mt-11 inline-flex items-center gap-4 bg-[#1A1A1A] px-9 py-[18px] text-[11px] font-medium uppercase tracking-[0.26em] text-[#F9F9F8] transition-colors delay-75 duration-700 hover:bg-[#2C2C2C]"
            >
              {t.cta}
              <ArrowRight className="h-3.5 w-3.5 transition-transform delay-100 duration-700 ease-out group-hover:translate-x-1" strokeWidth={1.25} />
            </a>
          </motion.div>
        </div>

        {/* image column — revealed from the bottom, then settles */}
        <figure className="order-1 md:order-2 md:col-span-7">
          <motion.div
            className="relative aspect-[4/5] overflow-hidden bg-[#E6E2DD] md:aspect-auto md:h-[calc(100svh-190px)] md:max-h-[880px] md:min-h-[520px]"
            initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 1.6, ease: EASE, delay: 0.05 }}
          >
            <motion.div className="h-full w-full" initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 2.6, ease: EASE }}>
              <Photo id={HERO_IMAGE} alt={t.heroAlt} sizes="(min-width: 768px) 58vw, 100vw" eager className="h-full w-full" />
            </motion.div>
          </motion.div>
          <motion.figcaption
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.2 }}
            className="mt-4 flex justify-between text-[11px] tracking-[0.08em] text-[#A9A297]"
          >
            <span>{t.captionLeft}</span>
            <span>{t.captionRight}</span>
          </motion.figcaption>
        </figure>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  About — the brand statement, with generous negative space          */
/* ------------------------------------------------------------------ */
function About() {
  const t = useT();
  const [before, emphasis, after] = t.statement;
  return (
    <section id="about" className="scroll-mt-24 border-t border-[#E5E5E5]">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 md:py-40 lg:px-14">
        <Reveal className="mx-auto max-w-[920px] text-center">
          <Eyebrow>{t.houseEyebrow}</Eyebrow>
          <p className="mt-8 font-serif text-[28px] leading-[1.35] text-[#2C2C2C] sm:text-[36px] lg:text-[44px] [&:lang(ka)]:text-[24px] [&:lang(ka)]:leading-[1.5] sm:[&:lang(ka)]:text-[30px] lg:[&:lang(ka)]:text-[36px]">
            {before}
            <em>{emphasis}</em>
            {after}
          </p>
        </Reveal>
        <div className="mt-20 grid gap-12 md:mt-28 md:grid-cols-3 md:gap-10 lg:gap-16">
          {t.principles.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.12} className="border-t border-[#E5E5E5] pt-7">
              <p className="text-[11px] tabular-nums tracking-[0.2em] text-[#A9A297]">0{i + 1}</p>
              <h3 className="mt-4 font-serif text-[22px] text-[#2C2C2C]">{p.title}</h3>
              <p className="mt-3 max-w-[36ch] text-[14px] font-light leading-[1.8] text-[#2C2C2C]/70">{p.text}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Shop                                                               */
/* ------------------------------------------------------------------ */
function ProductCard({ product, index }) {
  const t = useT();
  const name = product.name[t.lang];
  const add = useBag((s) => s.add);
  const [added, setAdded] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onAdd = () => {
    add(product.id);
    setAdded(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setAdded(false), 1800);
  };

  return (
    <article className="group flex h-full flex-col">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#E6E2DD]">
        <Photo
          id={product.image}
          alt={name}
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="h-full w-full transition-transform duration-[1600ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-105"
        />
        <span className="absolute left-4 top-4 text-[10px] tabular-nums tracking-[0.2em] text-[#F9F9F8] mix-blend-difference">
          {t.no} {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* price sits under the name on narrow two-column phones, beside it from sm up */}
      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h3 className="font-serif text-[16px] leading-snug text-[#2C2C2C] sm:text-[17px]">{name}</h3>
          <p className="mt-1.5 text-[12px] font-light leading-relaxed text-[#A9A297]">{product.material[t.lang]}</p>
        </div>
        <p className="shrink-0 text-[13px] tabular-nums tracking-[0.04em] text-[#2C2C2C] sm:pt-0.5">{formatPrice(product.price)}</p>
      </div>

      {/* fades in on hover; always visible on touch screens and to keyboard focus. mt-auto lines it up across a row */}
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex h-8 items-center gap-2 border-b border-[#2C2C2C]/0 text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C] opacity-0 transition-[opacity,border-color] delay-150 duration-700 ease-out hover:border-[#2C2C2C] focus-visible:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
          aria-label={t.addAria(name)}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                className="inline-flex items-center gap-2"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.4 }}
              >
                <Check className="h-3 w-3" strokeWidth={1.5} /> {t.added}
              </motion.span>
            ) : (
              <motion.span key="add" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.4 }}>
                {t.addToBag}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </article>
  );
}

function Shop({ category, setCategory }) {
  const t = useT();
  const visible = category === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);
  const countFor = (id) => (id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.category === id).length);

  return (
    <section id="collection" className="scroll-mt-16 border-t border-[#E5E5E5]">
      <div className="mx-auto max-w-[1440px] px-5 py-24 sm:px-8 md:py-36 lg:px-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <Eyebrow>{t.collectionEyebrow}</Eyebrow>
            <h2 className="mt-5 font-serif text-[36px] leading-[1.1] text-[#2C2C2C] sm:text-[48px] [&:lang(ka)]:leading-[1.3] sm:[&:lang(ka)]:text-[42px]">
              {t.collectionTitle[0]}
              <em>{t.collectionTitle[1]}</em>
            </h2>
          </Reveal>

          {/* category filter with a sliding underline */}
          <LayoutGroup id="filters">
            <div role="tablist" aria-label={t.filterLabel} className="-mx-1 flex gap-7 overflow-x-auto px-1 sm:gap-10">
              {CATEGORIES.map((id) => {
                const active = id === category;
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setCategory(id)}
                    className={`relative shrink-0 pb-3 text-[11px] font-medium uppercase tracking-[0.24em] transition-colors duration-700 ${
                      active ? "text-[#2C2C2C]" : "text-[#A9A297] hover:text-[#2C2C2C]"
                    }`}
                  >
                    {id === "all" ? t.all : t.nav[id]}
                    <sup className="ml-1 text-[9px] tabular-nums tracking-normal">{countFor(id)}</sup>
                    {active && <motion.span layoutId="filter-underline" className="absolute inset-x-0 bottom-0 h-px bg-[#2C2C2C]" transition={{ duration: 0.7, ease: EASE }} />}
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>

        <motion.ul layout className="mt-14 grid grid-cols-2 gap-x-4 gap-y-14 sm:gap-x-6 md:mt-20 md:grid-cols-3 md:gap-x-8 md:gap-y-20 lg:grid-cols-4">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((p) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <ProductCard product={p} index={PRODUCTS.indexOf(p)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Bag drawer                                                         */
/* ------------------------------------------------------------------ */
function QtyStepper({ line }) {
  const t = useT();
  const setQty = useBag((s) => s.setQty);
  const name = PRODUCT_BY_ID[line.id].name[t.lang];
  const btn = "inline-flex h-9 w-9 items-center justify-center text-[#2C2C2C] transition-opacity duration-500 hover:opacity-50 disabled:opacity-25";
  return (
    <div className="inline-flex items-center border border-[#E5E5E5]">
      <button type="button" className={btn} onClick={() => setQty(line.id, line.qty - 1)} disabled={line.qty <= 1} aria-label={t.decrease(name)}>
        <Minus className="h-3 w-3" strokeWidth={1.25} />
      </button>
      <span className="w-6 text-center text-[12px] tabular-nums" aria-live="polite" aria-label={t.quantity(line.qty)}>
        {line.qty}
      </span>
      <button type="button" className={btn} onClick={() => setQty(line.id, line.qty + 1)} disabled={line.qty >= MAX_QTY} aria-label={t.increase(name)}>
        <Plus className="h-3 w-3" strokeWidth={1.25} />
      </button>
    </div>
  );
}

function BagLine({ line }) {
  const t = useT();
  const remove = useBag((s) => s.remove);
  const p = PRODUCT_BY_ID[line.id];
  const name = p.name[t.lang];
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, x: 24, transition: { duration: 0.35 } }}
      transition={{ duration: 0.6, ease: EASE }}
      className="flex gap-5 border-b border-[#E5E5E5] py-6"
    >
      <div className="h-[110px] w-[88px] shrink-0 overflow-hidden bg-[#E6E2DD]">
        <Photo id={p.image} alt={name} sizes="88px" className="h-full w-full" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[15px] leading-snug text-[#2C2C2C]">{name}</h3>
          <p className="shrink-0 text-[13px] tabular-nums text-[#2C2C2C]">{formatPrice(p.price * line.qty)}</p>
        </div>
        <p className="mt-1 text-[11.5px] font-light leading-relaxed text-[#A9A297]">{p.material[t.lang]}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <QtyStepper line={line} />
          <button
            type="button"
            onClick={() => remove(line.id)}
            className="border-b border-[#A9A297]/40 pb-0.5 text-[10.5px] uppercase tracking-[0.2em] text-[#A9A297] transition-colors duration-500 hover:border-[#2C2C2C] hover:text-[#2C2C2C]"
          >
            {t.remove}
          </button>
        </div>
      </div>
    </motion.li>
  );
}

const panelFade = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0 }, transition: { duration: 0.6, ease: EASE } };

function BagDrawer() {
  const t = useT();
  const isOpen = useBag((s) => s.isOpen);
  const lines = useBag((s) => s.lines);
  const count = useBag(selectCount);
  const subtotal = useBag(selectSubtotal);
  const close = useBag((s) => s.close);
  const clear = useBag((s) => s.clear);

  // checkout simulation: idle → processing → done
  const [status, setStatus] = useState("idle");
  const [order, setOrder] = useState(null);
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);

  // while open: lock page scroll, trap focus, close on Escape; on close, return focus and reset the checkout
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.activeElement;
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll('button:not([disabled]), a[href], input, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      if (previous && previous.focus) previous.focus();
      clearTimeout(timer.current);
      setStatus("idle");
    };
  }, [isOpen, close]);

  const checkout = () => {
    setStatus("processing");
    timer.current = setTimeout(() => {
      setOrder({ number: `LP-${Date.now().toString(36).slice(-6).toUpperCase()}`, total: subtotal, items: count });
      clear();
      setStatus("done");
    }, 1800);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="scrim"
            className="fixed inset-0 z-50 bg-[#1A1A1A]/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            onClick={close}
            aria-hidden="true"
          />
          <motion.aside
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="bag-title"
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full max-w-[460px] flex-col bg-[#F9F9F8] shadow-[-24px_0_80px_-40px_rgba(26,26,26,0.25)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-[#E5E5E5] px-6 sm:px-8">
              <h2 id="bag-title" className="font-serif text-[22px] text-[#2C2C2C]">
                {t.bagTitle}
                {status !== "done" && count > 0 && <span className="ml-2 align-middle text-[12px] tabular-nums text-[#A9A297]">({count})</span>}
              </h2>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-[#2C2C2C] transition-opacity duration-500 hover:opacity-50"
                aria-label={t.bagClose}
              >
                <X className="h-5 w-5" strokeWidth={1.25} />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {status === "done" && order ? (
                // order confirmation
                <motion.div key="done" {...panelFade} className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                  <LogoMark className="h-16 w-16 text-[#A9A297]" strokeWidth={0.9} />
                  <p className="mt-8 font-serif text-[30px] leading-tight text-[#2C2C2C]">
                    {t.doneTitle}
                    <em>.</em>
                  </p>
                  <p className="mt-4 max-w-[30ch] text-[14px] font-light leading-[1.8] text-[#2C2C2C]/70">
                    {t.doneText(order, formatPrice(order.total))}
                  </p>
                  <p className="mt-2 text-[11px] text-[#A9A297]">{t.demoNote}</p>
                  <button
                    type="button"
                    onClick={close}
                    className="mt-10 border-b border-[#2C2C2C] pb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C] transition-opacity duration-500 hover:opacity-60"
                  >
                    {t.continue}
                  </button>
                </motion.div>
              ) : lines.length === 0 ? (
                // empty bag
                <motion.div key="empty" {...panelFade} className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                  <ShoppingBag className="h-7 w-7 text-[#A9A297]" strokeWidth={1} />
                  <p className="mt-6 font-serif text-[24px] text-[#2C2C2C]">{t.emptyTitle}</p>
                  <p className="mt-3 max-w-[28ch] text-[14px] font-light leading-[1.8] text-[#2C2C2C]/70">{t.emptyText}</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      scrollToId("collection");
                    }}
                    className="mt-10 border-b border-[#2C2C2C] pb-1 text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C] transition-opacity duration-500 hover:opacity-60"
                  >
                    {t.emptyCta}
                  </button>
                </motion.div>
              ) : (
                // line items + summary
                <motion.div key="lines" {...panelFade} className="flex min-h-0 flex-1 flex-col">
                  <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 sm:px-8">
                    <AnimatePresence initial={false}>
                      {lines.map((l) => (
                        <BagLine key={l.id} line={l} />
                      ))}
                    </AnimatePresence>
                  </ul>
                  <div className="shrink-0 border-t border-[#E5E5E5] px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C]">{t.subtotal}</span>
                      <span className="font-serif text-[22px] tabular-nums text-[#2C2C2C]">{formatPrice(subtotal)}</span>
                    </div>
                    <p className="mt-2 text-[12px] font-light leading-relaxed text-[#A9A297]">{t.shippingNote}</p>
                    <button
                      type="button"
                      onClick={checkout}
                      disabled={status === "processing"}
                      className="mt-6 flex w-full items-center justify-center gap-3 bg-[#1A1A1A] py-[18px] text-[11px] font-medium uppercase tracking-[0.26em] text-[#F9F9F8] transition-colors delay-75 duration-700 hover:bg-[#2C2C2C] disabled:cursor-wait"
                    >
                      {status === "processing" ? (
                        <>
                          <motion.span
                            className="h-3 w-3 rounded-full border border-[#F9F9F8]/30 border-t-[#F9F9F8]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
                          />
                          {t.processing}
                        </>
                      ) : (
                        t.checkout
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Newsletter() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [state, setState] = useState("idle"); // idle | invalid | done

  const submit = (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) return setState("invalid");
    setState("done");
    setEmail("");
  };

  return (
    <div>
      <Eyebrow>{t.letterEyebrow}</Eyebrow>
      <p className="mt-4 max-w-[36ch] text-[14px] font-light leading-[1.8] text-[#2C2C2C]/70">{t.letterText}</p>
      <AnimatePresence mode="wait" initial={false}>
        {state === "done" ? (
          <motion.p key="thanks" {...panelFade} className="mt-8 font-serif text-[18px] italic text-[#2C2C2C]" role="status">
            {t.thanks}
          </motion.p>
        ) : (
          <motion.form key="form" {...panelFade} onSubmit={submit} noValidate className="mt-6 max-w-[420px]">
            <div className="flex items-center border-b border-[#2C2C2C]/25 transition-colors duration-700 focus-within:border-[#2C2C2C]">
              <label htmlFor="newsletter-email" className="sr-only">
                {t.emailLabel}
              </label>
              <input
                id="newsletter-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={t.emailLabel}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === "invalid") setState("idle");
                }}
                aria-invalid={state === "invalid"}
                aria-describedby={state === "invalid" ? "newsletter-error" : undefined}
                className="min-w-0 flex-1 bg-transparent py-3.5 text-[14px] text-[#2C2C2C] outline-none placeholder:text-[#A9A297]"
              />
              <button type="submit" className="group inline-flex h-11 items-center gap-2 pl-4 text-[11px] font-medium uppercase tracking-[0.24em] text-[#2C2C2C]" aria-label={t.subscribe}>
                <span className="hidden sm:inline">{t.subscribe}</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform delay-100 duration-700 ease-out group-hover:translate-x-1" strokeWidth={1.25} />
              </button>
            </div>
            {state === "invalid" && (
              <p id="newsletter-error" className="mt-3 text-[12px] text-[#2C2C2C]/70">
                {t.emailError}
              </p>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-[#E5E5E5]">
      <div className="mx-auto max-w-[1440px] px-5 pb-10 pt-20 sm:px-8 md:pt-28 lg:px-14">
        <div className="grid gap-16 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6 lg:col-span-5">
            <Newsletter />
          </div>
          <div className="grid grid-cols-2 gap-10 md:col-span-6 md:col-start-7 lg:col-span-4 lg:col-start-9">
            {t.footerLinks.map((col) => (
              <div key={col.heading}>
                <Eyebrow>{col.heading}</Eyebrow>
                <ul className="mt-5 space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="text-[13px] font-light text-[#2C2C2C]/75 transition-colors duration-500 hover:text-[#2C2C2C]">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex flex-col-reverse gap-6 border-t border-[#E5E5E5] pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] tracking-[0.08em] text-[#A9A297]">
            © {new Date().getFullYear()} {BRAND.name}. {t.rights}
          </p>
          <ul className="flex gap-8">
            {SOCIAL.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-[11px] uppercase tracking-[0.22em] text-[#A9A297] transition-colors duration-500 hover:text-[#2C2C2C]">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
export default function LuxePetStore() {
  const [category, setCategory] = useState("all");
  const t = useT();

  // keep the page's language and tab title in step with the switch
  useEffect(() => {
    document.documentElement.lang = t.lang;
    document.title = t.title;
  }, [t.lang, t.title]);

  // header links pick a category and bring the collection into view
  const pickCategory = (id) => {
    setCategory(id);
    scrollToId("collection");
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#F9F9F8] font-sans text-[#2C2C2C] antialiased">
        <Header onPickCategory={pickCategory} />
        <main>
          <Hero />
          <Shop category={category} setCategory={setCategory} />
          <About />
        </main>
        <Footer />
        <BagDrawer />
      </div>
    </MotionConfig>
  );
}
