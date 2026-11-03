# Oceans Lines — oceanslines.ge

Your best line for auto imports. A Next.js 14 (App Router) site with a public landing page and a members-only portal that holds the Transportation Calculator.

- **Landing** (`/`): hero with the logo, "Portal Login", and an About section with animated cards for Auction buying, Logistics and Clearing.
- **Login** (`/login`): mock authentication.
- **Portal** (`/portal`): the Transportation Calculator. MEMBER users see a light corporate theme and SUPER_MEMBER users see an obsidian-and-gold theme. Both get exactly the same markup.
- **Admin** (`/admin`): a users table. Admins can add users (a password is generated and shown once), reset passwords, delete users, and switch people between Member and Super Member. Admins can also preview the portal as either tier.

Stack: Next.js 14, TypeScript (strict), Tailwind CSS, Framer Motion, Zustand, Radix UI (Select, Dialog, Label), lucide-react, clsx + tailwind-merge.

## Run it

```bash
cd oceanslines
npm install
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

Demo accounts (seeded on first visit, also listed on the login page):

| Role | Email | Password |
|---|---|---|
| Admin | admin@oceanslines.ge | Admin#2026 |
| Member | member@oceanslines.ge | Member#2026 |
| Super Member | super@oceanslines.ge | Super#2026 |

## Deploy (Vercel) and the domain

1. Vercel → Add New → Project → `first-repo` → **Root Directory: `oceanslines`** → Deploy. Next.js is detected automatically, and `vercel.json` pins `npm ci`.
2. Project → Settings → Domains → add `oceanslines.ge` and `www.oceanslines.ge`. At your `.ge` registrar, set the DNS records Vercel shows: an `A` record for the apex and a `CNAME` for `www`.

## Directory structure

```
oceanslines/
├── next.config.mjs            security headers; noindex on /login, /portal, /admin
├── tailwind.config.ts         brand colors + role-themed colors, all CSS variables
├── src/
│   ├── app/
│   │   ├── layout.tsx         fonts (Inter, Playfair Display, Roboto Slab for the wordmark), metadata
│   │   ├── providers.tsx      AuthProvider + MotionConfig(reducedMotion="user")
│   │   ├── globals.css        brand tokens, [data-portal-theme="member"|"super"] tokens
│   │   ├── page.tsx           landing
│   │   ├── login/page.tsx
│   │   ├── icon.svg           favicon (logo mark)
│   │   └── (portal)/          auth-guarded, role-themed area
│   │       ├── layout.tsx     PortalThemeScope → RequireAuth → PortalHeader
│   │       ├── portal/page.tsx   calculator
│   │       └── admin/page.tsx    users (ADMIN only)
│   ├── components/
│   │   ├── ui/                Button, Select, Dialog, Input, Label, Field, SegmentedControl
│   │   ├── brand/Logo.tsx     vector logo (brand / inverse tones)
│   │   ├── landing/           SiteHeader, Hero, About, SiteFooter, PortalButton
│   │   ├── auth/              AuthProvider (mock RBAC), RequireAuth, LoginForm
│   │   ├── portal/            PortalThemeScope, PortalHeader, TierPreviewToggle
│   │   ├── calculator/        TransportCalculator, QuoteSummary, AnimatedAmount
│   │   ├── admin/             AdminDashboard, UsersTable, AddUserDialog, CredentialsDialog
│   │   └── motion/Reveal.tsx  fade-up on scroll
│   ├── config/pricing-matrix.json   ← PLACEHOLDER PRICES, replace these
│   ├── data/
│   │   ├── auction-locations.json   ← Copart & IAAI facility cities
│   │   ├── locations.ts             validates + indexes the JSON
│   │   └── us-states.ts             50 states, StateCode type
│   ├── lib/
│   │   ├── pricing/           calculateShipping(), types, matrix validation
│   │   ├── auth/              mock store (localStorage), password hashing/generation
│   │   ├── motion.ts          shared easing and variants
│   │   └── utils.ts           cn(), formatMoney()
│   ├── store/                 Zustand: calculator-store, portal-theme-store
│   ├── hooks/use-pricing-tier.ts
│   └── types/domain.ts        Auction, CarType, Role, PricingTier (+ type guards)
```

## Changing prices

Edit `src/config/pricing-matrix.json`. There is no code to change. For each quote:

```
inland   = (locationInlandOverrides[id] ?? states[ST].inland) × carTypes[type].inlandMultiplier × tier.inlandMultiplier
ocean    = ports[states[ST].port].ocean[type]                                 × tier.oceanMultiplier
handling = auctionHandlingFee[auction]                                        × tier.auctionHandlingMultiplier
service  = tier.serviceFee
```

Each line is rounded up to `rounding`, and the total is the sum of the lines.

- `tiers.MEMBER` and `tiers.SUPER_MEMBER` are separate price lists.
- TypeScript checks the file's shape at build time. For example, a missing state or car type fails the build.
- At startup the file is also checked for:
  - port references that don't exist
  - negative numbers
  - any SUPER_MEMBER value that is higher than the MEMBER value
- `locationInlandOverrides` keys are facility ids: `<auction>-<state>-<city-slug>`, e.g. `copart-tx-fort-worth`.
- `calculateShipping(auction, state, city, carType, userRole, matrix?)` accepts another matrix as an optional last argument. You can use this for a price list fetched from an API.

## Facility data

`src/data/auction-locations.json` is a flat array of `{ "auction", "state", "city" }`: 164 Copart and 118 IAAI entries, across all 50 states. It was compiled without access to the live auction sites, and yards open and close. **Check it against the current Copart and IAAI location pages before launch.** Mistakes in the file are caught when it loads:

- unknown auction
- unknown state
- empty city
- duplicate entry

The City dropdown is filtered by the selected **auction and state**. If an auction has no facility in a state, the dropdown says so.

## Auth is a mock

Users and the session live in the visitor's browser (`localStorage`). Passwords are stored as salted SHA-256, never in plain text. The provider re-checks the admin role on every admin action, and the route guards redirect signed-out users and users with the wrong role.

This is good enough for a demo, but **it is not security**: anyone can edit their own browser storage. Before real members use it, replace `src/lib/auth/mock-db.ts` with a real backend, for example Auth.js or Supabase, and enforce roles on the server through middleware or route handlers. `AuthProvider` is the only file that calls the mock store, so it is the only file that has to change.

Password hashing uses `crypto.subtle`, which only works on HTTPS or `localhost`.
