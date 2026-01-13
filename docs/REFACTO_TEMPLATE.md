# Template de Refactorisation - CoworKing Café

Ce document est un guide étape par étape pour refactoriser chaque page du site de manière cohérente et propre.

---

## 🎯 Objectif

Transformer le code "à l'arrache" en code **propre, maintenable et réutilisable** avec :
- ✅ Nommage cohérent (BEM)
- ✅ Composants réutilisables
- ✅ Utilisation de `children` et composition
- ✅ Pas de duplication
- ✅ SCSS harmonisé

---

## 📋 Workflow en 4 Phases

```
PHASE 1: ANALYSE (30min-1h par page)
  └─ Comprendre la page actuelle

PHASE 2: ÉCRITURE MONOLITHIQUE (1-2h par page)
  └─ Tout réécrire dans un seul fichier

PHASE 3: DÉCOUPAGE INTELLIGENT (1-2h par page)
  └─ Extraire composants réutilisables

PHASE 4: HARMONISATION (30min par page)
  └─ Vérifier cohérence globale
```

---

## 🔍 PHASE 1 : ANALYSE

### Checklist d'analyse

```markdown
## Page : [NOM_PAGE]

### 1. Structure actuelle
- [ ] Fichier principal lu : `src/app/(site)/[chemin]/page.tsx`
- [ ] Liste des composants utilisés :
  - [ ] Composant 1 : [nom] → Fichier : [chemin]
  - [ ] Composant 2 : [nom] → Fichier : [chemin]
  - [ ] ...

### 2. Analyse des composants
Pour chaque composant :
- [ ] **Nom actuel** : [HeroOne, AboutSection, etc.]
- [ ] **Utilisé ailleurs** ? Oui/Non → [Liste des pages]
- [ ] **Similaire à** : [HeroTwo, HeroThree, etc.]
- [ ] **Peut être renommé** : [Hero avec variant]
- [ ] **Réutilisable** ? Oui/Non
- [ ] **Contient data en dur** ? Oui/Non

### 3. Duplications détectées
- [ ] [HeroOne / HeroTwo / HeroThree] → À unifier en `Hero` avec variants
- [ ] [CardA / CardB] → À unifier en `Card` avec props
- [ ] ...

### 4. Data sources
- [ ] Data en dur dans composants ? → À extraire
- [ ] Data dans fichiers dédiés ? → OK
- [ ] Data depuis CMS/API ? → OK

### 5. SCSS actuel
- [ ] Fichiers SCSS utilisés :
  - [ ] [_hero.scss]
  - [ ] [_about.scss]
  - [ ] ...
- [ ] Nommage cohérent ? Oui/Non
- [ ] BEM respecté ? Oui/Non
- [ ] Duplications CSS ? Oui/Non

### 6. Points d'attention
- [ ] Animations complexes
- [ ] Intégrations tierces (Stripe, maps, etc.)
- [ ] Forms avec validation
- [ ] Images à optimiser
- [ ] ...
```

### Exemple d'analyse : Page Home

```markdown
## Page : Home

### 1. Structure actuelle
- [x] Fichier principal : `src/app/(site)/page.tsx`
- [x] Composants utilisés :
  - [x] HeroOne → `src/components/site/heros/heroOne.tsx`
  - [x] AboutOne → `src/components/site/about/aboutOne.tsx`
  - [x] ProjectsOne → `src/components/site/projects/projectsOne.tsx`
  - [x] TestimonialOne → `src/components/site/testimonial/testimonialOne.tsx`
  - [x] HomeBlog → `src/components/site/blogs/homeBlog.tsx`

### 2. Analyse des composants

#### HeroOne
- **Utilisé ailleurs** : Non (mais HeroTwo, HeroThree existent)
- **Similaire à** : HeroTwo, HeroThree, HeroSimple
- **Renommer en** : `Hero` avec variant="full"
- **Réutilisable** : OUI
- **Data en dur** : OUI → À extraire

#### AboutOne
- **Utilisé ailleurs** : Non (spécifique Home)
- **Réutilisable** : Partiellement (section générique)
- **Peut devenir** : `Section` + `FeatureGrid`
- **Data en dur** : OUI → À extraire

### 3. Duplications détectées
- Hero[One|Two|Three|Simple] → Unifier en `Hero` avec variants
- About[One|Two] → Unifier en `Section` générique
- Card components → Unifier en `Card` unique

### 4. Recommandations
- Créer composant `Hero` réutilisable
- Créer composant `Section` wrapper générique
- Créer composant `FeatureCard` pour features
- Extraire data dans `src/data/home.ts`
```

---

## ✍️ PHASE 2 : ÉCRITURE MONOLITHIQUE

### Template de fichier monolithique

```tsx
// apps/site/src/app/(site)/[page-name]/page.tsx

"use client"

// ============================================
// IMPORTS
// ============================================
import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import "./page.scss"

// ============================================
// TYPES
// ============================================
interface DataType1 {
  id: string
  title: string
  // ...
}

interface DataType2 {
  // ...
}

// ============================================
// DATA
// ============================================
const sectionHeroData = {
  title: "Titre principal",
  subtitle: "Sous-titre",
  description: "Description...",
  image: "/images/hero.jpg",
  cta: {
    primary: { text: "CTA Principal", href: "/action" },
    secondary: { text: "CTA Secondaire", href: "/autre" }
  }
}

const sectionFeaturesData: DataType1[] = [
  {
    id: "1",
    title: "Feature 1",
    // ...
  },
  // ...
]

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

// ============================================
// SOUS-COMPOSANTS LOCAUX
// ============================================

// Composant 1 : [NOM_DESCRIPTIF]
interface Component1Props {
  data: typeof sectionHeroData
}

function PageNameHero({ data }: Component1Props) {
  return (
    <section className="page-name__hero">
      <div className="page-name__hero-content">
        <motion.h1
          className="page-name__hero-title"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {data.title}
        </motion.h1>

        <motion.p
          className="page-name__hero-subtitle"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          {data.subtitle}
        </motion.p>

        {/* ... */}
      </div>
    </section>
  )
}

// Composant 2 : [NOM_DESCRIPTIF]
interface Component2Props {
  features: DataType1[]
}

function PageNameFeatures({ features }: Component2Props) {
  return (
    <section className="page-name__features">
      <div className="page-name__features-header">
        <h2 className="page-name__features-title">Titre Section</h2>
      </div>

      <motion.div
        className="page-name__features-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {features.map((feature) => (
          <motion.div
            key={feature.id}
            className="page-name__features-card"
            variants={fadeInUp}
          >
            {/* Contenu carte */}
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

// Composant 3, 4, 5... selon besoin

// ============================================
// PAGE PRINCIPALE
// ============================================
export default function PageNamePage() {
  // States si nécessaire
  const [activeTab, setActiveTab] = useState(0)

  return (
    <main className="page-name">
      <PageNameHero data={sectionHeroData} />
      <PageNameFeatures features={sectionFeaturesData} />
      {/* Autres sections */}
    </main>
  )
}
```

### Template SCSS correspondant

```scss
// apps/site/src/styles/pages/_page-name.scss

.page-name {
  // Variables locales si besoin
  --page-primary-color: var(--color-primary);
  --page-spacing: 6rem;

  @media (max-width: 768px) {
    --page-spacing: 3rem;
  }

  // Hero section
  &__hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    padding: var(--page-spacing) 2rem;
    background: var(--color-surface);

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    &-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &-title {
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 1rem;
      line-height: 1.2;
    }

    &-subtitle {
      font-size: clamp(1.25rem, 2vw, 1.75rem);
      color: var(--color-text-secondary);
      margin-bottom: 1.5rem;
    }

    &-image {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-lg);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // Features section
  &__features {
    padding: var(--page-spacing) 2rem;
    background: var(--color-background);

    &-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    &-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    &-card {
      background: var(--color-surface);
      padding: 2rem;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-md);
      transition: transform var(--transition-base),
                  box-shadow var(--transition-base);

      &:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-lg);
      }

      &-icon {
        width: 60px;
        height: 60px;
        border-radius: var(--radius-sm);
        background: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.5rem;
        font-size: 2rem;
        color: white;
      }

      &-title {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-text-primary);
        margin-bottom: 1rem;
      }

      &-description {
        font-size: 1rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }
  }
}
```

---

## 🔧 PHASE 3 : DÉCOUPAGE INTELLIGENT

### Critères de découpage

#### Composant RÉUTILISABLE → `src/components/ui/`

**Quand extraire ?**
- ✅ Utilisé sur 2+ pages différentes
- ✅ Logique générique (Button, Card, Modal, etc.)
- ✅ Peut avoir variants/props flexibles

**Exemple : Hero**

```tsx
// apps/site/src/components/ui/Hero.tsx

interface HeroProps {
  variant?: 'full' | 'simple' | 'centered'
  title: string
  subtitle?: string
  description?: string
  image?: string
  imagePosition?: 'left' | 'right'
  cta?: {
    primary?: { text: string; href: string; onClick?: () => void }
    secondary?: { text: string; href: string }
  }
  children?: React.ReactNode
  className?: string
}

export function Hero({
  variant = 'full',
  title,
  subtitle,
  description,
  image,
  imagePosition = 'right',
  cta,
  children,
  className,
}: HeroProps) {
  return (
    <section className={clsx('hero', `hero--${variant}`, className)}>
      {children || (
        <div className="hero__container">
          <div className="hero__content">
            <h1 className="hero__title">{title}</h1>
            {subtitle && <p className="hero__subtitle">{subtitle}</p>}
            {description && <p className="hero__description">{description}</p>}

            {cta && (
              <div className="hero__cta">
                {cta.primary && (
                  <Button variant="primary" size="large" {...cta.primary}>
                    {cta.primary.text}
                  </Button>
                )}
                {cta.secondary && (
                  <Button variant="secondary" size="large" href={cta.secondary.href}>
                    {cta.secondary.text}
                  </Button>
                )}
              </div>
            )}
          </div>

          {image && (
            <div className={clsx('hero__image', `hero__image--${imagePosition}`)}>
              <Image src={image} alt={title} width={800} height={600} />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

// Usage dans pages
// Home - Full hero avec image
<Hero
  variant="full"
  title="Bienvenue"
  subtitle="Votre espace"
  image="/hero.jpg"
  cta={{
    primary: { text: "Réserver", href: "/booking" },
    secondary: { text: "Découvrir", href: "/concept" }
  }}
/>

// About - Simple hero sans image
<Hero
  variant="simple"
  title="Notre histoire"
  subtitle="Depuis 2020"
/>

// Contact - Hero avec contenu custom
<Hero variant="centered">
  <ContactForm />
</Hero>
```

#### Composant LAYOUT → `src/components/layout/`

**Quand extraire ?**
- ✅ Structure de page (Header, Footer, Sidebar)
- ✅ Wrappers réutilisables (Container, Section)

**Exemple : Section wrapper**

```tsx
// apps/site/src/components/layout/Section.tsx

interface SectionProps {
  children: React.ReactNode
  variant?: 'default' | 'light' | 'dark' | 'gradient'
  padding?: 'small' | 'medium' | 'large'
  className?: string
}

export function Section({
  children,
  variant = 'default',
  padding = 'medium',
  className,
}: SectionProps) {
  return (
    <section
      className={clsx(
        'section',
        `section--${variant}`,
        `section--padding-${padding}`,
        className
      )}
    >
      <div className="section__container">
        {children}
      </div>
    </section>
  )
}

// Usage
<Section variant="light" padding="large">
  <h2>Titre section</h2>
  <FeatureGrid features={data} />
</Section>
```

#### Composant SPÉCIFIQUE → Reste dans page

**Quand garder dans page ?**
- ✅ Utilisé UNIQUEMENT sur cette page
- ✅ Logique très spécifique
- ✅ Pas de réutilisation prévue

---

## 🎨 PHASE 4 : HARMONISATION

### Checklist d'harmonisation

```markdown
### Nommage
- [ ] Tous les composants suivent BEM
- [ ] Noms cohérents entre pages similaires
- [ ] Pas de `One`, `Two`, `Three` dans les noms

### Réutilisation
- [ ] Composants dupliqués unifiés
- [ ] Utilisation de `children` quand approprié
- [ ] Props flexibles avec defaults

### SCSS
- [ ] Variables CSS utilisées (pas de valeurs en dur)
- [ ] Responsive mobile-first
- [ ] Pas de duplication CSS

### Accessibilité
- [ ] Alt text sur images
- [ ] Labels sur forms
- [ ] Contraste suffisant
- [ ] Navigation clavier OK

### Performance
- [ ] Images optimisées (next/image)
- [ ] Lazy loading si nécessaire
- [ ] Animations performantes (GPU)
```

---

## 📚 Exemples de Refacto Avant/Après

### Exemple 1 : Unification de Hero

#### ❌ AVANT (Code actuel)

```tsx
// Composant 1
export function HeroOne() {
  return (
    <div className="hero-one">
      <h1>Titre 1</h1>
      <p>Description 1</p>
      <a href="/action">CTA</a>
    </div>
  )
}

// Composant 2 (quasi identique!)
export function HeroTwo() {
  return (
    <div className="hero-two">
      <h1>Titre 2</h1>
      <p>Description 2</p>
      <a href="/action2">CTA2</a>
    </div>
  )
}

// Composant 3 (encore!)
export function HeroSimple() {
  return (
    <div className="hero-simple">
      <h1>Titre simple</h1>
    </div>
  )
}
```

#### ✅ APRÈS (Unifié)

```tsx
// UN SEUL composant flexible
interface HeroProps {
  variant?: 'full' | 'simple'
  title: string
  description?: string
  cta?: { text: string; href: string }
}

export function Hero({ variant = 'full', title, description, cta }: HeroProps) {
  return (
    <div className={`hero hero--${variant}`}>
      <h1 className="hero__title">{title}</h1>
      {description && <p className="hero__description">{description}</p>}
      {cta && (
        <Button href={cta.href}>{cta.text}</Button>
      )}
    </div>
  )
}

// Usage
<Hero
  variant="full"
  title="Titre 1"
  description="Description 1"
  cta={{ text: "CTA", href: "/action" }}
/>

<Hero
  variant="simple"
  title="Titre simple"
/>
```

### Exemple 2 : Utilisation de children

#### ❌ AVANT

```tsx
// Beaucoup de props pour customiser
<Card
  title="Titre"
  subtitle="Sous-titre"
  icon="bi-star"
  footer={<CustomFooter />}
  showBadge={true}
  badgeText="Nouveau"
  // ... 20 props
/>
```

#### ✅ APRÈS

```tsx
// Simple et flexible avec children
<Card>
  <Card.Header>
    <Card.Icon icon="bi-star" />
    <Card.Badge>Nouveau</Card.Badge>
  </Card.Header>

  <Card.Body>
    <Card.Title>Titre</Card.Title>
    <Card.Subtitle>Sous-titre</Card.Subtitle>
  </Card.Body>

  <Card.Footer>
    <CustomFooter />
  </Card.Footer>
</Card>
```

---

## ✅ Checklist Finale par Page

```markdown
## Page [NOM] - Refacto complète

### Phase 1 : Analyse ✅
- [x] Page actuelle analysée
- [x] Composants listés et analysés
- [x] Duplications identifiées
- [x] Plan de refacto établi

### Phase 2 : Écriture monolithique ✅
- [x] Tout réécrit dans un seul fichier
- [x] Data extraite en haut
- [x] Composants locaux créés
- [x] Nommage BEM respecté
- [x] SCSS harmonisé créé

### Phase 3 : Découpage ✅
- [x] Composants réutilisables extraits → `ui/`
- [x] Composants layout extraits → `layout/`
- [x] Composants spécifiques gardés dans page
- [x] Data extraite dans fichiers dédiés

### Phase 4 : Harmonisation ✅
- [x] Nommage cohérent vérifié
- [x] Réutilisation entre pages vérifiée
- [x] Children utilisé quand approprié
- [x] SCSS sans duplication
- [x] Responsive testé
- [x] Accessibilité vérifiée
- [x] Performance optimisée

### Tests ✅
- [x] Page s'affiche correctement
- [x] Toutes les sections présentes
- [x] Responsive mobile OK
- [x] Animations fluides
- [x] Liens fonctionnels
- [x] Pas de console errors

### Validation finale ✅
- [x] Code review fait
- [x] Commit créé avec message descriptif
- [x] Push vers repo
```

---

## 🚀 Ordre de Refacto Recommandé

### Phase 1 : Pages Critiques (Priorité MAX)
1. **Home** (`/`) - Page d'accueil
2. **Booking système** (7 pages)
   - `/booking` - Sélection
   - `/booking/[type]/new` - Nouvelle résa
   - `/booking/details` - Détails
   - `/booking/summary` - Récap
   - `/booking/checkout/[id]` - Paiement
   - `/booking/confirmation/[id]` - Confirmation
   - `/booking/confirmation/success` - Succès
3. **Dashboard Client** (4 pages)
   - `/[id]` - Dashboard principal
   - `/[id]/reservations` - Mes réservations
   - `/[id]/profile` - Profil
   - `/[id]/settings` - Paramètres

### Phase 2 : Pages Importantes
4. **Auth** (4 pages)
5. **Offres & Produits** (5 pages)
6. **Pages principales** (7 pages restantes)

### Phase 3 : Pages Secondaires
7. **Contenu** (2 pages blog)
8. **Légal** (3 pages)
9. **Utilitaires** (3 pages)

---

*Template créé le 2026-01-13*
*Dernière mise à jour : 2026-01-13*
