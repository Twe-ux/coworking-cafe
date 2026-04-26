# CLAUDE.md — apps/site-v2

> Site CoworKing Café V2 — **Dark Editorial**.
> Implémentation depuis zéro dans Next.js 15 + Tailwind v4.
> Lire ce fichier **avant toute modification**.

---

## Stack

| Outil | Version | Rôle |
|-------|---------|------|
| Next.js | 15 (App Router) | Framework |
| React | 19 | UI |
| TypeScript | 5 | Types (zéro `any`) |
| Tailwind CSS | v4 (CSS-first) | Styles |
| shadcn/ui | Headless seulement | Dialog, Sheet, Select, Calendar, Sonner |
| next-auth | v4 | Auth |
| next/font | — | Fraunces / Inter / JetBrains Mono |
| Zod + react-hook-form | — | Validation |
| Stripe | v5 | Paiement |
| Packages workspace | `@coworking-cafe/database`, `email`, `shared` | Backend partagé |

---

## Design System — règles figées

### Source de vérité

```
claude_code_handoff/design_reference/05_v2_dark_editorial/
├── index.html       → Hub design system
├── landing.html     → Page /
├── espaces.html     → /espaces
├── tarifs.html      → /tarifs
├── concept.html     → /concept
├── menu.html        → /menu
├── evenements.html  → /evenements
├── dashboard.html   → /dashboard (desktop)
├── tokens.css       → Toutes les variables
├── shared.jsx       → Nav, PageHeader, Footer
└── icons.jsx        → ~45 icônes SVG line

claude_code_handoff/design_reference/
├── 01_auth.html            → /login, /register, /reset
├── 02_booking_flow.html    → /booking (mobile 4 étapes + desktop 3 col)
└── 03_dashboard_mobile.html → /dashboard (mobile)
```

**Toujours ouvrir le HTML de référence avant d'implémenter une page.**

### Tokens (définis dans `src/app/globals.css`)

```css
--body:    #1A1A1A   /* fond dark, texte principal */
--main:    #417972   /* sauge — accent, CTA secondaires */
--btn:     #F2D381   /* miel — CTA primaires, highlights */
--btn-dark:#8A6B1F   /* miel foncé — texte sur miel */
--cream:   #FAF6EE   /* fond crème — fond pages claires */
--line:    #E8E2D4   /* bordures */
--gry:     #7A766B   /* texte secondaire */
--danger:  #C0534C   /* erreurs */
```

**Ne jamais inventer de couleur. Ne jamais changer les polices.**

### Typographie

| Usage | Police | Taille / Style |
|-------|--------|----------------|
| H1 | Fraunces (`font-serif`) | `clamp(40px, 7vw, 84px)`, tracking -0.02em |
| H2 | Fraunces | `clamp(32px, 4.5vw, 52px)` |
| H3 | Fraunces | 22–28px |
| Body | Inter (`font-sans`) | 14–16px |
| Lead | Inter | 17–19px, lh 1.55 |
| Eyebrow/tag | JetBrains Mono (`font-mono`) | 10.5–11px, uppercase, ls 0.14em |

Classe `.eyebrow` déjà définie dans `globals.css`.

### Tailwind v4 — approche CSS-first

Les tokens sont dans `@theme {}` dans `globals.css`. Utilisation :

```tsx
// ✅ BON — token Tailwind
<div className="bg-[var(--cream)] text-[var(--body)]">

// ✅ BON — couleur nommée @theme
<div className="bg-cream text-body">

// ✅ BON — utilitaire custom
<p className="eyebrow">Espaces</p>

// ❌ MAUVAIS — couleur inventée
<div className="bg-slate-100">
```

### Rayons / Espacements

```
Cards :      rounded-[20px]  → --radius-card
Boutons :    rounded-full     → pill
Inputs :     rounded-[12px]   → --radius-input
Chips :      rounded-full
Ombres :     aucune — bordures fines 1px solid var(--line)
```

---

## shadcn/ui — Usage limité

Installer uniquement les composants **headless interactifs** suivants :

| Composant | Usage | Ne PAS utiliser pour |
|-----------|-------|----------------------|
| `Sheet` | Drawer mobile nav + drawer dashboard | — |
| `Dialog` | Modales confirmation | — |
| `Select` | Dropdowns accessibles | — |
| `Calendar` | Picker date dans booking | — |
| `Sonner` | Toast notifications | — |

**NE PAS utiliser** shadcn Button, Card, Badge, Input — ces composants sont custom et doivent respecter le design éditorial.

---

## Structure des dossiers

```
src/
├── app/
│   ├── layout.tsx              ← Root layout (fonts, metadata)
│   ├── globals.css             ← Tailwind v4 + tokens
│   │
│   ├── (site)/                 ← Route group — site public
│   │   ├── layout.tsx          ← Nav + Footer
│   │   ├── page.tsx            ← Landing /
│   │   ├── espaces/page.tsx
│   │   ├── concept/page.tsx
│   │   ├── tarifs/page.tsx
│   │   ├── menu/page.tsx
│   │   └── evenements/page.tsx
│   │
│   ├── (auth)/                 ← Route group — auth pages
│   │   ├── layout.tsx          ← Layout minimal (pas de nav)
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset/page.tsx
│   │
│   ├── booking/                ← Flow de réservation
│   │   └── page.tsx            ← Gère les steps via searchParams
│   │
│   ├── dashboard/              ← Espace membre (protégé)
│   │   ├── layout.tsx          ← Auth guard + PWA shell
│   │   └── [section]/page.tsx  ← home, bookings, history, wallet, etc.
│   │
│   └── api/                    ← API routes
│       ├── auth/[...nextauth]/route.ts
│       ├── bookings/route.ts
│       ├── spaces/route.ts
│       └── ...
│
├── components/
│   ├── layout/
│   │   ├── Nav.tsx             ← Nav desktop + mobile drawer
│   │   ├── Footer.tsx
│   │   └── PageHeader.tsx      ← Fond dark, eyebrow + H1 + lead
│   │
│   ├── ui/                     ← Composants design system custom
│   │   ├── Button.tsx          ← variants: primary/dark/ghost
│   │   ├── Card.tsx            ← variants: default/cream/dark
│   │   ├── Chip.tsx            ← variants: btn/tag/status
│   │   ├── Icon.tsx            ← SVG line icons (45 icônes)
│   │   └── index.ts            ← Barrel exports
│   │
│   ├── dashboard/              ← Composants espace membre
│   │   ├── DashboardShell.tsx  ← App shell PWA (tabs + screens)
│   │   ├── TabBar.tsx          ← Bottom nav mobile
│   │   └── screens/            ← HomeScreen, ReservationsScreen, etc.
│   │
│   └── booking/                ← Composants flow réservation
│       ├── BookingFlow.tsx
│       └── steps/              ← Step1Space, Step2Date, Step3Options, Step4Confirm
│
├── hooks/
│   ├── useBooking.ts
│   ├── useDashboardNavigation.ts
│   └── usePWA.ts
│
├── lib/
│   ├── fonts.ts                ← Fraunces, Inter, JetBrains Mono
│   ├── auth.ts                 ← NextAuth config
│   ├── stripe.ts               ← Lazy init Stripe
│   └── cn.ts                   ← clsx + tailwind-merge helper
│
└── types/
    ├── booking.ts
    ├── dashboard.ts
    └── user.ts
```

---

## Ordre d'implémentation

### Phase 1 — Site public (rentable, SEO)

1. **Composants UI** : `Button`, `Card`, `Chip`, `Icon`
2. **Layout** : `Nav` (desktop + mobile drawer) + `Footer`
3. **Landing** `/` — ref : `landing.html`
4. **Espaces** `/espaces` — ref : `espaces.html`
5. **Tarifs** `/tarifs` — ref : `tarifs.html`
6. **Concept** `/concept` — ref : `concept.html`
7. **Menu** `/menu` — ref : `menu.html`
8. **Événements** `/evenements` — ref : `evenements.html`

### Phase 2 — Auth

9. `/login` + `/register` + `/reset` — ref : `01_auth.html`
   - Magic link en priorité, password en fallback
   - Configurer NextAuth avec `@coworking-cafe/database`

### Phase 3 — Booking flow

10. `/booking` — ref : `02_booking_flow.html`
    - Mobile : 4 étapes séquentielles
    - Desktop : 3 colonnes
    - Steps : Espace → Date/Heure → Options → Confirmation + Stripe

### Phase 4 — Dashboard membre (PWA)

11. `/dashboard` — ref : `dashboard.html` (desktop) + `03_dashboard_mobile.html` (mobile)
    - **PWA trigger** : Quand l'utilisateur est connecté, proposer "Ajouter à l'écran d'accueil"
    - Mode PWA → shell mobile (bottom TabBar, plein écran, statusBar)
    - Mode browser → sidebar desktop
    - Sous-pages : bookings, history, wallet, loyalty, profile, events, directory

---

## PWA Dashboard — Architecture critique

Le dashboard fonctionne comme une **app mobile native** quand installé en PWA :

### Manifest (`public/manifest.json`)
```json
{
  "display": "standalone",
  "start_url": "/dashboard",
  "scope": "/dashboard",
  "theme_color": "#1A1A1A",
  "background_color": "#FAF6EE"
}
```

### StatusBar iOS
- `statusBarStyle: "default"` (NOT `black-translucent`) — l'OS gère la safe area
- Ne pas utiliser `env(safe-area-inset-top)` dans le hero dashboard
- Le fond du status bar est contrôlé via `meta[name="theme-color"]` (JS dynamique selon la page active)

### Shell app
```tsx
// dashboard/layout.tsx
// html/body → height: 100svh; overflow: hidden
// .dashboard-wrapper → flex-col, height 100svh
// .dashboard-screen → flex: 1, overflow-y: auto (scroll ici seulement)
// <TabBar> → position sticky bottom
```

### Theme-color dynamique
```tsx
// Depuis DashboardShell.tsx
useEffect(() => {
  const isDark = DARK_SCREENS.includes(currentScreen); // "home", "booking-detail"
  const color = isDark ? "#1A1A1A" : "#FAF6EE";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}, [currentScreen]);
```

### Trigger PWA (dans auth flow)
- Après connexion réussie → vérifier `window.matchMedia('(display-mode: standalone)')` 
- Si non-PWA + mobile → afficher bannière "Installer l'app" (pas de popup forcé)
- Si PWA → rediriger vers `/dashboard` sans la bannière

---

## Composants clés — spécifications

### `<Button>`

```tsx
// variants
type ButtonVariant = "primary" | "dark" | "ghost" | "ghost-light";
type ButtonSize = "sm" | "md" | "lg";

// primary → bg [--btn], text [--body], pill
// dark    → bg [--body], text white, pill
// ghost   → transparent + border [--line], text [--body], pill
// ghost-light → transparent + border white/20, text white, pill (pour fonds dark)

// Toujours pill (rounded-full)
// CTA avec icône ChevronRight à droite
```

### `<Icon>`

```tsx
// Composant unique pour tous les SVG
<Icon name="calendar" size={20} stroke="currentColor" strokeWidth={1.7} />

// 45 icônes : voir claude_code_handoff/design_reference/05_v2_dark_editorial/icons.jsx
// Stroke par défaut : 1.7 / Fill : none
// Ajouter icônes manquantes en suivant le même style
```

### `<Nav>`

```tsx
// Desktop : logo + liens + "Se connecter" (ghost) + "Réserver" (primary miel)
// Mobile  : logo + burger → Sheet fullscreen avec liens
// Variant "dark" (sur fonds --body) vs variant clair
// Prop `currentPath` pour marquer la page active
```

### `<PageHeader>`

```tsx
// Fond --body, texte blanc
// Structure : eyebrow (mono) + H1 (Fraunces) + lead (Inter)
// Utilisé en haut de chaque page hors landing
```

---

## Règles TypeScript

- **ZÉRO `any`** — utiliser `unknown` + type guards si nécessaire
- **Dates** : toujours `string` format `"YYYY-MM-DD"` / `"HH:mm"` — jamais `Date` object ni ISO
- **Fonctions exportées** : types explicites
- **`interface`** pour objets, **`type`** pour unions/intersections
- Fichiers < 200 lignes (composants), < 250 (hooks), < 150 (pages)

### Helper `cn()`

```ts
// src/lib/cn.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

---

## Checklist par page

- [ ] Responsive : mobile (< 560px) / tablette (560–960px) / desktop (> 960px)
- [ ] États : loading / empty / error
- [ ] A11y : landmarks, focus visible, contraste AA, labels form
- [ ] SEO (site public) : title, meta description, og:image
- [ ] I18n-ready : strings via helper `t()` (FR par défaut)
- [ ] Pas d'emoji dans le produit final
- [ ] Pas de gradients agressifs, pas de glassmorphism

---

## Commandes

```bash
# Depuis la racine monorepo
pnpm --filter @coworking-cafe/site-v2 dev      # Port 3002
pnpm --filter @coworking-cafe/site-v2 build
pnpm --filter @coworking-cafe/site-v2 type-check

# Avec Turbopack (plus rapide en dev)
pnpm --filter @coworking-cafe/site-v2 dev -- --turbo
```

---

## Assets manquants (placeholders à remplacer)

- 4 photos espaces : open-space, Salle Verrière, Salle Étage, Événementiel
- Logo SVG définitif
- 6–10 portraits équipe/partenaires
- Photos hero landing

Utiliser des `div` colorés en attendant, pas d'images stock.

---

**Branche** : `v2/site`
**Port dev** : 3002
**Dernière mise à jour** : 2026-04-21
