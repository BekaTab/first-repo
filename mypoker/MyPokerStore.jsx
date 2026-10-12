import React, { useEffect, useMemo, useReducer, useRef, useState } from "react";
import {
  Phone,
  Search,
  ShoppingBag,
  MessageCircle,
  Plus,
  Minus,
  X,
  ChevronDown,
  Trash2,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Maximize2,
  Truck,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  მონაცემები ადმინ პანელიდან (products.json, ჩაიწერება გვერდში აწყობისას) */
/* ------------------------------------------------------------------ */
function readData() {
  try {
    const el = typeof document !== "undefined" && document.getElementById("mp-data");
    const parsed = el ? JSON.parse(el.textContent) : null;
    if (parsed && typeof parsed === "object") return { settings: parsed.settings || {}, products: parsed.products || [] };
  } catch {
    /* დაზიანებული მონაცემები — მაღაზია ცარიელი გამოჩნდება */
  }
  return { settings: {}, products: [] };
}
const DATA = readData();

/* ------------------------------------------------------------------ */
/*  ენა: ქართული — „/“, ინგლისური — „/en/“ (ენის შეცვლა გვერდს ხელახლა ხსნის) */
/* ------------------------------------------------------------------ */
const LANG = typeof window !== "undefined" && /^\/en(\/|$)/.test(window.location.pathname) ? "en" : "ka";
const BASE = LANG === "en" ? "/en" : "";

const TEXT = {
  ka: {
    homeAria: "mypoker.ge — მთავარი",
    dealer: "დილერი",
    search: "ძიება",
    searchPh: "ძებნა",
    freeDelivery: "უფასო მიწოდება",
    freeFrom: (n) => `${n} ₾-დან`,
    callUs: "დაგვირეკეთ",
    callAria: (p) => `დაგვირეკეთ: ${p}`,
    cartAria: (n) => `კალათა, ${n} ნივთი`,
    category: "კატეგორია",
    price: "ფასი",
    pricePrefix: (l) => `ფასი: ${l}`,
    clearFilters: "ფილტრების გასუფთავება",
    waBoxTitle: "შეკვეთა WhatsApp-ით",
    waBoxText: "აირჩიეთ პროდუქტი და მოგვწერეთ — გიპასუხებთ რამდენიმე წუთში.",
    categoriesAria: "კატეგორიები",
    detailsAria: (n) => `${n} — დეტალურად`,
    inStock: "მარაგშია",
    onOrder: "შეკვეთით",
    onOrderLong: "შეკვეთით — მიწოდების ვადას დაგიზუსტებთ",
    orderCta: "შესაკვეთად დაგვიკავშირდით",
    inCart: "კალათაშია",
    addToCart: "კალათაში დამატება",
    inCartMore: "კალათაშია. კიდევ ერთის დამატება",
    inCartAria: (n) => `კალათაშია: ${n}. კიდევ ერთის დამატება`,
    addAria: (n) => `კალათაში დამატება: ${n}`,
    searchTitle: (q) => `ძიება: „${q}“`,
    allProducts: "ყველა პროდუქტი",
    productsAria: "პროდუქტები",
    productCount: (n) => `${n} პროდუქტი`,
    sort: "დალაგება",
    noResults: "პროდუქტი ვერ მოიძებნა",
    noResultsHint: "სცადეთ სხვა სიტყვა ან შეცვალეთ ფილტრი.",
    zoom: "ფოტოს გადიდება",
    photoAlt: (n, i) => `${n} — ფოტო ${i}`,
    photo: (i) => `ფოტო ${i}`,
    prevPhoto: "წინა ფოტო",
    nextPhoto: "შემდეგი ფოტო",
    close: "დახურვა",
    saleUntil: (d) => `ფასდაკლება მოქმედებს ${d}`,
    months: ["იანვრამდე", "თებერვლამდე", "მარტამდე", "აპრილამდე", "მაისამდე", "ივნისამდე", "ივლისამდე", "აგვისტომდე", "სექტემბრამდე", "ოქტომბრამდე", "ნოემბრამდე", "დეკემბრამდე"],
    dateFmt: (d, m) => `${d} ${m}`,
    breadcrumb: "ნავიგაცია",
    shop: "მაღაზია",
    orCall: "ან დაგვირეკეთ:",
    perkDelivery: "მიწოდება მთელ საქართველოში",
    perkConfirm: "შეკვეთის დადასტურება WhatsApp-ით ან ტელეფონით",
    description: "აღწერა",
    related: "შეიძლება დაგაინტერესოთ",
    notFound: "პროდუქტი ვერ მოიძებნა",
    notFoundText: "შესაძლოა, ის აღარ იყიდება ან ბმული შეიცვალა.",
    backToShop: "მაღაზიაში დაბრუნება",
    cart: "კალათა",
    items: (n) => `${n} ნივთი`,
    closeCart: "კალათის დახურვა",
    cartEmpty: "კალათა ცარიელია",
    cartEmptyText: "დაამატეთ პროდუქტები და გამოგვიგზავნეთ ერთი შეტყობინებით.",
    continueShopping: "შოპინგის გაგრძელება",
    decrease: "რაოდენობის შემცირება",
    increase: "რაოდენობის გაზრდა",
    removeAria: (n) => `წაშლა: ${n}`,
    perUnit: "ცალი",
    total: "ჯამი",
    paySoon: "ონლაინ გადახდა მალე დაემატება",
    clearCart: "კალათის გასუფთავება",
    rights: "ყველა უფლება დაცულია",
    added: "კალათაში დაემატა:",
    view: "ნახვა",
    siteTitle: "mypoker.ge — პოკერის აქსესუარების მაღაზია",
    language: "ენა",
    waHello: "გამარჯობა, mypoker.ge-დან გწერთ.",
    waProduct: (n, p) => `გამარჯობა, mypoker.ge-დან გწერთ, მაინტერესებს ეს პროდუქტი: ${n} (ფასი: ${p}₾)`,
    waCartHead: "გამარჯობა, mypoker.ge-დან გწერთ, მაინტერესებს ეს პროდუქტები:",
    waCartLine: (i, n, q, p) => `${i}. ${n} × ${q} (ფასი: ${p}₾)`,
    waCartTotal: (t) => `ჯამი: ${t}₾`,
    cat: { all: "ყველა", cards: "კარტები", chips: "ჩიპები", tables: "მაგიდები", accessories: "აქსესუარები" },
    priceAny: "ნებისმიერი",
    priceOver: (n) => `${n} ₾-ზე მეტი`,
    sorts: { featured: "რეკომენდებული", "price-asc": "ჯერ იაფი", "price-desc": "ჯერ ძვირი", sale: "ჯერ ფასდაკლებული" },
  },
  en: {
    homeAria: "mypoker.ge — home",
    dealer: "DEALER",
    search: "Search",
    searchPh: "Search",
    freeDelivery: "Free delivery",
    freeFrom: (n) => `from ${n} ₾`,
    callUs: "Call us",
    callAria: (p) => `Call us: ${p}`,
    cartAria: (n) => `Cart, ${n} ${n === 1 ? "item" : "items"}`,
    category: "Category",
    price: "Price",
    pricePrefix: (l) => `Price: ${l}`,
    clearFilters: "Clear filters",
    waBoxTitle: "Order via WhatsApp",
    waBoxText: "Pick a product and message us — we reply within minutes.",
    categoriesAria: "Categories",
    detailsAria: (n) => `${n} — details`,
    inStock: "In stock",
    onOrder: "On order",
    onOrderLong: "On order — we'll confirm the delivery time",
    orderCta: "Contact us to order",
    inCart: "In cart",
    addToCart: "Add to cart",
    inCartMore: "In cart. Add one more",
    inCartAria: (n) => `In cart: ${n}. Add one more`,
    addAria: (n) => `Add to cart: ${n}`,
    searchTitle: (q) => `Search: “${q}”`,
    allProducts: "All products",
    productsAria: "Products",
    productCount: (n) => `${n} ${n === 1 ? "product" : "products"}`,
    sort: "Sort",
    noResults: "No products found",
    noResultsHint: "Try another word or change the filters.",
    zoom: "Enlarge photo",
    photoAlt: (n, i) => `${n} — photo ${i}`,
    photo: (i) => `Photo ${i}`,
    prevPhoto: "Previous photo",
    nextPhoto: "Next photo",
    close: "Close",
    saleUntil: (d) => `Sale price until ${d}`,
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    dateFmt: (d, m) => `${d} ${m}`,
    breadcrumb: "Breadcrumb",
    shop: "Shop",
    orCall: "Or call us:",
    perkDelivery: "Delivery across Georgia",
    perkConfirm: "Orders confirmed by WhatsApp or phone",
    description: "Description",
    related: "You may also like",
    notFound: "Product not found",
    notFoundText: "It may no longer be on sale, or the link has changed.",
    backToShop: "Back to the shop",
    cart: "Cart",
    items: (n) => `${n} ${n === 1 ? "item" : "items"}`,
    closeCart: "Close cart",
    cartEmpty: "Your cart is empty",
    cartEmptyText: "Add products and send them to us in one message.",
    continueShopping: "Continue shopping",
    decrease: "Decrease quantity",
    increase: "Increase quantity",
    removeAria: (n) => `Remove ${n}`,
    perUnit: "each",
    total: "Total",
    paySoon: "Online payment coming soon",
    clearCart: "Clear cart",
    rights: "All rights reserved",
    added: "Added to cart:",
    view: "View",
    siteTitle: "mypoker.ge — poker accessories store",
    language: "Language",
    waHello: "Hello, I'm writing from mypoker.ge.",
    waProduct: (n, p) => `Hello, I'm writing from mypoker.ge. I'm interested in this product: ${n} (price: ${p}₾)`,
    waCartHead: "Hello, I'm writing from mypoker.ge. I'm interested in these products:",
    waCartLine: (i, n, q, p) => `${i}. ${n} × ${q} (price: ${p}₾)`,
    waCartTotal: (t) => `Total: ${t}₾`,
    cat: { all: "All", cards: "Cards", chips: "Chips", tables: "Tables", accessories: "Accessories" },
    priceAny: "Any",
    priceOver: (n) => `Over ${n} ₾`,
    sorts: { featured: "Recommended", "price-asc": "Price: low to high", "price-desc": "Price: high to low", sale: "Biggest discount" },
  },
};
const T = TEXT[LANG];

const CONFIG = {
  phoneDisplay: DATA.settings.phoneDisplay || "",
  phoneTel: DATA.settings.phoneTel || "",
  whatsappNumber: String(DATA.settings.whatsappNumber || "").replace(/\D/g, ""),
  freeShippingFrom: Math.round(Number(DATA.settings.freeShippingFrom) || 0),
  currency: "₾",
  storageKey: "mypoker.cart.v1",
};

/* ------------------------------------------------------------------ */
/*  მონაცემები                                                         */
/* ------------------------------------------------------------------ */
const CATEGORIES = ["all", "cards", "chips", "tables", "accessories"].map((id) => ({ id, label: T.cat[id] }));

const CATEGORY_LABEL = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

const PRICE_RANGES = [
  { id: "any", label: T.priceAny, min: 0, max: Infinity },
  { id: "50-100", label: "50 – 100 ₾", min: 50, max: 100 },
  { id: "100-200", label: "100 – 200 ₾", min: 100, max: 200 },
  { id: "200+", label: T.priceOver(200), min: 200, max: Infinity },
];

const SORTS = ["featured", "price-asc", "price-desc", "sale"].map((id) => ({ id, label: T.sorts[id] }));

const DEFAULT_VISUAL = {
  chips: { kind: "chips", colors: ["#c2410c", "#1f2937", "#d6b25e"] },
  cards: { kind: "cards", colors: ["#1e40af", "#fff", "#b91c1c"] },
  tables: { kind: "table", colors: ["#047857", "#7c4a1e", "#d6b25e"] },
  accessories: { kind: "dealer" },
};

/* დღევანდელი თარიღი თბილისის დროით, ფორმატში YYYY-MM-DD */
const todayInTbilisi = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Tbilisi" });

/* ატვირთული ფაილის მისამართი საიტის ძირიდან (ასე მუშაობს პროდუქტის გვერდზეც) */
const assetUrl = (path) => (/^(https?:|data:|\/)/.test(path) ? path : `/${path}`);

/* ფოტოები: ახალი ფორმატი [{ src, thumb }]; ძველი — ერთი `image` ველი */
function normalizeImages(p) {
  const list = Array.isArray(p.images) ? p.images : p.image ? [p.image] : [];
  return list
    .map((x) => (typeof x === "string" ? { src: x, thumb: x } : x && typeof x.src === "string" ? { src: x.src, thumb: x.thumb || x.src } : null))
    .filter((x) => x && x.src)
    .map((x) => ({ src: assetUrl(x.src), thumb: assetUrl(x.thumb) }));
}

/* ფასდაკლება აქტიურია, თუ ფასი დაბალია ძველზე და ვადა (თუ მითითებულია) ჯერ არ გასულა */
function normalizeProduct(p, today) {
  const regular = Number(p.price) || 0;
  const sale = Number(p.salePrice) || 0;
  const onSale = sale > 0 && sale < regular && (!p.saleEnds || p.saleEnds >= today);
  const en = LANG === "en";
  const pick = (field) => (en && typeof p[`${field}En`] === "string" && p[`${field}En`].trim() ? p[`${field}En`] : p[field]);
  return {
    ...p,
    name: pick("name"),
    spec: pick("spec") || "",
    badge: pick("badge") || "",
    price: onSale ? sale : regular,
    oldPrice: onSale ? regular : null,
    saleEnds: onSale ? p.saleEnds || "" : "",
    inStock: p.inStock !== false,
    images: normalizeImages(p),
    description: typeof pick("description") === "string" ? pick("description") : "",
    visual: p.visual || DEFAULT_VISUAL[p.category] || DEFAULT_VISUAL.accessories,
  };
}

const PRODUCTS = (() => {
  const today = todayInTbilisi();
  return (Array.isArray(DATA.products) ? DATA.products : [])
    .filter((p) => p && p.id && p.name && p.visible !== false && CATEGORY_LABEL[p.category])
    .map((p) => normalizeProduct(p, today));
})();

/* ------------------------------------------------------------------ */
/*  დამხმარე ფუნქციები                                                */
/* ------------------------------------------------------------------ */
const formatPrice = (value) =>
  `${new Intl.NumberFormat("ka-GE", { maximumFractionDigits: 0 }).format(value)} ${CONFIG.currency}`;

const buildWhatsAppLink = (text) =>
  `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`;

const productWhatsAppLink = (product) =>
  buildWhatsAppLink(
    T.waProduct(product.name, product.price)
  );

const cartWhatsAppLink = (lines, total) =>
  buildWhatsAppLink(
    [
      T.waCartHead,
      ...lines.map((l, i) => T.waCartLine(i + 1, l.product.name, l.qty, l.product.price * l.qty)),
      T.waCartTotal(total),
    ].join("\n")
  );

/* ------------------------------------------------------------------ */
/*  გვერდები: მაღაზია „/“ და პროდუქტი „/p/<id>/“                        */
/* ------------------------------------------------------------------ */
const productPath = (id) => `${BASE}/p/${encodeURIComponent(id)}/`;
const HOME_PATH = `${BASE}/`;

/* იმავე გვერდის მისამართი მეორე ენაზე */
const otherLangPath = (productId) => {
  const tail = productId ? `/p/${encodeURIComponent(productId)}/` : "/";
  return LANG === "en" ? tail : `/en${tail}`;
};

function routeFromLocation() {
  if (typeof window === "undefined") return { productId: null };
  const m = window.location.pathname.match(/^(?:\/en)?\/p\/([^/]+)\/?$/);
  return { productId: m ? decodeURIComponent(m[1]) : null };
}

/* ბმულზე დაჭერა გვერდის გადატვირთვის გარეშე; Cmd/Ctrl+დაჭერა ახალ ჩანართში ხსნის */
const handleNav = (navigate, productId) => (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  navigate(productId);
};

function useRoute() {
  const [route, setRoute] = useState(routeFromLocation);
  const shopScroll = useRef(0);

  useEffect(() => {
    try {
      window.history.scrollRestoration = "manual";
    } catch {
      /* ზოგ ბრაუზერში მიუწვდომელია */
    }
    const onPop = () => setRoute(routeFromLocation());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    window.scrollTo(0, route.productId ? 0 : shopScroll.current);
  }, [route.productId]);

  const navigate = (productId) => {
    if (productId === route.productId) return;
    if (!route.productId) shopScroll.current = window.scrollY;
    try {
      window.history.pushState({}, "", productId ? productPath(productId) : HOME_PATH);
    } catch {
      /* გადახედვის ფანჯარაში მისამართი არ იცვლება — გვერდი მაინც იცვლება */
    }
    setRoute({ productId });
  };

  return [route, navigate];
}

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
    if (sort === "sale") sorted.sort((a, b) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0));
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
/* ფონის პატერნი: კარტის ოთხი ნიშანი, ძალიან მკრთალად (♠ ♥ ♦ ♣) */
const SUIT = {
  spade: "M12 2s-8 6-8 11c0 2.7 2 4.5 4.4 4.5 1.3 0 2.5-.6 3-1.4L10.2 21h3.6l-1.2-4.9c.5.8 1.7 1.4 3 1.4 2.4 0 4.4-1.8 4.4-4.5 0-5-8-11-8-11z",
  heart: "M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3.1 4.5 6.9 4.5c2.1 0 3.6 1.1 5.1 3 1.5-1.9 3-3 5.1-3 3.8 0 6 3.9 4.5 7.3C19.5 16.4 12 21 12 21z",
  diamond: "M12 2l7.5 10L12 22 4.5 12z",
  club: "M12 2.8a4.2 4.2 0 0 1 3.6 6.4 4.2 4.2 0 1 1-2.4 7.2L14.5 21h-5l1.3-4.6a4.2 4.2 0 1 1-2.4-7.2A4.2 4.2 0 0 1 12 2.8z",
};
const suitAt = (d, x, y, r, fill, opacity) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" transform="translate(${x} ${y}) rotate(${r} 12 12) scale(.75)"/>`;
const PATTERN_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
  suitAt(SUIT.spade, 10, 12, -12, "#18191c", 0.058) +
  suitAt(SUIT.heart, 72, 8, 10, "#c8102e", 0.07) +
  suitAt(SUIT.diamond, 40, 70, 8, "#c8102e", 0.07) +
  suitAt(SUIT.club, 92, 76, -10, "#18191c", 0.058) +
  `</svg>`;
const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVG)}")`;

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@400;500;600;700&family=Manrope:wght@600;700&display=swap');
  :root { color-scheme: light; }
  body { margin: 0; background: #f3f2ef; color: #18191c; }
  .mp-sans { font-family: 'Noto Sans Georgian', system-ui, -apple-system, 'Segoe UI', sans-serif; }
  .mp-brand { font-family: 'Manrope', 'Noto Sans Georgian', system-ui, sans-serif; }
  .mp-num { font-variant-numeric: tabular-nums; }
  .mp-pattern { background-color: #f3f2ef; background-image: ${PATTERN_URL}; background-size: 120px 120px; }
  @keyframes mp-rise { from { opacity: 0; translate: 0 14px; scale: .97; } to { opacity: 1; translate: 0 0; scale: 1; } }
  @keyframes mp-pop { 0% { scale: .4; } 60% { scale: 1.35; } 100% { scale: 1; } }
  .mp-pop { animation: mp-pop .45s cubic-bezier(.16,1,.3,1) both; }
  @keyframes mp-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mp-ping { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(2.2); opacity: 0; } }
  @keyframes mp-slide-in { from { transform: translateX(100%); } to { transform: none; } }
  @keyframes mp-toast { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .mp-rise { animation: mp-rise .4s cubic-bezier(.16,1,.3,1) both; }
  .mp-fade { animation: mp-fade .2s ease both; }
  .mp-ping { animation: mp-ping 2s cubic-bezier(0,0,.2,1) infinite; }
  .mp-slide-in { animation: mp-slide-in .3s cubic-bezier(.16,1,.3,1) both; }
  .mp-toast { animation: mp-toast .3s cubic-bezier(.16,1,.3,1) both; }
  .mp-shimmer, .mp-shimmer-red {
    background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
    animation: mp-shimmer 3s ease-in-out infinite;
  }
  .mp-shimmer { background-image: linear-gradient(110deg, #ffffff 42%, #ffc2cb 50%, #ffffff 58%); }
  .mp-shimmer-red { background-image: linear-gradient(110deg, #ff5a6e 42%, #ffd6dc 50%, #ff5a6e 58%); }
  @keyframes mp-shimmer { 0% { background-position: 100% 0; } 55%, 100% { background-position: 0 0; } }
  .mp-drive { animation: mp-drive 1.2s ease-in-out infinite; }
  @keyframes mp-drive {
    0%, 100% { transform: translateX(-3px) translateY(0); }
    25% { transform: translateX(0) translateY(-1.5px); }
    50% { transform: translateX(4px) translateY(0); }
    75% { transform: translateX(0) translateY(-1px); }
  }
  .mp-beat { display: inline-block; animation: mp-beat 3s ease-in-out infinite; }
  @keyframes mp-beat { 0%, 70%, 100% { transform: scale(1); } 80% { transform: scale(1.08); } 90% { transform: scale(.98); } }
  .mp-scroll::-webkit-scrollbar { display: none; }
  .mp-scroll { scrollbar-width: none; }
  :focus-visible { outline: 2px solid #c8102e; outline-offset: 2px; }
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
          <stop offset="0" stopColor="#e3324d" />
          <stop offset="0.55" stopColor="#c8102e" />
          <stop offset="1" stopColor="#9e0c24" />
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
        <rect key={a} x="18.6" y="3.6" width="2.8" height="4.2" rx="1.2" fill="#ffffff" opacity="0.4" transform={`rotate(${a + 45} 20 20)`} />
      ))}
      {/* ყვავი */}
      <path
        d="M20 9.2c0 0-8.4 6.3-8.4 11.3 0 2.8 2.1 4.7 4.6 4.7 1.4 0 2.6-.6 3.1-1.5l-1.2 5.1h3.8l-1.2-5.1c.5.9 1.7 1.5 3.1 1.5 2.5 0 4.6-1.9 4.6-4.7 0-5-8.4-11.3-8.4-11.3Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function Logo({ onNavigate }) {
  return (
    <a
      href={HOME_PATH}
      onClick={onNavigate ? handleNav(onNavigate, null) : undefined}
      className="group flex shrink-0 items-center gap-2.5"
      aria-label={T.homeAria}
    >
      <span className="transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:rotate-[-8deg] group-hover:scale-105">
        <LogoMark />
      </span>
      <span className="mp-brand text-[19px] font-semibold leading-none tracking-[-0.02em] text-white">
        mypoker<span className="text-[#ff5a6e]">.ge</span>
      </span>
    </a>
  );
}

/* ენის გადამრთველი: იმავე გვერდს ხსნის მეორე ენაზე */
function LangSwitch({ productId, className = "" }) {
  const item = (code, label) =>
    code === LANG ? (
      <span aria-current="true" className="rounded-full bg-white px-2.5 py-1 text-[#18191c]">
        {label}
      </span>
    ) : (
      <a href={otherLangPath(productId)} hrefLang={code} lang={code} className="rounded-full px-2.5 py-1 text-white/70 transition-colors hover:text-white">
        {label}
      </a>
    );
  return (
    <div className={`shrink-0 items-center rounded-full border border-white/10 bg-white/10 p-0.5 text-[12px] font-semibold ${className}`} role="group" aria-label={T.language}>
      {item("ka", "ქარ")}
      {item("en", "EN")}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  პროდუქტის ილუსტრაციები (SVG — ჩაანაცვლეთ რეალური ფოტოებით)        */
/* ------------------------------------------------------------------ */
function ChipStack({ x, baseY, count, color, uid }) {
  return (
    <g>
      <ellipse cx={x} cy={baseY + 6} rx="30" ry="8" fill="#0f172a" opacity="0.14" />
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
      <rect x="-30" y="-44" width="60" height="88" rx="7" fill="#0f172a" opacity="0.14" transform="translate(3 5)" />
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
        <ellipse cx="116" cy="132" rx="96" ry="10" fill="#0f172a" opacity="0.14" />
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
        <ellipse cx="116" cy="134" rx="52" ry="8" fill="#0f172a" opacity="0.14" />
        <circle cx="116" cy="84" r="50" fill="#f5f5f4" />
        <circle cx="116" cy="84" r="50" fill={`url(#${uid}-shine)`} />
        <circle cx="116" cy="84" r="40" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="3" />
        <text x="116" y="91" textAnchor="middle" fontSize="19" fontWeight="700" fill="#18181b" fontFamily="'Noto Sans Georgian', sans-serif">
          {T.dealer}
        </text>
      </g>
    );
  } else if (kind === "shuffler") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="78" ry="8" fill="#0f172a" opacity="0.14" />
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
        <ellipse cx="116" cy="134" rx="48" ry="7" fill="#0f172a" opacity="0.14" />
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
function SearchField({ id, query, onQuery, className = "" }) {
  return (
    <label htmlFor={id} className={`relative block ${className}`}>
      <span className="sr-only">{T.search}</span>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={T.searchPh}
        className="h-11 w-full rounded-full border border-white/10 bg-white/10 pl-11 pr-4 text-[13px] text-white placeholder:text-white/60 transition-colors focus:border-white/40 focus:bg-white/15 focus:outline-none"
      />
    </label>
  );
}

/* „უფასო მიწოდება N ₾-დან“ — ზედა ზოლის შუაში (დიდ ეკრანზე) ან ცალკე ზოლად (ტელეფონზე) */
function FreeShipping({ strip = false }) {
  if (!CONFIG.freeShippingFrom) return null;
  return (
    <p
      className={`flex items-center justify-center whitespace-nowrap font-extrabold ${
        strip ? "gap-2 text-[13px] tracking-[0.02em]" : "gap-3 text-[17px] tracking-[0.14em] min-[1400px]:text-[18px] min-[1400px]:tracking-[0.18em]"
      }`}
    >
      <Truck className={`mp-drive shrink-0 ${strip ? "h-4 w-4 text-white" : "h-6 w-6 text-[#ff5a6e]"}`} strokeWidth={2.2} aria-hidden="true" />
      <span className="mp-shimmer">{T.freeDelivery}</span>
      <span className="mp-beat">
        <span className={`mp-num ${strip ? "mp-shimmer" : "mp-shimmer-red"}`}>{T.freeFrom(CONFIG.freeShippingFrom)}</span>
      </span>
    </p>
  );
}

function Header({ cartCount, onOpenCart, query, onQuery, onNavigate, productId }) {
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 bg-[#18191c] text-white shadow-[0_1px_0_rgba(0,0,0,0.2)]">
      {CONFIG.freeShippingFrom > 0 && (
        <div className="flex h-9 items-center justify-center bg-[#c8102e] px-4 xl:hidden">
          <FreeShipping strip />
        </div>
      )}
      {/* ლოგო | მიწოდება — მათ შორის დარჩენილი ადგილის შუაში | ძიება, ტელეფონი, კალათა */}
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6 xl:gap-6">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <Logo onNavigate={onNavigate} />
          <LangSwitch productId={productId} className="hidden sm:flex" />
        </div>

        <div className="hidden min-w-0 flex-1 justify-center xl:flex">
          <FreeShipping />
        </div>

        <div className="ml-auto flex items-center justify-end gap-2 xl:ml-0">
          <SearchField id="mp-search" query={query} onQuery={onQuery} className="hidden w-44 md:block xl:w-36 min-[1400px]:w-44" />

          <a
            href={`tel:${CONFIG.phoneTel}`}
            className="group flex h-11 items-center gap-2.5 rounded-full border border-white/10 bg-white/10 px-3 transition-colors hover:bg-white/15 sm:pr-4"
            aria-label={T.callAria(CONFIG.phoneDisplay)}
          >
            <span className="grid h-6 w-6 place-items-center rounded-full bg-[#15803d] text-white">
              <Phone className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-[10px] text-white/60">{T.callUs}</span>
              <span className="mp-num whitespace-nowrap text-[13px] font-semibold">{CONFIG.phoneDisplay}</span>
            </span>
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/10 transition-colors hover:bg-white/15"
            aria-label={T.cartAria(cartCount)}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            {cartCount > 0 && (
              <span key={cartCount} className="mp-num mp-pop absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#c8102e] px-1 text-[11px] font-bold text-white ring-2 ring-[#18191c]">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex h-[3.25rem] items-start gap-2 px-4 md:hidden">
        <SearchField id="mp-search-mobile" query={query} onQuery={onQuery} className="min-w-0 flex-1" />
        <LangSwitch productId={productId} className="mt-1.5 flex sm:hidden" />
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
      <p className="px-3 text-xs font-semibold text-[#5c5d61]">{title}</p>
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
      className={`flex items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors duration-200 ${
        active ? "bg-[#18191c] font-semibold text-white" : "text-[#18191c] hover:bg-[#e8e6e1]"
      }`}
    >
      {label}
      {count !== undefined && <span className={`mp-num text-xs ${active ? "text-white/60" : "text-[#8a8b90]"}`}>{count}</span>}
    </button>
  );
}

function Sidebar({ filter }) {
  const { category, setCategory, price, setPrice, counts, hasFilters, reset } = filter;
  return (
    <aside className="hidden lg:block">
      <div className={`sticky flex flex-col gap-7 ${CONFIG.freeShippingFrom > 0 ? "top-[7.25rem] xl:top-24" : "top-24"}`}>
        <FilterGroup title={T.category}>
          {CATEGORIES.map((c) => (
            <FilterOption key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} label={c.label} count={counts[c.id] || 0} />
          ))}
        </FilterGroup>
        <FilterGroup title={T.price}>
          {PRICE_RANGES.map((r) => (
            <FilterOption key={r.id} active={price === r.id} onClick={() => setPrice(r.id)} label={r.label} />
          ))}
        </FilterGroup>
        {hasFilters && (
          <button type="button" onClick={reset} className="px-3 text-left text-sm font-medium text-[#c8102e] hover:underline">
            {T.clearFilters}
          </button>
        )}
        <div className="rounded-2xl border border-[#e4e2dd] bg-white p-4">
          <p className="text-sm font-semibold text-[#18191c]">{T.waBoxTitle}</p>
          <p className="mt-1 text-xs leading-relaxed text-[#5c5d61]">{T.waBoxText}</p>
          <a href={`tel:${CONFIG.phoneTel}`} className="mp-num mt-3 block select-all text-sm font-semibold text-[#18191c] hover:text-[#15803d]">
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
    <div
      className={`sticky z-30 -mx-4 border-b border-[#e4e2dd] bg-[#f3f2ef]/95 px-4 py-3 backdrop-blur-md lg:hidden ${
        CONFIG.freeShippingFrom > 0
          ? "top-[calc(env(safe-area-inset-top,0px)+9.5rem)] md:top-[calc(env(safe-area-inset-top,0px)+6.25rem)]"
          : "top-[calc(env(safe-area-inset-top,0px)+7.25rem)] md:top-[calc(env(safe-area-inset-top,0px)+4rem)]"
      }`}
    >
      <div className="mp-scroll flex gap-2 overflow-x-auto" role="tablist" aria-label={T.categoriesAria}>
        {CATEGORIES.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setCategory(c.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors duration-200 ${
                active ? "border-[#18191c] bg-[#18191c] font-semibold text-white" : "border-[#d9d6d0] bg-white text-[#18191c]"
              }`}
            >
              {c.label}
              <span className={`mp-num text-[11px] ${active ? "text-white/60" : "text-[#8a8b90]"}`}>{counts[c.id] || 0}</span>
            </button>
          );
        })}
      </div>
      <label className="relative mt-2 block" htmlFor="mp-price-mobile">
        <span className="sr-only">{T.price}</span>
        <select
          id="mp-price-mobile"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="h-9 w-full appearance-none rounded-full border border-[#d9d6d0] bg-white pl-4 pr-9 text-[13px] text-[#18191c] focus:border-[#18191c] focus:outline-none"
        >
          {PRICE_RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {T.pricePrefix(r.label)}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5d61]" />
      </label>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  პროდუქტის სურათი: ატვირთული ფოტო ან ილუსტრაცია                     */
/* ------------------------------------------------------------------ */
function ProductMedia({ product, uid }) {
  const first = product.images[0];
  if (first) {
    return <img src={first.thumb} alt={product.name} loading="lazy" decoding="async" className="h-full w-full object-contain" />;
  }
  return <ProductVisual visual={product.visual} uid={uid} label={product.name} />;
}

/* ------------------------------------------------------------------ */
/*  პროდუქტის ბარათი                                                   */
/* ------------------------------------------------------------------ */
function ProductCard({ product, index, inCart, onAdd, onOpen }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;

  return (
    <article
      className="mp-rise group flex flex-col overflow-hidden rounded-2xl border border-[#e4e2dd] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#d2cfc8] hover:shadow-[0_18px_40px_-20px_rgba(24,25,28,0.28)]"
      style={{ animationDelay: `${Math.min(index, 11) * 40}ms` }}
    >
      <a
        href={productPath(product.id)}
        onClick={handleNav(onOpen, product.id)}
        className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-b from-[#f7f6f3] to-[#ebe9e4]"
        aria-label={T.detailsAria(product.name)}
        tabIndex={-1}
      >
        <div className="absolute inset-0 p-6 transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-105">
          <ProductMedia product={product} uid={`p-${product.id}`} />
        </div>
        {(product.badge || discount > 0) && (
          <div className="absolute left-3 top-3 flex gap-1.5">
            {discount > 0 && (
              <span className="mp-num rounded-md bg-[#c8102e] px-2 py-0.5 text-[11px] font-bold text-white">−{discount}%</span>
            )}
            {product.badge && <span className="rounded-md bg-[#18191c] px-2 py-0.5 text-[11px] font-medium text-white">{product.badge}</span>}
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug text-[#18191c]">
          <a href={productPath(product.id)} onClick={handleNav(onOpen, product.id)} className="transition-colors hover:text-[#c8102e]">
            {product.name}
          </a>
        </h3>
        <p className="mt-1 truncate text-[13px] text-[#5c5d61]">{product.spec}</p>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={`mp-num text-xl font-bold tracking-tight ${product.oldPrice ? "text-[#c8102e]" : "text-[#18191c]"}`}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <span className="mp-num text-xs text-[#8a8b90] line-through">{formatPrice(product.oldPrice)}</span>}
          </div>
          <span className={`text-xs font-medium ${product.inStock ? "text-[#15803d]" : "text-[#b45309]"}`}>
            {product.inStock ? T.inStock : T.onOrder}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={productWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#15803d] px-3 text-[13px] font-bold text-white transition-colors duration-200 hover:bg-[#166534] active:scale-[0.98]"
          >
            <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2.2} />
            {T.orderCta}
          </a>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition-colors duration-200 ${
              inCart ? "border-[#18191c] bg-[#18191c] text-white" : "border-[#d9d6d0] text-[#18191c] hover:border-[#18191c]"
            }`}
            aria-label={inCart ? T.inCartAria(product.name) : T.addAria(product.name)}
            title={inCart ? T.inCart : T.addToCart}
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
function Shop({ filter, cart, onOpen }) {
  const { category, query, sort, setSort, price, visible, hasFilters, reset } = filter;
  const inCart = useMemo(() => new Set(cart.lines.map((l) => l.product.id)), [cart.lines]);
  const gridKey = `${category}|${sort}|${price}|${query.trim()}`;
  const title = query.trim() ? T.searchTitle(query.trim()) : category === "all" ? T.allProducts : CATEGORY_LABEL[category];

  return (
    <main id="shop" className="mx-auto grid max-w-[1400px] gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[220px_1fr] lg:pt-6">
      <Sidebar filter={filter} />

      <section className="min-w-0" aria-label={T.productsAria}>
        <MobileFilters filter={filter} />

        <div className="mt-4 flex items-center justify-between gap-3 lg:mt-0">
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-tight text-[#18191c] sm:text-2xl">{title}</h1>
            <p className="mp-num text-sm text-[#5c5d61]" aria-live="polite">
              {T.productCount(visible.length)}
            </p>
          </div>
          <label className="relative shrink-0" htmlFor="mp-sort">
            <span className="sr-only">{T.sort}</span>
            <select
              id="mp-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 max-w-[10.5rem] appearance-none truncate rounded-full border border-[#d9d6d0] bg-white pl-4 pr-9 text-[13px] text-[#18191c] transition-colors focus:border-[#18191c] focus:outline-none"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5c5d61]" />
          </label>
        </div>

        {visible.length > 0 ? (
          <div key={gridKey} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visible.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} inCart={inCart.has(product.id)} onAdd={cart.add} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <div className="mp-fade mt-5 flex flex-col items-center rounded-2xl border border-dashed border-[#d2cfc8] bg-white px-6 py-16 text-center">
            <Search className="h-6 w-6 text-[#8a8b90]" />
            <p className="mt-3 font-semibold text-[#18191c]">{T.noResults}</p>
            <p className="mt-1 text-sm text-[#5c5d61]">{T.noResultsHint}</p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mt-5 rounded-full bg-[#18191c] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#2c2d31]"
              >
                {T.clearFilters}
              </button>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  ფოტო-გალერეა: მთავარი ფოტო, მინიატურები, გადაფურცვლა, სრული ეკრანი    */
/* ------------------------------------------------------------------ */
function Gallery({ product }) {
  const images = product.images;
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const count = images.length;
  const go = (d) => setIndex((i) => (i + d + count) % count);

  useEffect(() => {
    if (!zoom) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom, count]);

  if (!count) {
    return (
      <div className="aspect-square overflow-hidden rounded-3xl border border-[#e4e2dd] bg-gradient-to-b from-[#f7f6f3] to-[#ebe9e4] p-10">
        <ProductVisual visual={product.visual} uid={`g-${product.id}`} label={product.name} />
      </div>
    );
  }

  const swipe = {
    onTouchStart: (e) => (touch.current = e.touches[0].clientX),
    onTouchEnd: (e) => {
      if (touch.current === null) return;
      const dx = e.changedTouches[0].clientX - touch.current;
      touch.current = null;
      if (Math.abs(dx) > 40 && count > 1) go(dx < 0 ? 1 : -1);
    },
  };
  const arrow = "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#18191c] shadow-md transition hover:bg-white";

  return (
    <div className="flex flex-col gap-3">
      <div className="group relative aspect-square overflow-hidden rounded-3xl border border-[#e4e2dd] bg-white" {...swipe}>
        <button type="button" onClick={() => setZoom(true)} className="absolute inset-0 cursor-zoom-in" aria-label={T.zoom}>
          <img
            key={images[index].src}
            src={images[index].src}
            alt={T.photoAlt(product.name, index + 1)}
            className="mp-fade h-full w-full object-contain p-4"
          />
        </button>
        <span className="pointer-events-none absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-[#18191c] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
        {count > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} className={`${arrow} left-3`} aria-label={T.prevPhoto}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} className={`${arrow} right-3`} aria-label={T.nextPhoto}>
              <ChevronRight className="h-5 w-5" />
            </button>
            <span className="mp-num absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-[#18191c]/75 px-2.5 py-0.5 text-xs text-white">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mp-scroll flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-white p-1 transition-colors ${
                i === index ? "border-[#18191c]" : "border-[#e4e2dd] hover:border-[#b9b6af]"
              }`}
              aria-label={T.photo(i + 1)}
              aria-current={i === index}
            >
              <img src={img.thumb} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="mp-fade fixed inset-0 z-[60] flex items-center justify-center bg-[#0b0c0e]/95" role="dialog" aria-modal="true" aria-label={product.name} {...swipe}>
          <button type="button" className="absolute inset-0 cursor-zoom-out" onClick={() => setZoom(false)} aria-label={T.close} />
          <img src={images[index].src} alt={T.photoAlt(product.name, index + 1)} className="relative max-h-[92vh] max-w-[94vw] object-contain" />
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label={T.close}
          >
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className="absolute left-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={T.prevPhoto}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => go(1)} className="absolute right-3 grid h-12 w-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" aria-label={T.nextPhoto}>
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="mp-num absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] text-sm text-white/80">
                {index + 1} / {count}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  აღწერა: ცარიელი ხაზი — ახალი აბზაცი, „-“ ან „•“ — სიის პუნქტი        */
/* ------------------------------------------------------------------ */
function Description({ text }) {
  const blocks = text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean))
    .filter((lines) => lines.length);
  return (
    <div className="flex max-w-3xl flex-col gap-4 text-[15px] leading-relaxed text-[#2c2d31]">
      {blocks.map((lines, i) =>
        lines.every((l) => /^[-•*]\s*/.test(l)) ? (
          <ul key={i} className="flex flex-col gap-1.5">
            {lines.map((l, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#c8102e]" />
                <span>{l.replace(/^[-•*]\s*/, "")}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>
            {lines.map((l, j) => (
              <React.Fragment key={j}>
                {j > 0 && <br />}
                {l}
              </React.Fragment>
            ))}
          </p>
        )
      )}
    </div>
  );
}

const formatDate = (iso) => {
  const [y, m, d] = iso.split("-").map(Number);
  return y && m && d ? T.dateFmt(d, T.months[m - 1]) : iso;
};

/* ------------------------------------------------------------------ */
/*  პროდუქტის გვერდი                                                   */
/* ------------------------------------------------------------------ */
function ProductPage({ product, cart, onNavigate }) {
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
  const inCart = cart.lines.some((l) => l.product.id === product.id);
  const related = useMemo(() => {
    const same = PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category);
    const others = PRODUCTS.filter((p) => p.id !== product.id && p.category !== product.category);
    return [...same, ...others].slice(0, 4);
  }, [product.id]);
  const cartIds = useMemo(() => new Set(cart.lines.map((l) => l.product.id)), [cart.lines]);

  return (
    <main className="mx-auto max-w-[1200px] px-4 pb-16 pt-5 sm:px-6 lg:pt-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[#5c5d61]" aria-label={T.breadcrumb}>
        <a href={HOME_PATH} onClick={handleNav(onNavigate, null)} className="inline-flex items-center gap-1.5 font-medium text-[#18191c] hover:text-[#c8102e]">
          <ArrowLeft className="h-4 w-4" />
          {T.shop}
        </a>
        <span aria-hidden="true">/</span>
        <span>{CATEGORY_LABEL[product.category]}</span>
      </nav>

      <div className="mp-rise mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery key={product.id} product={product} />

        <div className="flex min-w-0 flex-col">
          {(product.badge || discount > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {discount > 0 && <span className="mp-num rounded-md bg-[#c8102e] px-2 py-0.5 text-xs font-bold text-white">−{discount}%</span>}
              {product.badge && <span className="rounded-md bg-[#18191c] px-2 py-0.5 text-xs font-medium text-white">{product.badge}</span>}
            </div>
          )}
          <h1 className="mt-3 text-2xl font-bold leading-tight text-[#18191c] sm:text-3xl">{product.name}</h1>
          {product.spec && <p className="mt-2 text-[15px] text-[#5c5d61]">{product.spec}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className={`mp-num text-3xl font-bold tracking-tight ${product.oldPrice ? "text-[#c8102e]" : "text-[#18191c]"}`}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <span className="mp-num text-lg text-[#8a8b90] line-through">{formatPrice(product.oldPrice)}</span>}
          </div>
          {product.oldPrice && product.saleEnds && (
            <p className="mt-1 text-sm font-medium text-[#c8102e]">{T.saleUntil(formatDate(product.saleEnds))}</p>
          )}
          <p className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium ${product.inStock ? "text-[#15803d]" : "text-[#b45309]"}`}>
            <span className={`h-2 w-2 rounded-full ${product.inStock ? "bg-[#15803d]" : "bg-[#b45309]"}`} />
            {product.inStock ? T.inStock : T.onOrderLong}
          </p>

          <div className="mt-6 flex gap-2">
            <a
              href={productWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#15803d] px-4 text-sm font-bold text-white transition-colors hover:bg-[#166534] active:scale-[0.98]"
            >
              <MessageCircle className="h-5 w-5 shrink-0" strokeWidth={2.2} />
              {T.orderCta}
            </a>
            <button
              type="button"
              onClick={() => cart.add(product.id)}
              className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl border transition-colors ${
                inCart ? "border-[#18191c] bg-[#18191c] text-white" : "border-[#d9d6d0] bg-white text-[#18191c] hover:border-[#18191c]"
              }`}
              aria-label={inCart ? T.inCartMore : T.addToCart}
              title={inCart ? T.inCart : T.addToCart}
            >
              {inCart ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            </button>
          </div>
          {CONFIG.phoneDisplay && (
            <p className="mt-3 text-sm text-[#5c5d61]">
              {T.orCall}{" "}
              <a href={`tel:${CONFIG.phoneTel}`} className="mp-num select-all font-semibold text-[#18191c] hover:text-[#15803d]">
                {CONFIG.phoneDisplay}
              </a>
            </p>
          )}
          <ul className="mt-6 flex flex-col gap-2 border-t border-[#e4e2dd] pt-5 text-sm text-[#5c5d61]">
            <li>✓ {T.perkDelivery}</li>
            <li>✓ {T.perkConfirm}</li>
          </ul>
        </div>
      </div>

      {product.description.trim() && (
        <section className="mt-12 border-t border-[#e4e2dd] pt-8" aria-labelledby="mp-desc">
          <h2 id="mp-desc" className="text-xl font-bold text-[#18191c]">{T.description}</h2>
          <div className="mt-4">
            <Description text={product.description} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12 border-t border-[#e4e2dd] pt-8" aria-labelledby="mp-related">
          <h2 id="mp-related" className="text-xl font-bold text-[#18191c]">{T.related}</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              /* 4 ბარათი ორ სვეტად, 3 — სამ სვეტად; მეოთხე დიდ ეკრანზე იმალება, რომ რიგი სრული იყოს */
              <div key={p.id} className={`grid ${i === 3 ? "lg:hidden" : ""}`}>
                <ProductCard product={p} index={i} inCart={cartIds.has(p.id)} onAdd={cart.add} onOpen={onNavigate} />
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function NotFound({ onNavigate }) {
  return (
    <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <p className="text-5xl">♠</p>
      <h1 className="mt-4 text-2xl font-bold text-[#18191c]">{T.notFound}</h1>
      <p className="mt-2 text-[#5c5d61]">{T.notFoundText}</p>
      <a
        href={HOME_PATH}
        onClick={handleNav(onNavigate, null)}
        className="mt-6 rounded-full bg-[#18191c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#2c2d31]"
      >
        {T.backToShop}
      </a>
    </main>
  );
}

/* ------------------------------------------------------------------ */
/*  კალათის პანელი                                                     */
/* ------------------------------------------------------------------ */
function CartDrawer({ open, onClose, cart, onOpenProduct }) {
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={T.cart}>
      <button type="button" className="mp-fade absolute inset-0 bg-[#18191c]/40 backdrop-blur-[2px]" onClick={onClose} aria-label={T.close} />
      <aside className="mp-slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#e4e2dd] px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-[#18191c]">{T.cart}</h2>
            <p className="mp-num text-xs text-[#5c5d61]">{T.items(cart.count)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full text-[#5c5d61] transition-colors hover:bg-[#f3f2ef] hover:text-[#18191c]"
            aria-label={T.closeCart}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-[#8a8b90]" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-[#18191c]">{T.cartEmpty}</p>
            <p className="mt-1 text-sm text-[#5c5d61]">{T.cartEmptyText}</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-[#18191c] px-5 py-2 text-sm font-semibold text-white hover:bg-[#2c2d31]">
              {T.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[#eceae5] overflow-y-auto px-5">
              {cart.lines.map(({ product, qty }) => (
                <li key={product.id} className="mp-fade flex gap-3 py-4">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-b from-[#f7f6f3] to-[#ebe9e4] p-1.5">
                    <ProductMedia product={product} uid={`c-${product.id}`} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <a
                      href={productPath(product.id)}
                      onClick={handleNav(onOpenProduct, product.id)}
                      className="line-clamp-2 text-[13px] font-medium leading-snug text-[#18191c] hover:text-[#c8102e]"
                    >
                      {product.name}
                    </a>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-full border border-[#d9d6d0]">
                        <button
                          type="button"
                          onClick={() => cart.decrement(product.id)}
                          className="grid h-8 w-8 place-items-center text-[#5c5d61] hover:text-[#18191c]"
                          aria-label={T.decrease}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="mp-num w-5 text-center text-[13px] font-semibold text-[#18191c]">{qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.add(product.id)}
                          className="grid h-8 w-8 place-items-center text-[#5c5d61] hover:text-[#18191c]"
                          aria-label={T.increase}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="mp-num text-sm font-bold text-[#18191c]">{formatPrice(product.price * qty)}</span>
                        <button
                          type="button"
                          onClick={() => cart.remove(product.id)}
                          className="text-[#8a8b90] transition-colors hover:text-[#c8102e]"
                          aria-label={T.removeAria(product.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-[#e4e2dd] bg-[#f8f7f5] px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-[#5c5d61]">{T.total}</span>
                <span className="mp-num text-2xl font-bold text-[#18191c]">{formatPrice(cart.total)}</span>
              </div>
              <a
                href={cartWhatsAppLink(cart.lines, cart.total)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#15803d] text-sm font-bold text-white transition-colors hover:bg-[#166534]"
              >
                <MessageCircle className="h-4 w-4" />
                {T.orderCta}
              </a>
              <p className="mt-3 text-center text-xs text-[#8a8b90]">{T.paySoon}</p>
              <button type="button" onClick={cart.clear} className="mt-2 w-full text-xs text-[#5c5d61] transition-colors hover:text-[#c8102e]">
                {T.clearCart}
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
    <footer className="bg-[#18191c] text-white">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 px-4 py-6 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <LogoMark size={24} />
          <span className="text-xs text-white/70">© {new Date().getFullYear()} mypoker.ge · {T.rights}</span>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <a href={`tel:${CONFIG.phoneTel}`} className="mp-num select-all font-semibold hover:text-white/80">
            {CONFIG.phoneDisplay}
          </a>
          <a
            href={buildWhatsAppLink(T.waHello)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-[#4ade80] hover:text-[#86efac]"
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
  const [route, navigate] = useRoute();
  const product = route.productId ? PRODUCTS.find((p) => p.id === route.productId) : null;

  useEffect(() => {
    document.documentElement.lang = LANG;
    document.title = product ? `${product.name} — mypoker.ge` : T.siteTitle;
  }, [product]);
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
    <div id="top" className="mp-sans mp-pattern flex min-h-screen flex-col text-[#18191c] antialiased selection:bg-[#c8102e]/15">
      <style>{GLOBAL_CSS}</style>
      <Header
        cartCount={cart.count}
        onOpenCart={openCart}
        query={filter.query}
        onQuery={(q) => {
          filter.setQuery(q);
          if (route.productId) navigate(null);
        }}
        onNavigate={navigate}
        productId={route.productId}
      />
      <div className="flex-1">
        {!route.productId ? (
          <Shop filter={filter} cart={cartApi} onOpen={navigate} />
        ) : product ? (
          <ProductPage product={product} cart={cartApi} onNavigate={navigate} />
        ) : (
          <NotFound onNavigate={navigate} />
        )}
      </div>
      <Footer />
      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        cart={cartApi}
        onOpenProduct={(id) => {
          setCartOpen(false);
          navigate(id);
        }}
      />

      {toast && (
        <div
          key={toast.id}
          className="mp-toast fixed bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-2xl bg-[#18191c] py-2.5 pl-3 pr-4 text-white shadow-2xl"
          role="status"
        >
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#15803d]">
            <Check className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px]">{T.added} {toast.name}</p>
          <button type="button" onClick={openCart} className="shrink-0 text-[13px] font-bold text-[#4ade80] hover:text-[#86efac]">
            {T.view}
          </button>
        </div>
      )}
    </div>
  );
}
