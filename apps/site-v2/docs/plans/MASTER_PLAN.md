# MASTER PLAN — CoworKing Café Site V2

> Suivi d'avancement complet. Mise à jour après chaque session.
> Référence design : `claude_code_handoff/design_reference/05_v2_dark_editorial/`
> Branche : `v2/site` — Port dev : 3002

---

## Vue d'ensemble des phases

| Phase | Domaine | Status |
|-------|---------|--------|
| 1 | Site public (6 pages) | ✅ DONE |
| 2 | Auth (login, register, reset) | ✅ DONE |
| 3 | Booking flow | ✅ DONE (UI) |
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

## Phase 2 — Auth ✅ DONE

> Référence : `claude_code_handoff/01_auth.html`

### Infrastructure Auth
- [x] NextAuth v4 config (`src/lib/auth.ts`) — CredentialsProvider + JWT callbacks
- [x] Route `app/api/auth/[...nextauth]/route.ts`
- [x] Route `app/api/auth/register/route.ts` — Zod validation, duplicate key 409
- [x] Middleware `src/middleware.ts` — protège `/dashboard/**` et `/booking/checkout`
- [x] `(auth)/layout.tsx` — layout minimal fond #DDE6DE, sans Nav/Footer
- [x] `src/app/providers.tsx` — SessionProvider wrapper
- [x] `src/app/layout.tsx` — body wrappé avec Providers

### Pages Auth
- [x] `/login` — email + password, split desktop, full-screen mobile
- [x] `/register` — 2 étapes (email+pw → infos+CGU), progress dots, incentive 1h
- [x] `/reset` — formulaire email + état succès (API email branchée Phase 5)

### Types
- [x] `src/types/user.ts` — `AuthUser` interface + module augmentation NextAuth

### Composants Auth (`src/components/auth/`)
- [x] `AuthLogo.tsx` — logo avec icône building + Fraunces + eyebrow mono
- [x] `AuthBrandPanel.tsx` — panneau dark gauche (desktop), stats, décors
- [x] `AuthField.tsx` — input avec focus ring sauge, label mono, forwardRef
- [x] `AuthDivider.tsx` — séparateur "OU" / "OU PAR EMAIL"
- [x] `SocialButton.tsx` — Apple/Google (disabled, "Disponible prochainement")
- [x] `PasswordStrength.tsx` — 4 barres colorées, 4 niveaux

### Hooks
- [x] `src/hooks/useAuth.ts` — wrapper `useSession()` + helpers
- [x] `src/app/(auth)/login/useLoginForm.ts` — 59 lignes
- [x] `src/app/(auth)/register/useRegisterForm.ts` — 103 lignes, fix CGU via setValue

### Architecture fichiers (tous < 200 lignes)
- `LoginForm.tsx` 169L / `RegisterForm.tsx` 120L / `Step1Form.tsx` 59L / `Step2Form.tsx` 102L

### Post-auth
- [ ] Trigger PWA : après connexion → bannière "Installer l'app"
- [ ] Redirect logic : PWA → `/dashboard`, browser → `/dashboard`

---

## Phase 3 — Booking Flow ✅ DONE (UI) / 🔲 Stripe TODO

> Référence : `claude_code_handoff/02_booking_flow.html`

### Architecture
- [x] Route `/booking/page.tsx` — hors route groups, plein écran
- [x] Mobile : 4 étapes séquentielles + sticky CTA bottom
- [x] Desktop : 3 colonnes (sidebar progress 240px + main + summary 380px)
- [x] Multi-venue : step 0 (VenueSelector) si `venues.length > 1`, invisible si 1 seul commerce

### Types (src/types/)
- [x] `booking.ts` — `BookingStep`, `BookingState`, `BookingService`, `PriceBreakdown`, `Space` + constantes `SPACES`, `BOOKING_SERVICES`, `TYPE_MULTIPLIERS`, `TYPE_LABELS` (69L)
- [x] `venue.ts` — `Venue` + `VENUES` constant (19L)

### Hooks
- [x] `src/hooks/useBooking.ts` — state machine, pricing, navigation multi-venue (146L)

### Composants
- [x] `src/components/booking/BookingFlow.tsx` — orchestrateur mobile+desktop (229L)
- [x] `src/components/booking/BookingProgress.tsx` — header mobile (segments) + sidebar desktop (cercles) (193L)
- [x] `src/components/booking/BookingSummary.tsx` — panneau right desktop (172L)
- [x] `src/components/booking/VenueSelector.tsx` — step 0 multi-venue, null si 1 seul (74L)
- [x] `src/components/booking/steps/Step1Space.tsx` — cards espace (110L)
- [x] `src/components/booking/steps/Step2DateTime.tsx` — type + date scroll + horaires + stepper (188L)
- [x] `src/components/booking/steps/Step3Options.tsx` — services + textarea (147L)
- [x] `src/components/booking/steps/Step4Confirm.tsx` — récap + breakdown + placeholder paiement (191L)

### Intégration Stripe (Phase 5)
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
→ Phase 4 — Dashboard Membre (PWA) : lire `dashboard.html` + `03_dashboard_mobile.html`

---

*Dernière mise à jour : 2026-04-26*
