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
  ArrowUpRight,
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
    freeDelivery: ["უფასო მიწოდება", "თბილისის მასშტაბით"],
    freeDeliveryShort: ["უფასო მიწოდება", "თბილისში"],
    freeFrom: (n) => `${n} ლარიდან`,
    callUs: "დაგვირეკეთ",
    callAria: (p) => `დაგვირეკეთ: ${p}`,
    cartAria: (n) => `კალათა, ${n} ნივთი`,
    category: "კატეგორია",
    clearFilters: "ფილტრების გასუფთავება",
    waBoxTitle: "შესაკვეთად დაგვიკავშირდით",
    waBoxText: "აირჩიეთ პროდუქტი და დაგვირეკეთ ან მოგვწერეთ — გიპასუხებთ რამდენიმე წუთში.",
    callBtn: "დარეკვა",
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
    cat: { all: "ყველა", cards: "კარტები", chips: "ჩიპები", tables: "მაგიდები", accessories: "პოკერის აქსესუარები", poker: "პოკერი", games: "სამაგიდო თამაშები და აქსესუარები" },
    gameSub: { backgammon: "ნარდი", domino: "დომინო", chess: "ჭადრაკი", boardgames: "Board Games", fun: "სხვა გასართობი" },
    sorts: { featured: "რეკომენდებული", "price-asc": "ჯერ იაფი", "price-desc": "ჯერ ძვირი", sale: "ჯერ ფასდაკლებული" },
  },
  en: {
    homeAria: "mypoker.ge — home",
    dealer: "DEALER",
    search: "Search",
    searchPh: "Search",
    freeDelivery: ["Free delivery", "in Tbilisi"],
    freeDeliveryShort: ["Free delivery", "in Tbilisi"],
    freeFrom: (n) => `from ${n} ₾`,
    callUs: "Call us",
    callAria: (p) => `Call us: ${p}`,
    cartAria: (n) => `Cart, ${n} ${n === 1 ? "item" : "items"}`,
    category: "Category",
    clearFilters: "Clear filters",
    waBoxTitle: "Contact us to order",
    waBoxText: "Pick a product and call or message us — we reply within minutes.",
    callBtn: "Call",
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
    cat: { all: "All", cards: "Cards", chips: "Chips", tables: "Tables", accessories: "Poker accessories", poker: "Poker", games: "Tabletop games & accessories" },
    gameSub: { backgammon: "Backgammon", domino: "Dominoes", chess: "Chess", boardgames: "Board games", fun: "Other fun" },
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
/* ორი განყოფილება: „პოკერი“ (წითელი, ლოგოს ფერი) და „სამაგიდო თამაშები და აქსესუარები“ (ოქროსფერი).
   ფილტრის მნიშვნელობა: "all", "poker", პოკერის კატეგორია ("cards" …), "games" ან "games:<ქვეკატეგორია>" */
const POKER_CATS = ["cards", "chips", "tables", "accessories"];
const GAME_SUBS = ["backgammon", "domino", "chess", "boardgames", "fun"];
const SECTIONS = [
  { id: "poker", items: POKER_CATS.map((id) => ({ id, label: T.cat[id] })) },
  { id: "games", items: GAME_SUBS.map((sub) => ({ id: `games:${sub}`, label: T.gameSub[sub] })) },
];
const inCategory = (p, category) =>
  category === "all" ||
  p.category === category ||
  (category === "poker" && POKER_CATS.includes(p.category)) ||
  (category.startsWith("games:") && p.category === "games" && `games:${p.subcategory}` === category);

const CATEGORY_LABEL = {
  ...Object.fromEntries(POKER_CATS.map((id) => [id, T.cat[id]])),
  poker: T.cat.poker,
  games: T.cat.games,
  ...Object.fromEntries(GAME_SUBS.map((sub) => [`games:${sub}`, T.gameSub[sub]])),
};

const SORTS = ["featured", "price-asc", "price-desc", "sale"].map((id) => ({ id, label: T.sorts[id] }));

const DEFAULT_VISUAL = {
  chips: { kind: "chips", colors: ["#6e2c32", "#3b2e27", "#b0916a"] },
  cards: { kind: "cards", colors: ["#3a4553", "#f6f1e8", "#7a3037"] },
  tables: { kind: "table", colors: ["#3d5a4a", "#5a4030", "#c9b78c"] },
  accessories: { kind: "dealer" },
  "games:backgammon": { kind: "backgammon" },
  "games:domino": { kind: "domino" },
  "games:chess": { kind: "chess" },
  "games:boardgames": { kind: "boardgame" },
  "games:fun": { kind: "dice" },
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
  const subcategory = p.category === "games" ? (GAME_SUBS.includes(p.subcategory) ? p.subcategory : "fun") : "";
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
    searchText: [p.name, p.nameEn, p.spec, p.specEn].filter((x) => typeof x === "string").join(" ").toLowerCase(),
    visual: p.visual || DEFAULT_VISUAL[p.category === "games" ? `games:${subcategory}` : p.category] || DEFAULT_VISUAL.accessories,
    subcategory,
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
    if (productId === route.productId) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
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

/* ელემენტი ჩნდება, როცა ეკრანზე შემოდის (ერთხელ) */
function useReveal() {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return undefined;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [shown]);
  return [ref, shown];
}

/* გვერდი ჩამოსქროლილია? (ზედა ზოლს ჩრდილი უჩნდება) */
function useScrolled(threshold = 8) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

function useProductFilter(products) {
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");

  const counts = useMemo(() => {
    const c = { all: products.length };
    products.forEach((p) => {
      c[p.category] = (c[p.category] || 0) + 1;
      if (POKER_CATS.includes(p.category)) c.poker = (c.poker || 0) + 1;
      if (p.subcategory) c[`games:${p.subcategory}`] = (c[`games:${p.subcategory}`] || 0) + 1;
    });
    return c;
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter((p) => inCategory(p, category) && (!q || p.searchText.includes(q)));
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "sale") sorted.sort((a, b) => (b.oldPrice ? 1 - b.price / b.oldPrice : 0) - (a.oldPrice ? 1 - a.price / a.oldPrice : 0));
    return sorted;
  }, [products, category, query, sort]);

  const hasFilters = category !== "all" || query.trim() !== "";
  const reset = () => {
    setCategory("all");
    setQuery("");
  };

  return { category, setCategory, query, setQuery, sort, setSort, counts, visible, hasFilters, reset };
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
/* ------------------------------------------------------------------ */
/*  ფერები — „Quiet Luxury“ (Cashmere & Claret)                         */
/*  ყველა ფერი აქ ინახება: CSS ცვლადებად გადადის (--ink, --brand …),     */
/*  ფონის პატერნი და ლოგოც მათ იყენებს.                                */
/*  შვრიისფერი ფონი, სპილოსძვლისფერი ზედაპირები, ესპრესოს ტექსტი,       */
/*  ჩუმი ბორდო (პოკერი, ფასდაკლება), ღრმა ბოთლისფერი მწვანე (შეკვეთა),  */
/*  აქლემისფერი/შამპანური (თამაშები, შეთავაზება). გრადიენტების გარეშე. */
/* ------------------------------------------------------------------ */
const PAL = {
  pattern: { ink: "#3b2e27", accent: "#6e2c32" },
  vars: {
    bg: "#cdc3b4", "bg-glass": "rgba(205,195,180,.9)",
    surface: "#f6f1e8", "surface-2": "#ece5d9", "surface-3": "#e4dbcc",
    line: "#d8cebe", "line-strong": "#8a7965",
    ink: "#2a201b", "ink-2": "#43362e", muted: "#52453b", faint: "#8a7965",
    brand: "#6e2c32", "brand-2": "#5a2328",
    "bar-bg": "#3b2e27", "bar-text": "#efe6d8", "pill-bg": "#c6a97f", "pill-text": "#2a201b",
    cta: "#2f4a3c", "cta-hover": "#253c30", "cta-text": "#f6f1e8",
    call: "#2f4a3c", "call-on-dark": "#4f7d60", "call-ring": "rgba(79,125,96,.5)",
    badge: "#6e2c32",
    sale: "#7a3037", "sale-badge": "#6e2c32", "sale-badge-text": "#f6f1e8", "sale-tint": "rgba(110,44,50,.1)",
    ok: "#2f5a43", "ok-tint": "rgba(47,90,67,.14)", wait: "#74552f", "wait-tint": "rgba(116,85,47,.14)",
    "poker-plate": "#6e2c32", "poker-plate-text": "#f6f1e8", "poker-plate-hover": "#5f262b", "poker-plate-ico": "rgba(246,241,232,.16)",
    "poker-tint": "#f1e5e0", "poker-sub": "#552429", "poker-ico": "#8c4d52", "poker-count": "#8c4d52",
    "poker-on": "#e6d3cd", "poker-on-text": "#552429", "poker-hover": "rgba(110,44,50,.07)", "poker-line": "rgba(110,44,50,.22)",
    "poker-text": "#6e2c32", "poker-chip-on": "#6e2c32", "poker-chip-on-text": "#f6f1e8",
    "games-plate": "#c2a274", "games-plate-text": "#2a201b", "games-plate-hover": "#b5946a", "games-plate-ico": "rgba(42,32,27,.08)",
    "games-tint": "#f0e8d8", "games-tint-hover": "#e9dfcb", "games-sub": "#4f3c25", "games-ico": "#806240", "games-count": "#806240",
    "games-on": "#e5d8bf", "games-on-text": "#4f3c25", "games-hover": "rgba(194,162,116,.18)", "games-line": "rgba(128,98,64,.3)",
    "games-text": "#4f3c25", "games-chip-on": "#c2a274", "games-chip-on-text": "#2a201b",
    active: "#3b2e27", "active-hover": "#2e2520", "on-dark": "#f6f1e8", "on-dark-muted": "rgba(246,241,232,.72)",
    "opt-hover": "rgba(246,241,232,.6)",
    dark: "#2e2520", "dark-text": "#efe7da", "dark-muted": "#b9a993", "dark-accent": "#d4bc94",
    focus: "#6e2c32", "focus-dark": "#d4bc94",
    scrim: "rgba(42,32,27,.35)", lightbox: "rgba(30,24,20,.94)", ring: "rgba(42,32,27,.08)", selection: "rgba(110,44,50,.16)", scrollbar: "#8a7965",
    "shadow-soft": "rgba(42,32,27,.06)", shadow: "rgba(42,32,27,.12)", "shadow-strong": "rgba(42,32,27,.22)",
  },
};

/* ფონის პატერნი: კარტის ოთხი ნიშანი, მკრთალად (♠ ♥ ♦ ♣) */
const suitAt = (d, x, y, r, fill, opacity) =>
  `<path d="${d}" fill="${fill}" fill-opacity="${opacity}" transform="translate(${x} ${y}) rotate(${r} 12 12) scale(.75)"/>`;
const PATTERN_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">` +
  suitAt(SUIT.spade, 10, 12, -12, PAL.pattern.ink, 0.055) +
  suitAt(SUIT.heart, 72, 8, 10, PAL.pattern.accent, 0.065) +
  suitAt(SUIT.diamond, 40, 70, 8, PAL.pattern.accent, 0.065) +
  suitAt(SUIT.club, 92, 76, -10, PAL.pattern.ink, 0.055) +
  `</svg>`;
const PATTERN_URL = `url("data:image/svg+xml,${encodeURIComponent(PATTERN_SVG)}")`;

/*
  დიზაინ-სისტემა — „Quiet Luxury“: ჩუმი, თბილი, დახვეწილი ტონები, ერთფეროვანი ზედაპირები, 8pt ბადე
  ფერები ერთ ადგილას ინახება (PAL) — CSS ცვლადებად გადადის და SVG ილუსტრაციებიც მათ იყენებს.
*/
const ROOT_VARS = Object.entries(PAL.vars)
  .map(([k, v]) => `--${k}: ${v};`)
  .join(" ");

const GLOBAL_CSS = `
  :root {
    color-scheme: light;
    ${ROOT_VARS}
    --ease: cubic-bezier(.4,0,.2,1); --ease-out: cubic-bezier(.16,1,.3,1);
    --r: 8px; --r-lg: 16px;
    --e1: 0 1px 2px var(--shadow-soft);
    --e2: 0 8px 24px -8px var(--shadow);
    --e3: 0 16px 40px -16px var(--shadow-strong);
  }
  html { scrollbar-color: var(--scrollbar) var(--bg); scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: var(--ink); -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility; }
  ::selection { background: var(--selection); color: var(--ink); }

  /* ---------- ტიპოგრაფია: Noto Sans Georgian, 14/24 საბაზისო ---------- */
  .mp-sans { font-family: 'Noto Sans Georgian', system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; line-height: 24px; font-feature-settings: "kern", "liga"; }
  .mp-sans h1, .mp-sans h2, .mp-sans h3 { letter-spacing: -0.01em; }
  .mp-sans *, .mp-sans *::before, .mp-sans *::after { transition-timing-function: var(--ease); }
  .mp-brand { font-family: 'Noto Sans Georgian', system-ui, sans-serif; }
  .mp-num { font-variant-numeric: tabular-nums; }
  .mp-title { color: var(--ink); }
  .mp-price { letter-spacing: -0.01em; }
  .mp-link { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size .3s var(--ease), color .3s var(--ease); }

  /* ---------- გვერდი ---------- */
  .mp-pattern { background-color: var(--bg); background-image: ${PATTERN_URL}; background-size: 120px 120px; }

  /* ---------- ზედა ზოლი ---------- */
  .mp-header { background: var(--surface); border-bottom: 1px solid var(--line); transition: box-shadow .3s var(--ease); }
  .mp-header-scrolled { box-shadow: 0 8px 24px -12px var(--shadow-strong); }
  .mp-strip { background: var(--bar-bg); }
  .mp-header .mp-field { background: var(--surface-2); }

  /* ---------- მართვის ელემენტები ---------- */
  .mp-ctl { color: var(--ink); background: var(--surface); border: 1px solid var(--line);
    transition: background-color .2s var(--ease), border-color .2s var(--ease), color .2s var(--ease), transform .2s var(--ease); }
  .mp-ctl-on { color: var(--on-dark); background: var(--active); border-color: var(--active); }
  .mp-segbox { background: var(--surface-2); }
  .mp-seg { color: var(--muted); transition: color .2s var(--ease), background-color .2s var(--ease); }
  .mp-seg-on { color: var(--ink); background: var(--surface); box-shadow: var(--e1); }
  .mp-call-dot { color: var(--on-dark); background: var(--call); }
  .mp-count-badge { color: var(--on-dark); background: var(--badge); box-shadow: 0 0 0 2px var(--surface); }

  /* ---------- ველები ---------- */
  .mp-field { color: var(--ink); background: var(--surface); border: 1px solid transparent; border-radius: var(--r);
    transition: border-color .2s var(--ease), box-shadow .2s var(--ease), background-color .2s var(--ease); }
  .mp-field::placeholder { color: var(--muted); }
  .mp-field:focus { outline: none; background: var(--surface); border-color: var(--ink); box-shadow: 0 0 0 4px var(--ring); }

  /* ---------- შეკვეთის ღილაკი ---------- */
  .mp-cta { position: relative; overflow: hidden; color: var(--cta-text); background: var(--cta); border-radius: var(--r);
    transition: background-color .2s var(--ease), transform .2s var(--ease), box-shadow .2s var(--ease); }
  .mp-cta svg { transition: transform .3s var(--ease-out); }

  /* ---------- ზედაპირები ---------- */
  .mp-panel { border-radius: var(--r-lg); background: var(--surface); border: 1px solid var(--line); }
  .mp-card { position: relative; container-type: inline-size; background: var(--surface); border: 1px solid var(--line); border-radius: var(--r-lg); transition: transform .3s var(--ease), box-shadow .3s var(--ease); }
  /* ვიწრო ბარათზე ღილაკის ტექსტი ერთ ხაზზე რჩება — ხატულა იმალება */
  @container (max-width: 300px) { .mp-card .mp-cta { font-size: 12px; padding-left: 8px; padding-right: 8px; } .mp-card .mp-cta > svg { display: none; } }
  .mp-card h3 > a:focus-visible { outline: none; color: var(--brand); text-decoration: underline; }
  .mp-tile { position: relative; border-radius: var(--r); background: var(--surface-2); transition: background-color .4s var(--ease); }
  .mp-tile.mp-tile-lg { border-radius: var(--r-lg); background-color: var(--surface); }
  .mp-tile :focus-visible { outline-offset: -4px; border-radius: inherit; }
  .mp-tile-media { transition: transform .7s var(--ease-out); }
  .mp-card-games .mp-tile, .mp-tile.mp-tile-games { background: var(--games-tint); }
  .mp-drawer { background: var(--surface); box-shadow: -24px 0 64px -24px var(--shadow-strong); }
  @media (min-width: 640px) { .mp-drawer { border-radius: var(--r-lg); } }
  .mp-glass { background: var(--dark); color: var(--dark-text); box-shadow: var(--e3); }
  .mp-glass .mp-call-dot, footer .mp-call-dot { color: var(--on-dark); background: var(--call-on-dark); }
  .mp-strip :focus-visible, .mp-dock :focus-visible, footer :focus-visible, .mp-glass :focus-visible { outline-color: var(--focus-dark); }
  .mp-float { color: var(--ink); background: var(--surface); box-shadow: var(--e1);
    transition: background-color .2s var(--ease), color .2s var(--ease), transform .3s var(--ease), scale .2s var(--ease), opacity .3s var(--ease), translate .3s var(--ease); }

  /* ---------- ფილტრები და ჩიპები ---------- */
  .mp-opt { position: relative; border-radius: var(--r); color: var(--ink-2); transition: background-color .2s var(--ease), color .2s var(--ease); }
  .mp-opt .mp-count { color: var(--muted); }
  .mp-opt-on { color: var(--ink); background: var(--surface); }
  .mp-opt-on::before { content: ''; position: absolute; left: 0; top: 8px; bottom: 8px; width: 2px; border-radius: 2px; background: var(--active); }
  .mp-chip { border-radius: var(--r); color: var(--ink-2); background: var(--surface); border: 1px solid var(--line); transition: background-color .2s var(--ease), border-color .2s var(--ease), color .2s var(--ease); }
  .mp-chip:not(.mp-chip-on) .mp-count { color: var(--muted); }
  .mp-chip-on { color: var(--on-dark); border-color: var(--active); background: var(--active); }
  .mp-chip-on .mp-count { color: var(--on-dark-muted); }
  .mp-thumb { border-radius: var(--r); border: 1px solid var(--line); background: var(--surface-2); transition: border-color .2s var(--ease), transform .3s var(--ease); }
  .mp-thumb-on { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
  .mp-stepper { border-radius: var(--r); border: 1px solid var(--line); }
  .mp-stepper button { border-radius: var(--r); transition: background-color .2s var(--ease), color .2s var(--ease); }

  /* ---------- ბეჯები ---------- */
  .mp-badge-sale { color: var(--sale-badge-text); background: var(--sale-badge); }
  .mp-badge { color: var(--ink); background: var(--surface); }
  .mp-dot-ok { background: var(--ok); box-shadow: 0 0 0 4px var(--ok-tint); }
  .mp-dot-wait { background: var(--wait); box-shadow: 0 0 0 4px var(--wait-tint); }
  .mp-bullet { background: var(--brand); }
  .mp-check { color: var(--ok); background: var(--ok-tint); }

  /* ---------- ორი განყოფილება: პოკერი და სამაგიდო თამაშები ---------- */
  .mp-sec-poker { background: var(--poker-tint); }
  .mp-sec-games { background: var(--games-tint); }
  .mp-plate { position: relative; overflow: hidden; isolation: isolate; border-radius: var(--r); transition: background-color .2s var(--ease), transform .2s var(--ease); }
  .mp-plate-poker { color: var(--poker-plate-text); background: var(--poker-plate); }
  .mp-plate-games { color: var(--games-plate-text); background: var(--games-plate); }
  .mp-plate-ico { display: grid; place-items: center; flex-shrink: 0; border-radius: var(--r); }
  .mp-plate-poker .mp-plate-ico { background: var(--poker-plate-ico); }
  .mp-plate-games .mp-plate-ico { background: var(--games-plate-ico); }
  .mp-plate-sub { opacity: .8; }
  .mp-plate-mark { position: absolute; z-index: -1; pointer-events: none; opacity: .12; transition: transform .6s var(--ease-out); }
  .mp-plate-poker.mp-plate-on { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--poker-plate); }
  .mp-plate-games.mp-plate-on { box-shadow: 0 0 0 2px var(--surface), 0 0 0 4px var(--games-plate); }
  .mp-sub { position: relative; border-radius: var(--r); transition: background-color .2s var(--ease), color .2s var(--ease); }
  .mp-sub-ico { display: grid; place-items: center; flex-shrink: 0; border-radius: var(--r); background: var(--surface); transition: background-color .2s var(--ease), color .2s var(--ease); }
  .mp-sub-poker { color: var(--poker-sub); }
  .mp-sub-poker .mp-sub-ico { color: var(--poker-ico); }
  .mp-sub-poker .mp-count { color: var(--poker-count); }
  .mp-sub-games { color: var(--games-sub); }
  .mp-sub-games .mp-sub-ico { color: var(--games-ico); }
  .mp-sub-games .mp-count { color: var(--games-count); }
  .mp-sub-poker.mp-sub-on { color: var(--poker-on-text); background: var(--poker-on); }
  .mp-sub-games.mp-sub-on { color: var(--games-on-text); background: var(--games-on); }
  .mp-sub-on .mp-sub-ico { background: var(--surface); }
  .mp-chip.mp-chip-poker .mp-sub-ico, .mp-chip.mp-chip-games .mp-sub-ico { background: transparent; }
  .mp-chip.mp-chip-poker { color: var(--poker-sub); border-color: var(--poker-line); }
  .mp-chip.mp-chip-poker .mp-sub-ico { color: var(--poker-ico); }
  .mp-chip.mp-chip-poker:not(.mp-chip-on) .mp-count { color: var(--poker-count); }
  .mp-chip.mp-chip-poker.mp-chip-on { color: var(--poker-chip-on-text); border-color: var(--poker-chip-on); background: var(--poker-chip-on); }
  .mp-chip.mp-chip-games { color: var(--games-sub); border-color: var(--games-line); }
  .mp-chip.mp-chip-games .mp-sub-ico { color: var(--games-ico); }
  .mp-chip.mp-chip-games:not(.mp-chip-on) .mp-count { color: var(--games-count); }
  .mp-chip.mp-chip-games.mp-chip-on { color: var(--games-chip-on-text); border-color: var(--games-chip-on); background: var(--games-chip-on); }
  .mp-chip.mp-chip-on .mp-sub-ico, .mp-chip.mp-chip-poker.mp-chip-on .mp-count, .mp-chip.mp-chip-games.mp-chip-on .mp-count { color: inherit; }
  .mp-chip.mp-chip-poker.mp-chip-on .mp-count, .mp-chip.mp-chip-games.mp-chip-on .mp-count { opacity: .75; }

  /* ---------- hover — მხოლოდ მაუსიან მოწყობილობებზე ---------- */
  @media (hover: hover) {
    .mp-ctl:hover { border-color: var(--line-strong); background: var(--surface-2); }
    .mp-ctl-on:hover { background: var(--active-hover); border-color: var(--active-hover); }
    .mp-seg:hover { color: var(--ink); }
    .mp-field:hover:not(:focus) { border-color: var(--line-strong); }
    .mp-header .mp-field:hover:not(:focus) { background: var(--surface-3); border-color: transparent; }
    .mp-dock-card:hover { transform: translateY(-2px); }
    .mp-cta:hover { background: var(--cta-hover); }
    .mp-cta:hover svg { transform: translateX(2px) rotate(-8deg); }
    .mp-card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -16px var(--shadow-strong); }
    .mp-card:hover .mp-tile { background: var(--surface-3); }
    .mp-card.mp-card-games:hover .mp-tile { background: var(--games-tint-hover); }
    .mp-card:hover .mp-tile-media { transform: scale(1.06); }
    .mp-card:hover h3 a { color: var(--brand); }
    .mp-float:hover { color: var(--on-dark); background: var(--active); scale: 1.06; }
    .mp-opt:hover:not(.mp-opt-on) { color: var(--ink); background: var(--opt-hover); }
    .mp-chip:hover:not(.mp-chip-on) { color: var(--ink); border-color: var(--line-strong); }
    .mp-thumb:hover { transform: translateY(-2px); border-color: var(--line-strong); }
    .mp-thumb-on:hover { border-color: var(--ink); }
    .mp-stepper button:hover { color: var(--ink); background: var(--surface-2); }
    .mp-link:hover { background-size: 100% 1px; }
    .mp-plate:hover { transform: translateY(-1px); }
    .mp-plate:hover .mp-plate-mark { transform: rotate(-4deg) scale(1.08); }
    .mp-plate-poker:hover { background: var(--poker-plate-hover); }
    .mp-plate-games:hover { background: var(--games-plate-hover); }
    .mp-sub-poker:hover:not(.mp-sub-on) { color: var(--ink); background: var(--poker-hover); }
    .mp-sub-games:hover:not(.mp-sub-on) { color: var(--ink); background: var(--games-hover); }
    .mp-chip.mp-chip-poker:hover:not(.mp-chip-on) { color: var(--ink); border-color: var(--poker-ico); }
    .mp-chip.mp-chip-games:hover:not(.mp-chip-on) { color: var(--ink); border-color: var(--games-ico); }
  }
  .mp-ctl:active { transform: scale(.96); transition-duration: .1s; }
  .mp-cta:active { transform: scale(.98); transition-duration: .1s; }
  :focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
  :where(:focus-visible) { border-radius: 4px; }
  .mp-field:focus-visible { outline: none; }

  /* ---------- ანიმაციები ---------- */
  @keyframes mp-rise { from { opacity: 0; translate: 0 24px; } to { opacity: 1; translate: 0 0; } }
  @keyframes mp-pop { 0% { scale: .4; } 60% { scale: 1.25; } 100% { scale: 1; } }
  @keyframes mp-bump { 0%, 100% { transform: none; } 30% { transform: translateY(-3px) rotate(-8deg); } 60% { transform: translateY(0) rotate(4deg); } }
  @keyframes mp-fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes mp-ping { 0% { transform: scale(1); opacity: .7; } 80%,100% { transform: scale(2.2); opacity: 0; } }
  @keyframes mp-slide-in { from { transform: translateX(104%); } to { transform: none; } }
  @keyframes mp-toast { from { opacity: 0; transform: translate(-50%, 16px); } to { opacity: 1; transform: translate(-50%, 0); } }
  .mp-pop { animation: mp-pop .45s var(--ease-out) both; }
  .mp-bump { display: inline-flex; animation: mp-bump .5s var(--ease-out); }
  .mp-rise { animation: mp-rise .6s var(--ease-out) both; }
  /* ბარათები ჩნდება, როცა ეკრანზე შემოდის (IntersectionObserver), რიგში ოდნავი დაგვიანებით */
  .mp-reveal { opacity: 0; }
  .mp-reveal.is-in { animation: mp-rise .7s var(--ease-out) both; animation-delay: var(--d, 0ms); }
  .mp-fade { animation: mp-fade .3s var(--ease) both; }
  .mp-ping { animation: mp-ping 2s cubic-bezier(0,0,.2,1) infinite; }
  .mp-slide-in { animation: mp-slide-in .45s var(--ease-out) both; }
  .mp-toast { animation: mp-toast .35s var(--ease-out) both; }
  .mp-drive { animation: mp-drive 1.6s ease-in-out infinite; }
  @keyframes mp-drive { 0%, 100% { transform: translateX(-2px); } 50% { transform: translateX(2px); } }
  .mp-dock { transition: opacity .3s var(--ease), translate .3s var(--ease), visibility .3s; animation: mp-rise .6s var(--ease-out) .5s backwards; }
  .mp-dock.is-hidden { opacity: 0; translate: 0 16px; visibility: hidden; }
  .mp-dock-card { box-shadow: 0 16px 40px -12px var(--shadow-strong); transition: transform .3s var(--ease); }
  .mp-scroll::-webkit-scrollbar { display: none; }
  .mp-scroll { scrollbar-width: none; }
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; }
    .mp-reveal { opacity: 1; }
    *, *::before, *::after { animation-duration: .001ms !important; animation-delay: 0s !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; transition-delay: 0s !important; }
  }
`;

/* ------------------------------------------------------------------ */
/*  ლოგო — „ყვავის ფირფიტა“                                           */
/* ------------------------------------------------------------------ */
/* აგური (♦) — ჩაზნექილი გვერდებით, როგორც კარტზე */
const DIAMOND_PATH = "M20 2.5C23.4 8.7 28 14.7 34 20c-6 5.3-10.6 11.3-14 17.5C16.6 31.3 12 25.3 6 20c6-5.3 10.6-11.3 14-17.5Z";
/* სამაგიდო თამაშის ფიგურა („მიპლი“) 24×24 ბადეზე */
const MEEPLE_PATH = "M12 2.8c1.5 0 2.7 1.2 2.7 2.7 0 .9-.4 1.6-1 2.1 3.2.5 6.9 1.7 6.9 3.6 0 1.2-1.4 1.6-3.3 1.5-.5 0-.7.4-.5.8l2.6 5.3c.4.9-.1 1.7-1.1 1.7h-3.4c-.6 0-1-.3-1.2-.8L12 16.2l-1.7 3.5c-.2.5-.6.8-1.2.8H5.7c-1 0-1.5-.8-1.1-1.7l2.6-5.3c.2-.4 0-.8-.5-.8-1.9.1-3.3-.3-3.3-1.5 0-1.9 3.7-3.1 6.9-3.6-.6-.5-1-1.2-1-2.1 0-1.5 1.2-2.7 2.7-2.7z";

function LogoMark({ size = 34 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
      {/* მომრგვალებული ფირფიტა — ერთფეროვანი ბორდო */}
      <path d="M20 1.5c11.2 0 18.5 7.3 18.5 18.5S31.2 38.5 20 38.5 1.5 31.2 1.5 20 8.8 1.5 20 1.5Z" fill={PAL.vars.brand} />
      {/* ჩიპის კიდის ჭდეები */}
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="18.6" y="3.6" width="2.8" height="4.2" rx="1.2" fill={PAL.vars.surface} opacity="0.35" transform={`rotate(${a + 45} 20 20)`} />
      ))}
      {/* აგური */}
      <path d={DIAMOND_PATH} fill={PAL.vars.surface} transform="translate(20 20) scale(.52) translate(-20 -20)" />
    </svg>
  );
}

function Logo({ onNavigate }) {
  return (
    <a
      href={HOME_PATH}
      onClick={onNavigate ? handleNav(onNavigate, null) : undefined}
      className="group flex shrink-0 items-center gap-2"
      aria-label={T.homeAria}
    >
      <span className="transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105">
        <LogoMark size={32} />
      </span>
      <span className="mp-brand text-[17px] font-semibold leading-none tracking-[-0.02em] text-[color:var(--ink)]">
        mypoker<span className="text-[color:var(--brand)]">.ge</span>
      </span>
    </a>
  );
}

/* ენის გადამრთველი: იმავე გვერდს ხსნის მეორე ენაზე */
function LangSwitch({ productId, className = "" }) {
  const item = (code, label) =>
    code === LANG ? (
      <span aria-current="true" className="mp-seg-on rounded-md px-2 py-1 leading-4">
        {label}
      </span>
    ) : (
      <a href={otherLangPath(productId)} hrefLang={code} lang={code} className="mp-seg rounded-md px-2 py-1 leading-4">
        {label}
      </a>
    );
  return (
    <div className={`mp-segbox shrink-0 items-center gap-1 rounded-lg p-1 text-[12px] font-medium ${className}`} role="group" aria-label={T.language}>
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
      <ellipse cx={x} cy={baseY + 6} rx="30" ry="8" fill="#2a201b" opacity="0.14" />
      {Array.from({ length: count }).map((_, i) => {
        const cy = baseY - i * 7;
        return (
          <g key={i}>
            <ellipse cx={x} cy={cy + 2.5} rx="26" ry="9" fill={color} />
            <ellipse cx={x} cy={cy + 2.5} rx="26" ry="9" fill="#2a201b" opacity="0.22" />
            <ellipse cx={x} cy={cy} rx="26" ry="9" fill={color} />
            <ellipse cx={x} cy={cy} rx="26" ry="9" fill="none" stroke="#efe6d8" strokeOpacity="0.85" strokeWidth="2.4" strokeDasharray="7 9" />
            {i === count - 1 && (
              <>
                <ellipse cx={x} cy={cy} rx="16" ry="5.4" fill={`url(#${uid}-shine)`} />
                <ellipse cx={x} cy={cy} rx="16" ry="5.4" fill="none" stroke="#efe6d8" strokeOpacity="0.55" />
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
      <rect x="-30" y="-44" width="60" height="88" rx="7" fill="#2a201b" opacity="0.14" transform="translate(3 5)" />
      {suit ? (
        <>
          <rect x="-30" y="-44" width="60" height="88" rx="7" fill="#efe7d8" />
          <text x="-20" y="-26" fontSize="14" textAnchor="middle" fill={ink}>{suit}</text>
          <text x="0" y="12" fontSize="34" textAnchor="middle" fill={ink}>{suit}</text>
          <text x="20" y="36" fontSize="14" textAnchor="middle" fill={ink} transform="rotate(180 20 31)">{suit}</text>
        </>
      ) : (
        <>
          <rect x="-30" y="-44" width="60" height="88" rx="7" fill={back} />
          <rect x="-25" y="-39" width="50" height="78" rx="4" fill={`url(#${uid}-diamond)`} stroke="#efe6d8" strokeOpacity="0.65" />
        </>
      )}
    </g>
  );
}

/* კამათლის / დომინოს წერტილები: პოზიციები -1..1 ბადეზე */
const PIPS = {
  0: [],
  1: [[0, 0]],
  2: [[-1, -1], [1, 1]],
  3: [[-1, -1], [0, 0], [1, 1]],
  4: [[-1, -1], [1, -1], [-1, 1], [1, 1]],
  5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]],
  6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]],
};
const pips = (n, cx, cy, step, r, fill) =>
  PIPS[n].map(([dx, dy], i) => <circle key={i} cx={cx + dx * step} cy={cy + dy * step} r={r} fill={fill} />);

function DominoTile({ x, y, rotate, a, b }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-19" y="-36" width="38" height="72" rx="7" fill="#2a201b" opacity="0.14" transform="translate(3 5)" />
      <rect x="-19" y="-36" width="38" height="72" rx="7" fill="#efe7d8" stroke="#8a7965" />
      <line x1="-12" y1="0" x2="12" y2="0" stroke="#8f7e6a" strokeWidth="1.6" />
      <circle cx="0" cy="0" r="2" fill="#a8915f" />
      {pips(a, 0, -18, 8.5, 3.1, "#2a201b")}
      {pips(b, 0, 18, 8.5, 3.1, "#2a201b")}
    </g>
  );
}

function Die({ x, y, rotate, value, face, pip }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <rect x="-27" y="-27" width="54" height="54" rx="12" fill="#2a201b" opacity="0.16" transform="translate(4 6)" />
      <rect x="-27" y="-27" width="54" height="54" rx="12" fill={face} />
      <rect x="-27" y="-27" width="54" height="54" rx="12" fill="url(#mp-die-shine)" />
      {pips(value, 0, 0, 13, 4.6, pip)}
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
        <rect width="8" height="8" fill={colors[0] || "#3a4553"} />
        <rect width="4" height="4" fill="#efe6d8" opacity="0.18" />
      </pattern>
      <linearGradient id={`${uid}-gold`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#c9b78c" />
        <stop offset="0.45" stopColor="#a8915f" />
        <stop offset="1" stopColor="#7d6a44" />
      </linearGradient>
      <linearGradient id="mp-die-shine" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
        <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <radialGradient id={`${uid}-felt`} cx="50%" cy="42%" r="68%">
        <stop offset="0" stopColor={colors[0] || "#3d5a4a"} />
        <stop offset="1" stopColor="#2a201b" />
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
        <PlayingCard x={116} y={76} rotate={-2} ink="#2a201b" suit="♠" uid={uid} />
        <PlayingCard x={152} y={84} rotate={14} ink="#7a3037" suit="♥" uid={uid} />
      </g>
    );
  } else if (kind === "table") {
    art = (
      <g>
        <ellipse cx="116" cy="132" rx="96" ry="10" fill="#2a201b" opacity="0.14" />
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
        <circle cx="96" cy="81" r="7" fill="#7a3037" stroke="#efe6d8" strokeDasharray="3 3" strokeWidth="1.5" />
        <circle cx="116" cy="87" r="7" fill="#3b2e27" stroke="#efe6d8" strokeDasharray="3 3" strokeWidth="1.5" />
        <circle cx="136" cy="79" r="7" fill={colors[2]} stroke="#efe6d8" strokeDasharray="3 3" strokeWidth="1.5" />
      </g>
    );
  } else if (kind === "dealer") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="52" ry="8" fill="#2a201b" opacity="0.14" />
        <circle cx="116" cy="84" r="50" fill="#efe7d8" />
        <circle cx="116" cy="84" r="50" fill={`url(#${uid}-shine)`} />
        <circle cx="116" cy="84" r="40" fill="none" stroke={`url(#${uid}-gold)`} strokeWidth="3" />
        <text x="116" y="91" textAnchor="middle" fontSize="19" fontWeight="700" fill="#2a201b" fontFamily="'Noto Sans Georgian', sans-serif">
          {T.dealer}
        </text>
      </g>
    );
  } else if (kind === "shuffler") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="78" ry="8" fill="#2a201b" opacity="0.14" />
        <rect x="44" y="62" width="144" height="66" rx="12" fill="#3b2e27" stroke="#5a4a40" />
        <rect x="56" y="74" width="50" height="42" rx="6" fill="#2a201b" />
        <rect x="126" y="74" width="50" height="42" rx="6" fill="#2a201b" />
        <rect x="62" y="44" width="38" height="50" rx="4" fill="#3a4553" stroke="#efe6d8" strokeOpacity="0.55" transform="rotate(-8 81 69)" />
        <rect x="132" y="44" width="38" height="50" rx="4" fill="#6e2c32" stroke="#efe6d8" strokeOpacity="0.55" transform="rotate(8 151 69)" />
        <circle cx="116" cy="112" r="6" fill="#c6a97f" />
      </g>
    );
  } else if (kind === "guard") {
    art = (
      <g>
        <ellipse cx="116" cy="134" rx="48" ry="7" fill="#2a201b" opacity="0.14" />
        <circle cx="116" cy="82" r="48" fill={`url(#${uid}-gold)`} />
        <circle cx="116" cy="82" r="39" fill="none" stroke="#7d6a44" strokeOpacity="0.55" strokeWidth="2" />
        <circle cx="116" cy="82" r="48" fill={`url(#${uid}-shine)`} />
        <text x="116" y="99" textAnchor="middle" fontSize="46" fill="#4f3c25" opacity="0.85">♠</text>
      </g>
    );
  } else if (kind === "backgammon") {
    const points = (x0, top, n0) =>
      Array.from({ length: 6 }).map((_, i) => {
        const x = x0 + i * 14;
        const tip = top ? 74 : 86;
        const base = top ? 32 : 128;
        return <polygon key={`${x0}-${top}-${i}`} points={`${x},${base} ${x + 14},${base} ${x + 7},${tip}`} fill={(i + n0) % 2 ? "#3b2e27" : "#6e2c32"} opacity="0.92" />;
      });
    art = (
      <g>
        <ellipse cx="116" cy="142" rx="100" ry="8" fill="#2a201b" opacity="0.14" />
        <rect x="14" y="22" width="204" height="116" rx="9" fill="#4a3428" />
        <rect x="14" y="22" width="204" height="116" rx="9" fill={`url(#${uid}-shine)`} opacity="0.35" />
        <rect x="22" y="30" width="88" height="100" rx="3" fill="#e6dccb" />
        <rect x="122" y="30" width="88" height="100" rx="3" fill="#e6dccb" />
        <rect x="111" y="22" width="10" height="116" fill="#3e2c22" />
        {points(23, true, 0)}
        {points(123, true, 1)}
        {points(23, false, 1)}
        {points(123, false, 0)}
        {[[30, 40], [30, 52], [30, 64], [144, 120], [144, 108], [186, 40]].map(([cx, cy], i) => (
          <g key={`w${i}`}>
            <circle cx={cx} cy={cy} r="6.6" fill="#efe7d8" stroke="#cbbfa9" />
            <circle cx={cx} cy={cy} r="3.4" fill="none" stroke="#d9cdb8" />
          </g>
        ))}
        {[[86, 120], [86, 108], [158, 40], [158, 52], [200, 120]].map(([cx, cy], i) => (
          <g key={`b${i}`}>
            <circle cx={cx} cy={cy} r="6.6" fill="#3b2e27" stroke="#2a201b" />
            <circle cx={cx} cy={cy} r="3.4" fill="none" stroke="#4a3d35" />
          </g>
        ))}
      </g>
    );
  } else if (kind === "domino") {
    art = (
      <g>
        <ellipse cx="116" cy="138" rx="84" ry="8" fill="#2a201b" opacity="0.14" />
        <DominoTile x={74} y={84} rotate={-16} a={6} b={3} />
        <DominoTile x={116} y={78} rotate={2} a={5} b={5} />
        <DominoTile x={158} y={86} rotate={18} a={2} b={4} />
      </g>
    );
  } else if (kind === "boardgame") {
    /* სამაგიდო თამაშის დაფა პერსპექტივაში: ფერადი გზა კიდეებზე, ორი მიპლი და კამათელი */
    const track = ["#6e2c32", "#b0916a", "#3a4553", "#3d5a4a"];
    const cells = [
      ...Array.from({ length: 8 }, (_, i) => [i, 0]),
      ...Array.from({ length: 7 }, (_, i) => [7, i + 1]),
      ...Array.from({ length: 7 }, (_, i) => [6 - i, 7]),
      ...Array.from({ length: 6 }, (_, i) => [0, 6 - i]),
    ];
    const meeple = (x, y, fill) => (
      <g transform={`translate(${x - 21.6} ${y - 36.9}) scale(1.8)`}>
        <ellipse cx="12" cy="20.6" rx="8" ry="2.2" fill="#2a201b" opacity="0.25" />
        <path d={MEEPLE_PATH} fill={fill} />
        <path d={MEEPLE_PATH} fill={`url(#${uid}-shine)`} />
      </g>
    );
    art = (
      <g>
        <ellipse cx="116" cy="142" rx="98" ry="9" fill="#2a201b" opacity="0.14" />
        <g transform="translate(116 88) scale(1 0.56) rotate(45)">
          <rect x="-62" y="-62" width="124" height="124" rx="9" fill="#3e2c22" transform="translate(8 8)" />
          <rect x="-62" y="-62" width="124" height="124" rx="9" fill="#6a4c38" />
          <rect x="-57" y="-57" width="114" height="114" rx="6" fill="#efe7d8" />
          {cells.map(([cx, cy], i) => (
            <rect key={i} x={-55.8 + cx * 14.25} y={-55.8 + cy * 14.25} width="11.85" height="11.85" rx="2.5" fill={track[i % 4]} opacity="0.92" />
          ))}
          <rect x="-41" y="-41" width="82" height="82" rx="5" fill="#e6dccb" />
          <circle r="19" fill="none" stroke="#a8915f" strokeWidth="3" />
          <path d={DIAMOND_PATH} transform="translate(-12 -12) scale(.6)" fill="#6e2c32" />
        </g>
        {meeple(84, 86, "#6e2c32")}
        {meeple(146, 96, "#3a4553")}
        <g transform="translate(176 116) scale(.6) translate(-176 -116)">
          <Die x={176} y={116} rotate={14} value={4} face="#efe7d8" pip="#2a201b" />
        </g>
      </g>
    );
  } else if (kind === "chess") {
    const pawn = (x, y, fill, stroke) => (
      <g transform={`translate(${x} ${y})`}>
        <ellipse cx="0" cy="30" rx="15" ry="4" fill="#2a201b" opacity="0.18" />
        <rect x="-13" y="22" width="26" height="7" rx="3.5" fill={fill} stroke={stroke} />
        <path d="M-8 22 L-5 4 H5 L8 22 Z" fill={fill} stroke={stroke} />
        <rect x="-8" y="0" width="16" height="5" rx="2.5" fill={fill} stroke={stroke} />
        <circle cx="0" cy="-6" r="7" fill={fill} stroke={stroke} />
      </g>
    );
    art = (
      <g>
        <ellipse cx="116" cy="142" rx="92" ry="8" fill="#2a201b" opacity="0.14" />
        <g transform="translate(116 80) scale(1 0.62) rotate(45)">
          <rect x="-58" y="-58" width="116" height="116" rx="6" fill="#4a3428" />
          {Array.from({ length: 64 }).map((_, i) => {
            const cx = i % 8;
            const cy = Math.floor(i / 8);
            return <rect key={i} x={-52 + cx * 13} y={-52 + cy * 13} width="13" height="13" fill={(cx + cy) % 2 ? "#6a4c38" : "#e6dccb"} />;
          })}
        </g>
        {pawn(84, 66, "#efe7d8", "#cbbfa9")}
        {pawn(146, 74, "#3b2e27", "#2a201b")}
      </g>
    );
  } else if (kind === "dice") {
    art = (
      <g>
        <ellipse cx="116" cy="136" rx="76" ry="8" fill="#2a201b" opacity="0.14" />
        <Die x={88} y={86} rotate={-14} value={5} face="#6e2c32" pip="#efe6d8" />
        <Die x={148} y={78} rotate={12} value={3} face="#efe7d8" pip="#2a201b" />
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
      <Search className="pointer-events-none absolute left-3 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder={T.searchPh}
        className="mp-field h-10 w-full pl-10 pr-4 text-[13px]"
      />
    </label>
  );
}

/* „უფასო მიწოდება N ₾-დან“ — ზედა ზოლის შუაში (დიდ ეკრანზე) ან ცალკე ზოლად (ტელეფონზე) */
function FreeShipping() {
  if (!CONFIG.freeShippingFrom) return null;
  return (
    <p className="flex items-center justify-center gap-2 whitespace-nowrap text-[13px] font-medium leading-4 tracking-[0.02em] text-[color:var(--bar-text)] md:gap-3 md:text-[15px] md:leading-6 md:tracking-[0.04em]">
      <Truck className="mp-drive h-4 w-4 shrink-0 md:h-5 md:w-5" strokeWidth={2} aria-hidden="true" />
      <span className="md:hidden">
        <span className="font-semibold">{T.freeDeliveryShort[0]}</span> {T.freeDeliveryShort[1]}
      </span>
      <span className="hidden md:inline">
        <span className="font-semibold">{T.freeDelivery[0]}</span> {T.freeDelivery[1]}
      </span>
      <span className="mp-num rounded-full bg-[color:var(--pill-bg)] px-2 py-0.5 text-[12px] font-bold leading-4 tracking-normal text-[color:var(--pill-text)] md:px-3 md:py-1 md:text-[14px]">
        {T.freeFrom(CONFIG.freeShippingFrom)}
      </span>
    </p>
  );
}

function Header({ cartCount, onOpenCart, query, onQuery, onNavigate, productId }) {
  const scrolled = useScrolled();
  return (
    <header className={`mp-header sticky top-[env(safe-area-inset-top,0px)] z-40 text-[color:var(--ink)] ${scrolled ? "mp-header-scrolled" : ""}`}>
      {/* შეთავაზება ცალკე ზოლად, ბრენდის წითელ ფერში */}
      {CONFIG.freeShippingFrom > 0 && (
        <div className="mp-strip flex h-8 items-center justify-center px-4 md:h-10">
          <FreeShipping />
        </div>
      )}
      {/* ლოგო | ძიება შუაში | ტელეფონი, კალათა */}
      <div className="mx-auto flex h-16 max-w-[1344px] items-center gap-4 px-4 sm:px-6 lg:px-8 xl:gap-6">
        <div className="flex min-w-0 items-center gap-4">
          <Logo onNavigate={onNavigate} />
          <LangSwitch productId={productId} className="hidden sm:flex" />
        </div>

        <div className="hidden min-w-0 flex-1 justify-center md:flex">
          <SearchField id="mp-search" query={query} onQuery={onQuery} className="w-full max-w-[480px]" />
        </div>

        <div className="ml-auto flex items-center justify-end gap-2 md:ml-0">

          <a
            href={`tel:${CONFIG.phoneTel}`}
            className="mp-ctl group flex h-10 items-center gap-2 rounded-lg px-2 sm:pr-3"
            aria-label={T.callAria(CONFIG.phoneDisplay)}
          >
            <span className="mp-call-dot grid h-6 w-6 place-items-center rounded-full">
              <Phone className="h-3 w-3 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />
            </span>
            <span className="hidden flex-col items-start sm:flex">
              <span className="text-[11px] leading-4 text-[color:var(--muted)]">{T.callUs}</span>
              <span className="mp-num whitespace-nowrap text-[12px] font-semibold leading-4 text-[color:var(--ink)]">{CONFIG.phoneDisplay}</span>
            </span>
          </a>

          <button
            type="button"
            onClick={onOpenCart}
            className="mp-ctl group relative grid h-10 w-10 place-items-center rounded-lg"
            aria-label={T.cartAria(cartCount)}
          >
            <span key={cartCount} className={cartCount > 0 ? "mp-bump" : "inline-flex"}>
              <ShoppingBag className="h-5 w-5" strokeWidth={1.8} />
            </span>
            {cartCount > 0 && (
              <span key={cartCount} className="mp-num mp-pop mp-count-badge absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-semibold leading-4">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex h-14 items-start gap-2 px-4 md:hidden">
        <SearchField id="mp-search-mobile" query={query} onQuery={onQuery} className="min-w-0 flex-1" />
        <LangSwitch productId={productId} className="flex h-10 sm:hidden" />
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
      <p className="px-3 text-[12px] font-medium leading-4 text-[color:var(--muted)]">{title}</p>
      <div className="mt-2 flex flex-col gap-1">{children}</div>
    </div>
  );
}

function FilterOption({ active, onClick, label, count }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`mp-opt flex h-8 items-center justify-between px-3 text-left text-[13px] leading-4 ${active ? "mp-opt-on font-semibold" : ""}`}
    >
      {label}
      {count !== undefined && <span className="mp-num mp-count text-xs">{count}</span>}
    </button>
  );
}

/* კატეგორიების ნიშნები: მთლიანი გლიფები 24×24 ბადეზე, ფერს currentColor-იდან იღებს.
   პოკერი — ლოგოს აგური, თამაშები — კამათლების წყვილი, ნარდი — კამათელი, ჭადრაკი — მხედარი, Board Games — მიპლი */
const CAT_ICONS = {
  poker: <path d={DIAMOND_PATH} transform="scale(.6)" />,
  games: (
    <>
      <path fillRule="evenodd" opacity=".5" transform="rotate(-14 8 14)" d="M4.9 8.2h6.1a2.7 2.7 0 0 1 2.7 2.7v6.1a2.7 2.7 0 0 1-2.7 2.7H4.9a2.7 2.7 0 0 1-2.7-2.7v-6.1a2.7 2.7 0 0 1 2.7-2.7zM4.4 11.6a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0zm4.7 4.7a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0z" />
      <path fillRule="evenodd" transform="rotate(12 15.75 8.55)" d="M12.7 2.8h6.1a2.7 2.7 0 0 1 2.7 2.7v6.1a2.7 2.7 0 0 1-2.7 2.7h-6.1a2.7 2.7 0 0 1-2.7-2.7V5.5a2.7 2.7 0 0 1 2.7-2.7zM12.1 6.1a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0zm2.45 2.45a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0zM17 11a1.2 1.2 0 1 0 2.4 0 1.2 1.2 0 1 0-2.4 0z" />
    </>
  ),
  cards: (
    <>
      <path opacity=".4" transform="rotate(-15 8.5 11.25)" d="M5.5 4h6a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      <path fillRule="evenodd" transform="rotate(10 14.5 12.25)" d="M11.5 5h6a2 2 0 0 1 2 2v10.5a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm3 3.95 2.4 3.3-2.4 3.3-2.4-3.3z" />
    </>
  ),
  chips: (
    <>
      <circle cx="12" cy="12" r="8.1" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="5.48 3" transform="rotate(-15 12 12)" />
      <circle cx="12" cy="12" r="6.2" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".5" />
      <circle cx="12" cy="12" r="4.4" />
    </>
  ),
  tables: (
    <>
      <path fillRule="evenodd" d="M1.8 12a10.2 6.8 0 1 0 20.4 0 10.2 6.8 0 1 0-20.4 0zm2.6 0a7.6 4.4 0 1 0 15.2 0 7.6 4.4 0 1 0-15.2 0z" />
      <ellipse cx="12" cy="12" rx="7.6" ry="4.4" opacity=".35" />
      <circle cx="9.6" cy="12" r="1.25" />
      <circle cx="12" cy="11.2" r="1.25" />
      <circle cx="14.4" cy="12" r="1.25" />
    </>
  ),
  accessories: (
    <path fillRule="evenodd" d="M2.4 12a9.6 9.6 0 1 0 19.2 0 9.6 9.6 0 1 0-19.2 0zM4 12a8 8 0 1 0 16 0 8 8 0 1 0-16 0zm1.3 0a6.7 6.7 0 1 0 13.4 0 6.7 6.7 0 1 0-13.4 0zm4.4-3.6H12a3.6 3.6 0 0 1 0 7.2H9.7zm1.7 1.6h.6a2 2 0 0 1 0 4h-.6z" />
  ),
  "games:backgammon": (
    <path fillRule="evenodd" transform="rotate(-12 12 12)" d="M8.1 4.5h7.8a3.6 3.6 0 0 1 3.6 3.6v7.8a3.6 3.6 0 0 1-3.6 3.6H8.1a3.6 3.6 0 0 1-3.6-3.6V8.1a3.6 3.6 0 0 1 3.6-3.6zM6.95 8.5a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 1 0-3.1 0zm7 0a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 1 0-3.1 0zm-3.5 3.5a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 1 0-3.1 0zm-3.5 3.5a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 1 0-3.1 0zm7 0a1.55 1.55 0 1 0 3.1 0 1.55 1.55 0 1 0-3.1 0z" />
  ),
  "games:domino": (
    <path fillRule="evenodd" transform="rotate(20 12 12)" d="M9.9 2.5h4.2a2.4 2.4 0 0 1 2.4 2.4v14.2a2.4 2.4 0 0 1-2.4 2.4H9.9a2.4 2.4 0 0 1-2.4-2.4V4.9a2.4 2.4 0 0 1 2.4-2.4zM10 11.4h4a.6.6 0 0 1 0 1.2h-4a.6.6 0 0 1 0-1.2zM9.2 5.3a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 1 0-2.2 0zm3.4 3.3a1.1 1.1 0 1 0 2.2 0 1.1 1.1 0 1 0-2.2 0zm-3.45 6a1.05 1.05 0 1 0 2.1 0 1.05 1.05 0 1 0-2.1 0zm1.8 2.4a1.05 1.05 0 1 0 2.1 0 1.05 1.05 0 1 0-2.1 0zm1.8 2.4a1.05 1.05 0 1 0 2.1 0 1.05 1.05 0 1 0-2.1 0z" />
  ),
  "games:chess": (
    <>
      <path fillRule="evenodd" d="M8.2 16c.2-1.6.8-2.6 1.7-3.5l-2.6.7c-.9.2-1.9-.3-2-1.3-.1-.8.4-1.5 1-2.3.9-1.2 2-2.3 3-3.4l1.2-2.8 1.8 1.8c3.3.2 6.1 2.8 6.3 7 .1 1.4-.3 2.7-1.2 3.8zm1.65-7.6a.85.85 0 1 0 1.7 0 .85.85 0 1 0-1.7 0z" />
      <rect x="6.8" y="16.6" width="10.4" height="1.6" rx=".8" />
      <rect x="5" y="18.8" width="14" height="2.8" rx="1.2" />
    </>
  ),
  "games:boardgames": <path d={MEEPLE_PATH} />,
  "games:fun": (
    <>
      <path d="M10 3c.5 4.3 2.2 6 6.5 6.5-4.3.5-6 2.2-6.5 6.5-.5-4.3-2.2-6-6.5-6.5C7.8 9 9.5 7.3 10 3z" />
      <path d="M17.5 13c.3 2.2 1.1 3 3.3 3.3-2.2.3-3 1.1-3.3 3.3-.3-2.2-1.1-3-3.3-3.3 2.2-.3 3-1.1 3.3-3.3z" />
      <circle cx="18.2" cy="5.2" r="1.3" />
    </>
  ),
};

function CatIcon({ id, className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {CAT_ICONS[id]}
    </svg>
  );
}

/* მთავარი განყოფილება გვერდით პანელში: ფერადი ფირფიტა (მთელი განყოფილება) და მის ქვემოთ ქვეკატეგორიები, ყოველთვის გაშლილი */
function FilterSection({ section, category, setCategory, counts }) {
  const { id, items } = section;
  return (
    <div className={`mp-sec mp-sec-${id} rounded-2xl p-2`} role="group" aria-label={T.cat[id]}>
      <button
        type="button"
        onClick={() => setCategory(id)}
        aria-pressed={category === id}
        className={`mp-plate mp-plate-${id} flex w-full items-center gap-3 p-3 text-left ${category === id ? "mp-plate-on" : ""}`}
      >
        <span className="mp-plate-ico h-8 w-8">
          <CatIcon id={id} className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold leading-4 [text-wrap:balance]">{T.cat[id]}</span>
          <span className="mp-plate-sub mp-num mt-1 block text-[11px] leading-4">{T.productCount(counts[id] || 0)}</span>
        </span>
        <CatIcon id={id} className="mp-plate-mark -bottom-6 -right-4 h-20 w-20 rotate-[-12deg]" />
      </button>
      <div className="mt-2 flex flex-col gap-1">
        {items.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCategory(c.id)}
            aria-pressed={category === c.id}
            className={`mp-sub mp-sub-${id} flex h-8 items-center gap-2 pl-1 pr-3 text-left text-[13px] leading-4 ${category === c.id ? "mp-sub-on font-semibold" : ""}`}
          >
            <span className="mp-sub-ico h-6 w-6">
              <CatIcon id={c.id} className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1">{c.label}</span>
            <span className="mp-num mp-count text-[12px]">{counts[c.id] || 0}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Sidebar({ filter }) {
  const { category, setCategory, counts, hasFilters, reset } = filter;
  return (
    <aside className="hidden lg:block">
      <div className={`mp-scroll sticky -mx-4 -mt-2 flex flex-col gap-8 overflow-y-auto px-4 pb-8 pt-2 [&>*]:shrink-0 ${CONFIG.freeShippingFrom > 0 ? "top-[7.5rem] max-h-[calc(100vh-8.5rem)]" : "top-24 max-h-[calc(100vh-7rem)]"}`}>
        <div className="flex flex-col gap-6">
        <FilterGroup title={T.category}>
          <FilterOption active={category === "all"} onClick={() => setCategory("all")} label={T.cat.all} count={counts.all || 0} />
        </FilterGroup>
        {/* ორი მთავარი განყოფილება: პოკერი (წითელი) და სამაგიდო თამაშები და აქსესუარები (ოქროსფერი) */}
        <div className="flex flex-col gap-4">
          {SECTIONS.map((section) => (
            <FilterSection key={section.id} section={section} category={category} setCategory={setCategory} counts={counts} />
          ))}
        </div>
        {hasFilters && (
          <button type="button" onClick={reset} className="mp-link mx-3 self-start text-left text-[13px] font-medium leading-4 text-[color:var(--brand)] hover:text-[color:var(--brand-2)]">
            {T.clearFilters}
          </button>
        )}
        </div>
      </div>
    </aside>
  );
}

function MobileFilters({ filter }) {
  const { category, setCategory, counts } = filter;
  return (
    <div
      className={`sticky z-30 -mx-4 border-b border-[color:var(--line)] bg-[color:var(--bg-glass)] px-4 py-3 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6 lg:hidden ${
        CONFIG.freeShippingFrom > 0
          ? "top-[calc(env(safe-area-inset-top,0px)+9.5rem)] md:top-[calc(env(safe-area-inset-top,0px)+6.5rem)]"
          : "top-[calc(env(safe-area-inset-top,0px)+7.5rem)] md:top-[calc(env(safe-area-inset-top,0px)+4rem)]"
      }`}
    >
      {/* თითო განყოფილება თავის გადასახვევ ზოლზე (პირველს წინ „ყველა“ უძღვის), ორივე ყოველთვის გაშლილი */}
      <div className="flex flex-col gap-2" role="group" aria-label={T.categoriesAria}>
        {SECTIONS.map(({ id, items }, i) => (
          <div key={id} className="mp-scroll -m-1 flex items-center gap-2 overflow-x-auto p-1">
            {i === 0 && (
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
                className={`mp-chip inline-flex h-8 shrink-0 items-center gap-2 px-3 text-[12px] leading-4 ${category === "all" ? "mp-chip-on font-semibold" : ""}`}
              >
                {T.cat.all}
                <span className="mp-num mp-count text-[11px]">{counts.all || 0}</span>
              </button>
            )}
            <div className={`mp-sec mp-sec-${id} flex shrink-0 items-center gap-1 rounded-xl p-1`} role="group" aria-label={T.cat[id]}>
              <button
                type="button"
                aria-pressed={category === id}
                onClick={() => setCategory(id)}
                className={`mp-plate mp-plate-${id} inline-flex h-8 shrink-0 items-center gap-2 px-3 text-[12px] font-semibold leading-4 ${category === id ? "mp-plate-on" : ""}`}
              >
                <CatIcon id={id} className="h-3.5 w-3.5" />
                {T.cat[id]}
                <span className="mp-plate-sub mp-num text-[11px] font-medium">{counts[id] || 0}</span>
              </button>
              {items.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                  className={`mp-chip mp-chip-${id} inline-flex h-8 shrink-0 items-center gap-2 px-3 text-[12px] leading-4 ${category === c.id ? "mp-chip-on font-semibold" : ""}`}
                >
                  <CatIcon id={c.id} className="mp-sub-ico h-3.5 w-3.5" />
                  {c.label}
                  <span className="mp-num mp-count text-[11px] font-normal">{counts[c.id] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
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
  const [ref, shown] = useReveal();

  return (
    <article
      ref={ref}
      className={`mp-card mp-reveal group flex min-w-0 flex-col p-2 ${shown ? "is-in" : ""} ${product.category === "games" ? "mp-card-games" : ""}`}
      style={{ "--d": `${(index % 4) * 80}ms` }}
    >
      <a
        href={productPath(product.id)}
        onClick={handleNav(onOpen, product.id)}
        className="mp-tile block aspect-[4/3] overflow-hidden"
        aria-label={T.detailsAria(product.name)}
        tabIndex={-1}
      >
        <div className="mp-tile-media absolute inset-0 p-8 drop-shadow-[0_12px_16px_rgba(24,25,28,0.18)]">
          <ProductMedia product={product} uid={`p-${product.id}`} />
        </div>
        <span className="mp-float absolute right-4 top-4 grid h-8 w-8 translate-y-1 place-items-center rounded-lg opacity-0 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
          <ArrowUpRight className="h-4 w-4" />
        </span>
        {(product.badge || discount > 0) && (
          <div className="absolute left-4 top-4 flex gap-2">
            {discount > 0 && (
              <span className="mp-num mp-badge-sale rounded-full px-2 py-1 text-[11px] font-semibold leading-4">−{discount}%</span>
            )}
            {product.badge && <span className="mp-badge rounded-full px-2 py-1 text-[11px] font-medium leading-4">{product.badge}</span>}
          </div>
        )}
      </a>

      <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
        <h3 className="line-clamp-2 min-h-10 text-[14px] font-medium leading-5 text-[color:var(--ink)]">
          <a href={productPath(product.id)} onClick={handleNav(onOpen, product.id)} className="transition-colors duration-300">
            {product.name}
          </a>
        </h3>
        <p className="mt-1 truncate text-[12px] leading-4 text-[color:var(--muted)]">{product.spec}</p>

        <div className="mt-4 flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className={`mp-num mp-price text-[18px] font-semibold leading-6 ${product.oldPrice ? "text-[color:var(--sale)]" : "text-[color:var(--ink)]"}`}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <span className="mp-num text-[12px] leading-4 text-[color:var(--muted)] line-through decoration-[color:var(--muted)]">{formatPrice(product.oldPrice)}</span>}
          </div>
          <span className={`inline-flex items-center gap-2 text-[12px] leading-6 ${product.inStock ? "text-[color:var(--ok)]" : "text-[color:var(--wait)]"}`}>
            {product.inStock ? T.inStock : T.onOrder}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <a
            href={productWhatsAppLink(product)}
            target="_blank"
            rel="noopener noreferrer"
            className="mp-cta inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-2 px-3 text-center text-[13px] font-semibold leading-4 [text-wrap:balance]"
          >
            <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
            {T.orderCta}
          </a>
          <button
            type="button"
            onClick={() => onAdd(product.id)}
            className={`mp-ctl grid h-10 w-10 shrink-0 place-items-center rounded-lg ${inCart ? "mp-ctl-on" : ""}`}
            aria-label={inCart ? T.inCartAria(product.name) : T.addAria(product.name)}
            title={inCart ? T.inCart : T.addToCart}
          >
            {inCart ? <Check className="mp-pop h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
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
  const { category, query, sort, setSort, visible, hasFilters, reset } = filter;
  const inCart = useMemo(() => new Set(cart.lines.map((l) => l.product.id)), [cart.lines]);
  const gridKey = `${category}|${sort}|${query.trim()}`;
  const title = query.trim() ? T.searchTitle(query.trim()) : category === "all" ? T.allProducts : CATEGORY_LABEL[category];
  const section = query.trim() ? null : category.startsWith("games:") ? "games" : POKER_CATS.includes(category) ? "poker" : null;

  return (
    <main id="shop" className="mx-auto grid max-w-[1344px] gap-8 px-4 pb-24 sm:px-6 lg:grid-cols-[256px_1fr] lg:gap-12 lg:px-8 lg:pt-12">
      <Sidebar filter={filter} />

      <section className="min-w-0" aria-label={T.productsAria}>
        <MobileFilters filter={filter} />

        {/* ქვეკატეგორიის სათაურს თავზე მისი განყოფილება აწერია, განყოფილების ფერით */}
        {section && (
          <p
            className={`mp-fade mb-2 mt-6 inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-[12px] font-medium leading-4 lg:mt-0 ${
              section === "games" ? "bg-[color:var(--games-tint)] text-[color:var(--games-text)]" : "bg-[color:var(--poker-tint)] text-[color:var(--poker-text)]"
            }`}
          >
            <CatIcon id={section} className="h-3.5 w-3.5 shrink-0" />
            {T.cat[section]}
          </p>
        )}
        <div className={`flex items-end justify-between gap-4 ${section ? "" : "mt-6 lg:mt-0"}`}>
          <div className="min-w-0">
            <h1 className="mp-title text-[20px] font-semibold leading-7 sm:text-[24px] sm:leading-8">{title}</h1>
            <p className="mp-num mt-1 text-[13px] leading-5 text-[color:var(--muted)]" aria-live="polite">
              {T.productCount(visible.length)}
            </p>
          </div>
          <label className="relative shrink-0" htmlFor="mp-sort">
            <span className="sr-only">{T.sort}</span>
            <select
              id="mp-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="mp-field h-10 max-w-[10.5rem] appearance-none truncate pl-4 pr-10 text-[13px] sm:max-w-[13rem]"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
          </label>
        </div>

        {visible.length > 0 ? (
          <div key={gridKey} className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} inCart={inCart.has(product.id)} onAdd={cart.add} onOpen={onOpen} />
            ))}
          </div>
        ) : (
          <div className="mp-fade mp-panel mt-8 flex flex-col items-center !border-dashed px-6 py-16 text-center">
            <Search className="h-6 w-6 text-[color:var(--faint)]" />
            <p className="mt-4 font-semibold text-[color:var(--ink)]">{T.noResults}</p>
            <p className="mt-1 text-[13px] text-[color:var(--muted)]">{T.noResultsHint}</p>
            {hasFilters && (
              <button
                type="button"
                onClick={reset}
                className="mp-cta mt-6 h-10 px-6 text-[13px] font-semibold"
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
      <div className={`mp-tile mp-tile-lg aspect-square overflow-hidden p-12 ${product.category === "games" ? "mp-tile-games" : ""}`}>
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
  const arrow = "mp-float absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-lg";

  return (
    <div className="flex flex-col gap-4">
      <div className={`mp-tile mp-tile-lg group aspect-square overflow-hidden ${product.category === "games" ? "mp-tile-games" : ""}`} {...swipe}>
        <button type="button" onClick={() => setZoom(true)} className="absolute inset-0 cursor-zoom-in" aria-label={T.zoom}>
          <img
            key={images[index].src}
            src={images[index].src}
            alt={T.photoAlt(product.name, index + 1)}
            className="mp-fade h-full w-full object-contain p-4"
          />
        </button>
        <span className="mp-float pointer-events-none absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-lg opacity-0 group-hover:opacity-100">
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
            <span className="mp-num mp-badge absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-[11px] leading-4">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mp-scroll -mx-2 -my-1 flex gap-2 overflow-x-auto px-2 py-2">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`mp-thumb h-[72px] w-[72px] shrink-0 overflow-hidden p-1 ${i === index ? "mp-thumb-on" : ""}`}
              aria-label={T.photo(i + 1)}
              aria-current={i === index}
            >
              <img src={img.thumb} alt="" loading="lazy" className="h-full w-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {zoom && (
        <div className="mp-fade fixed inset-0 z-[60] flex items-center justify-center bg-[color:var(--lightbox)] backdrop-blur-md" role="dialog" aria-modal="true" aria-label={product.name} {...swipe}>
          <button type="button" className="absolute inset-0 cursor-zoom-out" onClick={() => setZoom(false)} aria-label={T.close} />
          <img src={images[index].src} alt={T.photoAlt(product.name, index + 1)} className="relative max-h-[92vh] max-w-[94vw] object-contain" />
          <button
            type="button"
            onClick={() => setZoom(false)}
            className="mp-float absolute right-4 top-[calc(1rem+env(safe-area-inset-top,0px))] grid h-10 w-10 place-items-center rounded-lg"
            aria-label={T.close}
          >
            <X className="h-5 w-5" />
          </button>
          {count > 1 && (
            <>
              <button type="button" onClick={() => go(-1)} className="mp-float absolute left-4 grid h-12 w-12 place-items-center rounded-lg" aria-label={T.prevPhoto}>
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button type="button" onClick={() => go(1)} className="mp-float absolute right-4 grid h-12 w-12 place-items-center rounded-lg" aria-label={T.nextPhoto}>
                <ChevronRight className="h-6 w-6" />
              </button>
              <span className="mp-num absolute bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] text-sm text-[color:var(--dark-muted)]">
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
    <div className="flex max-w-3xl flex-col gap-4 text-[14px] leading-6 text-[color:var(--ink-2)]">
      {blocks.map((lines, i) =>
        lines.every((l) => /^[-•*]\s*/.test(l)) ? (
          <ul key={i} className="flex flex-col gap-2">
            {lines.map((l, j) => (
              <li key={j} className="flex gap-3">
                <span className="mp-bullet mt-[10px] h-1 w-1 shrink-0 rounded-full" />
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
    <main className="mp-rise mx-auto max-w-[1216px] px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pt-12">
      <nav className="flex flex-wrap items-center gap-2 text-[13px] leading-5 text-[color:var(--muted)]" aria-label={T.breadcrumb}>
        <a href={HOME_PATH} onClick={handleNav(onNavigate, null)} className="group inline-flex items-center gap-2 font-medium text-[color:var(--ink)] transition-colors duration-300 hover:text-[color:var(--brand)]">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
          <span className="mp-link">{T.shop}</span>
        </a>
        <span aria-hidden="true" className="text-[color:var(--faint)]">/</span>
        {POKER_CATS.includes(product.category) && (
          <>
            <span className="font-medium text-[color:var(--poker-text)]">{T.cat.poker}</span>
            <span aria-hidden="true" className="text-[color:var(--faint)]">/</span>
          </>
        )}
        <span className={product.category === "games" ? "font-medium text-[color:var(--games-text)]" : ""}>{CATEGORY_LABEL[product.category]}</span>
        {product.subcategory && (
          <>
            <span aria-hidden="true" className="text-[color:var(--faint)]">/</span>
            <span className="text-[color:var(--games-text)]">{T.gameSub[product.subcategory]}</span>
          </>
        )}
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
        <Gallery key={product.id} product={product} />

        <div className="flex min-w-0 flex-col">
          {(product.badge || discount > 0) && (
            <div className="flex flex-wrap gap-2">
              {discount > 0 && <span className="mp-num mp-badge-sale rounded-full px-2 py-1 text-[11px] font-semibold leading-4">−{discount}%</span>}
              {product.badge && <span className="mp-badge rounded-full !bg-[color:var(--surface-2)] px-2 py-1 text-[11px] font-medium leading-4">{product.badge}</span>}
            </div>
          )}
          <h1 className="mp-title mt-4 text-[24px] font-semibold leading-8 sm:text-[28px] sm:leading-9">{product.name}</h1>
          {product.spec && <p className="mt-2 text-[14px] leading-6 text-[color:var(--muted)]">{product.spec}</p>}

          <div className="mt-6 flex flex-wrap items-baseline gap-3">
            <span className={`mp-num mp-price text-[28px] font-semibold leading-8 ${product.oldPrice ? "text-[color:var(--sale)]" : "text-[color:var(--ink)]"}`}>
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && <span className="mp-num text-[16px] leading-6 text-[color:var(--muted)] line-through decoration-[color:var(--muted)]">{formatPrice(product.oldPrice)}</span>}
          </div>
          {product.oldPrice && product.saleEnds && (
            <p className="mt-2 text-[13px] leading-5 text-[color:var(--sale)]">{T.saleUntil(formatDate(product.saleEnds))}</p>
          )}
          <p className={`mt-4 inline-flex items-center gap-2 text-[13px] leading-5 ${product.inStock ? "text-[color:var(--ok)]" : "text-[color:var(--wait)]"}`}>
            <span className={`h-2 w-2 rounded-full ${product.inStock ? "mp-dot-ok" : "mp-dot-wait"}`} />
            {product.inStock ? T.inStock : T.onOrderLong}
          </p>

          <div className="mt-8 flex gap-2">
            <a
              href={productWhatsAppLink(product)}
              target="_blank"
              rel="noopener noreferrer"
              className="mp-cta inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 px-4 text-[14px] font-semibold"
            >
              <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
              {T.orderCta}
            </a>
            <button
              type="button"
              onClick={() => cart.add(product.id)}
              className={`mp-ctl grid h-12 w-12 shrink-0 place-items-center rounded-lg ${inCart ? "mp-ctl-on" : ""}`}
              aria-label={inCart ? T.inCartMore : T.addToCart}
              title={inCart ? T.inCart : T.addToCart}
            >
              {inCart ? <Check className="mp-pop h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}
            </button>
          </div>
          {CONFIG.phoneDisplay && (
            <p className="mt-4 text-[13px] leading-5 text-[color:var(--muted)]">
              {T.orCall}{" "}
              <a href={`tel:${CONFIG.phoneTel}`} className="mp-num mp-link group inline-flex items-center gap-1 align-bottom font-semibold text-[color:var(--ink)] hover:text-[color:var(--cta)]">
                <Phone className="h-3.5 w-3.5 shrink-0 text-[color:var(--call)] transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} aria-hidden="true" />
                <span className="select-all">{CONFIG.phoneDisplay}</span>
              </a>
            </p>
          )}
          <ul className="mp-panel mt-8 flex flex-col gap-3 p-4 text-[13px] leading-5 text-[color:var(--ink-2)]">
            {[T.perkDelivery, T.perkConfirm].map((t) => (
              <li key={t} className="flex items-center gap-3">
                <span className="mp-check grid h-5 w-5 shrink-0 place-items-center rounded-full">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {product.description.trim() && (
        <section className="mt-16 border-t border-[color:var(--line)] pt-12" aria-labelledby="mp-desc">
          <h2 id="mp-desc" className="mp-title text-[20px] font-semibold leading-7">{T.description}</h2>
          <div className="mt-6">
            <Description text={product.description} />
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16 border-t border-[color:var(--line)] pt-12" aria-labelledby="mp-related">
          <h2 id="mp-related" className="mp-title text-[20px] font-semibold leading-7">{T.related}</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p, i) => (
              /* 4 ბარათი ორ სვეტად, 3 — სამ სვეტად; მეოთხე დიდ ეკრანზე იმალება, რომ რიგი სრული იყოს */
              <div key={p.id} className={`grid min-w-0 ${i === 3 ? "lg:hidden" : ""}`}>
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
      <p className="mp-rise text-[64px] leading-none text-[color:var(--ink)]">♠</p>
      <h1 className="mp-title mt-6 text-[24px] font-semibold leading-8">{T.notFound}</h1>
      <p className="mt-2 text-[color:var(--muted)]">{T.notFoundText}</p>
      <a
        href={HOME_PATH}
        onClick={handleNav(onNavigate, null)}
        className="mp-cta mt-8 inline-flex h-10 items-center px-6 text-[13px] font-semibold"
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
      <button type="button" className="mp-fade absolute inset-0 bg-[color:var(--scrim)]" onClick={onClose} aria-label={T.close} />
      <aside className="mp-slide-in mp-drawer absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-hidden pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)] sm:inset-y-4 sm:right-4">
        <div className="flex items-center justify-between border-b border-[color:var(--line)] px-6 py-4">
          <div>
            <h2 className="mp-title text-[18px] font-semibold leading-7">{T.cart}</h2>
            <p className="mp-num text-[12px] leading-4 text-[color:var(--muted)]">{T.items(cart.count)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="mp-ctl grid h-10 w-10 place-items-center rounded-lg !text-[color:var(--muted)]"
            aria-label={T.closeCart}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag className="h-8 w-8 text-[color:var(--faint)]" strokeWidth={1.5} />
            <p className="mt-4 font-semibold text-[color:var(--ink)]">{T.cartEmpty}</p>
            <p className="mt-1 text-[13px] text-[color:var(--muted)]">{T.cartEmptyText}</p>
            <button type="button" onClick={onClose} className="mp-cta mt-6 h-10 px-6 text-[13px] font-semibold">
              {T.continueShopping}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-[#f0efed] overflow-y-auto px-6">
              {cart.lines.map(({ product, qty }) => (
                <li key={product.id} className="mp-fade flex gap-4 py-4">
                  <div className="mp-tile h-16 w-20 shrink-0 overflow-hidden !rounded-lg p-2">
                    <ProductMedia product={product} uid={`c-${product.id}`} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <a
                      href={productPath(product.id)}
                      onClick={handleNav(onOpenProduct, product.id)}
                      className="line-clamp-2 text-[13px] font-medium leading-5 text-[color:var(--ink)] transition-colors duration-300 hover:text-[color:var(--brand)]"
                    >
                      {product.name}
                    </a>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="mp-stepper flex items-center">
                        <button
                          type="button"
                          onClick={() => cart.decrement(product.id)}
                          className="grid h-8 w-8 place-items-center text-[color:var(--muted)]"
                          aria-label={T.decrease}
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="mp-num w-6 text-center text-[13px] font-semibold leading-4 text-[color:var(--ink)]">{qty}</span>
                        <button
                          type="button"
                          onClick={() => cart.add(product.id)}
                          className="grid h-8 w-8 place-items-center text-[color:var(--muted)]"
                          aria-label={T.increase}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="mp-num mp-price text-[14px] font-semibold leading-5 text-[color:var(--ink)]">{formatPrice(product.price * qty)}</span>
                        <button
                          type="button"
                          onClick={() => cart.remove(product.id)}
                          className="grid h-8 w-8 place-items-center rounded-lg text-[color:var(--muted)] transition-colors duration-300 hover:bg-[color:var(--sale-tint)] hover:text-[color:var(--sale)]"
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

            <div className="border-t border-[color:var(--line)] p-6">
              <div className="flex items-baseline justify-between">
                <span className="text-[13px] text-[color:var(--muted)]">{T.total}</span>
                <span className="mp-num mp-price mp-title text-[24px] font-semibold leading-8">{formatPrice(cart.total)}</span>
              </div>
              <a
                href={cartWhatsAppLink(cart.lines, cart.total)}
                target="_blank"
                rel="noopener noreferrer"
                className="mp-cta mt-4 inline-flex h-12 w-full items-center justify-center gap-2 text-[14px] font-semibold"
              >
                <MessageCircle className="h-4 w-4" />
                {T.orderCta}
              </a>
              <p className="mt-4 text-center text-[12px] leading-4 text-[color:var(--muted)]">{T.paySoon}</p>
              <button type="button" onClick={cart.clear} className="mx-auto mt-2 block w-fit rounded-lg px-2 py-1 text-[12px] leading-4 text-[color:var(--muted)] transition-colors duration-300 hover:bg-[color:var(--sale-tint)] hover:text-[color:var(--sale)]">
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
/*  მცურავი კონტაქტი — მარჯვენა ქვედა კუთხეში, გადახვევას მიჰყვება;     */
/*  ფუტერთან იმალება (იქ იგივე ინფორმაციაა)                           */
/* ------------------------------------------------------------------ */
function ContactDock() {
  const [nearFooter, setNearFooter] = useState(false);
  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer || typeof IntersectionObserver === "undefined") return undefined;
    const io = new IntersectionObserver(([entry]) => setNearFooter(entry.isIntersecting));
    io.observe(footer);
    return () => io.disconnect();
  }, []);
  if (!CONFIG.phoneDisplay) return null;
  return (
    <aside
      className={`mp-dock fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] right-4 z-30 lg:bottom-6 lg:right-6 ${nearFooter ? "is-hidden" : ""}`}
      aria-label={T.waBoxTitle}
    >
      <div className="mp-dock-card flex items-center gap-3 rounded-2xl bg-[color:var(--dark)] p-2 pr-4 text-[color:var(--dark-text)] sm:pr-2 lg:p-3">
        <a href={`tel:${CONFIG.phoneTel}`} className="group flex min-w-0 items-center gap-3" aria-label={T.callAria(CONFIG.phoneDisplay)}>
          <span className="relative grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[color:var(--call-on-dark)] text-[color:var(--on-dark)] sm:h-10 sm:w-10">
            <span className="mp-ping absolute inset-0 rounded-full bg-[color:var(--call-ring)]" aria-hidden="true" />
            <Phone className="relative h-4 w-4 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.2} />
          </span>
          <span className="flex min-w-0 flex-col pr-1">
            <span className="text-[11px] leading-4 text-[color:var(--dark-muted)] lg:text-[12px]">{T.waBoxTitle}</span>
            <span className="mp-num whitespace-nowrap text-[13px] font-semibold leading-4 sm:text-[14px] sm:leading-5 lg:text-[16px] lg:leading-6">{CONFIG.phoneDisplay}</span>
          </span>
        </a>
        <a
          href={buildWhatsAppLink(T.waHello)}
          target="_blank"
          rel="noopener noreferrer"
          className="mp-cta hidden h-10 shrink-0 items-center gap-2 px-4 text-[13px] font-semibold sm:inline-flex"
        >
          <MessageCircle className="h-4 w-4" strokeWidth={2} />
          WhatsApp
        </a>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  ფუტერი                                                             */
/* ------------------------------------------------------------------ */
function Footer() {
  return (
    <footer className="relative bg-[color:var(--dark)] text-[color:var(--dark-text)]">
      <div className="mx-auto flex max-w-[1344px] flex-col gap-4 px-4 py-8 text-[13px] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <LogoMark size={24} />
          <span className="text-[12px] text-[color:var(--dark-muted)]">© {new Date().getFullYear()} mypoker.ge · {T.rights}</span>
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <a href={`tel:${CONFIG.phoneTel}`} className="mp-num mp-link group inline-flex items-center gap-2 font-medium text-[color:var(--dark-text)] hover:opacity-80">
            <span className="mp-call-dot grid h-6 w-6 shrink-0 place-items-center rounded-full" aria-hidden="true">
              <Phone className="h-3 w-3 transition-transform duration-300 group-hover:rotate-12" strokeWidth={2.5} />
            </span>
            <span className="select-all">{CONFIG.phoneDisplay}</span>
          </a>
          <a
            href={buildWhatsAppLink(T.waHello)}
            target="_blank"
            rel="noopener noreferrer"
            className="mp-link inline-flex items-center gap-2 font-medium text-[color:var(--dark-accent)] hover:text-[color:var(--dark-text)]"
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
    <div id="top" className="mp-sans mp-pattern flex min-h-screen flex-col text-[color:var(--ink)] antialiased">
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
      <ContactDock />
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
          className="mp-toast mp-glass fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] left-1/2 z-50 lg:bottom-6 flex w-[calc(100%-2rem)] max-w-sm items-center gap-3 rounded-xl p-3 pr-4"
          role="status"
        >
          <span className="mp-call-dot grid h-8 w-8 shrink-0 place-items-center rounded-full">
            <Check className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 truncate text-[13px] leading-5">{T.added} {toast.name}</p>
          <button type="button" onClick={openCart} className="mp-link shrink-0 text-[13px] font-semibold text-[color:var(--dark-accent)] hover:text-[color:var(--dark-text)]">
            {T.view}
          </button>
        </div>
      )}
    </div>
  );
}
