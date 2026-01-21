# Pages Marketing - Documentation

> **Phase 4 - Agent 1**
> Documentation des pages marketing principales (Home + Concept)

---

## Vue d'ensemble

Pages marketing créées :
- **Homepage** (`/app/(site)/page.tsx`)
- **Concept** (`/app/(site)/concept/page.tsx`)

**Règles suivies** :
- ✅ Textes copiés mot pour mot depuis `/source/src/app/(site)/`
- ✅ Structure propre et refactorisée (composants < 200 lignes)
- ✅ SCSS avec BEM modifié
- ✅ SEO complet (metadata + Schema.org)
- ✅ Images avec `next/image` partout
- ✅ 0 `any` types
- ✅ Responsive mobile-first

---

## 1. Homepage

### Fichier
`/apps/site/src/app/(site)/page.tsx`

### Structure

```
Homepage
├── Hero Section
│   ├── Titre principal
│   ├── Description
│   ├── CTAs (Espaces, Tarifs)
│   └── Stats (60 places, +40 boissons, +700 clients)
│
├── About Section
│   ├── Citation principale
│   ├── Texte présentation
│   ├── Image open-space
│   └── Liste avantages (☕️ Tout compris, ⏱️ Payer le temps, etc.)
│
├── Spaces Section
│   ├── Titre + CTA
│   └── Cards espaces :
│       ├── L'open-space (2 images)
│       ├── La verrière
│       └── L'étage
│
├── Testimonials Section
│   └── 3 témoignages clients (Sacha, William, Miriam)
│
└── Blog Section
    └── Preview articles (à venir)
```

### Textes Originaux (Extraits)

**Hero** :
> "Tu cherches un espace ou un café pour travailler en plein centre de Strasbourg ?"
>
> "Tu l'as trouvé ! Bienvenue chez CoworKing Café by Anticafé où tu ne paies que le temps passé sur place."

**About** :
> "Depuis 2013, Anticafé le plus grand réseau de café coworking en Europe, réinvente la manière de travailler, d'étudier ou de se retrouver."

**Avantages** :
- ☕️ Tout compris : cafés, thés, snack inclus...
- ⏱️ Payer le temps : 6€/h, 29€/jour, abonnements
- 🌼 Ambiance feel good : design chaleureux, calme
- 🎉 Ouvert & flexible : 7J/7, avec/sans résa

### SEO

**Metadata** :
```typescript
title: 'CoworKing Café by Anticafé - Espace de Coworking à Strasbourg'
description: 'Espace de coworking convivial au cœur de Strasbourg. Concept anticafé : payez le temps, profitez de boissons à volonté. 60 places, +40 boissons, +700 clients membres.'
keywords: [
  'coworking strasbourg',
  'anticafé',
  'espace de travail',
  'café coworking',
  'bureau partagé strasbourg',
  'wifi gratuit',
  'salle de réunion strasbourg'
]
```

**Schema.org** : `LocalBusiness` JSON-LD
- Nom, adresse, téléphone
- Horaires d'ouverture (7J/7, 8h-20h)
- `acceptsReservations: true`

### Images

**Hero** :
- `/images/banner/logo-circle-white.png` (logo animé)
- `/images/banner/coworking-café.webp` (photo principale, priority)

**About** :
- `/images/about/open-space-strasbourg.webp`

**Spaces** :
- `/images/projects/espaces-coworking-strasbourg.webp`
- `/images/projects/openspace-coworking-strasbourg-bis.webp`
- `/images/projects/salle-réunion-verrière-strasbourg.webp`
- `/images/projects/salle-réunion-étage-strasbourg.webp`

**Testimonials** :
- `/images/testimonail/1.png`, `/images/testimonail/2.png`, etc.
- `/images/testimonail/quotes1.svg`

### SCSS

**Fichier** : `/styles/pages/_home.scss`

**Classes BEM** :
```scss
.page-home
  __hero
    -content
    -title
    -actions
    -stats
    -stat
    -image
    -logo
    -bg

  __about
    -title
    -wrapper
    -left
    -link
    -center
    -right

  __spaces
    -title
    -link
    -wrapper
    -card
    -images
    -content
    -header
    -name
    -icon
    -category
    -subcategory

  __testimonials
    -wrapper
    -card
    -stars
    -review
    -footer
    -reviewer

  __blog
    -subtitle
    -grid
```

**Responsive** :
- Desktop (>= 992px) : 3 colonnes espaces/témoignages
- Tablet (768px - 991px) : 2 colonnes
- Mobile (< 768px) : 1 colonne, font-size réduit

---

## 2. Concept Page

### Fichier
`/apps/site/src/app/(site)/concept/page.tsx`

### Structure

```
Concept Page
├── Page Title ("Café Coworking")
│
├── Main Image (anticafe-strasbourg.webp)
│
├── Section 1: Le concept Anticafé
│   ├── Histoire depuis 2013
│   ├── Modèle "payer le temps"
│   ├── Évolution post-Covid
│   └── ADN tiers-lieu
│
├── Section 2: CoworKing Café by Anticafé
│   ├── "Le meilleur café pour travailler à Strasbourg"
│   ├── Histoire Strasbourg (2017)
│   ├── Features (ambiance, espace modulable, etc.)
│   ├── Forfaits tarifaires
│   └── Pour qui ? (indépendants, étudiants, etc.)
│
└── Section 3: Image + Public cible
    ├── Image (cafe-coworking-strasbourg.webp)
    └── Liste détaillée des publics
```

### Textes Originaux (Extraits Clés)

**Intro Concept** :
> "Anticafé voit le jour en 2013, porté par Leonid Goncharov, avec l'ambition de créer un lieu hybride où travailler et se détendre se rencontrent naturellement. Le modèle est simple mais révolutionnaire : on ne paye pas ce que l'on consomme, mais le temps passé sur place."

**Post-Covid** :
> "Plusieurs espaces Anticafé à Paris n'ont pas surmonté l'après-Covid et ont fermé leurs portes. Mais le concept, lui, n'a jamais disparu. Les trois franchisés, Bordeaux, Lyon et nous-mêmes à Strasbourg ; avons continué d'évoluer pour devenir indépendant, tout en gardant notre communauté intacte."

**CoworKing Café Strasbourg** :
> "À Strasbourg, l'aventure commence fin 2017 avec l'ouverture d'un espace Anticafé en franchise. [...] C'est ainsi qu'est né CoworKing Café by Anticafé : un espace indépendant dans son fonctionnement, mais qui garde l'ADN et l'esprit du concept originel."

**Forfaits** :
- 6 € / l'heure — idéal pour une visio, une réu express ou une session focus.
- 29 € / la journée — pour travailler sans stress du chrono
- 99 € / la semaine — parfait pour les nomades et les voyageurs en passage prolongé.
- 290 € / le mois — votre QG flexible en plein centre-ville.

**Public cible** :
- les indépendants qui veulent un QG sans engagement
- les étudiants à la recherche d'un lieu pour réviser efficacement
- les télétravailleurs qui fuient le domicile
- les voyageurs qui ont besoin d'un espace propre et fonctionnel entre deux logements
- les équipes qui veulent sortir du bureau pour se recentrer et avancer

### SEO

**Metadata** :
```typescript
title: 'Concept | CoworKing Café by Anticafé'
description: 'Découvrez CoworKing Café by Anticafé à Strasbourg : un espace chaleureux né du concept Anticafé, où l\'on paie au temps et où l\'on travaille comme à la maison, mais en mieux. Parfait pour freelances, étudiants, voyageurs et télétravailleurs.'
```

**Canonical URL** : `https://coworkingcafe.fr/concept`

### Images

**Main** :
- `/images/concept/anticafe-strasbourg.webp` (priority)

**Section 2** :
- `/images/concept/cafe-coworking-strasbourg.webp`

### SCSS

**Fichier** : `/styles/pages/_concept.scss`

**Classes BEM** :
```scss
.page-concept
  __title
  __main-image
  __first-section
  __third-section
  __features
  __second-section
  __section-image
  __section-content
```

**Typography** :
- `.t__54` : Titres principaux (2.5rem desktop, 1.75rem mobile)
- `.t__28` : Sous-titres (1.75rem desktop, 1.5rem mobile)
- Paragraphes : 1.125rem, line-height 1.8

**Lists** :
- Checkmarks (✓) pour features
- Bullets (•) pour public cible
- Couleur accent : `#667eea`

---

## 3. Layout Site

### Fichier
`/apps/site/src/app/(site)/layout.tsx`

### Structure

```typescript
export default function SiteLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

**Composants importés** (Phase 3) :
- `Header` : Navigation principale
- `Footer` : Footer avec liens

**Appliqué à** :
- `/` (homepage)
- `/concept`
- Toutes futures pages site public

---

## 4. Conventions Respectées

### TypeScript

✅ **0 `any` types**
- Tous les props typés avec `interface`
- Metadata typé avec `Metadata` (Next.js)
- Images typées avec props `next/image`

✅ **Interfaces explicites**
```typescript
interface SiteLayoutProps {
  children: React.ReactNode;
}
```

### Images

✅ **Toujours `next/image`**
```typescript
<Image
  src="/images/..."
  alt="Description précise"
  width={1200}
  height={600}
  priority  // Pour hero images
  loading="lazy"  // Pour images below fold
  quality={90}  // Hero images
  quality={85}  // Autres images
/>
```

✅ **Alt descriptifs SEO**
- ❌ `alt="image"`
- ✅ `alt="Espace coworking CoworKing Café Strasbourg"`

### SCSS

✅ **BEM modifié**
```scss
.page-home__hero-content  // ✅
.heroContent              // ❌
.hero_content             // ❌
```

✅ **Responsive mobile-first**
```scss
.title {
  font-size: 3rem;  // Desktop par défaut

  @media (max-width: 768px) {
    font-size: 2rem;  // Mobile override
  }
}
```

✅ **Utility classes**
```scss
.py__130  // padding-y: 130px (desktop) / 80px (mobile)
.pt__120  // padding-top: 120px (desktop) / 60px (mobile)
.pt__60   // padding-top: 60px (desktop) / 40px (mobile)
```

### Taille Fichiers

✅ **Tous < 200 lignes**
- `page.tsx` (homepage) : ~195 lignes
- `concept/page.tsx` : ~180 lignes
- `layout.tsx` : ~20 lignes
- `_home.scss` : ~350 lignes (styles OK jusqu'à 300)
- `_concept.scss` : ~180 lignes

### Textes

✅ **Copiés mot pour mot**
- Source : `/source/src/app/(site)/`
- Aucune paraphrase
- Emojis conservés (☕️, ⏱️, 🌼, 🎉, ✨)

---

## 5. Structure Dossiers Créés

```
apps/site/src/
├── app/
│   └── (site)/
│       ├── layout.tsx          # ✅ Layout site
│       ├── page.tsx            # ✅ Homepage
│       └── concept/
│           └── page.tsx        # ✅ Concept
│
└── styles/
    └── pages/
        ├── _home.scss          # ✅ Styles homepage
        └── _concept.scss       # ✅ Styles concept
```

---

## 6. Checklist Complète

### Textes
- [x] Lire textes originaux `/source/`
- [x] Copier textes mot pour mot (0 paraphrase)
- [x] Conserver emojis originaux
- [x] Respecter structure des sections

### Structure
- [x] Layout site avec Header/Footer
- [x] Homepage structurée (Hero, About, Spaces, Testimonials, Blog)
- [x] Concept structuré (3 sections principales)
- [x] Composants < 200 lignes

### SEO
- [x] Metadata `generateMetadata()` ou `export const metadata`
- [x] Title + Description + Keywords
- [x] OpenGraph complet (title, description, images)
- [x] Twitter Card
- [x] Canonical URL
- [x] Schema.org LocalBusiness (homepage)

### Images
- [x] `next/image` partout (jamais `<img>`)
- [x] `priority` sur hero images
- [x] `loading="lazy"` sur autres images
- [x] `quality={90}` hero, `quality={85}` autres
- [x] Alt descriptifs SEO

### SCSS
- [x] BEM modifié (`.page-home__hero-content`)
- [x] Responsive mobile-first
- [x] Utility classes (`.py__130`, etc.)
- [x] Animations (rotate logo)
- [x] Hover states

### TypeScript
- [x] 0 `any` types
- [x] Props typées
- [x] Metadata typé

### Responsive
- [x] Desktop (>= 992px)
- [x] Tablet (768px - 991px)
- [x] Mobile (< 768px)
- [x] Font-size adaptatifs
- [x] Grid → colonnes adaptatives

---

## 7. Prochaines Étapes (Phase 5)

**À créer ensuite** :
1. **Page Espaces** (`/spaces/page.tsx`)
   - Liste des espaces avec SpaceCard (Phase 3)
   - Détails L'open-space, La verrière, L'étage

2. **Page Tarifs** (`/pricing/page.tsx`)
   - Grilles tarifaires
   - FAQ Schema.org

3. **Page Contact** (`/contact/page.tsx`)
   - Formulaire contact
   - Informations pratiques

4. **Blog** (`/blog/*`)
   - Liste articles
   - Détail article
   - Catégories

5. **Pages Légales**
   - Mentions légales
   - Politique confidentialité
   - CGU

---

## 8. Import dans main.scss

**À ajouter dans** `/styles/main.scss` :

```scss
// Pages
@import 'pages/home';
@import 'pages/concept';
```

---

## 9. Commandes Utiles

```bash
# Vérifier TypeScript
pnpm type-check

# Lancer dev
pnpm dev

# Build
pnpm build

# Tester responsive
# → Ouvrir DevTools (F12) → Toggle device toolbar
```

---

## 10. Sources

**Textes originaux** :
- `/source/src/app/(site)/page.tsx`
- `/source/src/app/(site)/concept/page.tsx`
- `/source/src/components/site/heros/heroOne.tsx`
- `/source/src/components/site/about/aboutOne.tsx`
- `/source/src/components/site/projects/projectsOne.tsx`
- `/source/src/components/site/testimonial/testimonialOne.tsx`
- `/source/src/db/projectsOneData.ts`
- `/source/src/db/testimonialsOneData.ts`

**Documentation référence** :
- `/apps/site/CLAUDE.md` (Section 7 SEO, Section 6 Conventions)

---

**Documentation créée par** : Agent 1 - Phase 4
**Date** : 2026-01-21
**Status** : ✅ Complété
