# Phase 1 — Site V2 Landing Page Implementation Plan

> **For agentic workers:** Use `dispatching-parallel-agents` skill for parallel tasks (SEO infra // UI components). Use `executing-plans` skill for sequential tasks.

**Goal:** Implémenter le site public V2 — composants UI, layout, SEO infra, et landing page. Design Dark Editorial strict : tokens from `globals.css`, refs from `claude_code_handoff/design_reference/05_v2_dark_editorial/`.

**Architecture:** App Router Next.js 15. Route group `(site)` pour pages publiques (Nav+Footer). Route group `(auth)` sans nav. Composants UI custom dans `components/ui/` — shadcn uniquement pour Sheet/Dialog/Select/Calendar/Sonner. SEO baked-in depuis le début (metadata, schema.org, sitemap, robots).

**Tech Stack:** Next.js 15, React 19, Tailwind v4 (CSS-first), next/font, zod, cn() helper

**Skills à utiliser :**
- `/tailwind-design-system` — design tokens + composants
- `/next-best-practices` — metadata, images, fonts, App Router
- `/frontend-design` — qualité visuelle éditorial
- `/react-best-practices` — composants < 200 lignes, hooks

**Constraints CLAUDE.md :**
- Fichiers composants < 200 lignes
- Hooks < 250 lignes
- Pages < 150 lignes
- ZÉRO `any`
- Dates : `string` format `"YYYY-MM-DD"`
- Pas d'emoji dans le code final
- Fraunces serif + Inter sans + JetBrains Mono uniquement
- Couleurs uniquement depuis design tokens

---

## Architecture des fichiers

```
apps/site-v2/src/
├── app/
│   ├── layout.tsx                  ← Root layout (DONE) — fonts + base metadata
│   ├── globals.css                 ← DONE (tokens, base, helpers)
│   ├── sitemap.ts                  ← NEW — sitemap dynamique
│   ├── robots.ts                   ← NEW — robots.txt
│   ├── manifest.ts                 ← NEW — PWA manifest (scope /dashboard)
│   ├── opengraph-image.tsx         ← NEW — OG image par défaut Edge runtime
│   │
│   ├── (site)/
│   │   ├── layout.tsx              ← NEW — Nav + Footer wrapper
│   │   └── page.tsx                ← NEW — Landing page (sections)
│   │
│   └── api/
│       └── health/route.ts         ← NEW — health check
│
├── components/
│   ├── ui/
│   │   ├── Icon.tsx                ← NEW — 45 SVG icons inline
│   │   ├── Button.tsx              ← NEW — primary/dark/ghost/ghost-light
│   │   ├── Card.tsx                ← NEW — default/cream/dark/glass/btn
│   │   ├── Chip.tsx                ← NEW — chip/chip-dark/chip-btn + status
│   │   └── index.ts                ← NEW — barrel exports
│   │
│   ├── layout/
│   │   ├── Nav.tsx                 ← NEW — desktop + mobile (Sheet)
│   │   ├── Footer.tsx              ← NEW — 4 colonnes
│   │   └── PageHeader.tsx          ← NEW — fond dark, eyebrow+H1+lead
│   │
│   └── seo/
│       ├── LocalBusinessSchema.tsx ← NEW — JSON-LD composant
│       └── BreadcrumbSchema.tsx    ← NEW — JSON-LD breadcrumb
│
├── lib/
│   ├── fonts.ts                    ← DONE
│   └── cn.ts                       ← DONE
│
└── types/
    └── space.ts                    ← NEW — type Space pour landing
```

---

## Dépendances entre tâches

```
Tâche 1 (tokens globals.css) ─── DONE
         │
         ├── Tâche 2 (Icon)
         ├── Tâche 3 (Button)    ←── parallèle avec Tâche 4-5
         ├── Tâche 4 (Card)
         ├── Tâche 5 (Chip)
         │
         ├── Tâche 6 (SEO infra) ←── parallèle avec Tâche 2-5
         │
         Tâche 2-5 done
         │
         ├── Tâche 7 (Nav)
         ├── Tâche 8 (Footer)
         ├── Tâche 9 (PageHeader)
         │
         Tâche 6-9 done
         │
         ├── Tâche 10 (Site layout)
         │
         Tâche 10 done
         │
         └── Tâche 11 (Landing page)
```

**Dispatch parallèle recommandé :**
- **Agent A** (UI specialist) : Tâches 2-5 (Icon, Button, Card, Chip) + Tâches 7-9 (Nav, Footer, PageHeader)
- **Agent B** (SEO specialist) : Tâche 6 (SEO infra : sitemap, robots, manifest, schemas)
- Puis **Agent A** ou inline : Tâche 10 (site layout) + Tâche 11 (landing page)

---

## Tâche 1 — globals.css (DONE — vérification requise)

**Fichiers :**
- Modify: `src/app/globals.css`

- [ ] **1.1 Vérifier tokens**

Ouvrir `globals.css`. Vérifier que ces tokens sont présents dans `@theme` :
```css
--color-body: #1A1A1A
--color-main: #417972
--color-btn: #F2D381
--color-btn-dark: #8A6B1F
--color-cream: #FAF6EE
--color-line: #E8E2D4
--color-gry: #7A766B
--color-danger: #C0534C
```

- [ ] **1.2 Ajouter les helpers CSS manquants** (hero, section, card-glass)

Ajouter dans `globals.css` après les tokens :

```css
/* ─── Hero dark ─── */
.hero-dark {
  background: linear-gradient(160deg, #1A1A1A 0%, #2F5955 60%, #417972 110%);
  color: #fff;
  position: relative;
  overflow: hidden;
  padding: clamp(48px, 8vw, 96px) 0;
}
.hero-dark::before,
.hero-dark::after {
  content: '';
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}
.hero-dark::before {
  top: -120px; right: -100px;
  width: 420px; height: 420px;
  background: radial-gradient(circle, rgba(242,211,129,0.15) 0%, transparent 65%);
}
.hero-dark::after {
  bottom: -140px; left: -100px;
  width: 480px; height: 480px;
  background: radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%);
}

/* ─── Sections ─── */
.section         { padding: clamp(48px, 8vw, 96px) 0; }
.section-dark    { background: var(--body); color: #fff; padding: clamp(48px, 8vw, 96px) 0; }
.section-cream   { background: var(--cream); }
.section-main    { background: var(--main); color: #fff; padding: clamp(48px, 8vw, 96px) 0; }

/* ─── Card glass (sur fonds dark) ─── */
.card-glass {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 18px;
  color: #fff;
}
.card-btn {
  background: var(--btn);
  color: #1A1A1A;
  border-radius: 18px;
  padding: 18px;
}

/* ─── Marquee ─── */
.marquee {
  display: flex;
  gap: clamp(24px, 3vw, 40px);
  flex-wrap: wrap;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0.65;
}

/* ─── Typography scale ─── */
.h1 {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(44px, 9vw, 116px);
  line-height: 0.92;
  letter-spacing: -0.035em;
  margin: 0;
}
.h2 {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(32px, 5vw, 56px);
  line-height: 1;
  letter-spacing: -0.025em;
  margin: 0;
}
.h3 {
  font-family: var(--font-serif);
  font-weight: 400;
  font-size: clamp(22px, 2.5vw, 30px);
  line-height: 1.1;
  letter-spacing: -0.015em;
  margin: 0;
}
.lead {
  font-size: clamp(15px, 1.4vw, 18px);
  line-height: 1.55;
  margin: 0;
}
.accent { color: var(--main); font-style: italic; }
```

- [ ] **1.3 Commit**
```bash
git add apps/site-v2/src/app/globals.css
git commit -m "feat(site-v2): complete globals.css with hero, sections, typography scale"
```

---

## Tâche 2 — `Icon.tsx` (Agent A)

**Fichier :** Create `src/components/ui/Icon.tsx`

- [ ] **2.1 Créer le composant**

Fichier doit être < 120 lignes (45 paths SVG inline, pas de fichiers séparés).

```tsx
// src/components/ui/Icon.tsx
import type { SVGProps } from "react";

const PATHS: Record<string, React.ReactNode> = {
  home: <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-7h-6v7H4a1 1 0 01-1-1v-9.5z"/>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
  plus: <path d="M12 5v14M5 12h14"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></>,
  gear: <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.5-2.3 1a7 7 0 00-2-1.2L14 3h-4l-.5 2.6a7 7 0 00-2 1.2l-2.4-1-2 3.5 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-1a7 7 0 002 1.2L10 21h4l.5-2.6a7 7 0 002-1.2l2.3 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z"/></>,
  bell: <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6zM10 19a2 2 0 004 0"/>,
  chevLeft: <path d="M15 19l-7-7 7-7"/>,
  chevRight: <path d="M9 5l7 7-7 7"/>,
  chevDown: <path d="M6 9l6 6 6-6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  people: <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.2 1.8-4 4-4"/></>,
  check: <path d="M5 12l5 5L20 7"/>,
  checkCircle: <><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></>,
  x: <path d="M6 6l12 12M18 6L6 18"/>,
  xCircle: <><circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/></>,
  tag: <><path d="M20 12l-8 8-9-9V3h8l9 9z"/><circle cx="7.5" cy="7.5" r="1.2"/></>,
  sparkle: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/>,
  qr: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM18 18h3v3h-3z"/></>,
  logout: <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></>,
  shield: <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
  phone: <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1 1 .3 1.8.6 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5c.9.3 1.8.5 2.7.6a2 2 0 011.7 2z"/>,
  building: <><rect x="4" y="3" width="16" height="18" rx="1.5"/><path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2"/></>,
  edit: <path d="M4 20h4l10-10-4-4L4 16v4zM13 5l4 4"/>,
  trash: <><path d="M4 6h16M9 6V4h6v2M6 6l1 13a2 2 0 002 2h6a2 2 0 002-2l1-13"/></>,
  gift: <><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v9a1 1 0 001 1h12a1 1 0 001-1v-9M12 8V4m-5 4s-1-4 2-4 3 4 3 4m0 0s1-4 4-4-1 4-1 4M12 8v14"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="M16 16l5 5"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  ticket: <path d="M4 8a2 2 0 002-2h12a2 2 0 002 2v2a2 2 0 000 4v2a2 2 0 00-2 2H6a2 2 0 00-2-2v-2a2 2 0 000-4V8z"/>,
  star: <path d="M12 3l2.9 6 6.6 1-4.8 4.7 1.1 6.6L12 18l-5.8 3.3 1.1-6.6L2.5 10l6.6-1L12 3z"/>,
  lock: <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
  cookie: <><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="10" r="1" fill="currentColor"/><circle cx="13" cy="14" r="1" fill="currentColor"/><circle cx="15" cy="8" r="1" fill="currentColor"/></>,
  wallet: <><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 10h18M17 15h2"/></>,
  arrowUp: <path d="M12 19V5M5 12l7-7 7 7"/>,
  arrowDown: <path d="M12 5v14M19 12l-7 7-7-7"/>,
  receipt: <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h4"/>,
  pin: <><path d="M12 21s-7-6-7-12a7 7 0 0114 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
  help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 115 0c0 1.5-2.5 2-2.5 4M12 17h.01"/></>,
};

export type IconName = keyof typeof PATHS;

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  sw?: number;
}

export function Icon({
  name,
  size = 20,
  sw = 1.7,
  fill = "none",
  stroke = "currentColor",
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
```

- [ ] **2.2 Commit**
```bash
git add apps/site-v2/src/components/ui/Icon.tsx
git commit -m "feat(site-v2): add Icon component with 45 SVG line icons"
```

---

## Tâche 3 — `Button.tsx` (Agent A)

**Fichier :** Create `src/components/ui/Button.tsx`

- [ ] **3.1 Créer le composant**

```tsx
// src/components/ui/Button.tsx
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "dark" | "ghost" | "ghost-light";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--btn)] text-[var(--body)] font-semibold hover:opacity-90",
  dark:
    "bg-[var(--body)] text-white hover:opacity-90",
  ghost:
    "bg-transparent text-[var(--body)] border border-[var(--line)] hover:bg-[var(--line)]",
  "ghost-light":
    "bg-white/8 text-white border border-white/14 hover:bg-white/14",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm:  "px-[14px] py-[10px] text-[13px]",
  md:  "px-[22px] py-[14px] text-[14px]",
  lg:  "px-[28px] py-[16px] text-[15px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-[10px]",
          "rounded-full font-medium",
          "transition-all duration-150 active:translate-y-px",
          "focus-visible:outline-2 focus-visible:outline-offset-2",
          "focus-visible:outline-[var(--main)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
```

> Note: `bg-white/8` et `bg-white/14` sont des classes Tailwind v4. Si erreur, utiliser `bg-[rgba(255,255,255,0.08)]`.

- [ ] **3.2 Commit**
```bash
git add apps/site-v2/src/components/ui/Button.tsx
git commit -m "feat(site-v2): add Button component with 4 variants"
```

---

## Tâche 4 — `Card.tsx` (Agent A)

**Fichier :** Create `src/components/ui/Card.tsx`

- [ ] **4.1 Créer le composant**

```tsx
// src/components/ui/Card.tsx
import { cn } from "@/lib/cn";

type CardVariant = "default" | "cream" | "dark";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-white border border-[var(--line)]",
  cream:   "bg-[var(--cream)] border border-[var(--line)]",
  dark:    "bg-[var(--body)] border border-white/10 text-white",
};

export function Card({
  variant = "default",
  className,
  children,
  style,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] p-[clamp(18px,2vw,24px)]",
        variantClasses[variant],
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
```

- [ ] **4.2 Commit**
```bash
git add apps/site-v2/src/components/ui/Card.tsx
git commit -m "feat(site-v2): add Card component"
```

---

## Tâche 5 — `Chip.tsx` (Agent A)

**Fichier :** Create `src/components/ui/Chip.tsx`

- [ ] **5.1 Créer le composant**

```tsx
// src/components/ui/Chip.tsx
import { cn } from "@/lib/cn";

type ChipVariant = "default" | "dark" | "btn" | "success" | "error" | "warning";

interface ChipProps {
  variant?: ChipVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<ChipVariant, string> = {
  default: "bg-[rgba(65,121,114,0.1)] text-[var(--main)]",
  dark:    "bg-white/8 text-white",
  btn:     "bg-[var(--btn)] text-[var(--body)]",
  success: "bg-[rgba(76,160,110,0.12)] text-[#2D7A52]",
  error:   "bg-[rgba(192,83,76,0.12)] text-[var(--danger)]",
  warning: "bg-[rgba(242,211,129,0.2)] text-[var(--btn-dark)]",
};

export function Chip({ variant = "default", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full",
        "px-3 py-[7px] text-[11.5px] font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// Dot indicator (pour "Ouvert maintenant")
export function StatusDot({
  color = "var(--main)",
}: { color?: string }) {
  return (
    <span
      className="inline-block w-[7px] h-[7px] rounded-full"
      style={{ background: color }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **5.2 Commit**
```bash
git add apps/site-v2/src/components/ui/Chip.tsx
git commit -m "feat(site-v2): add Chip component"
```

---

## Tâche 6 — SEO Infrastructure (Agent B — parallèle)

**Fichiers :** Create `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`, `src/components/seo/LocalBusinessSchema.tsx`, `src/components/seo/BreadcrumbSchema.tsx`

**Skills :** `/next-best-practices` section metadata + sitemap

- [ ] **6.1 Root layout metadata (mettre à jour)**

Dans `src/app/layout.tsx`, mettre à jour `metadata` :

```tsx
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr"
  ),
  title: {
    default: "CoworKing Café Strasbourg — Coworking + Café",
    template: "%s | CoworKing Café Strasbourg",
  },
  description:
    "Espace de coworking chaleureux au cœur de Strasbourg. WiFi fibre, café à volonté, salles de réunion privatisables. De 9€/h. Ouvert 7j/7, 9h–20h.",
  keywords: [
    "coworking strasbourg",
    "espace de coworking strasbourg",
    "cafe coworking strasbourg",
    "salle reunion strasbourg",
    "bureau partagé strasbourg",
    "coworking centre ville strasbourg",
  ],
  authors: [{ name: "CoworKing Café" }],
  creator: "CoworKing Café",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "CoworKing Café Strasbourg",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "CoworKing Café Strasbourg — Coworking + Café",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
```

- [ ] **6.2 Sitemap**

```ts
// src/app/sitemap.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                    priority: 1,   changeFrequency: "weekly",  lastModified: new Date() },
    { url: `${BASE_URL}/espaces`,       priority: 0.9, changeFrequency: "weekly",  lastModified: new Date("2026-04-22") },
    { url: `${BASE_URL}/tarifs`,        priority: 0.9, changeFrequency: "weekly",  lastModified: new Date("2026-04-22") },
    { url: `${BASE_URL}/concept`,       priority: 0.8, changeFrequency: "monthly", lastModified: new Date("2026-04-22") },
    { url: `${BASE_URL}/menu`,          priority: 0.7, changeFrequency: "monthly", lastModified: new Date("2026-04-22") },
    { url: `${BASE_URL}/evenements`,    priority: 0.8, changeFrequency: "daily",   lastModified: new Date() },
  ];
  return staticPages;
}
```

- [ ] **6.3 Robots**

```ts
// src/app/robots.ts
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/booking/checkout"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
```

- [ ] **6.4 Manifest PWA (scope /dashboard)**

```ts
// src/app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CoworKing Café",
    short_name: "CoworKing",
    description: "Coworking + Café à Strasbourg",
    start_url: "/dashboard",
    scope: "/dashboard",
    display: "standalone",
    background_color: "#FAF6EE",
    theme_color: "#1A1A1A",
    orientation: "portrait-primary",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
    ],
  };
}
```

- [ ] **6.5 OG Image par défaut (Edge runtime)**

```tsx
// src/app/opengraph-image.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "CoworKing Café Strasbourg";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          background: "linear-gradient(160deg, #1A1A1A 0%, #2F5955 60%, #417972 110%)",
          padding: "64px 72px",
          fontFamily: "serif",
        }}
      >
        <div style={{ color: "#F2D381", fontSize: 14, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20, fontFamily: "monospace" }}>
          COWORKING · CAFÉ · STRASBOURG
        </div>
        <div style={{ color: "#fff", fontSize: 72, lineHeight: 0.92, letterSpacing: "-0.035em", fontWeight: 400, marginBottom: 24 }}>
          Travailler mieux,<br />un café à la fois.
        </div>
        <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 20 }}>
          Ouvert 7j/7 · 9h–20h · 1 rue de la Division Leclerc
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **6.6 LocalBusiness schema**

```tsx
// src/components/seo/LocalBusinessSchema.tsx
export function LocalBusinessSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://coworkingcafe.fr/#organization",
    name: "CoworKing Café",
    description:
      "Espace de coworking chaleureux au cœur de Strasbourg. WiFi fibre, café à volonté, salles de réunion privatisables.",
    url: "https://coworkingcafe.fr",
    telephone: "+33987334519",
    address: {
      "@type": "PostalAddress",
      streetAddress: "1 rue de la Division Leclerc",
      addressLocality: "Strasbourg",
      addressRegion: "Grand Est",
      postalCode: "67000",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "48.5735",
      longitude: "7.7538",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "20:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "20:00",
      },
    ],
    priceRange: "€€",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "280",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

- [ ] **6.7 BreadcrumbSchema**

```tsx
// src/components/seo/BreadcrumbSchema.tsx
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

- [ ] **6.8 Commit**
```bash
git add apps/site-v2/src/app/sitemap.ts apps/site-v2/src/app/robots.ts apps/site-v2/src/app/manifest.ts apps/site-v2/src/app/opengraph-image.tsx apps/site-v2/src/components/seo/
git commit -m "feat(site-v2): add SEO infrastructure (sitemap, robots, manifest, OG image, JSON-LD)"
```

---

## Tâche 7 — `Nav.tsx` (Agent A)

**Fichier :** Create `src/components/layout/Nav.tsx`

Utilise `Sheet` de shadcn/ui pour le menu mobile. Max 150 lignes.

- [ ] **7.1 Installer Sheet shadcn (si pas fait)**

```bash
cd apps/site-v2 && npx shadcn@latest add sheet
```

- [ ] **7.2 Créer Nav.tsx**

```tsx
// src/components/layout/Nav.tsx
"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/",          label: "Accueil"      },
  { href: "/espaces",   label: "Espaces"      },
  { href: "/concept",   label: "Concept"      },
  { href: "/tarifs",    label: "Tarifs"       },
  { href: "/menu",      label: "Menu"         },
  { href: "/evenements",label: "Événements"   },
] as const;

interface NavProps {
  variant?: "light" | "dark";
  currentPath?: string;
}

export function Nav({ variant = "light", currentPath = "/" }: NavProps) {
  const isDark = variant === "dark";

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 border-b",
        "backdrop-blur-[20px]",
        isDark
          ? "bg-[rgba(11,21,19,0.8)] border-white/10 text-white"
          : "bg-[rgba(250,246,238,0.85)] border-[var(--line)] text-[var(--body)]"
      )}
      aria-label="Navigation principale"
    >
      <div className="wrap flex items-center gap-[clamp(14px,2vw,28px)] py-[18px]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-[10px] shrink-0 no-underline text-inherit">
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center"
            style={{ background: "var(--btn)" }}
          >
            <Icon name="building" size={18} stroke="#1A1A1A" />
          </div>
          <div>
            <div className="font-serif text-[16px] tracking-[-0.01em] leading-none">
              CoworKing Café
            </div>
            <div className="font-mono text-[9px] tracking-[0.14em] opacity-50 mt-[3px]">
              STRASBOURG · EST. 2022
            </div>
          </div>
        </Link>

        {/* Desktop links */}
        <div className="hidden lg:flex flex-1 justify-center gap-[clamp(14px,2vw,26px)]">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13.5px] font-medium py-2 no-underline text-inherit transition-opacity",
                currentPath === link.href ? "opacity-100" : "opacity-[0.72] hover:opacity-100"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-[10px] shrink-0">
          <Link
            href="/login"
            className={cn(
              "text-[13.5px] font-medium opacity-[0.72] hover:opacity-100 no-underline text-inherit"
            )}
          >
            Se connecter
          </Link>
          <Button
            variant={isDark ? "primary" : "dark"}
            size="sm"
            onClick={() => { window.location.href = "/booking"; }}
          >
            Réserver
          </Button>
        </div>

        {/* Mobile burger */}
        <div className="lg:hidden ml-auto">
          <MobileNav isDark={isDark} currentPath={currentPath} />
        </div>
      </div>
    </nav>
  );
}

function MobileNav({ isDark, currentPath }: { isDark: boolean; currentPath: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button
          aria-label="Ouvrir le menu"
          className={cn(
            "p-[6px] rounded-[8px]",
            isDark ? "text-white hover:bg-white/10" : "text-[var(--body)] hover:bg-[var(--line)]"
          )}
        >
          <Icon name="menu" size={22} stroke="currentColor" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-[300px] p-0"
        style={{ background: isDark ? "#0B1513" : "var(--cream)" }}
      >
        <nav className="flex flex-col p-6 gap-1" aria-label="Menu mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "py-[14px] px-3 text-[15px] font-medium rounded-[10px] no-underline text-inherit",
                "border-b border-[var(--line)] last:border-0",
                currentPath === link.href
                  ? "opacity-100"
                  : "opacity-70 hover:opacity-100 hover:bg-[var(--line)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-3">
            <Link href="/login" className="no-underline">
              <Button variant="ghost" className="w-full">Se connecter</Button>
            </Link>
            <Link href="/booking" className="no-underline">
              <Button variant="primary" className="w-full">Réserver</Button>
            </Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **7.3 Commit**
```bash
git add apps/site-v2/src/components/layout/Nav.tsx
git commit -m "feat(site-v2): add Nav component with responsive mobile Sheet"
```

---

## Tâche 8 — `Footer.tsx` (Agent A)

**Fichier :** Create `src/components/layout/Footer.tsx`

Max 100 lignes — données statiques, 4 colonnes.

- [ ] **8.1 Créer Footer.tsx**

```tsx
// src/components/layout/Footer.tsx
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const COLUMNS = [
  {
    title: "Espaces",
    links: [
      { label: "Open-space", href: "/espaces#open-space" },
      { label: "Salle Verrière", href: "/espaces#verriere" },
      { label: "Salle Étage", href: "/espaces#etage" },
      { label: "Événementiel", href: "/espaces#event" },
    ],
  },
  {
    title: "Le lieu",
    links: [
      { label: "Concept", href: "/concept" },
      { label: "Menu boissons", href: "/menu" },
      { label: "Événements", href: "/evenements" },
      { label: "Tarifs", href: "/tarifs" },
    ],
  },
  {
    title: "Membre",
    links: [
      { label: "Connexion", href: "/login" },
      { label: "Mon espace", href: "/dashboard" },
      { label: "Programme fidélité", href: "/dashboard/loyalty" },
      { label: "Contact", href: "/contact" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="bg-[#0B1513] text-white pt-[clamp(40px,6vw,72px)] pb-7">
      <div className="wrap">
        <div className="grid grid-cols-1 gap-[clamp(24px,4vw,56px)] pb-8 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[10px] mb-[14px]">
              <div className="w-9 h-9 rounded-[10px] bg-[var(--btn)] flex items-center justify-center shrink-0">
                <Icon name="building" size={18} stroke="#1A1A1A" />
              </div>
              <span className="font-serif text-[18px]">CoworKing Café</span>
            </div>
            <address className="not-italic text-[13px] opacity-65 leading-[1.55]">
              1 rue de la Division Leclerc<br />
              67000 Strasbourg<br />
              Lun–Ven 9h–20h · Sam–Dim 10h–20h<br />
              +33 9 87 33 45 19
            </address>
          </div>

          {/* Columns */}
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-[var(--btn)] mb-[14px]">
                {col.title}
              </div>
              <ul className="flex flex-col gap-2 list-none p-0 m-0 text-[13px] opacity-70">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-white no-underline hover:opacity-100 hover:text-[var(--btn)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-between items-center gap-[10px] pt-5 border-t border-white/8 font-mono text-[10.5px] tracking-[0.1em] opacity-50">
          <span>© 2026 COWORKING CAFÉ · TOUS DROITS RÉSERVÉS</span>
          <span>LE CAFÉ MOTIVE · L&apos;HUMAIN RELIE</span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **8.2 Commit**
```bash
git add apps/site-v2/src/components/layout/Footer.tsx
git commit -m "feat(site-v2): add Footer component"
```

---

## Tâche 9 — `PageHeader.tsx` (Agent A)

**Fichier :** Create `src/components/layout/PageHeader.tsx`

- [ ] **9.1 Créer PageHeader.tsx**

```tsx
// src/components/layout/PageHeader.tsx
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  num: string;
  eyebrow: string;
  title: string;
  titleAccent?: string;
  lead?: string;
  className?: string;
}

export function PageHeader({
  num,
  eyebrow,
  title,
  titleAccent,
  lead,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "page-header relative overflow-hidden",
        "py-[clamp(56px,8vw,120px)] pb-[clamp(40px,5vw,64px)]",
        "bg-[var(--body)] text-white",
        className
      )}
    >
      {/* Decorative glow */}
      <div
        className="absolute top-[-100px] right-[-80px] w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(242,211,129,0.12) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />
      <div className="wrap relative z-10">
        <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--btn)] mb-4">
          — {num} · {eyebrow}
        </div>
        <h1 className="h1" style={{ fontSize: "clamp(40px, 7vw, 84px)" }}>
          {title}{" "}
          {titleAccent && (
            <em style={{ color: "var(--btn)", fontStyle: "italic" }}>
              {titleAccent}
            </em>
          )}
        </h1>
        {lead && (
          <p
            className="lead mt-6"
            style={{ maxWidth: 640, color: "rgba(255,255,255,0.78)" }}
          >
            {lead}
          </p>
        )}
      </div>
    </header>
  );
}
```

- [ ] **9.2 barrel exports**

```ts
// src/components/ui/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Chip, StatusDot } from "./Chip";
export { Icon } from "./Icon";
export type { IconName } from "./Icon";

// src/components/layout/index.ts
export { Nav } from "./Nav";
export { Footer } from "./Footer";
export { PageHeader } from "./PageHeader";
```

- [ ] **9.3 Commit**
```bash
git add apps/site-v2/src/components/layout/PageHeader.tsx apps/site-v2/src/components/ui/index.ts apps/site-v2/src/components/layout/index.ts
git commit -m "feat(site-v2): add PageHeader + barrel exports"
```

---

## Tâche 10 — Site Layout (inline)

**Fichier :** Create `src/app/(site)/layout.tsx`

- [ ] **10.1 Créer le layout**

```tsx
// src/app/(site)/layout.tsx
import type { Metadata } from "next";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { headers } from "next/headers";

export const metadata: Metadata = {
  alternates: {
    canonical: process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr",
  },
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Lire le pathname pour marquer le lien actif
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "/";

  return (
    <>
      <Nav currentPath={pathname} />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}
```

> Note : `x-pathname` nécessite un middleware. Alternative simple : passer le pathname depuis chaque page en prop via un composant client NavWrapper.

**Alternative si middleware absent** — créer `src/components/layout/NavWrapper.tsx` :

```tsx
// src/components/layout/NavWrapper.tsx
"use client";
import { usePathname } from "next/navigation";
import { Nav } from "./Nav";

export function NavWrapper({ variant }: { variant?: "light" | "dark" }) {
  const pathname = usePathname();
  return <Nav variant={variant} currentPath={pathname} />;
}
```

Et dans `(site)/layout.tsx` :
```tsx
import { NavWrapper } from "@/components/layout/NavWrapper";
// ...
<NavWrapper />
```

- [ ] **10.2 Commit**
```bash
git add apps/site-v2/src/app/\(site\)/layout.tsx apps/site-v2/src/components/layout/NavWrapper.tsx
git commit -m "feat(site-v2): add site layout with Nav + Footer"
```

---

## Tâche 11 — Landing Page (inline ou Agent A)

**Fichier :** Modify `src/app/(site)/page.tsx`

**Ref :** `claude_code_handoff/design_reference/05_v2_dark_editorial/landing.html`

**Sections :**
1. Hero dark (grille 2 colonnes : copy + cards flottantes)
2. Espaces (4 cards magazine)
3. Concept (section sauge, 4 features)
4. Témoignages (3 cards, section crème)
5. CTA strip (dark, première heure offerte)

**Contrainte CLAUDE.md :** page < 150 lignes → extraire chaque section dans un composant dans `src/components/landing/`.

- [ ] **11.1 Créer les données**

```ts
// src/types/space.ts
export interface Space {
  key: string;
  name: string;
  tag: string;
  price: number;
  capacity: string;
  description: string;
  color: string;
}

export const SPACES: Space[] = [
  {
    key: "open",
    name: "Open-space",
    tag: "Flexible",
    price: 9,
    capacity: "40 places",
    description: "Ambiance studieuse, tables partagées, parfait pour le deep-work en solo.",
    color: "#417972",
  },
  {
    key: "verriere",
    name: "Salle Verrière",
    tag: "Meeting",
    price: 24,
    capacity: "6 pers.",
    description: "Lumière naturelle traversante, écran 55\", visio intégrée — pour vos workshops.",
    color: "#5A938B",
  },
  {
    key: "etage",
    name: "Salle Étage",
    tag: "Privé",
    price: 30,
    capacity: "10 pers.",
    description: "Cosy, privatisée à l'étage, tableau blanc et boissons incluses.",
    color: "#8A6B1F",
  },
  {
    key: "event",
    name: "Événementiel",
    tag: "Soirées",
    price: 80,
    capacity: "40 pers.",
    description: "Privatisation totale avec sono, lumières et service traiteur possible.",
    color: "#C0534C",
  },
];
```

- [ ] **11.2 Créer les composants de section**

Créer `src/components/landing/` avec :
- `HeroSection.tsx` (≤ 80 lignes)
- `SpacesSection.tsx` (≤ 80 lignes)
- `ConceptSection.tsx` (≤ 80 lignes)
- `TestimonialsSection.tsx` (≤ 80 lignes)
- `CtaSection.tsx` (≤ 60 lignes)

Voir landing.html pour chaque section. Utiliser les composants UI : `<Button>`, `<Card>`, `<Chip>`, `<Icon>`, classes `.h1`, `.h2`, `.lead`, `.eyebrow`, `.wrap`.

- [ ] **11.3 Créer la page**

```tsx
// src/app/(site)/page.tsx
import type { Metadata } from "next";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { HeroSection } from "@/components/landing/HeroSection";
import { SpacesSection } from "@/components/landing/SpacesSection";
import { ConceptSection } from "@/components/landing/ConceptSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { CtaSection } from "@/components/landing/CtaSection";

export const metadata: Metadata = {
  title: "Coworking Strasbourg Centre-Ville | CoworKing Café",
  description:
    "Espace de coworking chaleureux au cœur de Strasbourg. WiFi fibre, boissons à volonté, salles de réunion. Dès 9€/h, sans abonnement. Ouvert 7j/7.",
  alternates: {
    canonical: process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr",
  },
  openGraph: {
    title: "CoworKing Café Strasbourg — Coworking + Café",
    description: "WiFi fibre, café à volonté, salles privatisables. Dès 9€/h.",
    url: process.env.NEXT_PUBLIC_URL ?? "https://coworkingcafe.fr",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      <LocalBusinessSchema />
      <HeroSection />
      <SpacesSection />
      <ConceptSection />
      <TestimonialsSection />
      <CtaSection />
    </>
  );
}
```

- [ ] **11.4 Type check + build**

```bash
cd apps/site-v2 && npx tsc --noEmit
npx next build
```

Expected : 0 errors TypeScript, build réussi.

- [ ] **11.5 Commit final**

```bash
git add apps/site-v2/src/
git commit -m "feat(site-v2): implement landing page with all sections + SEO"
```

---

## Checklist finale (verification-before-completion skill)

- [ ] `pnpm --filter @coworking-cafe/site-v2 type-check` → 0 erreurs
- [ ] `pnpm --filter @coworking-cafe/site-v2 build` → build réussi
- [ ] Responsive : mobile 375px / tablet 768px / desktop 1280px
- [ ] Couleurs : uniquement tokens du design system (pas de #xxx hors liste)
- [ ] Polices : Fraunces + Inter + JetBrains Mono uniquement
- [ ] Zéro `any` TypeScript
- [ ] Fichiers composants < 200 lignes
- [ ] Schema.org LocalBusiness présent sur homepage
- [ ] Sitemap + robots.txt générés
- [ ] Nav active state fonctionne
- [ ] Mobile nav ouvre/ferme sans bug

---

**Plan créé le** : 2026-04-22
**Par** : Team Lead (Sonnet acting as lead)
**Skills utilisés** : writing-plans, frontend-design, tailwind-design-system, next-best-practices, dispatching-parallel-agents
