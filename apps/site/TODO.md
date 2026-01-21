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

- ✅ Créer arborescence src/ complète
  - ✅ /app (pages Next.js)
  - ✅ /components (composants réutilisables)
  - ✅ /lib (utilitaires)
  - ✅ /types (types TypeScript)
  - ✅ /hooks (custom hooks)
  - ✅ /store (Redux si nécessaire)
  - ✅ /styles (SCSS)

### 1.2 Types TypeScript

- ✅ Créer types/booking.ts
  - ✅ BookingFormData
  - ✅ PriceCalculation
  - ✅ ReservationDetails
- ✅ Créer types/user.ts
  - ✅ ClientProfile
  - ✅ UserSettings
- ✅ Créer types/blog.ts
  - ✅ ArticlePreview
  - ✅ ArticleFull
  - ✅ CategoryWithCount
- ✅ Créer types/common.ts
  - ✅ ApiResponse<T>
  - ✅ PaginatedResult<T>

### 1.3 Utilitaires

- ✅ Créer lib/utils/format-date.ts
  - ✅ formatDate, formatTime, calculateHours (15 fonctions)
- ✅ Créer lib/utils/validation.ts
  - ✅ validateEmail, validatePhone, validatePassword (15+ fonctions)
- ✅ Créer lib/utils/api-client.ts
  - ✅ ApiClient class, handleApiError
- ✅ Créer lib/utils/format-price.ts
  - ✅ formatPrice, toCents, applyDiscount (14 fonctions)
- ✅ Créer lib/utils/slugify.ts
- ✅ Créer lib/utils/cn.ts

### 1.4 SCSS Base

- ✅ Créer styles/bootstrap/\_variables.scss
- ✅ Créer styles/bootstrap/\_mixins.scss
- ✅ Créer styles/base/\_reset.scss
- ✅ Créer styles/base/\_typography.scss
- ✅ Créer styles/base/\_utilities.scss
- ✅ Créer styles/main.scss

### 1.5 Configuration

- ✅ Configurer tsconfig.json (paths aliases vers src/)
- ✅ Créer .env.example
- ✅ Documenter variables d'environnement

**Status Phase 1** : ✅ **100% TERMINÉ** (Commit: 32b7cfe)

---

## 🔌 PHASE 2: APIs BACKEND (3 jours)

**Objectif** : Créer toutes les API routes

### 2.1 APIs Booking

- ✅ POST /api/booking/calculate
  - ✅ Calcul prix côté serveur
  - ✅ Validation promo codes
  - ✅ Vérification disponibilité
- ✅ POST /api/booking/create-payment-intent
  - ✅ Validation double-booking
  - ✅ Création Payment Intent Stripe
  - ✅ Création réservation (status: pending)
- ✅ GET /api/booking/[id]
  - ✅ Récupérer détails réservation (avec auth)
- ✅ POST /api/booking/[id]/cancel
  - ✅ Annuler réservation
  - ✅ Rembourser via Stripe

### 2.2 APIs User

- ✅ GET /api/user/profile
  - ✅ Récupérer profil client
- ✅ PUT /api/user/profile
  - ✅ Mettre à jour profil (firstName, lastName, phone, avatar)
- ✅ GET /api/user/bookings
  - ✅ Historique réservations
  - ✅ Pagination + filtres (status)

### 2.3 APIs Blog

- ✅ GET /api/blog/articles
  - ✅ Liste articles publiés
  - ✅ Filtres (catégorie, tag, recherche)
  - ✅ Pagination
- ✅ GET /api/blog/articles/[slug]
  - ✅ Détails article
  - ✅ Increment view count
  - ✅ Articles similaires
- ✅ GET /api/blog/categories
  - ✅ Liste catégories avec compteur articles
- ✅ POST /api/blog/comments
  - ✅ Créer commentaire (status: pending, avec auth)
  - ✅ Support réponses (parentId)

### 2.4 APIs Contact & Newsletter

- ✅ POST /api/contact
  - ✅ Validation formulaire
  - ✅ Sauvegarder en DB (ContactMail)
- ✅ POST /api/newsletter/subscribe
  - ✅ Abonner à newsletter (Newsletter)
  - ✅ Vérification doublon

### 2.5 Webhook Stripe

- ✅ POST /api/stripe/webhook
  - ✅ Vérifier signature
  - ✅ Gérer payment_intent.succeeded
  - ✅ Gérer payment_intent.payment_failed
  - ✅ Gérer charge.refunded
  - ✅ Mettre à jour réservation

**Status Phase 2** : ✅ **100% TERMINÉ** (Commit: 2f8258e, 12 API routes créées)

---

## 🎨 PHASE 3: UI COMPONENTS (4 jours)

**Objectif** : Créer composants réutilisables

### 3.1 Layout Components

- ✅ Header
  - ✅ Navigation principale
  - ✅ Menu mobile responsive
  - ✅ User menu (si connecté)
- ✅ Footer
  - ✅ Links légaux
  - ✅ Social media
  - ✅ Newsletter form (avec API intégrée)
- ✅ Navigation (composant séparé avec pathname active detection)
- ✅ Breadcrumb (avec Schema.org JSON-LD)

### 3.2 Booking Components

- ✅ BookingForm (formulaire complet avec inline validation)
- ✅ SpaceCard
  - ✅ Image + description
  - ✅ Prix dès X€
  - ✅ Bouton réserver
  - ✅ Badge type espace
  - ✅ Amenities list (3 premiers + compteur)
- ✅ BookingSummary
  - ✅ Affichage récapitulatif
  - ✅ Détails formatés (dates, prix)
- ✅ PriceDisplay
  - ✅ Affichage prix en temps réel
  - ✅ Animation sur changement
  - ✅ Détail breakdown (base, discount, total)

### 3.3 Blog Components

- ✅ ArticleCard
  - ✅ Image
  - ✅ Titre, extrait (truncate 2 lignes)
  - ✅ Catégorie, date, vues, temps lecture
- ✅ ArticleList
  - ✅ Grid responsive (1/2/3 colonnes)
  - ✅ Gestion liste vide
- ✅ CommentSection
  - ✅ Nested comments (récursif)
  - ✅ Auth check (login si non connecté)
  - ✅ Pagination commentaires
- ✅ CommentForm
  - ✅ Validation (1-2000 caractères)
  - ✅ Submit avec loading state
  - ✅ Gestion erreurs

### 3.4 Common Components

- ✅ Button (5 variants: primary, secondary, outline, ghost, danger)
- ✅ Card (3 variants: default, outlined, elevated)
  - ✅ Card.Header composition
  - ✅ Card.Body composition
  - ✅ Card.Footer composition
- ✅ Input (forwardRef, icons, error state)
- ✅ Select (options typées, placeholder, disabled)
- ✅ Modal (Portal, ESC key, backdrop click)
- ✅ Spinner (3 sizes: sm, md, lg)

### 3.5 Custom Hooks

- ✅ useBookingForm
  - ✅ State management (formData, errors, loading)
  - ✅ 14 règles de validation
  - ✅ API integration (/api/booking/calculate)
  - ✅ Result pattern (success/error)
  - ✅ Error clearing on change

### 3.6 Documentation

- ✅ LAYOUT_COMPONENTS.md (Header, Footer, Navigation, Breadcrumb)
- ✅ UI_COMPONENTS.md (Button, Card, Input, Select, Modal, Spinner)
- ✅ BOOKING_COMPONENTS.md (SpaceCard, BookingForm, BookingSummary, PriceDisplay)
- ✅ BLOG_COMPONENTS.md (ArticleCard, ArticleList, CommentSection, CommentForm)
- ✅ USE_BOOKING_FORM.md (Hook documentation complète)

**Status Phase 3** : ✅ **100% TERMINÉ** (~40 fichiers créés par 4 agents parallèles)

---

## 📄 PHASE 4: PAGES PUBLIQUES (3 jours)

**Objectif** : Créer toutes les pages site public

### 4.1 Pages Marketing (Agent 1)

- ✅ Homepage (/)
  - ✅ Hero section + stats
  - ✅ About section
  - ✅ Espaces preview
  - ✅ Témoignages
  - ✅ Blog preview
- ✅ Concept (/concept)
  - ✅ Histoire Anticafé
  - ✅ Forfaits
- ✅ SCSS: _home.scss, _concept.scss

### 4.2 Pages Offres (Agent 2)

- ✅ Espaces (/spaces) - SpaceCard, filtres
- ✅ Tarifs (/pricing) - Grilles, comparaison, FAQ
- ✅ Offres étudiants (/student-offers) - Réduction -25%
- ✅ Programme fidélité (/members-program) - 3 niveaux
- ✅ SCSS: 4 fichiers (1,411L)

### 4.3 Pages Booking (Agent 3)

- ✅ Booking flow (/booking) - 4 étapes
  - ✅ Sélection + formulaire
  - ✅ Confirmation + récapitulatif
  - ✅ Checkout Stripe Elements
  - ✅ Success + confirmation
- ✅ SCSS: _booking.scss (650L)

### 4.4 Pages Blog & Contact (Agent 4)

- ✅ Liste articles (/blog)
  - ✅ Recherche + filtres
  - ✅ Pagination
- ✅ Article (/blog/[slug])
  - ✅ generateMetadata + Schema.org
  - ✅ CommentSection
- ✅ Catégorie (/blog/category/[slug])
- ✅ Contact (/contact) - Formulaire + Google Map
- ✅ SCSS: _blog.scss, _article.scss, _contact.scss

### 4.5 Pages Légales (Agent 5)

- ✅ Mentions légales (716L) - Textes copiés mot pour mot
- ✅ CGU (833L) - 12 articles complets
- ✅ Politique confidentialité (888L) - RGPD détaillé
- ✅ ProtectedEmail component
- ✅ SCSS: _legal.scss

**Status Phase 4** : ✅ **100% TERMINÉ** (Commit: 6b982c4, ~20 pages, 11,076 lignes)

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

| Phase | Nom              | Durée | Status      | %    |
| ----- | ---------------- | ----- | ----------- | ---- |
| 0     | Préparation      | -     | ✅ Terminé  | 100% |
| 1     | Fondations       | 3j    | ✅ Terminé  | 100% |
| 2     | APIs Backend     | 3j    | ✅ Terminé  | 100% |
| 3     | UI Components    | 4j    | ✅ Terminé  | 100% |
| 4     | Pages Publiques  | 3j    | ✅ Terminé  | 100% |
| 5     | Dashboard Client | 2j    | ⏳ Planifié | 0%   |
| 6     | Authentification | 1j    | ⏳ Planifié | 0%   |
| 7     | Tests & Optim    | 2j    | ⏳ Planifié | 0%   |

**TOTAL** : 18 jours | **Progression globale** : 72.2% (Phases 0-4 terminées - 13/18 jours)

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat (Phase 4 - Pages Site Public)

**⚠️ ATTENTION: Ne pas copier-coller de /source/. Garder les textes originaux mot pour mot.**

1. **Pages Marketing**
   - Homepage (Hero, Services, Espaces, Témoignages, CTA)
   - Concept (Présentation Anticafé, Comment ça marche)
   - Espaces (Liste avec cards, filtres)
   - Tarifs (Grilles tarifaires, comparaison)

2. **Pages Booking Flow**
   - Booking form (6 étapes)
   - Confirmation
   - Success

3. **Pages Blog**
   - Liste articles (grid, filtres, recherche, pagination)
   - Détail article (Markdown, commentaires, similaires)
   - Catégorie

4. **Pages Légales**
   - Contact (formulaire)
   - Mentions légales
   - CGU
   - Confidentialité

### Cette semaine

- Terminer Phase 4 (Pages Publiques)
- Démarrer Phase 5 (Dashboard Client)

### Ce mois

- Terminer Phases 4-6 (site public + dashboard + auth)
- Phase 7 (Tests & optimisation)

---

**Dernière mise à jour** : 21 janvier 2026
**Par** : Thierry + Claude Sonnet 4.5
