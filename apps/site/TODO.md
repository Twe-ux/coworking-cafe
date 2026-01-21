# 📋 TODO - apps/site Refactoring

> **Objectif** : Réécrire apps/site depuis /source/ en respectant les conventions strictes
> **Début** : 21 janvier 2026
> **Durée estimée** : 18 jours (7 phases)
> **Source de vérité** : `/source/src/app/(site)/`

---

## ⚠️ IMPORTANT - TENIR À JOUR CE FICHIER

**À FAIRE APRÈS CHAQUE TÂCHE TERMINÉE** :
1. ✅ Remplacer ⏳ par ✅ pour la tâche terminée
2. 📊 Mettre à jour le % dans le résumé de la phase
3. 📊 Mettre à jour le tableau "RÉSUMÉ GLOBAL" (fin du fichier)
4. 💾 Commit avec message descriptif
5. 📋 Mettre à jour `/PROGRESS.md` à la fin de chaque phase

**Exemple de workflow** :
```bash
# 1. Terminer une tâche
# → Éditer TODO.md : ⏳ → ✅

# 2. Commit
git add apps/site/TODO.md
git commit -m "feat(site): terminer tâche XYZ (Phase 1)"

# 3. À la fin de la phase
# → Mettre à jour /PROGRESS.md
# → Commit global
```

---

## 🎯 LÉGENDE

- ✅ **Terminé** - Fonctionnel et validé
- 🚧 **En cours** - En développement
- ⏳ **Planifié** - À faire
- ❌ **Bloqué** - Dépendance non résolue

---

## 📦 PHASE 0: PRÉPARATION (TERMINÉ)

### Documentation
- ✅ Créer CLAUDE.md pour apps/site (4269 lignes)
- ✅ Créer SEO_STRATEGY.md complet
- ✅ Créer PACKAGES_ARCHITECTURE.md (33 models)
- ✅ Créer DEPLOYMENT.md (Northflank)
- ✅ Organiser /docs avec sous-dossiers
- ✅ Corriger références source vs src-old dans CLAUDE.md

### Models Partagés (packages/database)
- ✅ Créer models Auth (Permission, Session)
- ✅ Créer models HR (TimeEntry, Shift, Availability)
- ✅ Créer models Booking (Booking complet)
- ✅ Créer models Blog (Comment)
- ✅ Créer models Messaging (Conversation, Message)
- ✅ Créer lib/stripe.ts avec helpers
- ✅ Exporter tous les models dans index.ts
- ✅ Corriger erreurs TypeScript
- ✅ Valider build (pnpm type-check)

**Status Phase 0** : ✅ **100% TERMINÉ**

---

## 🚀 PHASE 1: FONDATIONS (3 jours)

**Objectif** : Setup structure, types, utils, SCSS base

### 1.1 Structure de Base
- ⏳ Créer arborescence src/ complète
  - ⏳ /app (pages Next.js)
  - ⏳ /components (composants réutilisables)
  - ⏳ /lib (utilitaires)
  - ⏳ /types (types TypeScript)
  - ⏳ /hooks (custom hooks)
  - ⏳ /store (Redux si nécessaire)
  - ⏳ /assets (SCSS, images)

### 1.2 Types TypeScript
- ⏳ Créer types/booking.ts
  - ⏳ BookingFormData
  - ⏳ PriceCalculation
  - ⏳ ReservationDetails
- ⏳ Créer types/user.ts
  - ⏳ ClientProfile
  - ⏳ UserSettings
- ⏳ Créer types/blog.ts
  - ⏳ ArticlePreview
  - ⏳ ArticleFull
  - ⏳ CategoryWithCount
- ⏳ Créer types/common.ts
  - ⏳ ApiResponse<T>
  - ⏳ PaginatedResult<T>

### 1.3 Utilitaires
- ⏳ Créer lib/format-date.ts
  - ⏳ formatDate(date: string): string
  - ⏳ formatTime(time: string): string
  - ⏳ formatDateTime(date: string, time: string): string
- ⏳ Créer lib/validation.ts
  - ⏳ validateEmail(email: string): boolean
  - ⏳ validatePhone(phone: string): boolean
  - ⏳ validateBookingForm(data: BookingFormData): ValidationResult
- ⏳ Créer lib/api-client.ts
  - ⏳ fetchAPI<T>(url: string, options): Promise<ApiResponse<T>>
  - ⏳ handleApiError(error: unknown): string

### 1.4 SCSS Base
- ⏳ Migrer assets/site/scss/_variables.scss
- ⏳ Migrer assets/site/scss/_mixins.scss
- ⏳ Créer assets/site/scss/_base.scss
- ⏳ Créer assets/site/scss/_layout.scss
- ⏳ Vérifier nomenclature BEM

### 1.5 Configuration
- ⏳ Configurer next.config.js (images, i18n)
- ⏳ Configurer tsconfig.json (paths aliases)
- ⏳ Créer .env.example
- ⏳ Documenter variables d'environnement

**Status Phase 1** : ⏳ **0% TERMINÉ**

---

## 🔌 PHASE 2: APIs BACKEND (3 jours)

**Objectif** : Créer toutes les API routes

### 2.1 APIs Booking
- ⏳ POST /api/booking/calculate-price
  - ⏳ Calcul prix côté serveur
  - ⏳ Validation promo codes
  - ⏳ Calcul services additionnels
- ⏳ POST /api/booking/create
  - ⏳ Validation double-booking
  - ⏳ Création Payment Intent Stripe
  - ⏳ Création réservation (status: pending)
- ⏳ GET /api/booking/[id]
  - ⏳ Récupérer détails réservation
- ⏳ DELETE /api/booking/[id]/cancel
  - ⏳ Annuler réservation
  - ⏳ Rembourser via Stripe

### 2.2 APIs User
- ⏳ GET /api/user/profile
  - ⏳ Récupérer profil client
- ⏳ PUT /api/user/profile
  - ⏳ Mettre à jour profil
- ⏳ GET /api/user/reservations
  - ⏳ Historique réservations
  - ⏳ Pagination

### 2.3 APIs Blog
- ⏳ GET /api/blog/articles
  - ⏳ Liste articles publiés
  - ⏳ Filtres (catégorie, tag, recherche)
  - ⏳ Pagination
- ⏳ GET /api/blog/articles/[slug]
  - ⏳ Détails article
  - ⏳ Increment view count
- ⏳ GET /api/blog/categories
  - ⏳ Liste catégories avec count
- ⏳ POST /api/blog/comments
  - ⏳ Créer commentaire (status: pending)

### 2.4 APIs Contact & Newsletter
- ⏳ POST /api/contact
  - ⏳ Envoyer email contact
  - ⏳ Sauvegarder en DB
- ⏳ POST /api/newsletter/subscribe
  - ⏳ Abonner à newsletter

### 2.5 Webhooks Stripe
- ⏳ POST /api/webhooks/stripe
  - ⏳ Vérifier signature
  - ⏳ Gérer payment_intent.succeeded
  - ⏳ Gérer payment_intent.payment_failed
  - ⏳ Mettre à jour réservation
  - ⏳ Envoyer email confirmation

**Status Phase 2** : ⏳ **0% TERMINÉ**

---

## 🎨 PHASE 3: UI COMPONENTS (4 jours)

**Objectif** : Créer composants réutilisables

### 3.1 Layout Components
- ⏳ Header
  - ⏳ Navigation principale
  - ⏳ Menu mobile responsive
  - ⏳ User menu (si connecté)
- ⏳ Footer
  - ⏳ Links légaux
  - ⏳ Social media
  - ⏳ Newsletter form
- ⏳ Breadcrumb
- ⏳ ScrollToTop

### 3.2 Booking Components
- ⏳ BookingForm
  - ⏳ Step 1: Sélection (space, date, time)
  - ⏳ Step 2: Détails (personnes, services)
  - ⏳ Step 3: Coordonnées
  - ⏳ Step 4: Récapitulatif
  - ⏳ Step 5: Paiement Stripe
  - ⏳ Step 6: Confirmation
- ⏳ SpaceCard
  - ⏳ Image + description
  - ⏳ Prix dès X€
  - ⏳ Bouton réserver
- ⏳ PriceCalculator
  - ⏳ Affichage prix en temps réel
  - ⏳ Détail des services
- ⏳ CalendarPicker
  - ⏳ Sélection date
  - ⏳ Blocage dates indisponibles

### 3.3 Blog Components
- ⏳ ArticleCard
  - ⏳ Image
  - ⏳ Titre, extrait
  - ⏳ Catégorie, date
- ⏳ ArticleList
  - ⏳ Grid responsive
  - ⏳ Pagination
- ⏳ CategoryFilter
- ⏳ SearchBar
- ⏳ CommentList
  - ⏳ Nested comments
  - ⏳ Likes
- ⏳ CommentForm

### 3.4 Dashboard Components
- ⏳ ReservationCard
  - ⏳ Statut (upcoming/past/cancelled)
  - ⏳ Bouton annuler
- ⏳ ProfileForm
- ⏳ SettingsForm

### 3.5 Common Components
- ⏳ Button (variants: primary, secondary, outline)
- ⏳ Input (text, email, tel, textarea)
- ⏳ Select
- ⏳ Checkbox
- ⏳ Radio
- ⏳ Card
- ⏳ Alert (success, error, warning, info)
- ⏳ Spinner / Loader
- ⏳ Modal
- ⏳ Tooltip

**Status Phase 3** : ⏳ **0% TERMINÉ**

---

## 📄 PHASE 4: PAGES PUBLIQUES (3 jours)

**Objectif** : Créer toutes les pages site public

### 4.1 Pages Marketing
- ⏳ Homepage (/)
  - ⏳ Hero section
  - ⏳ Services overview
  - ⏳ Espaces preview
  - ⏳ Témoignages
  - ⏳ CTA réservation
- ⏳ Concept (/concept)
  - ⏳ Présentation Anticafé
  - ⏳ Comment ça marche
- ⏳ Espaces (/espaces)
  - ⏳ Liste espaces avec cards
  - ⏳ Filtres
- ⏳ Tarifs (/tarifs)
  - ⏳ Grilles tarifaires
  - ⏳ Comparaison formules
- ⏳ Offres étudiants (/offres-etudiants)
- ⏳ Programme fidélité (/programme-fidelite)

### 4.2 Pages Booking
- ⏳ Booking flow (/booking)
  - ⏳ 6 étapes complètes
  - ⏳ Intégration Stripe Elements
  - ⏳ Gestion erreurs
- ⏳ Confirmation (/booking/confirmation/[id])
  - ⏳ Récapitulatif réservation
  - ⏳ Télécharger reçu

### 4.3 Pages Blog
- ⏳ Liste articles (/blog)
  - ⏳ Grid responsive
  - ⏳ Filtres catégories
  - ⏳ Recherche
  - ⏳ Pagination
- ⏳ Article (/blog/[slug])
  - ⏳ Contenu Markdown
  - ⏳ Commentaires
  - ⏳ Articles similaires
- ⏳ Catégorie (/blog/category/[slug])

### 4.4 Pages Légales
- ⏳ Contact (/contact)
  - ⏳ Formulaire contact
  - ⏳ Infos pratiques
- ⏳ Mentions légales (/mentions-legales)
- ⏳ CGU (/cgu)
- ⏳ Confidentialité (/confidentialite)

**Status Phase 4** : ⏳ **0% TERMINÉ**

---

## 👤 PHASE 5: DASHBOARD CLIENT (2 jours)

**Objectif** : Créer dashboard pour clients

### 5.1 Pages Dashboard
- ⏳ Layout dashboard
  - ⏳ Sidebar navigation
  - ⏳ User menu
- ⏳ Mes réservations (/dashboard/reservations)
  - ⏳ Upcoming bookings
  - ⏳ Past bookings
  - ⏳ Cancelled bookings
  - ⏳ Bouton annuler
- ⏳ Mon profil (/dashboard/profile)
  - ⏳ Formulaire édition
  - ⏳ Upload avatar
- ⏳ Paramètres (/dashboard/settings)
  - ⏳ Notifications
  - ⏳ Préférences
- ⏳ Messages (/dashboard/messages)
  - ⏳ Liste conversations
  - ⏳ Chat interface
  - ⏳ WebSocket real-time

### 5.2 Hooks Dashboard
- ⏳ useReservations()
- ⏳ useProfile()
- ⏳ useMessages()

**Status Phase 5** : ⏳ **0% TERMINÉ**

---

## 🔐 PHASE 6: AUTHENTIFICATION (1 jour)

**Objectif** : Système auth NextAuth

### 6.1 Pages Auth
- ⏳ Login (/login)
  - ⏳ Email + password
  - ⏳ Lien mot de passe oublié
- ⏳ Register (/register)
  - ⏳ Formulaire inscription
  - ⏳ Validation email
- ⏳ Forgot password (/forgot-password)
  - ⏳ Envoi email reset
- ⏳ Reset password (/reset-password/[token])
  - ⏳ Formulaire nouveau password

### 6.2 Configuration NextAuth
- ⏳ Configurer providers (Credentials)
- ⏳ Configurer callbacks
- ⏳ Configurer pages custom
- ⏳ Middleware protection routes

### 6.3 Hooks Auth
- ⏳ useAuth()
- ⏳ useSession()

**Status Phase 6** : ⏳ **0% TERMINÉ**

---

## ✅ PHASE 7: TESTS & OPTIMISATION (2 jours)

**Objectif** : Validation complète avant prod

### 7.1 Tests Manuels
- ⏳ Booking flow complet
  - ⏳ Sélection espace
  - ⏳ Calcul prix
  - ⏳ Paiement Stripe (test mode)
  - ⏳ Webhook confirmation
  - ⏳ Email confirmation
- ⏳ Annulation réservation
  - ⏳ Remboursement Stripe
- ⏳ Blog
  - ⏳ Affichage articles
  - ⏳ Commentaires
  - ⏳ Recherche/filtres
- ⏳ Dashboard client
  - ⏳ Historique réservations
  - ⏳ Édition profil
- ⏳ Auth flow
  - ⏳ Login/logout
  - ⏳ Inscription
  - ⏳ Reset password

### 7.2 SEO
- ⏳ Vérifier metadata toutes pages
- ⏳ Tester Schema.org (Google Rich Results)
- ⏳ Vérifier sitemap.xml
- ⏳ Tester robots.txt
- ⏳ Lighthouse audit (score > 90)

### 7.3 Performance
- ⏳ next/image partout
- ⏳ Lazy loading composants
- ⏳ Code splitting
- ⏳ Compression images
- ⏳ Core Web Vitals
  - ⏳ LCP < 2.5s
  - ⏳ FID < 100ms
  - ⏳ CLS < 0.1

### 7.4 Responsive
- ⏳ Mobile (< 768px)
- ⏳ Tablet (768px - 1024px)
- ⏳ Desktop (> 1024px)

### 7.5 TypeScript
- ⏳ pnpm type-check (0 erreurs)
- ⏳ pnpm lint (0 warnings)
- ⏳ pnpm build (succès)

**Status Phase 7** : ⏳ **0% TERMINÉ**

---

## 📊 RÉSUMÉ GLOBAL

| Phase | Nom | Durée | Status | % |
|-------|-----|-------|--------|---|
| 0 | Préparation | - | ✅ Terminé | 100% |
| 1 | Fondations | 3j | ⏳ Planifié | 0% |
| 2 | APIs Backend | 3j | ⏳ Planifié | 0% |
| 3 | UI Components | 4j | ⏳ Planifié | 0% |
| 4 | Pages Publiques | 3j | ⏳ Planifié | 0% |
| 5 | Dashboard Client | 2j | ⏳ Planifié | 0% |
| 6 | Authentification | 1j | ⏳ Planifié | 0% |
| 7 | Tests & Optim | 2j | ⏳ Planifié | 0% |

**TOTAL** : 18 jours | **Progression globale** : 5.5% (Phase 0 uniquement)

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat (Phase 1)
1. Créer arborescence src/ complète
2. Définir types TypeScript de base
3. Créer utilitaires format-date, validation
4. Migrer SCSS variables + mixins

### Cette semaine
- Terminer Phase 1 (Fondations)
- Démarrer Phase 2 (APIs Backend)

### Ce mois
- Terminer Phases 1-4 (site public fonctionnel)
- Démarrer Phase 5 (dashboard client)

---

**Dernière mise à jour** : 21 janvier 2026
**Par** : Thierry + Claude Sonnet 4.5

