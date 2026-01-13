# Conventions de Code - CoworKing Café Site

Ce document définit les conventions de code, d'architecture et de nommage pour le site public et dashboard client.

## 📋 Table des matières

- [Architecture](#architecture)
- [Nommage CSS/SCSS](#nommage-cssscss)
- [Structure des fichiers](#structure-des-fichiers)
- [Composants React](#composants-react)
- [TypeScript](#typescript)
- [SCSS](#scss)

---

## 🏗️ Architecture

### Principe de base

**Phase 1 : Écriture monolithique**
- Tout le code d'une page dans un seul fichier
- Vision complète de la page
- Data, composants locaux, et page principale ensemble

**Phase 2 : Extraction (après validation)**
- Séparation des responsabilités
- Composants réutilisables extraits
- Data dans fichiers dédiés

### Structure des dossiers

```
apps/site/
├── src/
│   ├── app/
│   │   ├── (site)/           # Site public
│   │   │   ├── page.tsx      # Home
│   │   │   ├── booking/      # Système réservation
│   │   │   ├── [id]/         # Dashboard client
│   │   │   └── ...
│   │   ├── api/              # API routes
│   │   └── layout.tsx        # Root layout
│   │
│   ├── components/
│   │   ├── ui/               # Composants réutilisables
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Section.tsx
│   │   │   └── ...
│   │   └── layout/           # Composants de layout
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ...
│   │
│   ├── styles/
│   │   ├── base/             # Styles de base
│   │   │   ├── _reset.scss
│   │   │   ├── _variables.scss
│   │   │   └── _typography.scss
│   │   ├── components/       # Styles composants
│   │   │   ├── _buttons.scss
│   │   │   ├── _cards.scss
│   │   │   └── ...
│   │   ├── pages/            # Styles pages
│   │   │   ├── _home.scss
│   │   │   ├── _booking.scss
│   │   │   └── ...
│   │   └── main.scss         # Point d'entrée
│   │
│   ├── lib/                  # Logique métier
│   ├── utils/                # Utilitaires
│   └── types/                # Types TypeScript
│
├── public/                   # Assets statiques
└── package.json
```

---

## 🎨 Nommage CSS/SCSS

### Convention BEM modifiée

```scss
// Structure
.page-name__section
.page-name__section-element
.page-name__section-element--modifier

// État
.page-name__element.is-active
.page-name__element.is-disabled
```

### Exemples concrets

#### Page Home
```scss
.home__hero                           // Section hero
.home__hero-content                   // Contenu du hero
.home__hero-title                     // Titre
.home__hero-title--highlighted        // Titre avec modifier
.home__hero-cta                       // Call-to-action

.home__features                       // Section features
.home__features-grid                  // Grille des features
.home__features-card                  // Carte feature
.home__features-card-icon             // Icône de carte
.home__features-card-title            // Titre de carte
.home__features-card--premium         // Carte premium (modifier)

.home__testimonials                   // Section témoignages
.home__testimonials-slider            // Slider
.home__testimonials-slide             // Slide individuel
.home__testimonials-quote             // Citation
```

#### Page Booking
```scss
.booking__calendar                    // Calendrier
.booking__calendar-header             // En-tête calendrier
.booking__calendar-grid               // Grille des jours
.booking__calendar-day                // Jour individuel
.booking__calendar-day--selected      // Jour sélectionné
.booking__calendar-day--disabled      // Jour désactivé
.booking__calendar-day--today         // Aujourd'hui

.booking__summary                     // Récapitulatif
.booking__summary-section             // Section du récap
.booking__summary-item                // Item du récap
.booking__summary-label               // Label
.booking__summary-value               // Valeur
```

#### Dashboard Client
```scss
.dashboard__header                    // En-tête
.dashboard__header-welcome            // Message de bienvenue
.dashboard__header-title              // Titre

.dashboard__stats                     // Statistiques
.dashboard__stats-grid                // Grille stats
.dashboard__stats-card                // Carte stat
.dashboard__stats-card-icon           // Icône
.dashboard__stats-card-value          // Valeur
.dashboard__stats-card-label          // Label
.dashboard__stats-card--active        // Carte active

.dashboard__reservations              // Réservations
.dashboard__reservations-list         // Liste
.dashboard__reservations-item         // Item
.dashboard__reservations-item--pending // Item en attente
```

### États et modificateurs

```scss
// États (avec .is- ou .has-)
.button.is-loading
.button.is-disabled
.card.has-shadow

// Modificateurs (avec --)
.button--primary
.button--secondary
.button--large
.card--featured
```

---

## 📁 Structure des fichiers

### Page monolithique (Phase 1)

```tsx
// apps/site/src/app/(site)/page.tsx

"use client"

import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import "./page.scss"

// ============================================
// TYPES
// ============================================
interface Feature {
  icon: string
  title: string
  description: string
}

interface Testimonial {
  name: string
  role: string
  quote: string
  avatar: string
}

// ============================================
// DATA
// ============================================
const heroData = {
  title: "Bienvenue au CoworKing Café by Anticafé",
  subtitle: "Votre espace de travail flexible à Strasbourg",
  description: "Travaillez dans un cadre inspirant...",
  cta: {
    primary: { text: "Réserver maintenant", href: "/booking" },
    secondary: { text: "Découvrir le concept", href: "/concept" }
  },
  image: "/images/hero-coworking.jpg"
}

const featuresData: Feature[] = [
  {
    icon: "bi-wifi",
    title: "WiFi Ultra-Rapide",
    description: "Connexion fibre optique..."
  },
  {
    icon: "bi-cup-hot",
    title: "Café & Thé Illimité",
    description: "Profitez de boissons chaudes..."
  },
  // ... autres features
]

const testimonialsData: Testimonial[] = [
  {
    name: "Marie Dubois",
    role: "Freelance Designer",
    quote: "Un espace parfait pour travailler...",
    avatar: "/images/avatars/marie.jpg"
  },
  // ... autres témoignages
]

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

// ============================================
// COMPOSANTS LOCAUX
// ============================================
function HomeHero({ data }: { data: typeof heroData }) {
  return (
    <section className="home__hero">
      <div className="home__hero-content">
        <motion.h1
          className="home__hero-title"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          {data.title}
        </motion.h1>

        <motion.p
          className="home__hero-subtitle"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.1 }}
        >
          {data.subtitle}
        </motion.p>

        <motion.p
          className="home__hero-description"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.2 }}
        >
          {data.description}
        </motion.p>

        <motion.div
          className="home__hero-cta"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ delay: 0.3 }}
        >
          <Link href={data.cta.primary.href} className="btn btn--primary btn--large">
            {data.cta.primary.text}
          </Link>
          <Link href={data.cta.secondary.href} className="btn btn--secondary btn--large">
            {data.cta.secondary.text}
          </Link>
        </motion.div>
      </div>

      <div className="home__hero-image">
        <Image
          src={data.image}
          alt="CoworKing Café"
          width={800}
          height={600}
          priority
        />
      </div>
    </section>
  )
}

function HomeFeatures({ features }: { features: Feature[] }) {
  return (
    <section className="home__features">
      <div className="home__features-header">
        <h2 className="home__features-title">Nos Atouts</h2>
        <p className="home__features-subtitle">
          Tout ce dont vous avez besoin pour travailler efficacement
        </p>
      </div>

      <motion.div
        className="home__features-grid"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            className="home__features-card"
            variants={fadeInUp}
          >
            <div className="home__features-card-icon">
              <i className={feature.icon}></i>
            </div>
            <h3 className="home__features-card-title">{feature.title}</h3>
            <p className="home__features-card-description">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

function HomeTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="home__testimonials">
      <div className="home__testimonials-header">
        <h2 className="home__testimonials-title">Ce qu'ils disent de nous</h2>
      </div>

      <div className="home__testimonials-slider">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="home__testimonials-slide">
            <div className="home__testimonials-quote">
              <i className="bi-quote"></i>
              <p>{testimonial.quote}</p>
            </div>
            <div className="home__testimonials-author">
              <Image
                src={testimonial.avatar}
                alt={testimonial.name}
                width={60}
                height={60}
                className="home__testimonials-avatar"
              />
              <div className="home__testimonials-info">
                <p className="home__testimonials-name">{testimonial.name}</p>
                <p className="home__testimonials-role">{testimonial.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ============================================
// PAGE PRINCIPALE
// ============================================
export default function HomePage() {
  return (
    <main className="home">
      <HomeHero data={heroData} />
      <HomeFeatures features={featuresData} />
      <HomeTestimonials testimonials={testimonialsData} />
    </main>
  )
}
```

### SCSS correspondant

```scss
// apps/site/src/styles/pages/_home.scss

.home {
  // Hero section
  &__hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    padding: 8rem 2rem;
    background: linear-gradient(135deg, var(--color-primary-light), var(--color-primary));

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      padding: 4rem 1.5rem;
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

    &-description {
      font-size: 1.125rem;
      color: var(--color-text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    &-cta {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    &-image {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  // Features section
  &__features {
    padding: 6rem 2rem;
    background: var(--color-background);

    &-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    &-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: 1rem;
    }

    &-subtitle {
      font-size: 1.25rem;
      color: var(--color-text-secondary);
    }

    &-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    &-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease, box-shadow 0.3s ease;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
      }

      &-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
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

  // Testimonials section
  &__testimonials {
    padding: 6rem 2rem;
    background: var(--color-surface);

    &-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    &-title {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 700;
      color: var(--color-text-primary);
    }

    &-slider {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    &-slide {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }

    &-quote {
      margin-bottom: 2rem;

      i {
        font-size: 3rem;
        color: var(--color-primary);
        opacity: 0.3;
      }

      p {
        font-size: 1.125rem;
        color: var(--color-text-secondary);
        line-height: 1.6;
        font-style: italic;
      }
    }

    &-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    &-avatar {
      border-radius: 50%;
    }

    &-name {
      font-weight: 600;
      color: var(--color-text-primary);
    }

    &-role {
      font-size: 0.875rem;
      color: var(--color-text-secondary);
    }
  }
}
```

---

## ⚛️ Composants React

### Règles générales

1. **Un composant = une responsabilité**
2. **Props typées avec TypeScript**
3. **Nommage explicite**
4. **Composants purs autant que possible**

### Exemple de composant réutilisable

```tsx
// apps/site/src/components/ui/Button.tsx

import Link from "next/link"
import clsx from "clsx"

interface ButtonProps {
  children: React.ReactNode
  variant?: "primary" | "secondary" | "outline"
  size?: "small" | "medium" | "large"
  href?: string
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: "button" | "submit" | "reset"
}

export function Button({
  children,
  variant = "primary",
  size = "medium",
  href,
  onClick,
  disabled,
  className,
  type = "button",
}: ButtonProps) {
  const classes = clsx(
    "btn",
    `btn--${variant}`,
    `btn--${size}`,
    disabled && "is-disabled",
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

---

## 🎯 TypeScript

### Types et interfaces

```typescript
// Préférer interface pour les objets
interface User {
  id: string
  name: string
  email: string
}

// Préférer type pour les unions
type ButtonVariant = "primary" | "secondary" | "outline"

// Props de composant
interface CardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}
```

### Éviter

```typescript
// ❌ any
const data: any = getData()

// ✅ Type explicite ou unknown
const data: UserData = getData()
const data: unknown = getData() // puis type guard
```

---

## 🎨 SCSS

### Variables

```scss
// apps/site/src/styles/base/_variables.scss

:root {
  // Colors
  --color-primary: #417972;
  --color-primary-light: #5a9b92;
  --color-primary-dark: #2f5a54;

  --color-secondary: #1a2332;
  --color-accent: #f2d381;

  --color-background: #f5f5f5;
  --color-surface: #ffffff;

  --color-text-primary: #1a2332;
  --color-text-secondary: #6b7280;

  // Typography
  --font-family-base: "Figtree", sans-serif;
  --font-size-base: 16px;

  // Spacing
  --spacing-xs: 0.5rem;
  --spacing-sm: 1rem;
  --spacing-md: 1.5rem;
  --spacing-lg: 2rem;
  --spacing-xl: 3rem;

  // Breakpoints
  --breakpoint-sm: 576px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 992px;
  --breakpoint-xl: 1200px;

  // Shadows
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 5px 15px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 30px rgba(0, 0, 0, 0.15);

  // Border radius
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 20px;

  // Transitions
  --transition-base: 0.3s ease;
}
```

### Mixins utiles

```scss
// apps/site/src/styles/utils/_mixins.scss

@mixin respond-to($breakpoint) {
  @if $breakpoint == sm {
    @media (max-width: 576px) { @content; }
  } @else if $breakpoint == md {
    @media (max-width: 768px) { @content; }
  } @else if $breakpoint == lg {
    @media (max-width: 992px) { @content; }
  } @else if $breakpoint == xl {
    @media (max-width: 1200px) { @content; }
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

---

## ✅ Checklist avant commit

- [ ] Code testé et fonctionnel
- [ ] Nommage CSS respecte BEM modifié
- [ ] Composants typés avec TypeScript
- [ ] Pas de `any` dans le code
- [ ] SCSS organisé par page
- [ ] Responsive testé (mobile first)
- [ ] Animations fluides
- [ ] Accessibilité vérifiée
- [ ] Images optimisées

---

*Document créé le 2026-01-13*
*Dernière mise à jour : 2026-01-13*
