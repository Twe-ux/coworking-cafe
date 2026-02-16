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
- ✅ SCSS: \_home.scss, \_concept.scss

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
- ✅ SCSS: \_booking.scss (650L)

### 4.4 Pages Blog & Contact (Agent 4)

- ✅ Liste articles (/blog)
  - ✅ Recherche + filtres
  - ✅ Pagination
- ✅ Article (/blog/[slug])
  - ✅ generateMetadata + Schema.org
  - ✅ CommentSection
- ✅ Catégorie (/blog/category/[slug])
- ✅ Contact (/contact) - Formulaire + Google Map
- ✅ SCSS: \_blog.scss, \_article.scss, \_contact.scss

### 4.5 Pages Légales (Agent 5)

- ✅ Mentions légales (716L) - Textes copiés mot pour mot
- ✅ CGU (833L) - 12 articles complets
- ✅ Politique confidentialité (888L) - RGPD détaillé
- ✅ ProtectedEmail component
- ✅ SCSS: \_legal.scss

### 4.6 Routes Manquantes Phase 4

- ✅ Manifest PWA (/manifest.ts) - PWA metadata
- ✅ Page Manifeste (/manifest) - Notre Manifeste (135L)
- ✅ Confidentialité (/confidentiality) - Redirect
- ✅ Horaires (/horaires) - Opening hours avec API (241L)
- ✅ Historique (/history) - Chronologie 2012-2023 (197L)
- ✅ Système Promo/Scan complet
  - ✅ /scan - Page scan QR avec animations (290L)
  - ✅ /promo/[token] - Affichage code promo (215L)
  - ✅ 6 APIs promo/scan (track, reveal, copy, current-token, [token], marketing)
  - ✅ promoService (427L)
  - ✅ Types promo.ts
  - ✅ SCSS: \_scan.scss, \_promo.scss
- ✅ /boissons - Liste boissons (75L)
- ✅ /take-away - Marketing take-away (175L)

**Status Phase 4** : ✅ **100% TERMINÉ** (Commits: 6b982c4, a79da47, be10812, 66c4911 - Toutes routes créées)

---

## 👤 PHASE 5: DASHBOARD CLIENT (2 jours)

**Objectif** : Créer dashboard pour clients

### 5.1 Layout + Overview (Agent 1)

- ✅ Layout dashboard (40L)
  - ✅ Middleware auth NextAuth (getServerSession)
  - ✅ Sidebar navigation responsive
  - ✅ User menu (avatar, nom, logout)
  - ✅ Mobile drawer
- ✅ Page overview (145L)
  - ✅ 4 stats personnelles (DashboardStats)
  - ✅ Dernières réservations (5)
  - ✅ CTA "Réserver"
- ✅ DashboardNav component (135L)
- ✅ DashboardStats component (75L)
- ✅ SCSS: \_dashboard.scss (445L)

### 5.2 Pages Réservations (Agent 2)

- ✅ Liste réservations (/dashboard/bookings) - 181L
  - ✅ 3 onglets filtres (prochaines/passées/annulées)
  - ✅ Pagination (10 par page)
  - ✅ BookingCard component
  - ✅ Empty state personnalisé
- ✅ Détail réservation (/dashboard/bookings/[id]) - 130L
  - ✅ generateMetadata() dynamique
  - ✅ BookingDetailCard (175L)
  - ✅ Modal annulation (CancelBookingModal 167L)
  - ✅ Actions (annuler, télécharger reçu)
- ✅ useBookings hook (151L): fetch, filtres, pagination
- ✅ SCSS: \_booking-card.scss (516L)

### 5.3 Profil + Paramètres (Agent 3)

- ✅ Mon profil (/dashboard/profile) - 108L
  - ✅ Affichage stats (réservations, dépensé, points)
  - ✅ ProfileForm (168L): validation inline
  - ✅ Upload avatar (optionnel)
- ✅ Paramètres (/dashboard/settings) - 237L
  - ✅ Section Notifications (6 toggles)
  - ✅ Section Confidentialité
  - ✅ Section Langue (FR/EN)
  - ✅ Section Compte (changer password, supprimer)
- ✅ SettingsSection component (36L)
- ✅ Toggle component (85L): accessible
- ✅ useProfile hook (92L): fetch, update, optimistic
- ✅ API /api/user/settings (101L): GET + PUT
- ✅ SCSS: 5 fichiers (330L total)

**Status Phase 5** : ✅ **100% TERMINÉ** (Commit: a9c85ec, 27 fichiers, 4,378 lignes)

---

## 🔐 PHASE 6: AUTHENTIFICATION (1 jour)

**Objectif** : Système auth NextAuth complet

### 6.1 Model PasswordResetToken (packages/database)

- ✅ Schema Mongoose (userId, token, expiresAt, used)
- ✅ Indexes pour performance
- ✅ Export dans models/index.ts

### 6.2 Helpers & Config

- ✅ auth-helpers.ts (200L)
  - ✅ hashPassword, verifyPassword
  - ✅ findUserByEmail, findUserById
  - ✅ createUser, hasPermission, hasRoleLevel
  - ✅ getUserRoleSlug, getRedirectPathByRole
  - ✅ initializeRoles (4 rôles par défaut)
- ✅ auth-options.ts (193L)
  - ✅ CredentialsProvider email/password
  - ✅ Callbacks: jwt, session, redirect
  - ✅ Session JWT 30 jours
  - ✅ Pages custom: /auth/login, /auth/error
  - ✅ Auto-init roles
- ✅ Email templates
  - ✅ password-reset.ts (HTML template)
  - ✅ send-email.ts (Helper, console.log en dev)

### 6.3 APIs Auth (4 routes)

- ✅ /api/auth/[...nextauth] - Handler NextAuth
- ✅ /api/auth/register (108L)
  - ✅ Validation complète
  - ✅ Création user avec role "client"
  - ✅ Gestion duplicate email
- ✅ /api/auth/forgot-password (94L)
  - ✅ Token crypto sécurisé (32 bytes)
  - ✅ Expiry 1 heure
  - ✅ Envoi email reset
- ✅ /api/auth/reset-password (88L)
  - ✅ Validation token (non utilisé + non expiré)
  - ✅ Update password (hash auto)
  - ✅ Marque token utilisé

### 6.4 Pages Auth (4 pages)

- ✅ Login (/auth/login)
  - ✅ page.tsx - Wrapper avec metadata
  - ✅ LoginForm.tsx (164L) - Form client-side
  - ✅ Toggle password visibility
  - ✅ Redirect /dashboard après succès
  - ✅ Liens: register, forgot-password
- ✅ Register (/auth/register)
  - ✅ page.tsx (260L) - Form complet
  - ✅ Champs: email, password, confirmPassword, givenName, username, newsletter
  - ✅ Validation inline
  - ✅ Auto-login après inscription
  - ✅ Toggle password (2 champs)
- ✅ Forgot password (/auth/forgot-password)
  - ✅ page.tsx (109L) - Form simple
  - ✅ Message succès
  - ✅ Lien retour login
- ✅ Reset password (/auth/reset-password)
  - ✅ page.tsx (216L) - Form avec token
  - ✅ Récupère token depuis query params
  - ✅ Validation passwords match
  - ✅ Redirect login après succès

### 6.5 SCSS & Styles

- ✅ \_auth.scss (182L) - BEM modifié
  - ✅ .page-auth, .auth-card, .auth-form
  - ✅ États: hover, focus, disabled, error
  - ✅ Responsive mobile
  - ✅ Accessibilité (aria-labels)
  - ✅ Toggle password positionné

### 6.6 Features

- ✅ Validation client + serveur
- ✅ Toggle password visibility (icône œil)
- ✅ Auto-login après register
- ✅ Token crypto sécurisé (32 bytes, expiry 1h)
- ✅ Messages erreur français
- ✅ Loading states
- ✅ Redirect selon rôle
- ✅ Sécurité: bcrypt, crypto token, cookies httpOnly

**Status Phase 6** : ✅ **100% TERMINÉ** (Commits: deb8891, f752f17 - 17 fichiers, ~2000 lignes)

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
- ⏳ Compression images → **Conversion WebP**
  - ✅ /images/professional/ (6 images) - **FAIT** : 4.2 MB → 608 KB (-86%)
  - ✅ /images/about/Rectangle105.png - **FAIT** : 247K → 22K (-91%)
  - ⏳ /images/ (racine) - og-image.png (3.2M) + og-image-optimized.png (442K)
  - ⏳ /images/membersPrograms/ - programme-membre-fidelite (1.2M)
  - ⏳ /images/testimonail/ - anticafé-strasbourg.png (392K)
  - ⏳ /images/example/ - 5 fichiers (~1.3M)
  - ⏳ Autres dossiers (scan complet fait - 42 images total)
  - **Gain estimé total** : ~8 MB → ~1.5 MB (-80%)
  - **Commandes** :
    ```bash
    # Conversion globale (toutes les images d'un coup)
    cd public/images
    for img in $(find . -type f \( -name "*.png" -o -name "*.jpg" \) | grep -v "_originals" | grep -v "backup"); do
      cwebp -q 85 "$img" -o "${img%.*}.webp"
    done

    # Nettoyage après validation (supprimer PNG/JPG originaux)
    # ⚠️ À faire APRÈS avoir migré le code vers .webp
    find . -type f \( -name "*.png" -o -name "*.jpg" \) | grep -v "_originals" | grep -v "backup" | xargs rm
    ```
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
| 5     | Dashboard Client | 2j    | ✅ Terminé  | 100% |
| 6     | Authentification | 1j    | ✅ Terminé  | 100% |
| 7     | Tests & Optim    | 2j    | ⏳ Planifié | 0%   |

**TOTAL** : 18 jours | **Progression globale** : 94.4% (Phases 0-6 terminées - 17/18 jours)

---

## 🎯 PROCHAINES ÉTAPES

### Immédiat (Phase 7 - Tests & Optimisation)

1. **Tests Manuels**
   - Booking flow complet (sélection → paiement → confirmation)
   - Annulation + remboursement Stripe
   - Blog (articles, commentaires, recherche)
   - Dashboard client (réservations, profil)
   - Auth flow (login, register, reset password)

2. **SEO**
   - Vérifier metadata toutes pages
   - Tester Schema.org (Google Rich Results)
   - Lighthouse audit (score > 90)
   - Sitemap.xml, robots.txt

3. **Performance**
   - Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
   - Next/image partout
   - Code splitting
   - Compression images

4. **Responsive**
   - Mobile (< 768px)
   - Tablet (768px - 1024px)
   - Desktop (> 1024px)

5. **TypeScript & Build**
   - pnpm type-check (0 erreurs)
   - pnpm lint (0 warnings)
   - pnpm build (succès)

### Cette semaine

- ✅ Phases 0-6 terminées (17/18 jours)
- ⏳ Phase 7 (Tests & Optimisation)

### Prêt pour production

- Tests complets + optimisation
- Déploiement Northflank
- Configuration email service production

---

**Dernière mise à jour** : 21 janvier 2026 (Phase 6 terminée)
**Par** : Thierry + Claude Sonnet 4.5
