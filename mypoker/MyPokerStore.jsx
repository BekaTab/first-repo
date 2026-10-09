import React, { useEffect, useMemo, useReducer, useState } from "react";
import {
  Phone,
  Search,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  X,
  Star,
  ChevronDown,
  Trash2,
  Check,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  კონფიგურაცია — შეცვალეთ რეალური ნომრებით                          */
/* ------------------------------------------------------------------ */
const CONFIG = {
  phoneDisplay: "+995 555 12 34 56", // [YOUR_PHONE_NUMBER]
  phoneTel: "+995555123456",
  whatsappNumber: "995555123456", // [YOUR_WHATSAPP_NUMBER] — მხოლოდ ციფრები, „+“-ის გარეშე
  currency: "₾",
  storageKey: "mypoker.cart.v1",
};

/* ------------------------------------------------------------------ */
/*  მონაცემები                                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = [
  { id: "all", label: "ყველა" },
  { id: "cards", label: "კარტები" },
  { id: "chips", label: "ჩიპები" },
  { id: "tables", label: "მაგიდები" },
  { id: "accessories", label: "აქსესუარები" },
];

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const PRICE_RANGES = [
  { id: "any", label: "ნებისმიერი", min: 0, max: Infinity },
  { id: "u50", label: "50 ₾-მდე", min: 0, max: 50 },
  { id: "50-300", label: "50 – 300 ₾", min: 50, max: 300 },
  { id: "300-1000", label: "300 – 1000 ₾", min: 300, max: 1000 },
  { id: "1000+", label: "1000 ₾-ზე მეტი", min: 1000, max: Infinity },
];

const SORTS = [
  { id: "featured", label: "რეკომენდებული" },
  { id: "price-asc", label: "ჯერ იაფი" },
  { id: "price-desc", label: "ჯერ ძვირი" },
  { id: "rating", label: "საუკეთესო შეფასება" },
];

const PRODUCTS = [
  {
    id: "chips-pro-500",
    name: "პროფესიონალური პოკერის ჩიპების ნაკრები (500ც)",
    category: "chips",
    price: 389,
    oldPrice: 449,
    rating: 4.9,
    reviews: 128,
    badge: "ბესტსელერი",
    spec: "11.5 გ · თიხის კომპოზიტი · ალუმინის კეისი",
    visual: { kind: "chips", colors: ["#c2410c", "#1f2937", "#d6b25e"] },
  },
  {
    id: "bicycle-standard",
    name: "Bicycle-ის ორიგინალი დასტა",
    category: "cards",
    price: 19,
    rating: 4.8,
    reviews: 342,
    spec: "სტანდარტული ინდექსი · ჰაერის ბალიში",
    visual: { kind: "cards", colors: ["#1e40af", "#fff", "#b91c1c"] },
  },
  {
    id: "ceramic-300",
    name: "კერამიკული კაზინოს ჩიპები (300ც, ალუმინის კეისით)",
    category: "chips",
    price: 549,
    rating: 5.0,
    reviews: 64,
    badge: "პრემიუმი",
    spec: "10 გ · სრული კერამიკა · ორმხრივი ბეჭდვა",
    visual: { kind: "chips", colors: ["#047857", "#f5f5f4", "#1d4ed8"] },
  },
  {
    id: "copag-1546",
    name: "Copag-ის 100% პლასტიკის კარტი (2 დასტა)",
    category: "cards",
    price: 69,
    rating: 4.9,
    reviews: 211,
    spec: "100% პლასტიკი · წყალგაუმტარი",
    visual: { kind: "cards", colors: ["#991b1b", "#fff", "#111827"] },
  },
  {
    id: "oval-table-8",
    name: "ჰოლდემის ოვალური მაგიდა (8 მოთამაშე)",
    category: "tables",
    price: 1890,
    rating: 4.9,
    reviews: 37,
    badge: "ახალი",
    spec: "213 × 107 სმ · მწვანე მაუდი · მუხის კიდე",
    visual: { kind: "table", colors: ["#047857", "#7c4a1e", "#d6b25e"] },
  },
  {
    id: "folding-top-10",
    name: "დასაკეცი პოკერის მაგიდის ზედაპირი (10 მოთამაშე)",
    category: "tables",
    price: 649,
    rating: 4.7,
    reviews: 89,
    spec: "180 × 90 სმ · ჩანთით",
    visual: { kind: "table", colors: ["#1e40af", "#1f2937", "#cbd5e1"] },
  },
  {
    id: "octagon-table",
    name: "რვაკუთხა მაგიდა ჭიქის სადგამებით",
    category: "tables",
    price: 1290,
    rating: 4.8,
    reviews: 22,
    spec: "Ø 120 სმ · დასაკეცი ფეხები",
    visual: { kind: "table", colors: ["#991b1b", "#3f3f46", "#d6b25e"], octagon: true },
  },
  {
    id: "dealer-button",
    name: "დილერის ღილაკი — ხელნაკეთი აკრილი",
    category: "accessories",
    price: 29,
    rating: 4.8,
    reviews: 156,
    spec: "Ø 76 მმ · 12 მმ სისქე",
    visual: { kind: "dealer" },
  },
  {
    id: "auto-shuffler",
    name: "კარტების ავტომატური მრევი",
    category: "accessories",
    price: 159,
    oldPrice: 189,
    rating: 4.6,
    reviews: 73,
    spec: "1–6 დასტა · USB კვება",
    visual: { kind: "shuffler" },
  },
  {
    id: "card-guard-gold",
    name: "ლითონის კარტის დამცველი — ოქროსფერი",
    category: "accessories",
    price: 45,
    rating: 4.9,
    reviews: 98,
    badge: "საჩუქრად",
    spec: "თუთიის შენადნობი · 40 მმ",
    visual: { kind: "guard" },
  },
  {
    id: "clay-monaco-200",
    name: "თიხის ჩიპების ნაკრები „მონაკო“ (200ც)",
    category: "chips",
    price: 279,
    rating: 4.7,
    reviews: 51,
    spec: "13.5 გ · კაკლის ხის ყუთი",
    visual: { kind: "chips", colors: ["#6d28d9", "#1f2937", "#d6b25e"] },
  },
  {
    id: "kem-arrow",
    name: "KEM Arrow — ფართო ინდექსის დასტა",
    category: "cards",
    price: 49,
    rating: 4.8,
    reviews: 119,
    spec: "100% პლასტიკი · დიდი ინდექსი",
    visual: { kind: "cards", colors: ["#065f46", "#fff", "#111827"] },
  },
];

/* ------------------------------------------------------------------ */
/*  დამხმარე ფუნქციები                                                */
/* ------------------------------------------------------------------ */
const formatPrice = (value) =>
  `${new Intl.NumberFormat("ka-GE", { maximumFractionDigits: 0 }).format(value)} ${CONFIG.currency}`;

const buildWhatsAppLink = (text) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

const productWhatsAppLink = (product) =>
  buildWhatsAppLink(
    `გამარჯობა, mypoker.ge-დან გწერთ, მაინტერესებს ეს პროდუქტი: ${product.name} (ფასი: ${product.price}₾)`
  );

const cartWhatsAppLink = (lines, total) =>
  buildWhatsAppLink(
    [
      "გამარჯობა, mypoker.ge-დან გწერთ, მაინტერესებს ეს პროდუქტები:",
      ...lines.map((l, i) => `${i + 1}. ${l.product.name} × ${l.qty} (ფასი: ${l.product.price * l.qty}₾)`),
      `ჯამი: ${total}₾`,
    ].join("\n")
  );

/* ------------------------------------------------------------------ */
/*  კალათის მდგომარეობა (მზადაა მომავალი ონლაინ გადახდისთვის)          */
/* ------------------------------------------------------------------ */
function cartReducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, [action.id]: Math.min((state[action.id] || 0) + 1, 99) };
    case "decrement": {
      const qty = (state[action.id] || 0) - 1;
      const next = { ...state };
      if (qty <= 0) delete next[action.id];
      else next[action.id] = qty;
      return next;
    }
    case "remove": {
      const next = { ...state };
      delete next[action.id];
      return next;
    }
    case "clear":
      return {};
    default:
      return state;
  }
}

function loadCart() {
  try {
    const raw = window.localStorage.getItem(CONFIG.storageKey);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([id, qty]) => PRODUCTS.some((p) => p.id === id) && Number.isInteger(qty) && qty > 0
      )
    );
  } catch {
    return {};
  }
}

function useCart() {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      window.localStorage.setItem(CONFIG.storageKey, JSON.stringify(items));
    } catch {
      /* საცავი მიუწვდომელია — კალათა მუშაობს მეხსიერებაში */
    }
  }, [items]);

  const lines = useMemo(
    () =>
      Object.entries(items)
        .map(([id, qty]) => ({ product: PRODUCTS.find((p) => p.id === id), qty }))
        .filter((l) => l.product),
    [items]
  );
  const count = lines.reduce((sum, l) => sum + l.qty, 0);
  const total = lines.reduce((sum, l) => sum + l.qty * l.product.price, 0);

  return {
    lines,
    count,
    total,
    add: (id) => dispatch({ type: "add", id }),
    decrement: (id) => dispatch({ type: "decrement", id }),
    remove: (id) => dispatch({ type: "remove", id }),
    clear: () => dispatch({ type: "clear" }),
  };
}

function useProductFilter(products) {
  const [category, setCategory] = useState("all");
  const [price, setPrice] = useState("any");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  const counts = useMemo(() => {
    const c = { all: products.length };
    products.forEach((p) => (c[p.category] = (c[p.category] || 0) + 1));
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const range = PRICE_RANGES.find((r) => r.id === price) || PRICE_RANGES[0];
    const list = products.filter(
      (p) =>
        (category === "all" || p.category === category) &&
        p.price >= range.min &&
        p.price < range.max &&
        (!q || `${p.name} ${p.spec}`.toLowerCase().includes(q))
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    return sorted;
  }, [products, category, price, query, sort]);

  const hasFilters = category !== "all" || price !== "any" || query.trim() !== "";
  const reset = () => {
    setCategory("all");
    setPrice("any");
    setQuery("");
  };

  return { category, setCategory, price, setPrice, query, setQuery, sort, setSort, counts, visible, hasFilters, reset };
}


/* ------------------------------------------------------------------ */
/*  გლობალური სტილები                                                 */
/* ------------------------------------------------------------------ */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap');
  :root { color-scheme: dark; }
  body { margin: 0; background: #465163; color: #ffffff; }
  .mp-sans { font-family: 'Noto Sans Georgian', system-ui, -apple-system, 'Segoe UI', sans-serif; }
  .mp-brand { font-family: 'Manrope', 'Noto Sans Georgian', system-ui, sans-serif; }
  .mp-num { font-variant-numeric: tabular-nums; }
  @keyframes mp-rise { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes mp-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mp-ping { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(2.2); opacity: 0; } }
  @keyframes mp-slide-in { from { transform: translateX(100%); } to { transform: none; } }
  @keyframes mp-toast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .mp-rise { animation: mp-rise .4s cubic-bezier(.16,1,.3,1) both; }
  .mp-fade { animation: mp-fade .2s ease both; }
  .mp-ping { animation: mp-ping 2s cubic-bezier(0,0,.2,1) infinite; }
  .mp-slide-in { animation: mp-slide-in .3s cubic-bezier(.16,1,.3,1) both; }
  .mp-toast { animation: mp-toast .3s cubic-bezier(.16,1,.3,1) both; }
  .mp-scroll::-webkit-scrollbar { display: none; }
  .mp-scroll { scrollbar-width: none; }
  :focus-visible { outline: 2px solid #ecd08c; outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  }
`;

/* ------------------------------------------------------------------ */
/*  ლოგო — „ყვავის ფირფიტა“                                           */
/* ------------------------------------------------------------------ */
function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="mp-logo-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e3b4" />
          <stop offset="0.55" stopColor="#ecd08c" />
          <stop offset="1" stopColor="#c9a24f" />
        </linearGradient>
        <linearGradient id="mp-logo-gloss" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* სკვირკლი */}
      <path d="M20 1.5c11.2 0 18.5 7.3 18.5 18.5S31.2 38.5 20 38.5 1.5 31.2 1.5 20 8.8 1.5 20 1.5Z" fill="url(#mp-logo-fill)" />
      <path d="M20 1.5c11.2 0 18.5 7.3 18.5 18.5S31.2 38.5 20 38.5 1.5 31.2 1.5 20 8.8 1.5 20 1.5Z" fill="url(#mp-logo-gloss)" />
      {/* ჩიპის კიდის ჭდეები */}
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="18.6" y="3.6" width="2.8" height="4.2" rx="1.2" fill="#2b3340" opacity="0.28" transform={`rotate(${a + 45} 20 20)`} />
      ))}
      {/* ყვავი */}
      <path
        d="M20 9.2c0 0-8.4 6.3-8.4 11.3 0 2.8 2.1 4.7 4.6 4.7 1.4 0 2.6-.6 3.1-1.5l-1.2 5.1h3.8l-1.2-5.1c.5.9 1.7 1.5 3.1 1.5 2.5 0 4.6-1.9 4.6-4.7 0-5-8.4-11.3-8.4-11.3Z"
        fill="#2b3340"
      />
    </svg>
  );
}

function Logo() {
  return (
    <a href="#top" className="group flex shrink-0 items-center gap-2.5" aria-label="mypoker.ge — მთავარი">
      <span className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[-8deg] group-hover:scale-105">
        <LogoMark />
      </span>
      <span className="mp-brand text-[19px] font-semibold leading-none tracking-[-0.02em] text-white">
        mypoker<span className="text-[#ecd08c]">.ge</span>
      </span>
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  პროდუქტის ილუსტრაციები (SVG — ჩაანაცვლეთ რეალური ფოტოებით)        */
/* ------------------------------------------------------------------ */
function ChipStack({ x, baseY, count, color, uid }) {
  return (
    <g>
      <ellipse cx={x} cy={baseY + 6} rx="30" ry="8" fill="#0f172a" opacity="0.3" />
      {Array.from({ length: count }).map((_, i) => {
        const cy = baseY - i * 7;
        return (
          <g key={i}>
            <ellipse cx={x} cy={cy + 2.5} rx="26" ry="9" fill={color} />
            <ellipse cx={x} cy={cy + 2.5} rx="26" ry="9" fill="#000" opacity="0.22" />
            <ellipse cx={x} cy={cy} rx="26" ry="9" fill={color} />
            <ellipse cx={x} cy={cy} rx="26" ry="9" fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="2.4" strokeDasharray="7 9" />
            {i === count - 1 && (
              <>
                <ellipse cx={x} cy={cy} rx="16" ry="5.4" fill={`url(#${uid}-shine)`} />
                <ellipse cx={x} cy={cy} rx="16" ry="5.4" fill="none" stroke="#fff" strokeOpacity="0.55" />
              </>
            )}
          </g>
        );
      })}
    </g>
  );
}

function PlayingCard({ x, y, rotate, back, ink, suit, uid }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-30" y="-44" width="60" height="88" rx="7" fill="#0f172a" opacity="0.3" transform="translate(3 5)" />
      {suit ? (
        <>
          <rect x="-30" y="-44" width="60" height="88" rx="7" fill="#fafaf9" />
          <text x="-20" y="-26" fontSize="14" textAnchor="middle" fill={ink}>{suit}</text>
          <text x="0" y="12" fontSize="34" textAnchor="middle" fill={ink}>{suit}</text>
          <text x="20" y="36" fontSize="14" textAnchor="middle" fill={ink} transform="rotate(180 20 31)">{suit}</text>
        </>
      ) : (
        <>
          <rect x="-30" y="-44" width="60" height="88" rx="7" fill={back} />
          <rect x="-25" y="-39" width="50" height="78" rx="4" fill={`url(#${uid}-diamond)`} stroke="#fff" strokeOpacity="0.65" />
        </>
      )}
    </g>
  );
}

function ProductVisual({ visual, uid, label }) {
  const { kind, colors = [], octagon } = visual;

  const defs = (
    <defs>
      <radialGradient id={`${uid}-shine`} cx="35%" cy="30%" r="80%">
        <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </radialGradient>
      <pattern id={`${uid}-diamond`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="8" height="8" fill={colors[0] || "#1e40af"} />
        <rect width="4" height="4" fill="#fff" opacity="0.18" />
      </pattern>
      <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#fff1cc" />
        <stop offset="0.45" stopColor="#ecd08c" />
        <stop offset="1" stopColor="#9a7430" />
      </linearGradient>
      <radialGradient id={`${uid}-felt`} cx="50%" cy="42%" r="68%">
        <stop offset="0" stopColor={colors[0] || "#047857"} />
        <stop offset="1" stopColor="#0b2a22" />
      </radialGradient>
    </defs>
  );

  let art = null;
  if (kind === "chips") {
    art = (
      <g>
        <ChipStack x={64} baseY={120} count={7} color={colors[0]} uid={uid} />
        <ChipStack x={118} baseY={126} count={10} color={colors[1]} uid={uid} />
        <ChipStack x={170} baseY={116} count={5} color={colors[2]} uid={uid} />
      </g>
    );
  } else if (kind === "cards") {
    art = (
      <g>
        <PlayingCard x={80} y={82} rotate={-16} back={colors[0]} uid={uid} />
        <PlayingCard x={116} y={76} rotate={-2} ink="#111827" suit="♠" uid={uid} />
        <PlayingCard x={152} y={84} rotate={14} ink="#b91c1c" suit="♥" uid={uid} />
      </g>
    );
  } else if (kind === "table") {
    art = (
      <g>
        <ellipse cx="116" cy="132" rx="96" ry="10" fill="#0f172a" opacity="0.35" />
        {octagon ? (
          <>
            <polygon points="66,36 166,36 206,70 206,98 166,128 66,128 26,98 26,70" fill={colors[1]} />
            <polygon points="74,46 158,46 192,74 192,94 158,118 74,118 40,94 40,74" fill={`url(#${uid}-felt)`} />
          </>
        ) : (
          <>
            <rect x="18" y="34" width="196" height="94" rx="47" fill={colors[1]} />
            <rect x="30" y="44" width="172" height="74" rx="37" fill={`url(#${uid}-felt)`} />
            <rect x="52" y="58" width="128" height="46" rx="23" fill="none" stroke={colors[2]} strokeOpacity="0.5" strokeDasharray="4 5" />
          </>
        )}
        <circle cx="96" cy="81" r="7" fill="#b91c1c" stroke="#fff" strokeDasharray="3 3" strokeWidth="1.5" />
        <circle cx="116" cy="87" r="7" fill="#1f2937" stroke="#fff" strokeDasharray="3 3" strokeWidth="1.5" />
        <circle cx="136" cy="79" r="7" fill={colors[2]} stroke="#fff" strokeDasharray="3 3" strokeWidth="1.5" />
      </g>
    );
  } else if (kind === "dealer") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="52" ry="8" fill="#0f172a" opacity="0.35" />
        <circle cx="116" cy="84" r="50" fill="#f5f5f4" />
        <circle cx="116" cy="84" r="50" fill={`url(#${uid}-shine)`} />
        <circle cx="116" cy="84" r="40" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="3" />
        <text x="116" y="91" textAnchor="middle" fontSize="19" fontWeight="700" fill="#18181b" fontFamily="'Noto Sans Georgian', sans-serif">
          დილერი
        </text>
      </g>
    );
  } else if (kind === "shuffler") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="78" ry="8" fill="#0f172a" opacity="0.35" />
        <rect x="44" y="62" width="144" height="66" rx="12" fill="#1f2937" stroke="#475569" />
        <rect x="56" y="74" width="50" height="42" rx="6" fill="#0b1220" />
        <rect x="126" y="74" width="50" height="42" rx="6" fill="#0b1220" />
        <rect x="62" y="44" width="38" height="50" rx="4" fill="#1e40af" stroke="#fff" strokeOpacity="0.55" transform="rotate(-8 81 69)" />
        <rect x="132" y="44" width="38" height="50" rx="4" fill="#991b1b" stroke="#fff" strokeOpacity="0.55" transform="rotate(8 151 69)" />
        <circle cx="116" cy="112" r="6" fill="#34d399" />
      </g>
    );
  } else if (kind === "guard") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="48" ry="7" fill="#0f172a" opacity="0.35" />
        <circle cx="116" cy="82" r="48" fill={`url(#${uid}-gold)`} />
        <circle cx="116" cy="82" r="39" fill="none" stroke="#7a5418" strokeOpacity="0.55" strokeWidth="2" />
        <circle cx="116" cy="82" r="48" fill={`url(#${uid}-shine)`} />
        <text x="116" y="99" textAnchor="middle" fontSize="46" fill="#5b3d0f" opacity="0.85">♠</text>
      </g>
    );
  }

  return (
    <svg viewBox="0 0 232 160" className="h-full w-full" role="img" aria-label={label}>
      {defs}
      {art}
    </svg>
  );
}


/* ------------------------------------------------------------------ */
/*  ჰედერი                                                             */
/* ------------------------------------------------------------------ */
function SearchField({ id, query, onQuery }) {
  return (
    <label htmlFor={id} className="relative block w-full">
      <span className="sr-only">ძიება</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="მოძებნეთ პროდუქტი"
        className="h-11 w-full rounded-full border border-white/[0.12] bg-white/[0.07] pl-11 pr-4 text-sm text-white placeholder:text-slate-300 transition-colors focus:border-[#ecd08c]/70 focus:bg-white/[0.1] focus:outline-none"
      />
    </label>
  );
}

function Header({ cartCount, onOpenCart, query, onQuery }) {
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-white/[0.08] bg-[#465163]/90 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 lg:gap-8">
        <Logo />

        <div className="hidden max-w-xl flex-1 md:block">
          <SearchField id="mp-search" query={query} onQuery={onQuery} />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href={`tel:${CONFIG.phoneTel}`}
            className="group flex h-11 items-center gap-2.5 rounded-full border border-white/[0.12] bg-white/[0.07] px-3 transition-colors hover:border-[#34d399]/50 hover:bg-[#34d399]/10 sm:pr-4"
            aria-label={`დაგვირეკეთ: ${CONFIG.phoneDisplay}`}
          >
            <span className="relative grid h-6 w-6 place-items-center">
              <span className="mp-ping absolute inset-0 rounded-full bg-[#34d399]/50" />
              <span className="relative grid h-6 w-6 place-items-center rounded-full bg-[#34d399] text-[#052e1f]">
                <Phone className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-[10px] text-slate-200">დაგვირეკეთ</span>
              <span className="mp-num whitespace-nowrap text-[13px] font-semibold text-white">{CONFIG.phoneDisplay}</span>
            </span>
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/[0.12] bg-white/[0.07] text-white transition-colors hover:border-[#ecd08c]/60 hover:text-[#ecd08c]"
            aria-label={`კალათა, ${cartCount} ნივთი`}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span className="mp-num mp-fade absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#ecd08c] px-1 text-[11px] font-bold text-[#2b3340]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 md:hidden">
        <SearchField id="mp-search-mobile" query={query} onQuery={onQuery} />
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  ფილტრები                                                           */
/* ------------------------------------------------------------------ */
function FilterGroup({ title, children }) {
  return (
    <div>
      <p className="px-3 text-xs font-semibold text-slate-200">{title}</p>
      <div className="mt-2 flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function FilterOption({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors ${
        active ? "bg-white font-semibold text-[#2b3340]" : "text-slate-100 hover:bg-white/[0.08]"
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`mp-num text-xs ${active ? "text-[#2b3340]/60" : "text-slate-300"}`}>{count}</span>
      )}
    </button>
  );
}

function Sidebar({ filter }) {
  const { category, setCategory, price, setPrice, counts, hasFilters, reset } = filter;
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-24 flex flex-col gap-7">
        <FilterGroup title="კატეგორია">
          {CATEGORIES.map((c) => (
            <FilterOption key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} label={c.label} count={counts[c.id] || 0} />
          ))}
        </FilterGroup>
        <FilterGroup title="ფასი">
          {PRICE_RANGES.map((r) => (
            <FilterOption key={r.id} active={price === r.id} onClick={() => setPrice(r.id)} label={r.label} />
          ))}
        </FilterGroup>
        {hasFilters && (
          <button type="button" onClick={reset} className="px-3 text-left text-sm text-[#ecd08c] hover:underline">
            ფილტრების გასუფთავება
          </button>
        )}
        <div className="rounded-2xl border border-white/[0.1] bg-white/[0.05] p-4">
          <p className="text-sm font-semibold text-white">შეკვეთა WhatsApp-ით</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-200">აირჩიეთ პროდუქტი და მოგვწერეთ — გიპასუხებთ რამდენიმე წუთში.</p>
          <a href={`tel:${CONFIG.phoneTel}`} className="mp-num mt-3 block select-all text-sm font-semibold text-white hover:text-[#34d399]">
            {CONFIG.phoneDisplay}
          </a>
        </div>
      </div>
    </aside>
  );
}

function MobileFilters({ filter }) {
  const { category, setCategory, price, setPrice, counts } = filter;
  return (
    <div className="sticky top-[calc(env(safe-area-inset-top,0px)+7.5rem+1px)] z-30 -mx-4 border-b border-white/[0.08] bg-[#465163]/95 px-4 py-3 backdrop-blur-xl md:top-[calc(env(safe-area-inset-top,0px)+4rem+1px)] lg:hidden">
      <div className="mp-scroll flex gap-2 overflow-x-auto" role="tablist" aria-label="კატეგორიები">
        {CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors ${
                active ? "border-white bg-white font-semibold text-[#2b3340]" : "border-white/[0.14] text-slate-100"
              }`}
            >
              {c.label}
              <span className={`mp-num text-[11px] ${active ? "text-[#2b3340]/60" : "text-slate-300"}`}>{counts[c.id] || 0}</span>
            </button>
          );
        })}
      </div>
      <label className="relative mt-2 block" htmlFor="mp-price-mobile">
        <span className="sr-only">ფასი</span>
        <select
          id="mp-price-mobile"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9 w-full appearance-none rounded-full border border-white/[0.14] bg-[#505c6e] pl-4 pr-9 text-[13px] text-white focus:outline-none"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              ფასი: {r.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  პროდუქტის ბარათი                                                   */
/* ------------------------------------------------------------------ */
function ProductCard({ product, index, inCart, onAdd }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article
      className="mp-rise group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#505c6e] transition-all duration-300 hover:-translate-y-0.5 hover:border-white/[0.2] hover:shadow-[0_20px_40px_-20px_rgba(15,23,42,0.6)]"
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[radial-gradient(120%_100%_at_50%_0%,#6a788d_0%,#5a677a_70%)]">
        <div className="absolute inset-0 p-6 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105">
          <ProductVisual visual={product.visual} uid={`p-${product.id}`} label={product.name} />
        </div>
        {(product.badge || discount > 0) && (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {discount > 0 && (
              <span className="mp-num rounded-full bg-[#34d399] px-2 py-0.5 text-[11px] font-bold text-[#052e1f]">−{discount}%</span>
            )}
            {product.badge && (
              <span className="rounded-full bg-[#2b3340]/80 px-2.5 py-0.5 text-[11px] font-medium text-[#f6e3b4] backdrop-blur">
                {product.badge}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-white">{product.name}</h3>
        <p className="mt-1 truncate text-[13px] text-slate-200">{product.spec}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="mp-num text-xl font-bold tracking-tight text-white">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="mp-num text-xs text-slate-300 line-through">{formatPrice(product.oldPrice)}</span>}
          </div>
          <span className="flex items-center gap-1 text-xs text-slate-200">
            <Star className="h-3.5 w-3.5 fill-[#ecd08c] text-[#ecd08c]" />
            <span className="mp-num font-medium text-white">{product.rating.toFixed(1)}</span>
            <span className="mp-num">({product.reviews})</span>
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={productWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#34d399] px-3 text-[13px] font-bold text-[#052e1f] transition-colors hover:bg-[#4ade80] active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            შესაკვეთად დაგვიკავშირდით
          </a>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors ${
              inCart ? "border-[#ecd08c] bg-[#ecd08c] text-[#2b3340]" : "border-white/[0.16] text-white hover:border-[#ecd08c] hover:text-[#ecd08c]"
            }`}
            aria-label={inCart ? `კალათაშია: ${product.name}. კიდევ ერთის დამატება` : `კალათაში დამატება: ${product.name}`}
            title={inCart ? "კალათაშია" : "კალათაში დამატება"}
          >
            {inCart ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/*  მაღაზია                                                            */
/* ------------------------------------------------------------------ */
function Shop({ filter, cart }) {
  const { category, query, sort, setSort, price, visible, hasFilters, reset } = filter;
  const inCart = useMemo(() => new Set(cart.lines.map((l) => l.product.id)), [cart.lines]);
  const gridKey = `${category}|${sort}|${price}|${query.trim()}`;
  const title = query.trim() ? `ძიება: „${query.trim()}“` : category === "all" ? "ყველა პროდუქტი" : CATEGORY_LABEL[category];

  return (
    <main id="shop" className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[220px_1fr] lg:pt-6">
      <Sidebar filter={filter} />

      <section className="min-w-0" aria-label="პროდუქტები">
        <MobileFilters filter={filter} />

        <div className="mt-4 flex items-center justify-between gap-3 lg:mt-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight text-white sm:text-2xl">{title}</h1>
            <p className="mp-num text-sm text-slate-200" aria-live="polite">
              {visible.length} პროდუქტი
            </p>
          </div>
          <label className="relative shrink-0" htmlFor="mp-sort">
            <span className="sr-only">დალაგება</span>
            <select
              id="mp-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 max-w-[10.5rem] appearance-none truncate rounded-full border border-white/[0.14] bg-[#505c6e] pl-4 pr-9 text-[13px] text-white transition-colors focus:border-[#ecd08c]/70 focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          </label>
        </div>

        {visible.length > 0 ? (
          <div key={gridKey} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} inCart={inCart.has(product.id)} onAdd={cart.add} />
            ))}
          </div>
        ) : (
          <div className="mp-fade mt-5 flex flex-col items-center rounded-2xl border border-dashed border-white/[0.18] px-6 py-16 text-center">
            <Search className="h-6 w-6 text-slate-300" />
            <p className="mt-3 font-semibold text-white">პროდუქტი ვერ მოიძებნა</p>
            <p className="mt-1 text-sm text-slate-200">სცადეთ სხვა სიტყვა ან შეცვალეთ ფილტრი.</p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2b3340] transition-colors hover:bg-slate-100"
              >
                ფილტრების გასუფთავება
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  კალათის პანელი                                                     */
/* ------------------------------------------------------------------ */
function CartDrawer({ open, onClose, cart }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="კალათა">
      <button type="button" className="mp-fade absolute inset-0 bg-[#1e2530]/50 backdrop-blur-sm" onClick={onClose} aria-label="დახურვა" />
      <aside className="mp-slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-white/[0.1] bg-[#465163] pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">კალათა</h2>
            <p className="mp-num text-xs text-slate-200">{cart.count} ნივთი</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-slate-100 transition-colors hover:bg-white/[0.08]"
            aria-label="კალათის დახურვა"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-white">კალათა ცარიელია</p>
            <p className="mt-1 text-sm text-slate-200">დაამატეთ პროდუქტები და გამოგვიგზავნეთ ერთი შეტყობინებით.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#2b3340] hover:bg-slate-100">
              შოპინგის გაგრძელება
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 space-y-2 overflow-y-auto p-4">
              {cart.lines.map(({ product, qty }) => (
                <li key={product.id} className="mp-fade flex gap-3 rounded-2xl bg-[#505c6e] p-3">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[radial-gradient(120%_100%_at_50%_0%,#6a788d_0%,#5a677a_70%)] p-1.5">
                    <ProductVisual visual={product.visual} uid={`c-${product.id}`} label={product.name} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-white">{product.name}</p>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-white/[0.16]">
                        <button
                          type="button"
                          onClick={() => cart.decrement(product.id)}
                          className="grid h-8 w-8 place-items-center text-slate-100 hover:text-white"
                          aria-label="რაოდენობის შემცირება"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="mp-num w-5 text-center text-[13px] font-semibold text-white">{qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.add(product.id)}
                          className="grid h-8 w-8 place-items-center text-slate-100 hover:text-white"
                          aria-label="რაოდენობის გაზრდა"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="mp-num text-sm font-bold text-white">{formatPrice(product.price * qty)}</span>
                        <button
                          type="button"
                          onClick={() => cart.remove(product.id)}
                          className="text-slate-300 transition-colors hover:text-red-300"
                          aria-label={`წაშლა: ${product.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-white/[0.08] px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-slate-200">ჯამი</span>
                <span className="mp-num text-2xl font-bold text-white">{formatPrice(cart.total)}</span>
              </div>
              <a
                href={cartWhatsAppLink(cart.lines, cart.total)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#34d399] text-sm font-bold text-[#052e1f] transition-colors hover:bg-[#4ade80]"
              >
                <MessageCircle className="h-4 w-4" />
                შესაკვეთად დაგვიკავშირდით
              </a>
              <p className="mt-3 text-center text-xs text-slate-300">ონლაინ გადახდა მალე დაემატება</p>
              <button type="button" onClick={cart.clear} className="mt-2 w-full text-xs text-slate-300 transition-colors hover:text-white">
                კალათის გასუფთავება
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ფუტერი                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[#414b5c]">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark size={24} />
          <span className="text-xs">© {new Date().getFullYear()} mypoker.ge · აზარტული თამაში მხოლოდ 18 წლიდან</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`tel:${CONFIG.phoneTel}`} className="mp-num select-all font-semibold text-white hover:text-[#34d399]">
            {CONFIG.phoneDisplay}
          </a>
          <a
            href={buildWhatsAppLink("გამარჯობა, mypoker.ge-დან გწერთ.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#34d399] hover:text-[#4ade80]"
          >
            <MessageCircle className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  აპლიკაცია                                                          */
/* ------------------------------------------------------------------ */
export default function App() {
  const cart = useCart();
  const filter = useProductFilter(PRODUCTS);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const cartApi = {
    ...cart,
    add: (id) => {
      cart.add(id);
      const product = PRODUCTS.find((p) => p.id === id);
      if (product && !cartOpen) setToast({ id: Date.now(), name: product.name });
    },
  };

  const openCart = () => {
    setToast(null);
    setCartOpen(true);
  };

  return (
    <div id="top" className="mp-sans flex min-h-screen flex-col bg-[#465163] text-white antialiased selection:bg-[#ecd08c]/40">
      <style>{GLOBAL_CSS}</style>
      <Header cartCount={cart.count} onOpenCart={openCart} query={filter.query} onQuery={filter.setQuery} />
      <div className="flex-1">
        <Shop filter={filter} cart={cartApi} />
      </div>
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cartApi} />

      {toast && (
        <div
          key={toast.id}
          className="mp-toast fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl border border-white/[0.12] bg-[#2f3845]/95 py-2.5 pl-3 pr-4 shadow-2xl backdrop-blur-xl"
          role="status"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#ecd08c] text-[#2b3340]">
            <Check className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] text-white">კალათაში დაემატა: {toast.name}</p>
          <button type="button" onClick={openCart} className="shrink-0 text-[13px] font-bold text-[#ecd08c] hover:text-[#f6e3b4]">
            ნახვა
          </button>
        </div>
      )}
    </div>
  );
}
