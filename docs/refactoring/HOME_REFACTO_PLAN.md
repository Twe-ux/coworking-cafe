# Plan de Refactorisation - Page Home

**Date :** 2026-01-13
**Status :** 📋 Planification complète (Opus)
**Prochaine étape :** ✍️ Implémentation (Sonnet)

---

## 📊 PHASE 1 : ANALYSE COMPLÈTE

### Structure actuelle

```tsx
// src/app/(site)/page.tsx
<>
  <HeroOne />
  <AboutOne />
  <ProjectsOne isProjectUseCaseShow={true} />
  <TestimonialOne />
  <HomeBlog className={"py__130"} />
</>
```

### Composants analysés

#### 1. **HeroOne** (`src/components/site/heros/heroOne.tsx`)
**Contenu :**
- Titre: "Tu cherches un espace ou un café pour travailler..."
- Description avec mention "CoworKing Café by Anticafé"
- 2 CTAs: "Voir les espaces" + "Nos tarifs"
- 3 Stats: 60 places / +40 boissons / +700 clients
- Image: coworking-café.webp + logo circle
- 4 shapes décoratives (animations)

**Technologies :**
- SlideUp animations (custom)
- Bootstrap grid
- Font Awesome icons

**Réutilisable ?** OUI - Créer `Hero` générique

---

#### 2. **AboutOne** (`src/components/site/about/aboutOne.tsx`)
**Contenu :**
- Titre principal: "La flexibilité d'un café..."
- Texte histoire (2 paragraphes)
- Image: open-space-strasbourg.webp
- 4 Features avec emojis:
  * ☕️ Tout compris
  * ⏱️ Payer le temps
  * 🌼 Ambiance feel good
  * 🎉 Ouvert & flexible
- Composant Partner (logos)

**Data :** `partnerOneLogos` depuis `/db/`

**Réutilisable ?** Partiellement - Créer `FeatureList` + `PartnerLogos`

---

#### 3. **ProjectsOne** (`src/components/site/projects/projectsOne.tsx`)
**Contenu :**
- Titre: "Des espaces pour favoriser..."
- CTA: "En savoir plus"
- Grid de cartes espaces (data externe)
- Chaque carte: images + titre + catégories

**Data :** `projectsOneData` depuis `/db/`

**Réutilisable ?** OUI - Créer `SpaceCard` générique

---

#### 4. **TestimonialOne** (`src/components/site/testimonial/testimonialOne.tsx`)
**Contenu :**
- Titre: "Merci pour vos retours!"
- Swiper carousel (2 slides par vue desktop)
- Chaque témoignage: étoiles + texte + photo + nom + poste
- Navigation custom avec pagination
- VideoTestimonial component

**Technologies :**
- Swiper.js
- Custom pagination
- useRef + useEffect pour interactivité

**Data :** `testimonialsOneData` depuis `/db/`

**Réutilisable ?** OUI - Créer `TestimonialSlider` générique

---

#### 5. **HomeBlog** (`src/components/site/blogs/homeBlog.tsx`)
**Contenu :**
- Titre: "Entre projets et cappuccinos..."
- Récupération articles via Redux/RTK Query
- 3 derniers articles publiés
- States: loading, error, empty

**Technologies :**
- Redux Toolkit Query
- API: `useGetArticlesQuery`

**Réutilisable ?** OUI - Garder comme composant séparé

---

### Duplications identifiées

#### Hero components
- ❌ `HeroOne` (Home)
- ❌ `HeroTwo` (autre page?)
- ❌ `HeroThree` (autre page?)
- ✅ → Unifier en `Hero` avec variants

#### Projects/Spaces components
- ❌ `ProjectsOne`
- ❌ `ProjectsTwo` (data: `projectsTwoData`)
- ✅ → Unifier en `SpaceGrid` avec props flexibles

#### Testimonials
- ❌ `TestimonialOne`
- ❌ `TestimonialTwo` (data: `testimonialsTwoData`)
- ✅ → Unifier en `TestimonialSlider`

---

## ✍️ PHASE 2 : STRUCTURE MONOLITHIQUE CIBLE

### Fichier : `apps/site/src/app/(site)/page.tsx`

```tsx
"use client"

// ============================================
// IMPORTS
// ============================================
import { motion } from "motion/react"
import Link from "next/link"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, Pagination } from "swiper/modules"
import "swiper/css"
import "./page.scss"

// Redux
import { useGetArticlesQuery } from "@/store/api/blogApi"

// Animations
import SlideUp from "@/utils/animations/slideUp"
import SlideDown from "@/utils/animations/slideDown"

// ============================================
// TYPES
// ============================================
interface Stat {
  value: string
  label: string
}

interface Feature {
  emoji: string
  title: string
  description: string
}

interface Space {
  id: number
  title: string
  categories: string
  images: string[]
  link: string
}

interface Testimonial {
  stars: number
  review: string
  reviewer: {
    name: string
    position: string
    image: string
  }
  quoteImage: string
}

interface PartnerLogo {
  src: string
  alt: string
}

// ============================================
// DATA
// ============================================
const heroData = {
  title: "Tu cherches un espace ou un café pour travailler en plein centre de Strasbourg ?",
  description: "Tu l'as trouvé ! Bienvenue chez CoworKing Café by Anticafé où tu ne paies que le temps passé sur place...",
  image: "/images/banner/coworking-café.webp",
  logoCircle: "/images/banner/logo-circle-white.png",
  ctas: [
    { text: "Voir les espaces", href: "/spaces#spaces", variant: "primary" },
    { text: "Nos tarifs", href: "/pricing#pricing", variant: "outline" }
  ],
  stats: [
    { value: "60", label: "places" },
    { value: "+ 40", label: "choix de boissons" },
    { value: "+ 700", label: "clients membres" }
  ] as Stat[]
}

const aboutData = {
  title: "La flexibilité d'un café, le confort de la maison, l'ambiance studieuse d'une bibliothèque et l'énergie inspirante d'une communauté.",
  paragraphs: [
    "Depuis 2013, Anticafé le plus grand réseau de café coworking en Europe...",
    "Ouvert en 2017 à Strasbourg, CoworKing Café by Anticafé..."
  ],
  image: "/images/about/open-space-strasbourg.webp",
  features: [
    { emoji: "☕️", title: "Tout compris :", description: "cafés, thés et autres boissons à volonté..." },
    { emoji: "⏱️", title: "Payer le temps :", description: "6€/heure, 29€/jour ou abonnements..." },
    { emoji: "🌼", title: "Ambiance feel good :", description: "design chaleureux, calme..." },
    { emoji: "🎉", title: "Ouvert & flexible :", description: "ouvert 7J/7, avec ou sans réservation..." }
  ] as Feature[],
  cta: { text: "En savoir plus", href: "/concept#concept" }
}

// Import depuis /db/ actuel
const spacesData: Space[] = [
  // Data depuis projectsOneData
]

const testimonialsData: Testimonial[] = [
  // Data depuis testimonialsOneData
]

const partnerLogos: PartnerLogo[] = [
  // Data depuis partnerOneLogos
]

// ============================================
// ANIMATION VARIANTS
// ============================================
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

// ============================================
// COMPOSANTS LOCAUX
// ============================================

// 1. Hero Section
function HomeHero({ data }: { data: typeof heroData }) {
  return (
    <section className="home__hero">
      <div className="home__hero-container">
        <div className="home__hero-content">
          <SlideUp>
            <h1 className="home__hero-title">{data.title}</h1>
          </SlideUp>

          <SlideUp delay={2}>
            <p className="home__hero-description">{data.description}</p>
          </SlideUp>

          <SlideUp delay={3} className="home__hero-ctas">
            {data.ctas.map((cta, i) => (
              <Link
                key={i}
                href={cta.href}
                className={`btn btn--${cta.variant}`}
              >
                <span>{cta.text}</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            ))}
          </SlideUp>

          <SlideUp delay={4} className="home__hero-stats">
            {data.stats.map((stat, i) => (
              <div key={i} className="home__hero-stat">
                <h4>{stat.value}</h4>
                <p>{stat.label}</p>
              </div>
            ))}
          </SlideUp>
        </div>

        <div className="home__hero-media">
          <Image
            src={data.logoCircle}
            alt="logo"
            width={150}
            height={150}
            className="home__hero-logo"
          />
          <Image
            src={data.image}
            alt="coworking-café"
            width={500}
            height={600}
            className="home__hero-image"
            priority
          />
        </div>

        {/* Decorative shapes */}
        <div className="home__hero-shapes">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`home__hero-shape home__hero-shape--${i}`} />
          ))}
        </div>
      </div>
    </section>
  )
}

// 2. About Section
function HomeAbout({ data }: { data: typeof aboutData }) {
  return (
    <section className="home__about">
      <div className="home__about-container">
        <SlideDown>
          <h2 className="home__about-title">{data.title}</h2>
        </SlideDown>

        <div className="home__about-content">
          <div className="home__about-text">
            <SlideUp>
              {data.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <Link href={data.cta.href} className="home__about-cta">
                <i className="fa-solid fa-arrow-right"></i>
                <span>{data.cta.text}</span>
              </Link>
            </SlideUp>
          </div>

          <div className="home__about-image">
            <SlideUp delay={2}>
              <Image
                src={data.image}
                alt="open-space"
                width={400}
                height={500}
              />
            </SlideUp>
          </div>

          <div className="home__about-features">
            <SlideUp delay={3}>
              <ul>
                {data.features.map((feat, i) => (
                  <li key={i}>
                    <p className="home__about-feature-title">
                      {feat.emoji} {feat.title}
                    </p>
                    <p>{feat.description}</p>
                  </li>
                ))}
              </ul>
            </SlideUp>
          </div>
        </div>

        <HomePartners logos={partnerLogos} />
      </div>
    </section>
  )
}

// 3. Partners Logos
function HomePartners({ logos }: { logos: PartnerLogo[] }) {
  return (
    <div className="home__partners">
      {logos.map((logo, i) => (
        <Image
          key={i}
          src={logo.src}
          alt={logo.alt}
          width={120}
          height={60}
        />
      ))}
    </div>
  )
}

// 4. Spaces Section
function HomeSpaces({ spaces }: { spaces: Space[] }) {
  return (
    <section className="home__spaces">
      <div className="home__spaces-container">
        <SlideDown className="home__spaces-header">
          <h2 className="home__spaces-title">
            Des espaces pour favoriser votre créativité et votre productivité !
          </h2>
          <Link href="/spaces#spaces" className="home__spaces-cta">
            <i className="fa-solid fa-arrow-right"></i>
            <span>En savoir plus</span>
          </Link>
        </SlideDown>

        <div className="home__spaces-grid">
          {spaces.map((space) => (
            <SlideUp key={space.id} delay={space.id} className="home__spaces-card">
              <Link href={`/spaces#${space.link}`}>
                <div className="home__spaces-card-images">
                  {space.images.map((img, i) => (
                    <Image key={i} src={img} alt={space.title} width={400} height={300} />
                  ))}
                </div>
              </Link>
              <div className="home__spaces-card-content">
                <div className="home__spaces-card-header">
                  <Link href={`/spaces#${space.link}`}>
                    <h3>{space.title}</h3>
                  </Link>
                  <Link href={`/spaces#${space.link}`} className="home__spaces-card-arrow">
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
                <p>{space.categories}</p>
              </div>
            </SlideUp>
          ))}
        </div>
      </div>
    </section>
  )
}

// 5. Testimonials Section
function HomeTestimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const swiperRef = useRef<SwiperType | null>(null)

  useEffect(() => {
    // Custom pagination logic (voir code original)
  }, [])

  return (
    <section className="home__testimonials">
      <div className="home__testimonials-container">
        <SlideDown>
          <h2 className="home__testimonials-title">
            Merci pour vos retours! <br />
            Parce que vous contribuez à notre succès...
          </h2>
        </SlideDown>

        <SlideUp>
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            spaceBetween={25}
            breakpoints={{
              0: { slidesPerView: 1 },
              768: { slidesPerView: 2 }
            }}
            navigation={{
              nextEl: ".home__testimonials-next",
              prevEl: ".home__testimonials-prev"
            }}
            pagination={{
              type: "custom",
              el: ".home__testimonials-pagination",
              renderCustom: function (_swiper, current, total) {
                // Custom pagination logic
              }
            }}
            loop
            modules={[Navigation, Pagination]}
          >
            {testimonials.map((testimonial, index) => (
              <SwiperSlide key={index}>
                <div className="home__testimonials-card">
                  <div className="home__testimonials-stars">
                    {Array.from({ length: testimonial.stars }).map((_, i) => (
                      <i key={i} className="bi bi-star-fill" />
                    ))}
                  </div>
                  <p className="home__testimonials-review">{testimonial.review}</p>
                  <div className="home__testimonials-author">
                    <Image
                      src={testimonial.reviewer.image}
                      alt={testimonial.reviewer.name}
                      width={50}
                      height={50}
                    />
                    <div>
                      <p>{testimonial.reviewer.name}</p>
                      <small>{testimonial.reviewer.position}</small>
                    </div>
                    <Image src={testimonial.quoteImage} alt="quote" width={40} height={40} />
                  </div>
                </div>
              </SwiperSlide>
            ))}

            <div className="home__testimonials-controls">
              <button className="home__testimonials-prev">
                <i className="fa-solid fa-arrow-left"></i>
              </button>
              <div className="home__testimonials-pagination"></div>
              <button className="home__testimonials-next">
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </div>
          </Swiper>
        </SlideUp>

        <VideoTestimonial />
      </div>
    </section>
  )
}

// 6. Blog Section
function HomeBlog() {
  const { data, isLoading, error } = useGetArticlesQuery({
    limit: 3,
    sortBy: "publishedAt",
    sortOrder: "desc",
    status: "published"
  })

  return (
    <section className="home__blog">
      <div className="home__blog-container">
        <SlideDown>
          <h2 className="home__blog-title">Entre projets et cappuccinos :</h2>
          <p className="home__blog-subtitle">
            nos actus, nos conseils et la worklife des sans bureau fixe.
          </p>
        </SlideDown>

        <div className="home__blog-grid">
          {isLoading ? (
            <div className="home__blog-loading">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : error ? (
            <p>Erreur lors du chargement des articles.</p>
          ) : !data?.articles || data.articles.length === 0 ? (
            <p>Aucun article disponible pour le moment.</p>
          ) : (
            data.articles.map((article, index) => (
              <SlideUp key={article._id} delay={index + 1}>
                <BlogCard
                  imgSrc={article.featuredImage || "/images/blogs/blog-1.png"}
                  title={article.title}
                  slug={article.slug}
                />
              </SlideUp>
            ))
          )}
        </div>
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
      <HomeAbout data={aboutData} />
      <HomeSpaces spaces={spacesData} />
      <HomeTestimonials testimonials={testimonialsData} />
      <HomeBlog />
    </main>
  )
}
```

---

## 🎨 PHASE 3 : SCSS Cible

### Fichier : `apps/site/src/styles/pages/_home.scss`

Utiliser convention BEM :
- `.home__hero`
- `.home__hero-title`
- `.home__about`
- `.home__spaces`
- `.home__testimonials`
- `.home__blog`

Variables CSS pour tout (couleurs, espacements, etc.)

---

## 🔧 PHASE 4 : Composants à extraire (après validation)

### Composants réutilisables → `src/components/ui/`
1. `Hero.tsx` - Hero générique
2. `FeatureList.tsx` - Liste features avec emojis
3. `SpaceCard.tsx` - Carte espace
4. `TestimonialSlider.tsx` - Carousel témoignages
5. `BlogCard.tsx` - Carte article (existe déjà)

### Composants layout → `src/components/layout/`
1. `Section.tsx` - Wrapper section générique
2. `Container.tsx` - Container responsive

---

## ✅ Checklist Implémentation (pour Sonnet)

- [ ] Créer structure fichier monolithique
- [ ] Copier/adapter data depuis `/db/`
- [ ] Implémenter HomeHero
- [ ] Implémenter HomeAbout
- [ ] Implémenter HomeSpaces
- [ ] Implémenter HomeTestimonials (avec Swiper)
- [ ] Implémenter HomeBlog (avec Redux)
- [ ] Créer SCSS complet avec BEM
- [ ] Tester responsive
- [ ] Tester animations
- [ ] Valider avec Opus

---

## 📝 Notes importantes

1. **Redux/RTK Query** : HomeBlog utilise Redux - garder tel quel
2. **Swiper.js** : Testimonials utilise Swiper - garder tel quel
3. **Animations custom** : SlideUp/SlideDown - garder tel quel
4. **Images** : Utiliser next/image partout
5. **Font Awesome + Bootstrap Icons** : Les deux sont utilisés

---

**Prochaine étape :** Switch vers **Sonnet** pour implémentation 🚀
