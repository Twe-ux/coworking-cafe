# Phase 4 : Harmonisation SCSS BEM

> **Objectif** : Harmoniser le nommage SCSS selon conventions BEM modifiées
> **Status** : 📋 Planifié - Pas encore commencé
> **Date création** : 2026-02-08

---

## 📊 État des Lieux

### Fichiers SCSS Critiques (> 300 lignes)

**Total identifié** : 9 fichiers à découper/harmoniser

| Fichier | Lignes | Priorité | Issues |
|---------|--------|----------|--------|
| `_booking.scss` | 1408 | 🔥 P0 | Trop long + nommage mixte |
| `_student-offers.scss` | 579 | 🟠 P1 | Nommage à harmoniser |
| `_spaces.scss` | 553 | 🟠 P1 | Nommage à harmoniser |
| `client-dashboard.scss` | 498 | 🔥 P0 | Trop long + pas BEM |
| `_members-program.scss` | 442 | 🟠 P1 | Nommage mixte |
| `_typography.scss` | 420 | 🟡 P2 | OK mais long |
| `_header.scss` | 340 | 🟡 P2 | Nommage à vérifier |
| `_projects.scss` | 338 | 🟡 P2 | Nommage mixte |
| `_cash-register.scss` | 337 | 🟡 P2 | OK mais long |

### Problèmes Identifiés

**1. Nommage Incohérent**
```scss
// ❌ Trouvés dans le code actuel
.heroOne { }              // camelCase
.hero-one { }             // kebab-case sans contexte
.hero_title { }           // underscore simple
.card1 { }                // Numérotation
.booking-form { }         // OK mais pas préfixé
```

**2. Fichiers Trop Longs**
- `_booking.scss` : 1408 lignes (limite : 300)
- `client-dashboard.scss` : 498 lignes

**3. Manque de Structure**
- Pas de découpage logique
- Mixte composants/pages dans un fichier
- Difficile à maintenir

---

## 🎯 Convention BEM Modifiée (Rappel)

### Règles Strictes

```scss
// ✅ BON - BEM modifié avec préfixe

// Pages
.page-home__hero { }
.page-home__hero-title { }
.page-home__hero-title--highlighted { }

// Composants génériques
.card { }
.card--primary { }
.card__header { }
.card__header-title { }

// Composants métier
.booking__form { }
.booking__form-field { }
.booking__form-field--error { }
```

### Schéma

```
.block                           # Bloc principal
.block--modifier                 # Modificateur du bloc
.block__element                  # Élément du bloc
.block__element--modifier        # Modificateur de l'élément
.block__element-child            # Sous-élément (tiret simple)
```

### Exemples Concrets

```scss
// Page Booking
.page-booking { }
.page-booking__container { }
.page-booking__header { }
.page-booking__header-title { }

// Composant Booking Form
.booking-form { }
.booking-form--horizontal { }
.booking-form__field { }
.booking-form__field--error { }
.booking-form__field-label { }
.booking-form__field-input { }
.booking-form__field-error-message { }
```

---

## 📋 Plan d'Action Détaillé

### Étape 1 : P0 - Booking + Dashboard (Jours 1-3)

#### 1.1 _booking.scss (1408 lignes → ~300 lignes découpage)

**Analyse Actuelle** :
```scss
// Tout dans un seul fichier :
- Styles page booking principale
- Styles formulaire sélection
- Styles formulaire détails
- Styles summary
- Styles confirmation
- Styles steps indicator
- Styles modales
```

**Découpage Proposé** :

```
scss/_components/booking/
├── _booking-main.scss (200)       # Page principale booking
├── _booking-form.scss (250)       # Formulaire général
├── _booking-steps.scss (150)      # Indicateur étapes
├── _booking-summary.scss (200)    # Page summary
├── _booking-confirmation.scss (180) # Page confirmation
├── _booking-modal.scss (150)      # Modales (cancel, etc.)
└── index.scss (30)                # Import tous les partials
```

**Migration BEM** :

```scss
// ❌ AVANT (nommage actuel à vérifier)
.booking-container { }
.booking-header { }
.form-field { }
.error-message { }

// ✅ APRÈS (BEM modifié)
.page-booking { }
.page-booking__container { }
.page-booking__header { }

.booking-form { }
.booking-form__field { }
.booking-form__field--error { }
.booking-form__error-message { }
```

---

#### 1.2 client-dashboard.scss (498 lignes → ~300 lignes)

**Découpage Proposé** :

```
scss/_pages/dashboard/
├── _dashboard-main.scss (180)     # Layout principal
├── _dashboard-nav.scss (120)      # Navigation sidebar
├── _dashboard-bookings.scss (150) # Section réservations
└── _dashboard-profile.scss (120)  # Section profil
```

**Migration BEM** :

```scss
// ✅ APRÈS
.page-dashboard { }
.page-dashboard__container { }
.page-dashboard__sidebar { }
.page-dashboard__content { }

.dashboard-nav { }
.dashboard-nav__item { }
.dashboard-nav__item--active { }
.dashboard-nav__icon { }

.dashboard-bookings { }
.dashboard-bookings__list { }
.dashboard-bookings__card { }
.dashboard-bookings__card-header { }
```

---

### Étape 2 : P1 - Pages Métier (Jours 4-5)

#### 2.1 _student-offers.scss (579 lignes → ~300 lignes)

**Découpage Proposé** :

```
scss/_pages/
├── _student-offers-hero.scss (150)
├── _student-offers-pricing.scss (200)
└── _student-offers-cta.scss (120)
```

**Migration BEM** :

```scss
.page-student-offers { }
.page-student-offers__hero { }
.page-student-offers__hero-title { }

.student-pricing { }
.student-pricing__card { }
.student-pricing__card--featured { }
.student-pricing__price { }
```

---

#### 2.2 _spaces.scss (553 lignes → ~300 lignes)

**Découpage Proposé** :

```
scss/_pages/
├── _spaces-hero.scss (150)
├── _spaces-grid.scss (200)
└── _spaces-card.scss (180)
```

**Migration BEM** :

```scss
.page-spaces { }
.page-spaces__hero { }
.page-spaces__grid { }

.space-card { }
.space-card--featured { }
.space-card__image { }
.space-card__content { }
.space-card__title { }
.space-card__description { }
.space-card__features { }
.space-card__features-item { }
.space-card__cta { }
```

---

#### 2.3 _members-program.scss (442 lignes → ~300 lignes)

**Découpage Proposé** :

```
scss/_pages/
├── _members-hero.scss (150)
├── _members-benefits.scss (180)
└── _members-tiers.scss (150)
```

**Migration BEM** :

```scss
.page-members { }
.page-members__hero { }
.page-members__benefits { }

.members-tier { }
.members-tier--premium { }
.members-tier__header { }
.members-tier__features { }
.members-tier__cta { }
```

---

### Étape 3 : P2 - Composants Globaux (Jours 6-7)

#### 3.1 _header.scss (340 lignes → harmonisation BEM)

**Migration BEM** :

```scss
// ✅ HARMONISER
.site-header { }
.site-header--transparent { }
.site-header__container { }
.site-header__logo { }
.site-header__nav { }
.site-header__nav-item { }
.site-header__nav-item--active { }
.site-header__cta { }
```

---

#### 3.2 _projects.scss (338 lignes → harmonisation BEM)

**Migration BEM** :

```scss
.projects { }
.projects__grid { }

.project-card { }
.project-card__image { }
.project-card__content { }
.project-card__title { }
.project-card__description { }
.project-card__tags { }
.project-card__tag { }
```

---

#### 3.3 _typography.scss (420 lignes → OK mais documenter)

**Action** : Vérifier cohérence, pas de découpage nécessaire

```scss
// Typography utilities - OK de rester long
// Mais vérifier nommage des classes utilitaires

// ✅ BON
.text-primary { }
.text-secondary { }
.heading-1 { }
.heading-2 { }

// ❌ ÉVITER
.h1 { }  // Trop court
.txt { } // Abréviation
```

---

## 🔧 Méthodologie de Migration

### Template de Migration d'un Fichier

```scss
// ===================================================
// AVANT (exemple _booking.scss ligne 1-50)
// ===================================================

.booking-container {
  padding: 20px;

  .booking-header {
    margin-bottom: 30px;

    h1 {
      font-size: 32px;
    }
  }

  .form {
    .field {
      margin-bottom: 20px;

      &.error {
        border-color: red;
      }
    }
  }
}

// ===================================================
// APRÈS (BEM modifié)
// ===================================================

.page-booking {
  padding: 20px;
}

.page-booking__header {
  margin-bottom: 30px;
}

.page-booking__header-title {
  font-size: 32px;
}

.booking-form {
  // Formulaire séparé du layout page
}

.booking-form__field {
  margin-bottom: 20px;
}

.booking-form__field--error {
  border-color: red;
}
```

### Workflow de Migration

```bash
# 1. Créer branche
git checkout -b refactor/phase4-scss-bem

# 2. Pour CHAQUE fichier à migrer :

# a) Copier fichier original
cp _booking.scss _booking.scss.backup

# b) Analyser structure actuelle
# - Identifier blocs principaux
# - Lister tous les sélecteurs
# - Repérer nommage non-BEM

# c) Créer mapping
# Créer fichier migration.md avec tableau :
# | Ancien | Nouveau | Notes |
# |--------|---------|-------|
# | .booking-container | .page-booking | Layout page |
# | .form .field | .booking-form__field | BEM |

# d) Migrer progressivement
# - Commencer par le bloc principal
# - Puis éléments enfants
# - Puis modificateurs

# e) Tester visuellement
npm run dev
# Vérifier pages affectées

# f) Commit
git add .
git commit -m "refactor(scss): migrer _booking.scss vers BEM (1408→300 lignes)"

# 3. Répéter pour chaque fichier
```

---

## 🧪 Validation et Tests

### Checklist Après Chaque Migration

- [ ] ✅ Build SCSS réussit (`npm run build`)
- [ ] ✅ Aucun sélecteur orphelin (classes CSS non utilisées)
- [ ] ✅ Pas de régression visuelle (comparer avant/après)
- [ ] ✅ Nommage cohérent BEM
- [ ] ✅ Fichier < 300 lignes (si découpage)
- [ ] ✅ Responsive OK
- [ ] ✅ Dark mode OK (si applicable)

### Tests Visuels Requis

**Pages à tester** :
- [ ] `/` - Homepage
- [ ] `/booking` - Toutes étapes booking
- [ ] `/spaces` - Page espaces
- [ ] `/student-offers` - Offres étudiants
- [ ] `/members-program` - Programme membres
- [ ] `/dashboard` - Dashboard client

**Breakpoints à tester** :
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1200px)
- [ ] Large (1920px)

---

## 📚 Guide BEM Complet

### Cas d'Usage Fréquents

#### 1. Page avec Section

```scss
.page-home { }
.page-home__hero { }
.page-home__hero-title { }
.page-home__hero-subtitle { }
.page-home__hero-cta { }

.page-home__about { }
.page-home__about-content { }
.page-home__about-image { }
```

#### 2. Composant avec États

```scss
.button { }
.button--primary { }
.button--secondary { }
.button--large { }
.button--disabled { }

.button__icon { }
.button__text { }
```

#### 3. Composant Complexe

```scss
.card { }
.card--highlighted { }
.card--bordered { }

.card__header { }
.card__header-title { }
.card__header-actions { }

.card__body { }
.card__body-text { }
.card__body-image { }

.card__footer { }
.card__footer-actions { }
.card__footer-metadata { }
```

#### 4. Listes

```scss
.nav { }
.nav--vertical { }
.nav--horizontal { }

.nav__list { }
.nav__item { }
.nav__item--active { }
.nav__link { }
.nav__icon { }
```

---

## 🗂️ Structure Finale SCSS

### Architecture Cible

```
src/assets/site/scss/
├── main.scss                      # Import principal
├── _variables.scss                # Variables globales
├── _mixins.scss                   # Mixins réutilisables
│
├── _base/
│   ├── _reset.scss
│   ├── _typography.scss
│   └── _utilities.scss
│
├── _layout/
│   ├── _grid.scss
│   ├── _container.scss
│   └── _spacing.scss
│
├── _components/
│   ├── _button.scss
│   ├── _card.scss
│   ├── _modal.scss
│   ├── _form.scss
│   ├── _header.scss
│   ├── _footer.scss
│   ├── _navigation.scss
│   │
│   ├── booking/                   # Dossier booking
│   │   ├── _booking-main.scss
│   │   ├── _booking-form.scss
│   │   ├── _booking-steps.scss
│   │   ├── _booking-summary.scss
│   │   ├── _booking-confirmation.scss
│   │   └── index.scss
│   │
│   └── dashboard/                 # Dossier dashboard
│       ├── _dashboard-main.scss
│       ├── _dashboard-nav.scss
│       └── index.scss
│
└── _pages/
    ├── _home.scss
    ├── _spaces.scss
    ├── _student-offers.scss
    ├── _members-program.scss
    └── _legal.scss
```

### main.scss (Import Order)

```scss
// Variables & Mixins
@import 'variables';
@import 'mixins';

// Base
@import 'base/reset';
@import 'base/typography';
@import 'base/utilities';

// Layout
@import 'layout/grid';
@import 'layout/container';
@import 'layout/spacing';

// Components génériques
@import 'components/button';
@import 'components/card';
@import 'components/modal';
@import 'components/form';
@import 'components/header';
@import 'components/footer';
@import 'components/navigation';

// Components métier
@import 'components/booking';      // → booking/index.scss
@import 'components/dashboard';    // → dashboard/index.scss

// Pages
@import 'pages/home';
@import 'pages/spaces';
@import 'pages/student-offers';
@import 'pages/members-program';
@import 'pages/legal';
```

---

## 📊 Métriques de Succès

### Objectifs Chiffrés

| Métrique | Avant | Objectif | Success |
|----------|-------|----------|---------|
| **Fichiers > 300 lignes** | 9 | 0 | ✅ |
| **Nommage BEM** | ~30% | 100% | ✅ |
| **Fichier le plus long** | 1408 lignes | < 300 | ✅ |
| **Duplication CSS** | ~20% | < 5% | ✅ |
| **Build SCSS** | OK | OK | ✅ |

### Avant/Après

```scss
// ❌ AVANT
.heroOne { }
.booking-container .form .field.error { }
.card1 { }
.header_nav { }

// ✅ APRÈS
.page-home__hero { }
.booking-form__field--error { }
.card--primary { }
.site-header__nav { }
```

---

## 📝 Documentation

### Créer Guide BEM pour l'Équipe

**Fichier** : `/docs/SCSS_BEM_GUIDE.md`

**Contenu** :
1. Convention BEM modifiée
2. Exemples concrets
3. Cas d'usage fréquents
4. Erreurs à éviter
5. Checklist avant commit

### Rapport Phase 4

**Fichier** : `/docs/REFACTO_PHASE4_REPORT.md`

**Contenu** :
- Fichiers migrés (liste complète)
- Avant/Après (lignes, nommage)
- Difficultés rencontrées
- Régressions visuelles détectées
- Screenshots avant/après

---

## 🚨 Pièges à Éviter

### Erreurs Fréquentes

```scss
// ❌ MAUVAIS - Nesting trop profond
.page-booking {
  .container {
    .form {
      .field {
        .label {
          .icon { }
        }
      }
    }
  }
}

// ✅ BON - Plat avec BEM
.page-booking { }
.booking-form { }
.booking-form__field { }
.booking-form__field-label { }
.booking-form__field-label-icon { }
```

```scss
// ❌ MAUVAIS - Modificateur sans bloc
.--primary { }

// ✅ BON
.button--primary { }
```

```scss
// ❌ MAUVAIS - Élément d'élément
.card__header__title { }

// ✅ BON
.card__header { }
.card__header-title { }
```

---

## 📅 Timeline Estimée

| Jours | Tâches | Fichiers |
|-------|--------|----------|
| **J1-3** | P0 - Booking + Dashboard | 2 fichiers (gros) |
| **J4-5** | P1 - Pages métier | 3 fichiers |
| **J6-7** | P2 - Composants globaux | 4 fichiers |
| **J8** | Tests visuels complets | - |
| **J9** | Documentation + Guide | - |
| **J10** | PR Review + Merge | - |

**Durée totale estimée** : 10 jours

---

## 🎯 Résultat Final Attendu

### Avant Phase 4
```
📊 Stats SCSS
- Fichiers > 300 lignes : 9
- Plus gros fichier : 1408 lignes
- Nommage BEM : ~30%
- Maintenabilité : ⚠️ Difficile
- Cohérence : ❌ Mixte
```

### Après Phase 4
```
📊 Stats SCSS
- Fichiers > 300 lignes : 0 ✅
- Plus gros fichier : < 300 lignes ✅
- Nommage BEM : 100% ✅
- Maintenabilité : ✅ Facile
- Cohérence : ✅ Totale
- Documentation : ✅ Guide BEM complet
```

---

**Prêt à démarrer** : Migrer fichier par fichier, tester visuellement, ne rien casser ! 🎨
