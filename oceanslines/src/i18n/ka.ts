import type { Auction, CarType, Role } from "@/types/domain";

/**
 * Georgian — the site's primary language and the source of truth for the
 * dictionary shape. `en.ts` is typed as `Dictionary`, so a missing or extra
 * key there is a compile error.
 */
export const ka = {
  meta: {
    htmlLang: "ka",
    /** Explicit month names: not every browser ships Georgian date data. */
    formatDate: (d: Date) =>
      `${String(d.getDate()).padStart(2, "0")} ${["იან", "თებ", "მარ", "აპრ", "მაი", "ივნ", "ივლ", "აგვ", "სექ", "ოქტ", "ნოე", "დეკ"][d.getMonth()]} ${d.getFullYear()}`,
  },

  common: {
    language: "ენა",
    homeAria: "Oceans Lines — მთავარი",
    close: "დახურვა",
    cancel: "გაუქმება",
  },

  roles: {
    ADMIN: "ადმინი",
    MEMBER: "წევრი",
    SUPER_MEMBER: "სუპერ წევრი",
  } satisfies Record<Role, string>,

  rolesPlural: {
    ADMIN: "ადმინები",
    MEMBER: "წევრები",
    SUPER_MEMBER: "სუპერ წევრები",
  } satisfies Record<Role, string>,

  carTypes: {
    SUV: "ჯიპი (SUV)",
    Sedan: "სედანი",
  } satisfies Record<CarType, string>,

  nav: {
    about: "ჩვენ შესახებ",
    services: "სერვისები",
    contact: "კონტაქტი",
    portalLogin: "სისტემაში შესვლა",
    portalLoginShort: "შესვლა",
    openPortal: "პორტალის გახსნა",
  },

  hero: {
    eyebrow: "აშშ-ის აუქციონები · საზღვაო გადაზიდვა",
    titleLead: "თქვენი მანქანა,",
    titleAccent: "სანდო ხაზით.",
    body:
      "Oceans Lines იძენს ავტომობილს Copart-ისა და IAAI-ის აუქციონებზე, ზღვით ჩამოაქვს საქართველოში და გადის განბაჟებას — ერთი პასუხისმგებელი ხაზი პირველი ფსონიდან გასაღების გადაცემამდე.",
    routeAria: "ავტომობილის მარშრუტი: აშშ-ის პორტებიდან ფოთამდე",
    ports: {
      newark: "ნიუარკი",
      savannah: "სავანა",
      houston: "ჰიუსტონი",
      losAngeles: "ლოს-ანჯელესი",
      poti: "ფოთი",
    },
    steps: ["აუქციონი", "აშშ-ის პორტი", "ფოთი"],
    dragHint: "გადაატრიალეთ გლობუსი",
  },

  partners: {
    eyebrow: "აუქციონები",
    title: "Copart და IAAI — ერთი ანგარიშიდან.",
    facilities: (count: number, states: number) => `${count} მოედანი · ${states} შტატი`,
    hub: "ერთი ხაზი",
  },

  about: {
    eyebrow: "ჩვენ შესახებ",
    title: "ავტომობილის იმპორტი — მშვიდად და გამართულად.",
    p1: "აშშ-დან იმპორტი მოიცავს აუქციონებს, ევაკუატორის კომპანიებს, საზღვაო ხაზებს და საბაჟოს — თითოეულს თავისი ვადები და დოკუმენტები აქვს. Oceans Lines ყველაფერს ერთ ხაზზე აერთიანებს.",
    p2: "წევრები ყველა ტარიფს წინასწარ ხედავენ, ყოველ ეტაპს პორტალიდან ადევნებენ თვალს და პირველი ფსონიდან გასაღების გადაცემამდე ერთ გუნდთან აქვთ საქმე.",
    servicesEyebrow: "ძირითადი სერვისები",
    services: [
      {
        title: "აუქციონზე შესყიდვა",
        summary: "Copart-სა და IAAI-ზე წვდომა გამოცნობის გარეშე. ვამოწმებთ ლოტს, თქვენთან ერთად ვადგენთ ზღვარს და ვაჭრობაში ვმონაწილეობთ.",
        points: ["ლოტის ისტორიისა და ფოტოების შემოწმება", "ფსონი შეთანხმებულ ლიმიტამდე", "აუქციონის გადახდა და დოკუმენტები"],
      },
      {
        title: "ლოჯისტიკა",
        summary: "აუქციონის მოედნიდან ფოთის პორტამდე — ერთი კოორდინირებული ჯაჭვი და ერთი საკონტაქტო პირი.",
        points: ["ტრანსპორტირება უახლოეს საექსპორტო პორტამდე", "კონტეინერში ჩატვირთვა და საზღვაო გადაზიდვა", "სტატუსის განახლება ყოველ ეტაპზე"],
      },
      {
        title: "განბაჟება",
        summary: "საქართველოს საბაჟო, გადასახადები და დოკუმენტაცია — ზუსტად და დროულად, რომ ავტომობილი ჩამოსვლისთანავე მზად იყოს.",
        points: ["საბაჟო დეკლარაცია და გადასახადები", "დოკუმენტების მომზადება და შემოწმება", "გაცემა და გადაცემა საქართველოში"],
      },
    ],
  },

  footer: {
    eyebrow: "წევრის პორტალი",
    title: "გაიგეთ ფასი ფსონამდე.",
    body: "წევრები Copart-ის ან IAAI-ის ნებისმიერი მოედნიდან ფოთამდე ფასს წამებში იგებენ. ანგარიშისთვის მოგვმართეთ.",
    rights: "ყველა უფლება დაცულია.",
  },

  login: {
    title: "წევრის პორტალი",
    subtitle: "შედით იმ მონაცემებით, რომლებიც Oceans Lines-ის მენეჯერმა გამოგიგზავნათ.",
    email: "ელ-ფოსტა",
    password: "პაროლი",
    showPassword: "პაროლის ჩვენება",
    hidePassword: "პაროლის დამალვა",
    error: "ელ-ფოსტა ან პაროლი არასწორია.",
    submit: "შესვლა",
    back: "← მთავარ გვერდზე დაბრუნება",
    checking: "სესიის შემოწმება…",
  },

  portal: {
    calculator: "კალკულატორი",
    users: "მომხმარებლები",
    previewAs: "ნახვა როგორც",
    signOut: "გასვლა",
    navAria: "პორტალი",
  },

  calculatorPage: {
    eyebrow: "წევრის პორტალი",
    title: "ტრანსპორტირების ღირებულება",
    description: "გამოთვალეთ ფასი Copart-ის ან IAAI-ის ნებისმიერი მოედნიდან ფოთამდე რამდენიმე წამში.",
  },

  calculator: {
    title: "ტრანსპორტირების კალკულატორი",
    subtitle: "აუქციონის მოედანი → აშშ-ის პორტი → ფოთი, საქართველო.",
    auction: "აუქციონი",
    state: "შტატი",
    city: "ქალაქი",
    carType: "ავტომობილის ტიპი",
    selectAuction: "აირჩიეთ აუქციონი",
    selectState: "აირჩიეთ შტატი",
    selectCity: "აირჩიეთ ქალაქი",
    noCities: "ქალაქები არ არის",
    selectCarType: "აირჩიეთ ტიპი",
    cityHintChoose: "ჯერ აირჩიეთ აუქციონი და შტატი.",
    cityHintNone: (auction: Auction, state: string) => `${auction}-ს შტატში ${state} მოედანი არ აქვს. სცადეთ მეზობელი შტატი.`,
    cityHintCount: (count: number, auction: Auction, state: string) => `${auction}: ${count} მოედანი შტატში ${state}.`,
    calculate: "გამოთვლა",
    ready: "ფასი მითითებულია ერთ ავტომობილზე, აშშ დოლარში.",
    incomplete: "გამოსათვლელად შეავსეთ ოთხივე ველი.",
  },

  quote: {
    total: "სრული ღირებულება ფოთამდე",
    errorUnknownLocation: (auction: Auction, city: string, state: string) => `${auction}-ს ${city}, ${state}-ში მოედანი არ აქვს.`,
    errorNoPort: (state: string) => `შტატისთვის ${state} საექსპორტო პორტი არ არის მითითებული.`,
  },

  admin: {
    eyebrow: "ადმინისტრირება",
    title: "მომხმარებლები",
    description: "დაამატეთ წევრები, გასცით მონაცემები და გადაიყვანეთ ისინი წევრიდან სუპერ წევრში.",
    addUser: "მომხმარებლის დამატება",
    addUserDescription: "უსაფრთხო პაროლი ავტომატურად შეიქმნება.",
    fullName: "სახელი და გვარი",
    email: "ელ-ფოსტა",
    role: "როლი",
    create: "შექმნა და პაროლის გენერირება",
    errors: {
      EMAIL_TAKEN: "ამ ელ-ფოსტით ანგარიში უკვე არსებობს.",
      INVALID_INPUT: "შეიყვანეთ სახელი და სწორი ელ-ფოსტა.",
      FORBIDDEN: "მომხმარებლის დამატება მხოლოდ ადმინს შეუძლია.",
      NOT_FOUND: "მოხდა შეცდომა. სცადეთ თავიდან.",
      PROTECTED_USER: "მოხდა შეცდომა. სცადეთ თავიდან.",
    },
    search: "ძებნა სახელით ან ელ-ფოსტით",
    searchAria: "მომხმარებლების ძებნა",
    colUser: "მომხმარებელი",
    colRole: "როლი",
    colLastLogin: "ბოლო შესვლა",
    colCreated: "შექმნილია",
    colActions: "მოქმედებები",
    you: "(თქვენ)",
    never: "არასდროს",
    resetPassword: "ახალი პაროლი",
    resetPasswordTitle: "ახალი პაროლის გენერირება",
    deleteUser: (name: string) => `წაშლა: ${name}`,
    deleteTitle: "მომხმარებლის წაშლა",
    confirmDelete: "დაადასტურეთ წაშლა",
    roleFor: (name: string) => `როლი: ${name}`,
    noMatch: (q: string) => `„${q}“ — შედეგი ვერ მოიძებნა.`,
    credentialsCreated: "ანგარიში შეიქმნა",
    credentialsReset: "პაროლი განახლდა",
    credentialsDescription: "გაუგზავნეთ ეს მონაცემები მომხმარებელს ახლავე. პაროლი მხოლოდ ერთხელ ჩანს და წაკითხვადი სახით არ ინახება.",
    password: "პაროლი",
    done: "მზადაა",
    copy: "მონაცემების კოპირება",
    copied: "დაკოპირდა",
    clipboard: (email: string, password: string) =>
      `Oceans Lines — წევრის პორტალი\nhttps://oceanslines.ge/login\nელ-ფოსტა: ${email}\nპაროლი: ${password}`,
  },

  notFound: {
    title: "გვერდი ვერ მოიძებნა.",
    back: "მთავარ გვერდზე დაბრუნება",
  },
};

export type Dictionary = typeof ka;
