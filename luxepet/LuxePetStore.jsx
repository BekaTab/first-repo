import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Banknote,
  Cat,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Dog,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  SlidersHorizontal,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/* ------------------------------------------------------------------ */
/*  Shop settings — name, contacts, delivery prices                    */
/* ------------------------------------------------------------------ */
export const BRAND = {
  name: "LuxePet",
  phone: "+995 5XX XX XX XX", // replace with the shop's number
  email: "info@luxepet.ge",
  facebook: "https://facebook.com",
  instagram: "https://instagram.com",
  freeDeliveryFrom: 100, // ₾ — orders from this amount ship free
  deliveryTbilisi: 5, // ₾
  deliveryRegions: 10, // ₾
  sameDayUntil: "15:00",
  perPage: 12, // products per catalogue page
  defaultLang: "ka", // "ka" or "en"; a visitor's own choice is remembered
};

/*
  Colours (Tailwind arbitrary values):
    #F26B1D  orange — buttons, accents            #D9570B  orange hover
    #1F2933  ink — text, top bar, footer          #6B7280  muted text
    #FFF4EC  warm tint — banner, highlights       #FAFAF9  page background
    #E7E5E4  borders                              #E03131  sale   #2F9E44  in stock / new
*/

const MAX_QTY = 20;

/* ------------------------------------------------------------------ */
/*  Site text — Georgian and English                                   */
/* ------------------------------------------------------------------ */
export const TEXT = {
  ka: {
    title: "LuxePet — ძაღლისა და კატის საკვები და აქსესუარები",
    topbar: (from, until) => `უფასო მიწოდება ${from} ₾-დან · თბილისში იმავე დღეს, თუ შეუკვეთავთ ${until}-მდე`,
    searchPlaceholder: "მოძებნეთ: საკვები, საბელი, ბრენდი…",
    searchLabel: "ძებნა",
    nav: { dog: "ძაღლები", cat: "კატები", sale: "ფასდაკლებები" },
    animals: { dog: "ძაღლი", cat: "კატა" },
    cats: {
      food: "საკვები",
      treats: "სნეკები და ძვლები",
      accessories: "აქსესუარები",
      clothes: "ტანსაცმელი",
      beds: "საწოლები და სახლები",
      toys: "სათამაშოები",
      care: "მოვლა და ჰიგიენა",
    },
    units: { kg: "კგ", g: "გ", l: "ლ", ml: "მლ", cm: "სმ", m: "მ", pcs: "ც" },
    heroTitle: "ყველაფერი თქვენი ძაღლისა და კატისთვის",
    heroText: "საკვები, აქსესუარები, ტანსაცმელი და სათამაშოები ცნობილი ბრენდებისგან. თბილისში მიწოდება იმავე დღეს.",
    shopNow: "პროდუქციის ნახვა",
    saleUpTo: (n) => `ფასდაკლებები -${n}%-მდე`,
    features: [
      { title: "იმავე დღეს მიწოდება", text: (until) => `თბილისში, ${until}-მდე შეკვეთისას` },
      { title: "გადახდა კურიერთან", text: () => "ნაღდი ფულით ან ბარათით" },
      { title: "ორიგინალი პროდუქცია", text: () => "ოფიციალური მომწოდებლებისგან" },
      { title: "მარტივი დაბრუნება", text: () => "14 დღის განმავლობაში" },
    ],
    categoriesTitle: "კატეგორიები",
    catalogTitle: "პროდუქცია",
    found: (n) => `ნაპოვნია ${n} პროდუქტი`,
    sortLabel: "დალაგება",
    sort: { popular: "პოპულარული", new: "ჯერ ახალი", priceAsc: "ფასი: იაფიდან", priceDesc: "ფასი: ძვირიდან", discount: "ყველაზე დიდი ფასდაკლება" },
    filters: "ფილტრი",
    filterAnimal: "ცხოველი",
    filterCategory: "კატეგორია",
    filterPrice: "ფასი",
    any: "ყველა",
    priceBuckets: ["25 ₾-მდე", "25–50 ₾", "50–100 ₾", "100 ₾-ზე მეტი"],
    onlySale: "მხოლოდ ფასდაკლებული",
    onlyStock: "მხოლოდ მარაგში",
    reset: "ფილტრის გასუფთავება",
    showResults: (n) => `ნახვა (${n})`,
    searchFor: (q) => `ძებნა: „${q}“`,
    noResults: "ვერაფერი მოიძებნა",
    noResultsHint: "სცადეთ სხვა სიტყვა ან გაასუფთავეთ ფილტრი.",
    addToCart: "კალათაში",
    outOfStock: "ამოიწურა",
    inStock: "მარაგშია",
    isNew: "ახალი",
    inCart: (n) => `კალათაშია: ${n}`,
    prev: "წინა",
    next: "შემდეგი",
    pages: "გვერდები",
    pageN: (n) => `გვერდი ${n}`,
    qty: "რაოდენობა",
    addToCartLong: "კალათაში დამატება",
    decrease: "შემცირება",
    increase: "გაზრდა",
    close: "დახურვა",
    quickDelivery: (from) => `უფასო მიწოდება ${from} ₾-დან`,
    quickPay: "გადახდა კურიერთან, ნაღდით ან ბარათით",
    cart: "კალათა",
    openCart: (n) => `კალათის გახსნა, ${n} პროდუქტი`,
    cartEmpty: "კალათა ცარიელია",
    cartEmptyHint: "დაამატეთ პროდუქცია კატალოგიდან.",
    continueShopping: "ყიდვის გაგრძელება",
    toFree: (x) => `დაამატეთ კიდევ ${x} და მიწოდება უფასო იქნება`,
    freeReached: "მიწოდება უფასოა!",
    itemsTotal: "პროდუქცია",
    delivery: "მიწოდება",
    total: "სულ",
    free: "უფასო",
    remove: "წაშლა",
    checkout: "შეკვეთის გაფორმება",
    backToCart: "კალათაში დაბრუნება",
    fName: "სახელი და გვარი",
    fPhone: "ტელეფონი",
    fPhonePh: "5XX XX XX XX",
    fCity: "ქალაქი",
    tbilisi: "თბილისი",
    regions: "რეგიონი",
    fAddress: "მისამართი",
    fAddressPh: "ქუჩა, სახლი, ბინა",
    fComment: "კომენტარი (არასავალდებულო)",
    fPayment: "გადახდის მეთოდი",
    cash: "ნაღდი ფულით კურიერთან",
    card: "ბარათით კურიერთან",
    confirm: "შეკვეთის დადასტურება",
    errRequired: "შეავსეთ ეს ველი",
    errPhone: "შეიყვანეთ სწორი ნომერი, მაგ. 555 12 34 56",
    doneTitle: "შეკვეთა მიღებულია!",
    doneText: (no, phone) => `შეკვეთის ნომერია ${no}. ოპერატორი დაგიკავშირდებათ ნომერზე ${phone} შეკვეთის დასადასტურებლად.`,
    demoNote: "ეს სადემონსტრაციო ვერსიაა, შეკვეთა რეალურად არ იგზავნება.",
    footerAbout: "ძაღლებისა და კატების საკვები, აქსესუარები და სათამაშოები ერთ ადგილას. მიწოდება მთელ საქართველოში.",
    footerInfo: "ინფორმაცია",
    footerInfoLinks: ["მიწოდება და გადახდა", "დაბრუნების პირობები", "ჩვენ შესახებ"],
    footerContact: "კონტაქტი",
    city: "თბილისი, საქართველო",
    hours: "ორშ–კვი, 10:00–20:00",
    rights: "ყველა უფლება დაცულია.",
    langLabel: "ენა",
  },
  en: {
    title: "LuxePet — Dog & cat food and accessories",
    topbar: (from, until) => `Free delivery from ${from} ₾ · Same-day in Tbilisi when you order by ${until}`,
    searchPlaceholder: "Search: food, leash, brand…",
    searchLabel: "Search",
    nav: { dog: "Dogs", cat: "Cats", sale: "Sale" },
    animals: { dog: "Dog", cat: "Cat" },
    cats: {
      food: "Food",
      treats: "Treats & chews",
      accessories: "Accessories",
      clothes: "Clothing",
      beds: "Beds & houses",
      toys: "Toys",
      care: "Care & hygiene",
    },
    units: { kg: "kg", g: "g", l: "L", ml: "ml", cm: "cm", m: "m", pcs: "pcs" },
    heroTitle: "Everything for your dog and cat",
    heroText: "Food, accessories, clothing and toys from trusted brands. Same-day delivery in Tbilisi.",
    shopNow: "Shop products",
    saleUpTo: (n) => `Sale up to -${n}%`,
    features: [
      { title: "Same-day delivery", text: (until) => `In Tbilisi, when you order by ${until}` },
      { title: "Pay on delivery", text: () => "Cash or card to the courier" },
      { title: "Genuine products", text: () => "From official suppliers" },
      { title: "Easy returns", text: () => "Within 14 days" },
    ],
    categoriesTitle: "Categories",
    catalogTitle: "Products",
    found: (n) => `${n} ${n === 1 ? "product" : "products"} found`,
    sortLabel: "Sort by",
    sort: { popular: "Most popular", new: "Newest first", priceAsc: "Price: low to high", priceDesc: "Price: high to low", discount: "Biggest discount" },
    filters: "Filters",
    filterAnimal: "Pet",
    filterCategory: "Category",
    filterPrice: "Price",
    any: "All",
    priceBuckets: ["Under 25 ₾", "25–50 ₾", "50–100 ₾", "Over 100 ₾"],
    onlySale: "On sale only",
    onlyStock: "In stock only",
    reset: "Clear filters",
    showResults: (n) => `Show (${n})`,
    searchFor: (q) => `Search: “${q}”`,
    noResults: "Nothing found",
    noResultsHint: "Try another word or clear the filters.",
    addToCart: "Add to cart",
    outOfStock: "Out of stock",
    inStock: "In stock",
    isNew: "New",
    inCart: (n) => `In cart: ${n}`,
    prev: "Previous",
    next: "Next",
    pages: "Pages",
    pageN: (n) => `Page ${n}`,
    qty: "Quantity",
    addToCartLong: "Add to cart",
    decrease: "Decrease",
    increase: "Increase",
    close: "Close",
    quickDelivery: (from) => `Free delivery from ${from} ₾`,
    quickPay: "Pay the courier, cash or card",
    cart: "Cart",
    openCart: (n) => `Open cart, ${n} ${n === 1 ? "item" : "items"}`,
    cartEmpty: "Your cart is empty",
    cartEmptyHint: "Add products from the catalogue.",
    continueShopping: "Continue shopping",
    toFree: (x) => `Add ${x} more for free delivery`,
    freeReached: "Delivery is free!",
    itemsTotal: "Products",
    delivery: "Delivery",
    total: "Total",
    free: "Free",
    remove: "Remove",
    checkout: "Checkout",
    backToCart: "Back to cart",
    fName: "Full name",
    fPhone: "Phone",
    fPhonePh: "5XX XX XX XX",
    fCity: "City",
    tbilisi: "Tbilisi",
    regions: "Other regions",
    fAddress: "Address",
    fAddressPh: "Street, building, flat",
    fComment: "Comment (optional)",
    fPayment: "Payment method",
    cash: "Cash to the courier",
    card: "Card to the courier",
    confirm: "Place order",
    errRequired: "Please fill in this field",
    errPhone: "Enter a valid number, e.g. 555 12 34 56",
    doneTitle: "Order received!",
    doneText: (no, phone) => `Your order number is ${no}. We will call ${phone} to confirm it.`,
    demoNote: "This is a demo; no order is actually sent.",
    footerAbout: "Food, accessories and toys for dogs and cats in one place. Delivery across Georgia.",
    footerInfo: "Information",
    footerInfoLinks: ["Delivery & payment", "Returns", "About us"],
    footerContact: "Contact",
    city: "Tbilisi, Georgia",
    hours: "Mon–Sun, 10:00–20:00",
    rights: "All rights reserved.",
    langLabel: "Language",
  },
};
const LANGS = [
  { id: "ka", short: "ქა", name: "ქართული" },
  { id: "en", short: "EN", name: "English" },
];

/* ------------------------------------------------------------------ */
/*  Catalogue                                                          */
/* ------------------------------------------------------------------ */
export const CATEGORIES = ["food", "treats", "accessories", "clothes", "beds", "toys", "care"];
// the drawing each category tile shows: [art, colour]
const CATEGORY_ART = {
  food: ["bag", "#F26B1D"],
  treats: ["bone", "#C9A227"],
  accessories: ["leash", "#1971C2"],
  clothes: ["jacket", "#E8590C"],
  beds: ["bed", "#845EF7"],
  toys: ["toy", "#E03131"],
  care: ["bottle", "#1098AD"],
};
const PRICE_BUCKETS = [
  [0, 25],
  [25, 50],
  [50, 100],
  [100, Infinity],
];

/*
  One entry per product. `name` and `desc` are given per language; `size` is [amount, unit] or a plain size like "M".
  `art` picks the drawing (bag, pouch, box, bone, leash, collar, harness, bowl, jacket, sweater, bed, tree, toy, wand, bottle, litter)
  and `color` tints it; add `image: "https://…"` to show a product photo instead. `rank` orders "Most popular" (1 = first).
*/
export const PRODUCTS = [
  {
    id: "rc-medium-adult",
    animal: "dog",
    category: "food",
    brand: "Royal Canin",
    name: { ka: "Royal Canin Medium Adult, მშრალი საკვები", en: "Royal Canin Medium Adult dry food" },
    desc: { ka: "საშუალო ზომის (11–25 კგ) ზრდასრული ძაღლებისთვის. ხელს უწყობს საჭმლის მონელებას და ბეწვის ჯანმრთელობას.", en: "For adult medium-size dogs (11–25 kg). Supports digestion and a healthy coat." },
    size: [4, "kg"],
    price: 89,
    oldPrice: 99,
    art: "bag",
    color: "#C8102E",
    label: "RC",
    rank: 1,
  },
  {
    id: "brit-care-lamb",
    animal: "dog",
    category: "food",
    brand: "Brit",
    name: { ka: "Brit Care Adult, ბატკნის ხორცი და ბრინჯი", en: "Brit Care Adult, lamb & rice" },
    desc: { ka: "ჰიპოალერგიული საკვები ზრდასრული ძაღლებისთვის, ხორბლის გარეშე.", en: "Hypoallergenic food for adult dogs, wheat-free." },
    size: [3, "kg"],
    price: 62,
    art: "bag",
    color: "#2B8A3E",
    label: "BRIT",
    rank: 4,
  },
  {
    id: "acana-adult-dog",
    animal: "dog",
    category: "food",
    brand: "Acana",
    name: { ka: "Acana Adult Dog, მშრალი საკვები", en: "Acana Adult Dog dry food" },
    desc: { ka: "კანადური საკვები ახალი ქათმის ხორცით და კვერცხით, მარცვლეულის გარეშე.", en: "Canadian recipe with fresh chicken and eggs, grain-free." },
    size: [2, "kg"],
    price: 79,
    art: "bag",
    color: "#3D3D3D",
    label: "ACANA",
    isNew: true,
    rank: 12,
  },
  {
    id: "proplan-puppy",
    animal: "dog",
    category: "food",
    brand: "Purina Pro Plan",
    name: { ka: "Purina Pro Plan Puppy, ქათმით", en: "Purina Pro Plan Puppy, chicken" },
    desc: { ka: "ლეკვებისთვის 1 წლამდე. შეიცავს კოლოსტრუმს იმუნიტეტისთვის.", en: "For puppies up to 1 year. With colostrum for immunity." },
    size: [3, "kg"],
    price: 74,
    oldPrice: 85,
    art: "bag",
    color: "#1D3557",
    label: "PRO PLAN",
    rank: 3,
  },
  {
    id: "rc-indoor-27",
    animal: "cat",
    category: "food",
    brand: "Royal Canin",
    name: { ka: "Royal Canin Indoor 27, კატის საკვები", en: "Royal Canin Indoor 27 cat food" },
    desc: { ka: "სახლის კატებისთვის: ამცირებს ბეწვის ბურთულებს და განავლის სუნს.", en: "For indoor cats: reduces hairballs and stool odour." },
    size: [2, "kg"],
    price: 69,
    art: "bag",
    color: "#C8102E",
    label: "RC",
    rank: 2,
  },
  {
    id: "brit-cat-sterilised",
    animal: "cat",
    category: "food",
    brand: "Brit",
    name: { ka: "Brit Premium Cat Sterilised, ქათმით", en: "Brit Premium Cat Sterilised, chicken" },
    desc: { ka: "დაბალკალორიული საკვები სტერილიზებული კატებისთვის.", en: "Lower-calorie food for sterilised cats." },
    size: [1.5, "kg"],
    price: 32,
    oldPrice: 38,
    art: "bag",
    color: "#2B8A3E",
    label: "BRIT",
    rank: 6,
  },
  {
    id: "whiskas-pouch-12",
    animal: "cat",
    category: "food",
    brand: "Whiskas",
    name: { ka: "Whiskas სველი საკვები ქათმით, 12 × 85 გ", en: "Whiskas wet food with chicken, 12 × 85 g" },
    desc: { ka: "სველი საკვები ზრდასრული კატებისთვის, სოუსში.", en: "Wet food in gravy for adult cats." },
    size: [12, "pcs"],
    price: 24,
    art: "pouch",
    color: "#6A1B9A",
    label: "Whiskas",
    rank: 5,
  },
  {
    id: "hills-kitten",
    animal: "cat",
    category: "food",
    brand: "Hill's",
    name: { ka: "Hill's Science Plan Kitten, კნუტებისთვის", en: "Hill's Science Plan Kitten" },
    desc: { ka: "კნუტებისთვის 12 თვემდე და მაკე კატებისთვის. DHA ტვინის განვითარებისთვის.", en: "For kittens up to 12 months and pregnant cats. DHA for brain development." },
    size: [1.5, "kg"],
    price: 58,
    art: "bag",
    color: "#0B5394",
    label: "HILL'S",
    isNew: true,
    rank: 15,
  },
  {
    id: "pedigree-dentastix",
    animal: "dog",
    category: "treats",
    brand: "Pedigree",
    name: { ka: "Pedigree DentaStix, კბილების ჩხირები", en: "Pedigree DentaStix dental sticks" },
    desc: { ka: "ყოველდღიური ჩხირი კბილის ნადების შესამცირებლად, საშუალო ჯიშებისთვის.", en: "Daily stick that reduces tartar build-up, for medium breeds." },
    size: [7, "pcs"],
    price: 9,
    oldPrice: 11,
    art: "box",
    color: "#F2A900",
    label: "DentaStix",
    rank: 7,
  },
  {
    id: "trixie-chew-bones",
    animal: "dog",
    category: "treats",
    brand: "Trixie",
    name: { ka: "Trixie ბუნებრივი ძვლები", en: "Trixie natural chew bones" },
    desc: { ka: "ხარის ტყავისგან, ხანგრძლივი ღეჭვისთვის.", en: "Made of beef hide for long-lasting chewing." },
    size: [2, "pcs"],
    price: 12,
    art: "bone",
    color: "#C9A227",
    rank: 14,
  },
  {
    id: "dreamies-cheese",
    animal: "cat",
    category: "treats",
    brand: "Dreamies",
    name: { ka: "Dreamies ხრაშუნა ბალიშები, ყველით", en: "Dreamies crunchy treats, cheese" },
    desc: { ka: "გარედან ხრაშუნა, შიგნით რბილი. ჯილდოდ ან თამაშისთვის.", en: "Crunchy outside, soft inside. For rewards and play." },
    size: [60, "g"],
    price: 5.5,
    oldPrice: 6.5,
    art: "pouch",
    color: "#7B2CBF",
    label: "Dreamies",
    rank: 8,
  },
  {
    id: "flexi-new-classic",
    animal: "dog",
    category: "accessories",
    brand: "Flexi",
    name: { ka: "Flexi New Classic, რულეტკა-საბელი", en: "Flexi New Classic retractable leash" },
    desc: { ka: "M ზომა, 20 კგ-მდე ძაღლებისთვის. ჩაკეტვა ერთი ღილაკით.", en: "Size M, for dogs up to 20 kg. One-button brake." },
    size: [5, "m"],
    price: 54,
    art: "leash",
    color: "#D9480F",
    rank: 10,
  },
  {
    id: "trixie-premium-collar",
    animal: "dog",
    category: "accessories",
    brand: "Trixie",
    name: { ka: "Trixie Premium საყელური", en: "Trixie Premium collar" },
    desc: { ka: "მტკიცე ნეილონი, რეგულირებადი 35–55 სმ, ლითონის ბალთით.", en: "Strong nylon, adjustable 35–55 cm, metal buckle." },
    size: "M",
    price: 18,
    art: "collar",
    color: "#1971C2",
    rank: 13,
  },
  {
    id: "julius-k9-harness",
    animal: "dog",
    category: "accessories",
    brand: "Julius-K9",
    name: { ka: "Julius-K9 IDC Power აღკაზმულობა", en: "Julius-K9 IDC Power harness" },
    desc: { ka: "ერგონომიული აღკაზმულობა ამრეკლი ზოლებით, ნებისმიერი ამინდისთვის.", en: "Ergonomic harness with reflective trim, for any weather." },
    size: "L",
    price: 95,
    oldPrice: 110,
    art: "harness",
    color: "#343A40",
    rank: 11,
    inStock: false,
  },
  {
    id: "ferplast-steel-bowl",
    animal: "dog",
    category: "accessories",
    brand: "Ferplast",
    name: { ka: "Ferplast უჟანგავი ფოლადის ჯამი", en: "Ferplast stainless steel bowl" },
    desc: { ka: "რეზინის ძირი არ აცურებს. ირეცხება ჭურჭლის სარეცხ მანქანაში.", en: "Rubber base stops it sliding. Dishwasher-safe." },
    size: [0.75, "l"],
    price: 14,
    art: "bowl",
    color: "#868E96",
    rank: 18,
  },
  {
    id: "ceramic-double-bowl",
    animal: "cat",
    category: "accessories",
    brand: "Trixie",
    name: { ka: "ორმაგი კერამიკული ჯამი სადგამით", en: "Double ceramic bowl on a stand" },
    desc: { ka: "მაღალი სადგამი აადვილებს ჭამას და უფრთხილდება კისერს.", en: "The raised stand makes eating easier and is gentle on the neck." },
    size: ["2 × 200", "ml"],
    price: 22,
    art: "bowl",
    color: "#E64980",
    isNew: true,
    rank: 19,
  },
  {
    id: "winter-dog-jacket",
    animal: "dog",
    category: "clothes",
    brand: "Trixie",
    name: { ka: "ზამთრის ქურთუკი ძაღლისთვის", en: "Winter dog jacket" },
    desc: { ka: "წყალგაუმტარი, თბილი სარჩულით და ამრეკლი ზოლით.", en: "Waterproof, with a warm lining and a reflective strip." },
    size: "M",
    price: 45,
    oldPrice: 59,
    art: "jacket",
    color: "#E8590C",
    rank: 9,
  },
  {
    id: "knitted-dog-sweater",
    animal: "dog",
    category: "clothes",
    brand: "Trixie",
    name: { ka: "ნაქსოვი სვიტერი პატარა ჯიშებისთვის", en: "Knitted sweater for small breeds" },
    desc: { ka: "რბილი ნაქსოვი, მარტივად იცმევა.", en: "Soft knit that is easy to put on." },
    size: "S",
    price: 32,
    art: "sweater",
    color: "#2F9E44",
    isNew: true,
    rank: 20,
  },
  {
    id: "round-plush-bed",
    animal: "dog",
    category: "beds",
    brand: "Ferplast",
    name: { ka: "მრგვალი რბილი საწოლი", en: "Round plush bed" },
    desc: { ka: "რბილი ბორტები და ღრმა ფორმა. ირეცხება 30°-ზე.", en: "Soft raised rim and a deep shape. Machine-washable at 30°." },
    size: [60, "cm"],
    price: 75,
    art: "bed",
    color: "#845EF7",
    rank: 16,
  },
  {
    id: "cat-tree-80",
    animal: "cat",
    category: "beds",
    brand: "Trixie",
    name: { ka: "კატის სახლი და საფხაჭნი", en: "Cat tree with scratching post" },
    desc: { ka: "ორი პლატფორმა, დახურული სახლი და სიზალის საფხაჭნი სვეტები.", en: "Two platforms, a hideaway and sisal scratching posts." },
    size: [80, "cm"],
    price: 119,
    oldPrice: 139,
    art: "tree",
    color: "#A47148",
    rank: 17,
  },
  {
    id: "kong-classic",
    animal: "dog",
    category: "toys",
    brand: "KONG",
    name: { ka: "KONG Classic სათამაშო", en: "KONG Classic toy" },
    desc: { ka: "მტკიცე რეზინის სათამაშო, შიგნით შეგიძლიათ ჩადოთ სნეკი.", en: "Tough rubber toy you can fill with treats." },
    size: "M",
    price: 29,
    art: "toy",
    color: "#E03131",
    rank: 21,
  },
  {
    id: "feather-wand",
    animal: "cat",
    category: "toys",
    brand: "Trixie",
    name: { ka: "ჯოხი ბუმბულებით", en: "Feather wand toy" },
    desc: { ka: "აქტიური თამაშისთვის: კატა ბუმბულებზე ნადირობს.", en: "For active play: your cat hunts the feathers." },
    size: [45, "cm"],
    price: 9,
    art: "wand",
    color: "#F59F00",
    isNew: true,
    rank: 22,
  },
  {
    id: "beaphar-dog-shampoo",
    animal: "dog",
    category: "care",
    brand: "Beaphar",
    name: { ka: "Beaphar შამპუნი ძაღლებისთვის", en: "Beaphar dog shampoo" },
    desc: { ka: "ალოე ვერათი, მგრძნობიარე კანისთვის. ბეწვი რბილი და ბზინვარე ხდება.", en: "With aloe vera for sensitive skin. Leaves the coat soft and shiny." },
    size: [250, "ml"],
    price: 19,
    art: "bottle",
    color: "#1098AD",
    rank: 23,
  },
  {
    id: "cats-best-original",
    animal: "cat",
    category: "care",
    brand: "Cat's Best",
    name: { ka: "Cat's Best Original, ქვიშა კატისთვის", en: "Cat's Best Original cat litter" },
    desc: { ka: "მცენარეული ბოჭკოსგან, კარგად იკავებს სუნს.", en: "Plant-fibre litter that locks in odour." },
    size: [10, "l"],
    price: 39,
    oldPrice: 45,
    art: "litter",
    color: "#5C940D",
    rank: 24,
  },
];

const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
const isOnSale = (p) => p.oldPrice > p.price;
const discountOf = (p) => (isOnSale(p) ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
const inStock = (p) => p.inStock !== false;
const MAX_DISCOUNT = Math.max(...PRODUCTS.map(discountOf));

// "89 ₾", "5.50 ₾"
const formatPrice = (n) => `${Number.isInteger(n) ? n : n.toFixed(2)} ₾`;
const formatSize = (size, t) => (Array.isArray(size) ? `${size[0]} ${t.units[size[1]]}` : size);

/* ------------------------------------------------------------------ */
/*  Stores (Zustand): cart and language, both kept in localStorage     */
/* ------------------------------------------------------------------ */
const clampQty = (n) => Math.max(1, Math.min(MAX_QTY, Math.floor(n)));

export const useCart = create(
  persist(
    (set) => ({
      // lines keep the order in which products were added: [{ id, qty }]
      lines: [],
      isOpen: false,
      add: (id, qty = 1) =>
        set((s) => {
          const p = PRODUCT_BY_ID[id];
          if (!p || !inStock(p)) return s;
          const found = s.lines.find((l) => l.id === id);
          return { lines: found ? s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(l.qty + qty) } : l)) : [...s.lines, { id, qty: clampQty(qty) }] };
        }),
      // a quantity below 1 takes the product out of the cart
      setQty: (id, qty) => set((s) => ({ lines: qty < 1 ? s.lines.filter((l) => l.id !== id) : s.lines.map((l) => (l.id === id ? { ...l, qty: clampQty(qty) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      clear: () => set({ lines: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "luxepet-cart",
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

const selectCount = (s) => s.lines.reduce((n, l) => n + l.qty, 0);
const selectSubtotal = (s) => s.lines.reduce((sum, l) => sum + PRODUCT_BY_ID[l.id].price * l.qty, 0);
const deliveryFor = (subtotal, city) => (subtotal >= BRAND.freeDeliveryFrom ? 0 : city === "tbilisi" ? BRAND.deliveryTbilisi : BRAND.deliveryRegions);

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

/* ------------------------------------------------------------------ */
/*  Logo and product drawings                                          */
/* ------------------------------------------------------------------ */
function PawMark({ className = "" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#F26B1D" />
      <g fill="#fff">
        <ellipse cx="16" cy="20.5" rx="5.6" ry="4.8" />
        <ellipse cx="9.2" cy="14.6" rx="2.3" ry="2.9" transform="rotate(-18 9.2 14.6)" />
        <ellipse cx="13.6" cy="10.4" rx="2.3" ry="3" transform="rotate(-6 13.6 10.4)" />
        <ellipse cx="18.4" cy="10.4" rx="2.3" ry="3" transform="rotate(6 18.4 10.4)" />
        <ellipse cx="22.8" cy="14.6" rx="2.3" ry="2.9" transform="rotate(18 22.8 14.6)" />
      </g>
    </svg>
  );
}

function Wordmark({ dark = false }) {
  return (
    <span className={`text-[22px] font-bold tracking-tight ${dark ? "text-white" : "text-[#1F2933]"}`}>
      Luxe<span className="text-[#F26B1D]">Pet</span>
    </span>
  );
}

// darkens (amt < 0) or lightens (amt > 0) a #rrggbb colour
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => ch(v).toString(16).padStart(2, "0")).join("")}`;
}

// Flat drawings per product type, so every card has a clear picture even before real photos are added
function ProductArt({ art, color, label = "" }) {
  const dark = shade(color, -0.3);
  const light = shade(color, 0.55);
  const pale = shade(color, 0.86);
  const labelText = (y, size) => (
    <text x="60" y={y} textAnchor="middle" fontSize={size} fontWeight="700" fill={color} fontFamily="Inter, sans-serif">
      {label}
    </text>
  );
  const shapes = {
    bag: (
      <>
        <path d="M33 30h54l5 68a6 6 0 0 1-6 6H34a6 6 0 0 1-6-6z" fill={color} />
        <rect x="31" y="20" width="58" height="13" rx="3" fill={dark} />
        <rect x="39" y="50" width="42" height="34" rx="5" fill="#fff" />
        {labelText(64, label.length > 5 ? 7 : 9)}
        <g fill={color} opacity=".85">
          <ellipse cx="60" cy="76" rx="4.2" ry="3.4" />
          <circle cx="54.5" cy="71.5" r="1.7" />
          <circle cx="58" cy="69" r="1.7" />
          <circle cx="62" cy="69" r="1.7" />
          <circle cx="65.5" cy="71.5" r="1.7" />
        </g>
      </>
    ),
    pouch: (
      <>
        <path d="M38 26h44l4 74a5 5 0 0 1-5 5H39a5 5 0 0 1-5-5z" fill={color} />
        <path d="M38 26h44l1 9H37z" fill={dark} />
        <ellipse cx="60" cy="68" rx="18" ry="14" fill="#fff" />
        {labelText(71, label.length > 7 ? 6.5 : 8)}
      </>
    ),
    box: (
      <>
        <rect x="26" y="32" width="68" height="62" rx="6" fill={color} />
        <rect x="26" y="32" width="68" height="14" rx="6" fill={dark} />
        <rect x="36" y="56" width="48" height="26" rx="4" fill="#fff" />
        {labelText(73, 7.5)}
      </>
    ),
    bone: (
      <g transform="rotate(-25 60 60)">
        <rect x="34" y="52" width="52" height="16" rx="6" fill={light} />
        <circle cx="33" cy="51" r="10" fill={light} />
        <circle cx="33" cy="69" r="10" fill={light} />
        <circle cx="87" cy="51" r="10" fill={light} />
        <circle cx="87" cy="69" r="10" fill={light} />
        <rect x="40" y="56" width="40" height="3" rx="1.5" fill={color} opacity=".35" />
      </g>
    ),
    leash: (
      <>
        <rect x="30" y="34" width="44" height="40" rx="18" fill={color} />
        <circle cx="52" cy="54" r="9" fill={dark} />
        <path d="M30 52c-10 4-10 22 6 26" stroke={dark} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M74 54c14 0 18 14 18 30" stroke={dark} strokeWidth="3" fill="none" />
        <rect x="86" y="82" width="12" height="16" rx="4" fill="#ADB5BD" />
      </>
    ),
    collar: (
      <>
        <ellipse cx="60" cy="56" rx="32" ry="22" fill="none" stroke={color} strokeWidth="11" />
        <rect x="80" y="44" width="14" height="22" rx="3" fill="#CED4DA" stroke="#868E96" strokeWidth="2" />
        <circle cx="60" cy="84" r="9" fill="#FCC419" stroke="#E67700" strokeWidth="2" />
        <path d="M57 84h6" stroke="#E67700" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    harness: (
      <>
        <path d="M30 40c10-10 50-10 60 0l-6 46c-16 8-32 8-48 0z" fill={color} />
        <rect x="36" y="52" width="48" height="16" rx="4" fill={shade(color, 0.25)} />
        <rect x="42" y="56" width="36" height="8" rx="2" fill="#fff" />
        <path d="M34 88l-6 12M86 88l6 12" stroke={color} strokeWidth="7" strokeLinecap="round" />
        <rect x="54" y="30" width="12" height="8" rx="2" fill="#ADB5BD" />
      </>
    ),
    bowl: (
      <>
        <ellipse cx="60" cy="56" rx="36" ry="10" fill={dark} />
        <path d="M24 56h72l-9 30a8 8 0 0 1-8 6H41a8 8 0 0 1-8-6z" fill={color} />
        <ellipse cx="60" cy="56" rx="28" ry="6" fill={light} />
        <path d="M34 70h52" stroke="#fff" strokeOpacity=".35" strokeWidth="3" />
      </>
    ),
    jacket: (
      <>
        <path d="M40 30l-16 14 8 14 8-6v50h40V52l8 6 8-14-16-14c-4 6-12 9-20 9s-16-3-20-9z" fill={color} />
        <path d="M60 39v63" stroke={dark} strokeWidth="3" />
        <path d="M44 66h10M66 66h10" stroke={light} strokeWidth="4" strokeLinecap="round" />
        <path d="M40 30c4 6 12 9 20 9s16-3 20-9" stroke={dark} strokeWidth="4" fill="none" />
      </>
    ),
    sweater: (
      <>
        <path d="M40 30l-16 14 8 14 8-6v50h40V52l8 6 8-14-16-14c-4 6-12 9-20 9s-16-3-20-9z" fill={color} />
        {[54, 66, 78, 90].map((y) => (
          <path key={y} d={`M40 ${y}h40`} stroke={light} strokeWidth="3" strokeDasharray="4 3" />
        ))}
        <path d="M40 30c4 6 12 9 20 9s16-3 20-9" stroke={dark} strokeWidth="5" fill="none" />
      </>
    ),
    bed: (
      <>
        <ellipse cx="60" cy="72" rx="44" ry="24" fill={color} />
        <ellipse cx="60" cy="68" rx="32" ry="15" fill={light} />
        <ellipse cx="60" cy="70" rx="24" ry="10" fill={pale} />
      </>
    ),
    tree: (
      <>
        <rect x="24" y="96" width="72" height="10" rx="3" fill={dark} />
        <rect x="36" y="44" width="10" height="54" fill="#E9D8A6" />
        <rect x="74" y="60" width="10" height="38" fill="#E9D8A6" />
        <path d="M36 50h10M36 58h10M36 66h10M36 74h10M36 82h10M74 68h10M74 76h10M74 84h10" stroke="#C9A227" strokeWidth="1.5" />
        <rect x="26" y="34" width="34" height="10" rx="3" fill={color} />
        <rect x="58" y="50" width="38" height="10" rx="3" fill={color} />
        <rect x="56" y="16" width="34" height="28" rx="6" fill={color} />
        <circle cx="73" cy="31" r="7" fill={dark} />
      </>
    ),
    toy: (
      <>
        <ellipse cx="60" cy="80" rx="22" ry="20" fill={color} />
        <ellipse cx="60" cy="54" rx="16" ry="14" fill={color} />
        <ellipse cx="60" cy="34" rx="10" ry="9" fill={color} />
        <ellipse cx="60" cy="26" rx="4" ry="2.5" fill={dark} />
        <ellipse cx="52" cy="76" rx="5" ry="9" fill="#fff" opacity=".25" />
      </>
    ),
    wand: (
      <>
        <path d="M28 98L80 34" stroke="#A47148" strokeWidth="5" strokeLinecap="round" />
        <path d="M80 34c-2 8 4 18 14 20" stroke="#868E96" strokeWidth="1.5" fill="none" />
        <path d="M94 54c-10-2-16 6-14 16 8-2 14-8 14-16z" fill={color} />
        <path d="M94 54c4 8 0 18-8 22 0-8 2-16 8-22z" fill={shade(color, -0.15)} />
        <path d="M94 54c8 2 12 10 10 18-6-4-10-10-10-18z" fill={light} />
      </>
    ),
    bottle: (
      <>
        <rect x="50" y="18" width="20" height="12" rx="2" fill={dark} />
        <path d="M44 30h32c4 0 6 3 6 6v62a6 6 0 0 1-6 6H44a6 6 0 0 1-6-6V36c0-3 2-6 6-6z" fill={color} />
        <rect x="44" y="52" width="32" height="30" rx="4" fill="#fff" />
        <path d="M60 58c-5 7-7 10-7 13a7 7 0 0 0 14 0c0-3-2-6-7-13z" fill={color} />
      </>
    ),
    litter: (
      <>
        <path d="M30 34h60l-4 66a6 6 0 0 1-6 6H40a6 6 0 0 1-6-6z" fill={color} />
        <rect x="26" y="26" width="68" height="12" rx="4" fill={dark} />
        <path d="M46 34c0-14 28-14 28 0" stroke={dark} strokeWidth="4" fill="none" />
        <rect x="40" y="56" width="40" height="28" rx="4" fill="#fff" />
        <g fill={color}>
          <circle cx="52" cy="72" r="3" />
          <circle cx="60" cy="68" r="3" />
          <circle cx="68" cy="72" r="3" />
          <circle cx="56" cy="77" r="2.4" />
          <circle cx="64" cy="77" r="2.4" />
        </g>
      </>
    ),
  };
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
      <circle cx="60" cy="64" r="50" fill={pale} />
      {shapes[art] || shapes.bag}
    </svg>
  );
}

// a product photo when one is set (and loads), otherwise the drawing
function ProductImage({ product }) {
  const [failed, setFailed] = useState(false);
  if (product.image && !failed) {
    return <img src={product.image} alt="" loading="lazy" onError={() => setFailed(true)} className="h-full w-full object-contain" />;
  }
  return <ProductArt art={product.art} color={product.color} label={product.label} />;
}

/* ------------------------------------------------------------------ */
/*  Small shared pieces                                                */
/* ------------------------------------------------------------------ */
function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Price({ product, big = false }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className={`font-bold tabular-nums ${isOnSale(product) ? "text-[#E03131]" : "text-[#1F2933]"} ${big ? "text-[28px]" : "text-[18px]"}`}>{formatPrice(product.price)}</span>
      {isOnSale(product) && <span className={`tabular-nums text-[#6B7280] line-through ${big ? "text-[16px]" : "text-[13px]"}`}>{formatPrice(product.oldPrice)}</span>}
    </div>
  );
}

function StockNote({ product }) {
  const t = useT();
  return inStock(product) ? <span className="text-[#2F9E44]">{t.inStock}</span> : <span className="text-[#E03131]">{t.outOfStock}</span>;
}

function SaleBadges({ product }) {
  const t = useT();
  return (
    <span className="absolute left-3 top-3 flex flex-col items-start gap-1">
      {isOnSale(product) && <span className="rounded-md bg-[#E03131] px-2 py-0.5 text-[12px] font-bold text-white">-{discountOf(product)}%</span>}
      {product.isNew && <span className="rounded-md bg-[#2F9E44] px-2 py-0.5 text-[12px] font-bold text-white">{t.isNew}</span>}
    </span>
  );
}

function QtyStepper({ value, onChange, min = 1, label, small = false }) {
  const t = useT();
  const box = small ? "h-9 w-9" : "h-11 w-11";
  return (
    <div className="inline-flex items-center rounded-lg border border-[#E7E5E4] bg-white">
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} className={`${box} inline-flex items-center justify-center text-[#1F2933] hover:text-[#F26B1D] disabled:opacity-30`} aria-label={`${t.decrease}: ${label}`}>
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-[28px] text-center text-[15px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= MAX_QTY} className={`${box} inline-flex items-center justify-center text-[#1F2933] hover:text-[#F26B1D] disabled:opacity-30`} aria-label={`${t.increase}: ${label}`}>
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

// while a panel or dialog is open: lock page scroll and close it with Escape
function useOverlay(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

const Scrim = ({ onClick, className = "" }) => <motion.div className={`fixed inset-0 z-50 bg-black/40 ${className}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClick} />;

function LangSwitch() {
  const t = useT();
  const setLang = useLang((s) => s.setLang);
  return (
    <div role="group" aria-label={t.langLabel} className="flex items-center gap-1 text-[13px] font-semibold">
      {LANGS.map((l) => (
        <button
          key={l.id}
          type="button"
          lang={l.id}
          onClick={() => setLang(l.id)}
          aria-pressed={t.lang === l.id}
          aria-label={l.name}
          className={`rounded px-1.5 py-0.5 ${t.lang === l.id ? "bg-white/15 text-white" : "text-white/60 hover:text-white"}`}
        >
          {l.short}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header: top bar, logo + search + cart, category bar                */
/* ------------------------------------------------------------------ */
function CartButton() {
  const t = useT();
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const open = useCart((s) => s.open);
  return (
    <button type="button" onClick={open} className="flex items-center gap-2.5 rounded-xl bg-[#F26B1D] px-3 py-2.5 text-white hover:bg-[#D9570B] sm:px-4" aria-label={t.openCart(count)}>
      <span className="relative">
        <ShoppingCart className="h-5 w-5" />
        {count > 0 && (
          <motion.span key={count} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute -right-2.5 -top-2.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1F2933] px-1 text-[11px] font-bold tabular-nums" aria-hidden="true">
            {count}
          </motion.span>
        )}
      </span>
      <span className="hidden text-[14px] font-semibold tabular-nums sm:inline">{count > 0 ? formatPrice(subtotal) : t.cart}</span>
    </button>
  );
}

function Header({ query, onSearch, onNav, activeNav }) {
  const t = useT();
  const [draft, setDraft] = useState(query);
  useEffect(() => setDraft(query), [query]);
  // "all products" is the logo's job, which keeps this bar on one line at desktop width
  const navItems = [
    { id: "dog", label: t.nav.dog, icon: Dog },
    { id: "cat", label: t.nav.cat, icon: Cat },
    { id: "sale", label: t.nav.sale, sale: true },
    ...CATEGORIES.map((c) => ({ id: c, label: t.cats[c] })),
  ];

  return (
    <>
      <div className="bg-[#1F2933] text-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-4 py-2 text-[12.5px] sm:px-6">
          <p className="flex min-w-0 items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-[#F26B1D]" />
            <span className="truncate">{t.topbar(BRAND.freeDeliveryFrom, BRAND.sameDayUntil)}</span>
          </p>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden items-center gap-1.5 md:flex">
              <Phone className="h-3.5 w-3.5" /> {BRAND.phone}
            </span>
            <LangSwitch />
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_#E7E5E4]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:px-6 md:flex-nowrap">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              onNav("all", { top: true });
            }}
            className="flex shrink-0 items-center gap-2"
            aria-label={BRAND.name}
          >
            <PawMark className="h-9 w-9" />
            <Wordmark />
          </a>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSearch(draft.trim());
            }}
            role="search"
            className="order-3 w-full md:order-2 md:flex-1"
          >
            <label htmlFor="site-search" className="sr-only">
              {t.searchLabel}
            </label>
            <div className="flex w-full items-center rounded-xl border-2 border-[#E7E5E4] bg-[#F5F5F4] focus-within:border-[#F26B1D] focus-within:bg-white">
              <input
                id="site-search"
                type="search"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (!e.target.value) onSearch("");
                }}
                placeholder={t.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent px-4 py-2 text-[15px] outline-none placeholder:text-[#9CA3AF]"
              />
              <button type="submit" className="m-1 inline-flex h-9 w-11 items-center justify-center rounded-lg bg-[#1F2933] text-white hover:bg-black" aria-label={t.searchLabel}>
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
          <div className="order-2 ml-auto flex items-center gap-4 md:order-3 md:ml-0">
            <span className="hidden items-center gap-2 text-[14px] font-semibold text-[#1F2933] lg:flex">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF4EC] text-[#F26B1D]">
                <Phone className="h-4 w-4" />
              </span>
              {BRAND.phone}
            </span>
            <CartButton />
          </div>
        </div>

        {/* category bar: scrolls sideways on phones */}
        <nav aria-label={t.catalogTitle} className="border-t border-[#E7E5E4]">
          <ul className="mx-auto flex max-w-[1280px] overflow-x-auto px-3 py-1.5 [mask-image:linear-gradient(to_right,#000_88%,transparent)] [scrollbar-width:none] sm:px-5 xl:justify-between xl:[mask-image:none]">
            {navItems.map((n) => {
              const active = activeNav === n.id;
              const Icon = n.icon;
              return (
                <li key={n.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onNav(n.id)}
                    className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors ${
                      active ? "bg-[#FFF4EC] text-[#F26B1D]" : n.sale ? "text-[#E03131] hover:bg-[#FFF5F5]" : "text-[#1F2933] hover:bg-[#F5F5F4]"
                    }`}
                    aria-current={active ? "true" : undefined}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    {n.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Home: banner, service strip, category tiles                        */
/* ------------------------------------------------------------------ */
const FEATURE_ICONS = [Truck, Banknote, ShieldCheck, RotateCcw];

function Banner({ onNav }) {
  const t = useT();
  const showcase = ["rc-medium-adult", "kong-classic", "whiskas-pouch-12"].map((id) => PRODUCT_BY_ID[id]);
  return (
    <section id="top" className="mx-auto max-w-[1280px] px-4 pt-5 sm:px-6">
      <div className="grid items-center gap-6 overflow-hidden rounded-3xl bg-[#FFF4EC] px-6 py-8 sm:px-10 md:grid-cols-2 md:py-12">
        <div>
          <h1 className="text-[28px] font-bold leading-[1.25] text-[#1F2933] sm:text-[38px]">{t.heroTitle}</h1>
          <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-[#4B5563]">{t.heroText}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => onNav("all")} className="rounded-xl bg-[#F26B1D] px-6 py-3 text-[15px] font-semibold text-white hover:bg-[#D9570B]">
              {t.shopNow}
            </button>
            <button type="button" onClick={() => onNav("sale")} className="rounded-xl border-2 border-[#E03131] bg-white px-6 py-3 text-[15px] font-semibold text-[#E03131] hover:bg-[#FFF5F5]">
              {t.saleUpTo(MAX_DISCOUNT)}
            </button>
          </div>
        </div>
        <div className="mx-auto hidden w-full max-w-[420px] grid-cols-3 items-end gap-2 sm:grid" aria-hidden="true">
          {showcase.map((p, i) => (
            <div key={p.id} className={`aspect-square ${i === 1 ? "-translate-y-4" : ""}`}>
              <ProductArt art={p.art} color={p.color} label={p.label} />
            </div>
          ))}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {t.features.map((f, i) => {
          const Icon = FEATURE_ICONS[i];
          return (
            <li key={f.title} className="flex items-center gap-3 rounded-2xl border border-[#E7E5E4] bg-white p-3 sm:p-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4EC] text-[#F26B1D]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold leading-snug text-[#1F2933]">{f.title}</span>
                <span className="block text-[12.5px] leading-snug text-[#6B7280]">{f.text(BRAND.sameDayUntil)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function CategoryTiles({ onNav }) {
  const t = useT();
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-10 sm:px-6">
      <h2 className="text-[22px] font-bold text-[#1F2933]">{t.categoriesTitle}</h2>
      <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {CATEGORIES.map((c) => {
          const [art, color] = CATEGORY_ART[c];
          return (
            <li key={c}>
              <button
                type="button"
                onClick={() => onNav(c)}
                className="group flex h-full w-full flex-col items-center gap-2 rounded-2xl border border-[#E7E5E4] bg-white p-3 text-center transition-shadow hover:border-[#F26B1D] hover:shadow-[0_6px_20px_-10px_rgba(242,107,29,0.5)]"
              >
                <span className="block aspect-square w-full max-w-[96px] transition-transform group-hover:scale-105">
                  <ProductArt art={art} color={color} />
                </span>
                <span className="text-[13px] font-semibold leading-tight text-[#1F2933]">{t.cats[c]}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Catalogue: filters, sorting, product grid, pagination              */
/* ------------------------------------------------------------------ */
export const DEFAULT_FILTERS = { animal: "all", category: "all", price: -1, onlySale: false, onlyStock: false };

// does a product pass the filters? (skipCategory: used for the per-category counts)
const passes = (p, f, skipCategory = false) =>
  (f.animal === "all" || p.animal === f.animal) &&
  (skipCategory || f.category === "all" || p.category === f.category) &&
  (f.price < 0 || (p.price >= PRICE_BUCKETS[f.price][0] && p.price < PRICE_BUCKETS[f.price][1])) &&
  (!f.onlySale || isOnSale(p)) &&
  (!f.onlyStock || inStock(p));

const SORTS = {
  popular: (a, b) => a.rank - b.rank,
  new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.rank - b.rank,
  priceAsc: (a, b) => a.price - b.price,
  priceDesc: (a, b) => b.price - a.price,
  discount: (a, b) => discountOf(b) - discountOf(a) || a.rank - b.rank,
};

function FilterPanel({ filters, setFilters, counts }) {
  const t = useT();
  const set = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const control = "h-4 w-4 accent-[#F26B1D]";
  const row = "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-[14px] text-[#1F2933] hover:bg-[#F5F5F4]";
  const legend = "mb-2 text-[13px] font-bold text-[#6B7280]";
  return (
    <div className="space-y-6">
      <fieldset>
        <legend className={legend}>{t.filterAnimal}</legend>
        {["all", "dog", "cat"].map((a) => (
          <label key={a} className={row}>
            <input type="radio" name="f-animal" className={control} checked={filters.animal === a} onChange={() => set({ animal: a })} />
            {a === "dog" && <Dog className="h-4 w-4 text-[#6B7280]" />}
            {a === "cat" && <Cat className="h-4 w-4 text-[#6B7280]" />}
            {a === "all" ? t.any : t.animals[a]}
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className={legend}>{t.filterCategory}</legend>
        {["all", ...CATEGORIES].map((c) => (
          <label key={c} className={row}>
            <input type="radio" name="f-category" className={control} checked={filters.category === c} onChange={() => set({ category: c })} />
            <span className="flex-1">{c === "all" ? t.any : t.cats[c]}</span>
            <span className="text-[12px] tabular-nums text-[#9CA3AF]">{counts[c] || 0}</span>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend className={legend}>{t.filterPrice}</legend>
        {[-1, 0, 1, 2, 3].map((b) => (
          <label key={b} className={row}>
            <input type="radio" name="f-price" className={control} checked={filters.price === b} onChange={() => set({ price: b })} />
            {b < 0 ? t.any : t.priceBuckets[b]}
          </label>
        ))}
      </fieldset>
      <div className="space-y-1 border-t border-[#E7E5E4] pt-4">
        <label className={row}>
          <input type="checkbox" className={control} checked={filters.onlySale} onChange={(e) => set({ onlySale: e.target.checked })} />
          {t.onlySale}
        </label>
        <label className={row}>
          <input type="checkbox" className={control} checked={filters.onlyStock} onChange={(e) => set({ onlyStock: e.target.checked })} />
          {t.onlyStock}
        </label>
      </div>
    </div>
  );
}

function ProductCard({ product, onOpen }) {
  const t = useT();
  const name = product.name[t.lang];
  const line = useCart((s) => s.lines.find((l) => l.id === product.id));
  const add = useCart((s) => s.add);
  const setQty = useCart((s) => s.setQty);
  const available = inStock(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white transition-shadow hover:shadow-[0_10px_30px_-15px_rgba(31,41,51,0.35)]">
      <button type="button" onClick={() => onOpen(product.id)} className="relative block aspect-square w-full p-4" aria-label={name}>
        <span className="block h-full w-full transition-transform duration-300 group-hover:scale-105">
          <ProductImage product={product} />
        </span>
        <SaleBadges product={product} />
      </button>
      <div className="flex flex-1 flex-col px-3 pb-3 sm:px-4 sm:pb-4">
        <p className="text-[12px] font-semibold text-[#9CA3AF]">{product.brand}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.6em] text-[14.5px] font-semibold leading-[1.3] text-[#1F2933]">
          <button type="button" onClick={() => onOpen(product.id)} className="text-left hover:text-[#F26B1D]">
            {name}
          </button>
        </h3>
        <p className="mt-1 text-[13px] text-[#6B7280]">
          {formatSize(product.size, t)} · <StockNote product={product} />
        </p>
        <div className="mt-auto pt-3">
          <Price product={product} />
          <div className="mt-3">
            {line ? (
              <div className="flex items-center justify-between gap-2">
                <QtyStepper value={line.qty} onChange={(q) => setQty(product.id, q)} min={0} label={name} small />
                <span className="flex items-center gap-1 text-[12.5px] font-semibold text-[#2F9E44]">
                  <Check className="h-4 w-4" />
                  <span className="hidden sm:inline">{t.inCart(line.qty)}</span>
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => add(product.id)}
                disabled={!available}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-xl bg-[#F26B1D] text-[14px] font-semibold text-white hover:bg-[#D9570B] disabled:cursor-not-allowed disabled:bg-[#E7E5E4] disabled:text-[#9CA3AF]"
                aria-label={`${t.addToCart}: ${name}`}
              >
                <ShoppingCart className="h-4 w-4" />
                {available ? t.addToCart : t.outOfStock}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

function Pagination({ page, pages, onPage }) {
  const t = useT();
  if (pages <= 1) return null;
  const btn = "inline-flex h-10 min-w-[40px] items-center justify-center rounded-lg border px-3 text-[14px] font-semibold";
  const idle = "border-[#E7E5E4] bg-white text-[#1F2933] hover:border-[#F26B1D]";
  return (
    <nav aria-label={t.pages} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onPage(page - 1)} disabled={page === 1} className={`${btn} ${idle} disabled:opacity-40`} aria-label={t.prev}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          aria-current={n === page ? "page" : undefined}
          aria-label={t.pageN(n)}
          className={`${btn} tabular-nums ${n === page ? "border-[#F26B1D] bg-[#F26B1D] text-white" : idle}`}
        >
          {n}
        </button>
      ))}
      <button type="button" onClick={() => onPage(page + 1)} disabled={page === pages} className={`${btn} ${idle} disabled:opacity-40`} aria-label={t.next}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function Catalog({ query, onClearQuery, filters, setFilters, sort, setSort, page, setPage, onOpen }) {
  const t = useT();
  const [panelOpen, setPanelOpen] = useState(false);
  const closePanel = useMemo(() => () => setPanelOpen(false), []);
  useOverlay(panelOpen, closePanel);

  // search matches either language's name, the brand and the category names
  const searched = useMemo(() => {
    const q = query.toLowerCase();
    if (!q) return PRODUCTS;
    return PRODUCTS.filter((p) => [p.name.ka, p.name.en, p.brand, TEXT.ka.cats[p.category], TEXT.en.cats[p.category]].some((s) => s.toLowerCase().includes(q)));
  }, [query]);

  const results = useMemo(() => searched.filter((p) => passes(p, filters)).sort(SORTS[sort]), [searched, filters, sort]);

  // category counts follow every other active filter
  const counts = useMemo(() => {
    const c = { all: 0 };
    for (const p of searched) {
      if (!passes(p, filters, true)) continue;
      c.all++;
      c[p.category] = (c[p.category] || 0) + 1;
    }
    return c;
  }, [searched, filters]);

  const pages = Math.max(1, Math.ceil(results.length / BRAND.perPage));
  const current = Math.min(page, pages);
  const shown = results.slice((current - 1) * BRAND.perPage, current * BRAND.perPage);
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);
  const clearAll = () => {
    setFilters(DEFAULT_FILTERS);
    onClearQuery();
  };

  const unset = (patch) => () => setFilters((f) => ({ ...f, ...patch }));
  const chips = [
    query && { key: "q", label: t.searchFor(query), clear: onClearQuery },
    filters.animal !== "all" && { key: "a", label: t.animals[filters.animal], clear: unset({ animal: "all" }) },
    filters.category !== "all" && { key: "c", label: t.cats[filters.category], clear: unset({ category: "all" }) },
    filters.price >= 0 && { key: "p", label: t.priceBuckets[filters.price], clear: unset({ price: -1 }) },
    filters.onlySale && { key: "s", label: t.onlySale, clear: unset({ onlySale: false }) },
    filters.onlyStock && { key: "st", label: t.onlyStock, clear: unset({ onlyStock: false }) },
  ].filter(Boolean);

  return (
    <section id="catalog" className="mx-auto max-w-[1280px] scroll-mt-[170px] px-4 pb-16 pt-10 sm:px-6 md:scroll-mt-[125px]">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-[22px] font-bold text-[#1F2933]">{t.catalogTitle}</h2>
          <p className="mt-0.5 text-[14px] text-[#6B7280]">{t.found(results.length)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPanelOpen(true)} className="inline-flex items-center gap-2 rounded-xl border border-[#E7E5E4] bg-white px-3.5 py-2.5 text-[14px] font-semibold text-[#1F2933] lg:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            {t.filters}
            {filtersActive && <span className="h-2 w-2 rounded-full bg-[#F26B1D]" />}
          </button>
          <label htmlFor="sort" className="sr-only">
            {t.sortLabel}
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="max-w-[200px] rounded-xl border border-[#E7E5E4] bg-white px-3 py-2.5 text-[14px] font-medium text-[#1F2933] outline-none focus:border-[#F26B1D]"
          >
            {Object.entries(t.sort).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {chips.map((c) => (
            <li key={c.key}>
              <button type="button" onClick={c.clear} className="inline-flex items-center gap-1.5 rounded-full bg-[#FFF4EC] px-3 py-1.5 text-[13px] font-medium text-[#D9570B] hover:bg-[#FFE8D6]">
                {c.label}
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={clearAll} className="px-2 py-1.5 text-[13px] font-medium text-[#6B7280] underline hover:text-[#1F2933]">
              {t.reset}
            </button>
          </li>
        </ul>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[135px] rounded-2xl border border-[#E7E5E4] bg-white p-4">
            <FilterPanel filters={filters} setFilters={setFilters} counts={counts} />
          </div>
        </aside>

        <div className="min-w-0">
          {shown.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
              {shown.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} onOpen={onOpen} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#E7E5E4] bg-white px-6 py-16 text-center">
              <Search className="mx-auto h-8 w-8 text-[#9CA3AF]" />
              <p className="mt-3 text-[17px] font-semibold text-[#1F2933]">{t.noResults}</p>
              <p className="mt-1 text-[14px] text-[#6B7280]">{t.noResultsHint}</p>
              <button type="button" onClick={clearAll} className="mt-4 rounded-xl bg-[#F26B1D] px-5 py-2.5 text-[14px] font-semibold text-white hover:bg-[#D9570B]">
                {t.reset}
              </button>
            </div>
          )}
          <Pagination
            page={current}
            pages={pages}
            onPage={(n) => {
              setPage(n);
              scrollToId("catalog");
            }}
          />
        </div>
      </div>

      {/* filters as a bottom sheet on phones and tablets */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <Scrim onClick={closePanel} className="lg:hidden" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t.filters}
              className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col rounded-t-3xl bg-white lg:hidden"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
            >
              <div className="flex items-center justify-between border-b border-[#E7E5E4] px-5 py-4">
                <p className="text-[17px] font-bold">{t.filters}</p>
                <button type="button" onClick={closePanel} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F5F5F4]" aria-label={t.close}>
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto px-4 py-4">
                <FilterPanel filters={filters} setFilters={setFilters} counts={counts} />
              </div>
              <div className="flex gap-3 border-t border-[#E7E5E4] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
                <button type="button" onClick={() => setFilters(DEFAULT_FILTERS)} className="flex-1 rounded-xl border border-[#E7E5E4] py-3 text-[14px] font-semibold">
                  {t.reset}
                </button>
                <button type="button" onClick={closePanel} className="flex-1 rounded-xl bg-[#F26B1D] py-3 text-[14px] font-semibold text-white">
                  {t.showResults(results.length)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Product quick view                                                 */
/* ------------------------------------------------------------------ */
function ProductModal({ id, onClose }) {
  const t = useT();
  const product = id ? PRODUCT_BY_ID[id] : null;
  const add = useCart((s) => s.add);
  const openCart = useCart((s) => s.open);
  const [qty, setQty] = useState(1);
  useEffect(() => setQty(1), [id]);
  useOverlay(!!product, onClose);

  return (
    <AnimatePresence>
      {product && (
        <>
          <Scrim onClick={onClose} />
          {/* centring wrapper; the dialog itself animates, so its transform stays free for Framer Motion */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-3">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="pm-title"
              className="pointer-events-auto relative max-h-[92dvh] w-full max-w-[860px] overflow-y-auto rounded-3xl bg-white"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
            >
              <button type="button" onClick={onClose} className="absolute right-3 top-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/90 hover:bg-[#F5F5F4]" aria-label={t.close}>
                <X className="h-5 w-5" />
              </button>
              <div className="grid md:grid-cols-2">
                <div className="relative mx-auto aspect-square w-full max-w-[360px] p-8 md:max-w-none">
                  <ProductImage product={product} />
                  <SaleBadges product={product} />
                </div>
                <div className="flex flex-col px-6 pb-6 sm:px-8 sm:pb-8 md:pt-8">
                  <p className="text-[13px] font-semibold text-[#9CA3AF]">
                    {product.brand} · {t.animals[product.animal]} · {t.cats[product.category]}
                  </p>
                  <h2 id="pm-title" className="mt-2 text-[22px] font-bold leading-snug text-[#1F2933]">
                    {product.name[t.lang]}
                  </h2>
                  <p className="mt-1 text-[14px] text-[#6B7280]">
                    {formatSize(product.size, t)} · <StockNote product={product} />
                  </p>
                  <div className="mt-4">
                    <Price product={product} big />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-[#4B5563]">{product.desc[t.lang]}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <QtyStepper value={qty} onChange={setQty} label={t.qty} />
                    <button
                      type="button"
                      disabled={!inStock(product)}
                      onClick={() => {
                        add(product.id, qty);
                        onClose();
                        openCart();
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F26B1D] px-5 py-3 text-[15px] font-semibold text-white hover:bg-[#D9570B] disabled:cursor-not-allowed disabled:bg-[#E7E5E4] disabled:text-[#9CA3AF]"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {inStock(product) ? t.addToCartLong : t.outOfStock}
                    </button>
                  </div>
                  <ul className="mt-6 space-y-2 border-t border-[#E7E5E4] pt-4 text-[13.5px] text-[#4B5563]">
                    <li className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-[#F26B1D]" /> {t.quickDelivery(BRAND.freeDeliveryFrom)}
                    </li>
                    <li className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-[#F26B1D]" /> {t.quickPay}
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Cart drawer: cart → checkout form → confirmation                   */
/* ------------------------------------------------------------------ */
// Georgian mobile numbers: 5XX XXX XXX, optionally with +995
const PHONE_RE = /^(\+?995)?5\d{8}$/;

function Totals({ subtotal, delivery }) {
  const t = useT();
  return (
    <dl className="space-y-1.5 text-[14px]">
      <div className="flex justify-between text-[#4B5563]">
        <dt>{t.itemsTotal}</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between text-[#4B5563]">
        <dt>{t.delivery}</dt>
        <dd className={`tabular-nums ${delivery === 0 ? "font-semibold text-[#2F9E44]" : ""}`}>{delivery === 0 ? t.free : formatPrice(delivery)}</dd>
      </div>
      <div className="flex justify-between pt-1 text-[17px] font-bold text-[#1F2933]">
        <dt>{t.total}</dt>
        <dd className="tabular-nums">{formatPrice(subtotal + delivery)}</dd>
      </div>
    </dl>
  );
}

function CheckoutForm({ subtotal, onBack, onDone }) {
  const t = useT();
  const [form, setForm] = useState({ name: "", phone: "", city: "tbilisi", address: "", comment: "", payment: "cash" });
  const [errors, setErrors] = useState({});
  const delivery = deliveryFor(subtotal, form.city);
  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (!form.name.trim()) er.name = t.errRequired;
    if (!PHONE_RE.test(form.phone.replace(/[\s()-]/g, ""))) er.phone = t.errPhone;
    if (!form.address.trim()) er.address = t.errRequired;
    setErrors(er);
    if (Object.keys(er).length) return;
    onDone({ number: `LP-${Date.now().toString().slice(-6)}`, phone: form.phone.trim(), total: subtotal + delivery });
  };

  const inputClass = (k) => `w-full rounded-xl border bg-white px-3.5 py-2.5 text-[15px] outline-none focus:border-[#F26B1D] ${errors[k] ? "border-[#E03131]" : "border-[#E7E5E4]"}`;
  const a11y = (k) => ({ id: `co-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `co-${k}-err` : undefined });
  const Field = ({ k, label, children }) => (
    <div>
      <label htmlFor={`co-${k}`} className="mb-1 block text-[13.5px] font-semibold text-[#1F2933]">
        {label}
      </label>
      {children}
      {errors[k] && (
        <p id={`co-${k}-err`} className="mt-1 text-[12.5px] text-[#E03131]">
          {errors[k]}
        </p>
      )}
    </div>
  );
  const fee = (amount) => (subtotal >= BRAND.freeDeliveryFrom ? t.free : formatPrice(amount));

  return (
    <form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-[14px] font-medium text-[#6B7280] hover:text-[#1F2933]">
          <ChevronLeft className="h-4 w-4" /> {t.backToCart}
        </button>
        {Field({ k: "name", label: t.fName, children: <input {...a11y("name")} autoComplete="name" value={form.name} onChange={set("name")} className={inputClass("name")} /> })}
        {Field({
          k: "phone",
          label: t.fPhone,
          children: <input {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" placeholder={t.fPhonePh} value={form.phone} onChange={set("phone")} className={inputClass("phone")} />,
        })}
        {Field({
          k: "city",
          label: t.fCity,
          children: (
            <select {...a11y("city")} value={form.city} onChange={set("city")} className={inputClass("city")}>
              <option value="tbilisi">
                {t.tbilisi} — {fee(BRAND.deliveryTbilisi)}
              </option>
              <option value="regions">
                {t.regions} — {fee(BRAND.deliveryRegions)}
              </option>
            </select>
          ),
        })}
        {Field({
          k: "address",
          label: t.fAddress,
          children: <input {...a11y("address")} autoComplete="street-address" placeholder={t.fAddressPh} value={form.address} onChange={set("address")} className={inputClass("address")} />,
        })}
        {Field({ k: "comment", label: t.fComment, children: <textarea {...a11y("comment")} rows={2} value={form.comment} onChange={set("comment")} className={inputClass("comment")} /> })}
        <fieldset>
          <legend className="mb-1 text-[13.5px] font-semibold text-[#1F2933]">{t.fPayment}</legend>
          <div className="grid gap-2">
            {[
              ["cash", t.cash, Banknote],
              ["card", t.card, ShieldCheck],
            ].map(([v, label, Icon]) => (
              <label key={v} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-[14px] ${form.payment === v ? "border-[#F26B1D] bg-[#FFF4EC]" : "border-[#E7E5E4]"}`}>
                <input type="radio" name="co-payment" value={v} checked={form.payment === v} onChange={set("payment")} className="h-4 w-4 accent-[#F26B1D]" />
                <Icon className="h-4 w-4 text-[#6B7280]" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="border-t border-[#E7E5E4] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
        <Totals subtotal={subtotal} delivery={delivery} />
        <button type="submit" className="mt-4 w-full rounded-xl bg-[#F26B1D] py-3.5 text-[15px] font-semibold text-white hover:bg-[#D9570B]">
          {t.confirm}
        </button>
      </div>
    </form>
  );
}

function CartDrawer({ onOpenProduct }) {
  const t = useT();
  const isOpen = useCart((s) => s.isOpen);
  const lines = useCart((s) => s.lines);
  const count = useCart(selectCount);
  const subtotal = useCart(selectSubtotal);
  const close = useCart((s) => s.close);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const clear = useCart((s) => s.clear);
  const [step, setStep] = useState("cart"); // cart | checkout | done
  const [order, setOrder] = useState(null);
  useOverlay(isOpen, close);
  // the next time the drawer opens it starts from the cart again
  useEffect(() => {
    if (!isOpen) setStep("cart");
  }, [isOpen]);

  const left = BRAND.freeDeliveryFrom - subtotal;
  const progress = Math.min(100, (subtotal / BRAND.freeDeliveryFrom) * 100);
  const primary = "rounded-xl bg-[#F26B1D] text-[15px] font-semibold text-white hover:bg-[#D9570B]";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Scrim onClick={close} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full max-w-[440px] flex-col bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
          >
            <div className="flex items-center justify-between border-b border-[#E7E5E4] px-5 py-4">
              <h2 id="cart-title" className="text-[19px] font-bold text-[#1F2933]">
                {step === "checkout" ? t.checkout : t.cart}
                {step === "cart" && count > 0 && <span className="ml-1.5 text-[15px] font-medium text-[#6B7280]">({count})</span>}
              </h2>
              <button type="button" onClick={close} className="inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#F5F5F4]" aria-label={t.close}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {step === "done" && order ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#EBFBEE] text-[#2F9E44]">
                  <Check className="h-8 w-8" />
                </span>
                <p className="mt-5 text-[22px] font-bold text-[#1F2933]">{t.doneTitle}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-[#4B5563]">{t.doneText(order.number, order.phone)}</p>
                <p className="mt-2 text-[15px] font-semibold tabular-nums text-[#1F2933]">
                  {t.total}: {formatPrice(order.total)}
                </p>
                <p className="mt-4 rounded-lg bg-[#F5F5F4] px-3 py-2 text-[12.5px] text-[#6B7280]">{t.demoNote}</p>
                <button type="button" onClick={close} className={`mt-6 px-6 py-3 ${primary}`}>
                  {t.continueShopping}
                </button>
              </div>
            ) : step === "checkout" && lines.length ? (
              <CheckoutForm
                subtotal={subtotal}
                onBack={() => setStep("cart")}
                onDone={(o) => {
                  setOrder(o);
                  clear();
                  setStep("done");
                }}
              />
            ) : lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#FFF4EC] text-[#F26B1D]">
                  <ShoppingCart className="h-7 w-7" />
                </span>
                <p className="mt-4 text-[19px] font-bold text-[#1F2933]">{t.cartEmpty}</p>
                <p className="mt-1 text-[14px] text-[#6B7280]">{t.cartEmptyHint}</p>
                <button
                  type="button"
                  onClick={() => {
                    close();
                    scrollToId("catalog");
                  }}
                  className={`mt-6 px-6 py-3 ${primary}`}
                >
                  {t.continueShopping}
                </button>
              </div>
            ) : (
              <>
                {/* free-delivery progress */}
                <div className="border-b border-[#E7E5E4] px-5 py-3">
                  <p className="flex items-center gap-2 text-[13.5px] font-medium text-[#1F2933]">
                    <Truck className="h-4 w-4 shrink-0 text-[#F26B1D]" />
                    {left > 0 ? t.toFree(formatPrice(left)) : t.freeReached}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#F5F5F4]">
                    <div className={`h-full rounded-full ${left > 0 ? "bg-[#F26B1D]" : "bg-[#2F9E44]"}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <ul className="min-h-0 flex-1 divide-y divide-[#E7E5E4] overflow-y-auto px-5">
                  {lines.map((l) => {
                    const p = PRODUCT_BY_ID[l.id];
                    const name = p.name[t.lang];
                    return (
                      <li key={l.id} className="flex gap-3 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            close();
                            onOpenProduct(p.id);
                          }}
                          className="h-20 w-20 shrink-0 rounded-xl border border-[#E7E5E4] p-1.5"
                          aria-label={name}
                        >
                          <ProductImage product={p} />
                        </button>
                        <div className="flex min-w-0 flex-1 flex-col">
                          <p className="line-clamp-2 text-[14px] font-semibold leading-snug text-[#1F2933]">{name}</p>
                          <p className="mt-0.5 text-[12.5px] text-[#6B7280]">
                            {formatSize(p.size, t)} · {formatPrice(p.price)}
                          </p>
                          <div className="mt-2 flex items-center justify-between gap-2">
                            <QtyStepper value={l.qty} onChange={(q) => setQty(l.id, q)} label={name} small />
                            <span className="text-[15px] font-bold tabular-nums text-[#1F2933]">{formatPrice(p.price * l.qty)}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => remove(l.id)} className="self-start p-1 text-[#9CA3AF] hover:text-[#E03131]" aria-label={`${t.remove}: ${name}`}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-[#E7E5E4] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
                  <Totals subtotal={subtotal} delivery={deliveryFor(subtotal, "tbilisi")} />
                  <button type="button" onClick={() => setStep("checkout")} className={`mt-4 w-full py-3.5 ${primary}`}>
                    {t.checkout}
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                             */
/* ------------------------------------------------------------------ */
function Footer({ onNav }) {
  const t = useT();
  const social = "inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 hover:bg-[#F26B1D]";
  return (
    <footer className="bg-[#1F2933] text-white/80">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <PawMark className="h-9 w-9" />
            <Wordmark dark />
          </div>
          <p className="mt-3 max-w-[34ch] text-[14px] leading-relaxed">{t.footerAbout}</p>
          <div className="mt-4 flex gap-2">
            <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" className={social} aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className={social} aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div>
          <p className="text-[15px] font-bold text-white">{t.catalogTitle}</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <button type="button" onClick={() => onNav(c)} className="hover:text-[#F26B1D]">
                  {t.cats[c]}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[15px] font-bold text-white">{t.footerInfo}</p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {t.footerInfoLinks.map((l) => (
              <li key={l}>
                <a href="#top" className="hover:text-[#F26B1D]">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[15px] font-bold text-white">{t.footerContact}</p>
          <ul className="mt-3 space-y-2.5 text-[14px]">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#F26B1D]" /> {BRAND.phone}
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#F26B1D]" /> {BRAND.email}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#F26B1D]" /> {t.hours}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#F26B1D]" /> {t.city}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1280px] px-4 py-4 text-[13px] text-white/60 sm:px-6">
          © {new Date().getFullYear()} {BRAND.name}. {t.rights}
        </p>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  App                                                                */
/* ------------------------------------------------------------------ */
// which category-bar item matches the current filters, if any
function activeNavFor(query, f) {
  if (query) return null;
  const rest = (patch) => JSON.stringify({ ...DEFAULT_FILTERS, ...patch }) === JSON.stringify(f);
  if (rest({})) return "all";
  if (rest({ onlySale: true })) return "sale";
  if (rest({ animal: f.animal })) return f.animal;
  if (rest({ category: f.category })) return f.category;
  return null;
}

export default function LuxePetStore() {
  const t = useT();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [openId, setOpenId] = useState(null);
  const closeProduct = useMemo(() => () => setOpenId(null), []);
  const firstRender = useRef(true);

  // a new search or filter starts again from page 1
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPage(1);
  }, [query, filters]);

  // keep the page's language and tab title in step with the switch
  useEffect(() => {
    document.documentElement.lang = t.lang;
    document.title = t.title;
  }, [t.lang, t.title]);

  // the category bar, tiles and banner buttons: each sets one filter and shows the catalogue
  const onNav = (id, { top = false } = {}) => {
    const next = { ...DEFAULT_FILTERS };
    if (id === "dog" || id === "cat") next.animal = id;
    else if (id === "sale") next.onlySale = true;
    else if (id !== "all") next.category = id;
    setFilters(next);
    setQuery("");
    if (top) window.scrollTo({ top: 0, behavior: "smooth" });
    else scrollToId("catalog");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] font-sans text-[#1F2933] antialiased">
      <Header
        query={query}
        activeNav={activeNavFor(query, filters)}
        onNav={onNav}
        onSearch={(q) => {
          // a search from the header looks through the whole shop
          setQuery(q);
          if (q) {
            setFilters(DEFAULT_FILTERS);
            scrollToId("catalog");
          }
        }}
      />
      <main>
        <Banner onNav={onNav} />
        <CategoryTiles onNav={onNav} />
        <Catalog query={query} onClearQuery={() => setQuery("")} filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} page={page} setPage={setPage} onOpen={setOpenId} />
      </main>
      <Footer onNav={onNav} />
      <ProductModal id={openId} onClose={closeProduct} />
      <CartDrawer onOpenProduct={setOpenId} />
    </div>
  );
}
