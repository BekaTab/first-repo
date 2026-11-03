import type { Dictionary } from "./ka";

export const en: Dictionary = {
  meta: {
    htmlLang: "en",
    formatDate: (d) => new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(d),
  },

  common: {
    language: "Language",
    homeAria: "Oceans Lines — home",
    close: "Close",
    cancel: "Cancel",
  },

  roles: {
    ADMIN: "Admin",
    MEMBER: "Member",
    SUPER_MEMBER: "Super Member",
  },

  rolesPlural: {
    ADMIN: "Admins",
    MEMBER: "Members",
    SUPER_MEMBER: "Super Members",
  },

  carTypes: {
    SUV: "SUV",
    Sedan: "Sedan",
  },

  nav: {
    about: "About",
    services: "Services",
    contact: "Contact",
    portalLogin: "Sign in",
    portalLoginShort: "Log in",
    openPortal: "Open portal",
  },

  hero: {
    eyebrow: "US auctions · Ocean freight",
    titleLead: "Every car, carried",
    titleAccent: "with intent.",
    body:
      "Oceans Lines buys at Copart and IAAI, moves your vehicle across the Atlantic and clears it through Georgian customs — one accountable line from the first bid to the final key.",
    routeAria: "Shipping routes: from US ports to Poti, Georgia",
    ports: {
      newark: "Newark",
      savannah: "Savannah",
      houston: "Houston",
      losAngeles: "Los Angeles",
      poti: "Poti",
    },
    steps: ["Auction", "US port", "Poti"],
  },

  partners: {
    eyebrow: "Auctions",
    title: "Copart and IAAI, through one account.",
    facilities: (count, states) => `${count} facilities · ${states} states`,
    hub: "One line",
  },

  about: {
    eyebrow: "About us",
    title: "A quieter way to import a car.",
    p1: "Importing from the United States involves auctions, towing companies, shipping lines and customs officers — each with their own timing and paperwork. Oceans Lines brings all of it onto one line.",
    p2: "Members see every rate before they commit, follow each stage from the portal, and deal with one team from the first bid to the moment the keys change hands.",
    servicesEyebrow: "Core services",
    services: [
      {
        title: "Auction buying",
        summary: "Access to Copart and IAAI without the guesswork. We vet the lot, set the ceiling with you, and bid.",
        points: ["Lot history and photo review", "Bidding to your agreed limit", "Auction payment and title handling"],
      },
      {
        title: "Logistics",
        summary: "From the auction yard to the port of Poti, one coordinated chain with a single point of contact.",
        points: ["Inland towing to the nearest export port", "Container loading and ocean freight", "Status updates at every hand-off"],
      },
      {
        title: "Clearing",
        summary: "Georgian customs, duties and paperwork handled precisely, so the car is ready when it lands.",
        points: ["Customs declaration and duties", "Document preparation and checks", "Release and hand-over in Georgia"],
      },
    ],
  },

  footer: {
    eyebrow: "Member portal",
    title: "See your rate before you bid.",
    body: "Members price any Copart or IAAI yard to Poti in seconds. Ask us for an account.",
    rights: "All rights reserved.",
  },

  login: {
    title: "Member portal",
    subtitle: "Sign in with the credentials your Oceans Lines manager sent you.",
    email: "Email",
    password: "Password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    error: "That email and password don’t match an account.",
    submit: "Sign in",
    back: "← Back to the home page",
    checking: "Checking your session…",
  },

  portal: {
    calculator: "Calculator",
    users: "Users",
    previewAs: "Preview as",
    signOut: "Sign out",
    navAria: "Portal",
  },

  calculatorPage: {
    eyebrow: "Member portal",
    title: "Shipping estimate",
    description: "Price any Copart or IAAI facility to Poti in a few clicks.",
  },

  calculator: {
    title: "Transportation Calculator",
    subtitle: "Auction yard → US port → Poti, Georgia.",
    auction: "Auction",
    state: "State",
    city: "City",
    carType: "Car type",
    selectAuction: "Select auction",
    selectState: "Select state",
    selectCity: "Select city",
    noCities: "No cities available",
    selectCarType: "Select car type",
    cityHintChoose: "Choose an auction and state first.",
    cityHintNone: (auction, state) => `${auction} has no facility in ${state}. Try a neighbouring state.`,
    cityHintCount: (count, auction, state) => `${count} ${auction} ${count === 1 ? "facility" : "facilities"} in ${state}.`,
    calculate: "Calculate",
    ready: "Prices are per vehicle, in US dollars.",
    incomplete: "Fill in all four fields to calculate.",
  },

  quote: {
    total: "Total cost to Poti",
    errorUnknownLocation: (auction, city, state) => `${auction} has no facility in ${city}, ${state}.`,
    errorNoPort: (state) => `No export port configured for ${state}.`,
  },

  admin: {
    eyebrow: "Administration",
    title: "Users",
    description: "Add members, issue credentials, and move people between Member and Super Member.",
    addUser: "Add user",
    addUserDescription: "A secure password is generated for them automatically.",
    fullName: "Full name",
    email: "Email",
    role: "Role",
    create: "Create & generate credentials",
    errors: {
      EMAIL_TAKEN: "An account with this email already exists.",
      INVALID_INPUT: "Enter a name and a valid email address.",
      FORBIDDEN: "Only admins can add users.",
      NOT_FOUND: "Something went wrong. Try again.",
      PROTECTED_USER: "Something went wrong. Try again.",
    },
    search: "Search name or email",
    searchAria: "Search users",
    colUser: "User",
    colRole: "Role",
    colLastLogin: "Last sign-in",
    colCreated: "Created",
    colActions: "Actions",
    you: "(you)",
    never: "Never",
    resetPassword: "Reset password",
    resetPasswordTitle: "Generate a new password",
    deleteUser: (name) => `Delete ${name}`,
    deleteTitle: "Delete user",
    confirmDelete: "Confirm delete",
    roleFor: (name) => `Role for ${name}`,
    noMatch: (q) => `No users match “${q}”.`,
    credentialsCreated: "Account created",
    credentialsReset: "Password reset",
    credentialsDescription: "Send these to the user now. The password is shown only once and is not stored in readable form.",
    password: "Password",
    done: "Done",
    copy: "Copy credentials",
    copied: "Copied",
    clipboard: (email, password) =>
      `Oceans Lines portal\nhttps://oceanslines.ge/login\nEmail: ${email}\nPassword: ${password}`,
  },

  notFound: {
    title: "This page has sailed.",
    back: "Back to home",
  },
};
