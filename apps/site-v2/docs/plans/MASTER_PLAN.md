# MASTER PLAN — CoworKing Café Site V2

> Suivi d'avancement complet. Mise à jour après chaque session.
> Référence design : `claude_code_handoff/design_reference/05_v2_dark_editorial/`
> Branche : `v2/site` — Port dev : 3002

---

## Vue d'ensemble des phases

| Phase | Domaine | Status |
|-------|---------|--------|
| 1 | Site public (6 pages) | ✅ DONE |
| 2 | Auth (login, register, reset) | 🔲 TODO |
| 3 | Booking flow | 🔲 TODO |
| 4 | Dashboard membre (PWA) | 🔲 TODO |
| 5 | Intégrations backend | 🔲 TODO |
| 6 | Polish & production | 🔲 TODO |

---

## Phase 1 — Site public ✅ DONE

### Infrastructure
- [x] Next.js 15 + Tailwind v4 scaffold
- [x] Design tokens dans `globals.css` (`@theme {}`)
- [x] Fonts : Fraunces + Inter + JetBrains Mono via `next/font`
- [x] `cn()` helper (clsx + tailwind-merge)
- [x] SEO : `sitemap.ts`, `robots.ts`, `manifest.ts`
- [x] SEO : `opengraph-image.tsx` (edge runtime)
- [x] SEO : `LocalBusinessSchema.tsx` (JSON-LD schema.org)

### Composants UI
- [x] `Icon.tsx` — 45 icônes SVG inline, type-safe
- [x] `Button.tsx` — primary / dark / ghost / ghost-light
- [x] `Card.tsx` — default / cream / dark
- [x] `Chip.tsx` — chip / chip-dark / chip-btn + StatusDot
- [x] `sheet.tsx` — shadcn Sheet (@base-ui/react)

### Layout
- [x] `Nav.tsx` — desktop + mobile drawer (Sheet), variant light/dark
- [x] `NavWrapper.tsx` — client component avec `usePathname()`
- [x] `Footer.tsx` — 4 colonnes, fond #0B1513
- [x] `PageHeader.tsx` — fond dark, eyebrow + H1 + lead
- [x] `(site)/layout.tsx` — NavWrapper + main + Footer

### Pages
- [x] `/` — Landing (Hero + Espaces + Concept + Testimonials + CTA)
- [x] `/espaces` — 4 espaces en cards alternées
- [x] `/tarifs` — Plans pricing (toggle annuel/mensuel) + salles + FAQ
- [x] `/concept` — Manifesto + Piliers + Histoire + Timeline + Équipe
- [x] `/menu` — +40 boissons en 4 catégories
- [x] `/evenements` — Agenda + section Privatisation

### Build
- [x] 0 erreurs TypeScript
- [x] 12 routes statiques (SSG)
- [x] Bundle size OK (< 120 kB First Load JS)

---

## Phase 2 — Auth 🔲 TODO

> Référence : `claude_code_handoff/01_auth.html`

### Infrastructure Auth
- [ ] NextAuth v4 config (`src/lib/auth.ts`)
  - Magic link (email) en priorité
  - Password fallback
  - Provider `@coworking-cafe/database` (MongoDB)
- [ ] Route `app/api/auth/[...nextauth]/route.ts`
- [ ] Middleware `middleware.ts` — protège `/dashboard/**` et `/booking/checkout`
- [ ] `(auth)/layout.tsx` — layout minimal sans Nav/Footer

### Pages Auth
- [ ] `/login` — email magic link + password fallback
- [ ] `/register` — création compte (email + nom + password)
- [ ] `/reset` — reset password (email + nouveau mot de passe)

### Types
- [ ] `src/types/user.ts` — `User`, `Session`

### Composants Auth
- [ ] `src/components/auth/AuthCard.tsx` — wrapper carte centrée
- [ ] `src/components/auth/MagicLinkForm.tsx` — formulaire email
- [ ] `src/components/auth/PasswordForm.tsx` — formulaire password

### Hooks
- [ ] `src/hooks/useAuth.ts` — wrapper `useSession()` + helpers

### Post-auth
- [ ] Trigger PWA : après connexion → bannière "Installer l'app"
- [ ] Redirect logic : PWA → `/dashboard`, browser → `/dashboard`

---

## Phase 3 — Booking Flow 🔲 TODO

> Référence : `claude_code_handoff/02_booking_flow.html`

### Architecture
- [ ] Route `/booking/page.tsx` — gestion steps via `searchParams` (`?step=1`)
- [ ] Mobile : 4 étapes séquentielles
- [ ] Desktop : 3 colonnes (steps + récap live + résumé)

### Types
- [ ] `src/types/booking.ts` — `BookingStep`, `BookingState`, `BookingService`

### Hooks
- [ ] `src/hooks/useBooking.ts` — state machine des étapes, prix, services

### Composants
- [ ] `src/components/booking/BookingFlow.tsx` — orchestrateur
- [ ] `src/components/booking/steps/Step1Space.tsx` — choix espace
- [ ] `src/components/booking/steps/Step2DateTime.tsx` — date + heure
- [ ] `src/components/booking/steps/Step3Options.tsx` — services additionnels
- [ ] `src/components/booking/steps/Step4Confirm.tsx` — récap + Stripe
- [ ] `src/components/booking/BookingSummary.tsx` — colonne récap desktop

### Intégration Stripe
- [ ] `src/lib/stripe.ts` — lazy init
- [ ] `app/api/checkout/route.ts` — création PaymentIntent
- [ ] `app/api/webhook/route.ts` — traitement webhook Stripe

---

## Phase 4 — Dashboard Membre (PWA) 🔲 TODO

> Référence : `claude_code_handoff/05_v2_dark_editorial/dashboard.html` (desktop)
> Référence : `claude_code_handoff/03_dashboard_mobile.html` (mobile/PWA)

### Architecture PWA
- [ ] `dashboard/layout.tsx` — Auth guard + PWA shell
  - `height: 100svh; overflow: hidden` sur html/body
  - `.dashboard-screen` → `overflow-y: auto` (scroll ici seulement)
  - `<TabBar>` sticky bottom
- [ ] `public/manifest.json` — `start_url: /dashboard`, `scope: /dashboard`
- [ ] Theme-color dynamique selon la page active

### Types
- [ ] `src/types/dashboard.ts` — `DashboardScreen`, `Booking`, `LoyaltyData`

### Hooks
- [ ] `src/hooks/useDashboardNavigation.ts` — tab active + history
- [ ] `src/hooks/usePWA.ts` — détection mode PWA + prompt install
- [ ] `src/hooks/useThemeColor.ts` — meta theme-color dynamique

### Composants Shell
- [ ] `src/components/dashboard/DashboardShell.tsx` — app shell
- [ ] `src/components/dashboard/TabBar.tsx` — bottom nav mobile (5 tabs)
- [ ] `src/components/dashboard/Sidebar.tsx` — nav desktop

### Écrans Dashboard
- [ ] `screens/HomeScreen.tsx` — prochaine résa + solde + actions rapides
- [ ] `screens/BookingsScreen.tsx` — réservations à venir
- [ ] `screens/HistoryScreen.tsx` — historique + factures
- [ ] `screens/WalletScreen.tsx` — solde + recharger
- [ ] `screens/LoyaltyScreen.tsx` — programme fidélité + badges
- [ ] `screens/ProfileScreen.tsx` — infos perso + préférences
- [ ] `screens/EventsScreen.tsx` — événements + inscriptions
- [ ] `screens/DirectoryScreen.tsx` — annuaire membres

### Routes Dashboard
- [ ] `app/dashboard/page.tsx` → redirect vers `home` screen
- [ ] `app/dashboard/[section]/page.tsx` — route dynamique par section

---

## Phase 5 — Intégrations Backend 🔲 TODO

> Package partagé : `@coworking-cafe/database` (MongoDB + Mongoose)

### API Routes
- [ ] `app/api/bookings/route.ts` — GET/POST réservations
- [ ] `app/api/bookings/[id]/route.ts` — GET/PATCH/DELETE
- [ ] `app/api/spaces/route.ts` — GET espaces disponibles
- [ ] `app/api/user/profile/route.ts` — GET/PATCH profil
- [ ] `app/api/user/wallet/route.ts` — GET solde + transactions
- [ ] `app/api/loyalty/route.ts` — GET points + badges
- [ ] `app/api/events/route.ts` — GET événements + inscription

### Services
- [ ] `src/lib/bookings.ts` — CRUD réservations
- [ ] `src/lib/availability.ts` — calcul disponibilités
- [ ] `src/lib/pricing.ts` — calcul tarifs (-15% semaine, -40% mois)
- [ ] `src/lib/loyalty.ts` — calcul points fidélité

---

## Phase 6 — Polish & Production 🔲 TODO

### SEO avancé
- [ ] Metadata dynamique par page (titre, description, OG)
- [ ] Vérifier `sitemap.ts` — ajouter pages dynamiques (events)
- [ ] Schema.org Event pour les événements
- [ ] Canonical URLs

### Performance
- [ ] Images réelles → `next/image` avec `sizes` optimisés
- [ ] Vérifier Core Web Vitals (LCP, CLS, FID)
- [ ] `@next/bundle-analyzer` si bundle > 150 kB

### Assets manquants (client)
- [ ] 4 photos espaces (open-space, Verrière, Étage, Event)
- [ ] Logo SVG définitif
- [ ] 4 portraits équipe
- [ ] Photo hero landing

### Qualité
- [ ] Tester responsive : 375px / 768px / 1200px / 1440px
- [ ] Tester a11y : landmarks, contraste, focus
- [ ] Tester auth flow complet
- [ ] Tester booking + Stripe en mode test

### Deploy
- [ ] Configurer domaine (sous-domaine v2 pour test)
- [ ] Variables d'env Vercel
- [ ] Cron jobs (rappels, no-shows, rapport quotidien)
- [ ] Preview → Production promote

---

## Notes techniques

### Commandes utiles
```bash
pnpm --filter @coworking-cafe/site-v2 dev      # Port 3002
pnpm --filter @coworking-cafe/site-v2 build
pnpm --filter @coworking-cafe/site-v2 type-check
```

### Contraintes à respecter
- Composants < 200 lignes
- Hooks < 250 lignes
- Pages < 150 lignes
- ZÉRO `any`
- Dates : `"YYYY-MM-DD"` / `"HH:mm"` — jamais `Date` object

### Prochaine action
→ Phase 2 — Auth : lire `01_auth.html`, implémenter NextAuth + pages login/register/reset

---

*Dernière mise à jour : 2026-04-22*
