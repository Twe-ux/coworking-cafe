/**
 * Homepage - apps/site
 * Page d'accueil du site CoworKing Café
 *
 * TEXTES: Extraits depuis /source/src/app/(site)/page.tsx
 * Structure refactorisée avec composants propres
 */

import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'CoworKing Café by Anticafé - Espace de Coworking à Strasbourg',
  description: 'Espace de coworking convivial au cœur de Strasbourg. Concept anticafé : payez le temps, profitez de boissons à volonté. 60 places, +40 boissons, +700 clients membres.',
  keywords: [
    'coworking strasbourg',
    'anticafé',
    'espace de travail',
    'café coworking',
    'bureau partagé strasbourg',
    'wifi gratuit',
    'salle de réunion strasbourg'
  ],
  openGraph: {
    title: 'CoworKing Café by Anticafé - Strasbourg',
    description: 'Espace de coworking convivial avec concept anticafé à Strasbourg',
    url: 'https://coworkingcafe.fr',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/banner/coworking-café.webp',
        width: 1200,
        height: 630,
        alt: 'CoworKing Café Strasbourg'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CoworKing Café by Anticafé - Strasbourg',
    description: 'Espace de coworking convivial avec concept anticafé',
    images: ['/images/banner/coworking-café.webp']
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr'
  }
};

export default function HomePage() {
  return (
    <>
      {/* Schema.org LocalBusiness */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            '@id': 'https://coworkingcafe.fr/#organization',
            name: 'CoworKing Café by Anticafé',
            image: 'https://coworkingcafe.fr/images/banner/coworking-café.webp',
            description: 'Espace de coworking convivial avec concept anticafé à Strasbourg',
            url: 'https://coworkingcafe.fr',
            telephone: '+33388000000',
            email: 'contact@coworkingcafe.fr',
            address: {
              '@type': 'PostalAddress',
              streetAddress: '1 Rue du Coworking',
              addressLocality: 'Strasbourg',
              postalCode: '67000',
              addressCountry: 'FR'
            },
            openingHoursSpecification: [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                  'Monday',
                  'Tuesday',
                  'Wednesday',
                  'Thursday',
                  'Friday',
                  'Saturday',
                  'Sunday'
                ],
                opens: '08:00',
                closes: '20:00'
              }
            ],
            priceRange: '€€',
            acceptsReservations: true
          })
        }}
      />

      {/* Hero Section */}
      <section className="page-home__hero">
        <div className="container position-relative">
          <div className="row">
            <div className="col-lg-9">
              <div className="page-home__hero-content">
                <div className="page-home__hero-title">
                  <h1 className="title">
                    Tu cherches un espace ou un café pour travailler en plein centre de Strasbourg ?
                  </h1>
                  <p>
                    Tu l'as trouvé ! Bienvenue chez{' '}
                    <strong>CoworKing Café by Anticafé</strong> où tu ne paies que le temps passé
                    sur place. À ta disposition, un énorme choix de boissons à volonté, des snacks
                    et plein d'autres services.
                  </p>
                </div>

                <div className="page-home__hero-actions">
                  <Link href="/spaces#spaces" className="btn btn--primary">
                    <span>Voir les espaces</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                  <Link href="/pricing#pricing" className="btn btn--outline">
                    <span>Nos tarifs</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>

                <div className="page-home__hero-stats">
                  <div className="page-home__hero-stat">
                    <h4>60</h4>
                    <p>places</p>
                  </div>
                  <div className="page-home__hero-stat">
                    <h4>+ 40</h4>
                    <p>choix de boissons</p>
                  </div>
                  <div className="page-home__hero-stat">
                    <h4>+ 700</h4>
                    <p>clients membres</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-3">
              <div className="page-home__hero-image">
                <Image
                  src="/images/banner/logo-circle-white.png"
                  alt="Logo CoworKing Café"
                  width={200}
                  height={200}
                  className="page-home__hero-logo"
                  priority
                />
                <Image
                  src="/images/banner/coworking-café.webp"
                  alt="Espace coworking CoworKing Café Strasbourg"
                  width={400}
                  height={600}
                  className="page-home__hero-bg"
                  priority
                  quality={90}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="page-home__about py__130">
        <div className="container">
          <div className="row justify-content-between page-home__about-title">
            <div className="col-lg-10">
              <h1 className="title">
                La flexibilité d'un café, le confort de la maison, l'ambiance studieuse d'une
                bibliothèque et l'énergie inspirante d'une communauté.
              </h1>
            </div>
          </div>

          <div className="row justify-content-between align-items-center page-home__about-wrapper">
            <div className="col-xl-5 col-lg-6">
              <div className="page-home__about-left">
                <p>
                  Depuis 2013, Anticafé le plus grand réseau de café coworking en Europe,
                  réinvente la manière de travailler, d'étudier ou de se retrouver.
                </p>
                <br />
                <p>
                  Ouvert en 2017 à Strasbourg, CoworKing Café by Anticafé est né sous l'enseigne
                  Anticafé avant de devenir un lieu indépendant, ancré dans la vie locale. Un
                  espace chaleureux, accessible sans réservation, pensé pour les indépendants,
                  étudiants, télétravailleurs et équipes en quête d'un lieu où travailler comme à
                  la maison, mais en mieux.
                </p>
                <Link href="/concept#concept" className="page-home__about-link">
                  <i className="fa-solid fa-arrow-right"></i>
                  <span>En savoir plus</span>
                </Link>
              </div>
            </div>

            <div className="col-xl-4 col-lg-6">
              <div className="page-home__about-center">
                <Image
                  src="/images/about/open-space-strasbourg.webp"
                  alt="Open space coworking Strasbourg"
                  width={500}
                  height={600}
                  loading="lazy"
                  quality={85}
                />
              </div>
            </div>

            <div className="col-xl-3 col-lg-6 mt-5 mt-xl-0">
              <ul className="page-home__about-right">
                <li>
                  <span>
                    <p className="bold">☕️ Tout compris :</p>
                    <p>
                      cafés, thés et autres boissons à volonté, wifi très haut débit, snack
                      inclus...
                    </p>
                  </span>
                </li>
                <li>
                  <span>
                    <p className="bold">⏱️ Payer le temps :</p>
                    <p>6€/heure, 29€/jour ou abonnements semaine et mois</p>
                  </span>
                </li>
                <li>
                  <span>
                    <p className="bold">🌼 Ambiance feel good : </p>
                    <p>design chaleureux, calme et échanges naturels</p>
                  </span>
                </li>
                <li>
                  <span>
                    <p className="bold">🎉 Ouvert & flexible :</p>
                    <p>ouvert 7J/7, avec ou sans réservation (jusqu'à 5 pers.)</p>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Spaces Section */}
      <section className="page-home__spaces pt__120 pb__130">
        <div className="container">
          <div className="page-home__spaces-title">
            <h1 className="title">
              Des espaces pour favoriser votre créativité et votre productivité !
            </h1>
            <Link href="/spaces#spaces" className="page-home__spaces-link">
              <i className="fa-solid fa-arrow-right"></i>
              <span>En savoir plus</span>
            </Link>
          </div>

          <div className="page-home__spaces-wrapper">
            {/* L'open-space */}
            <div className="page-home__spaces-card">
              <Link href="/spaces#open-space">
                <div className="page-home__spaces-images">
                  <Image
                    src="/images/projects/espaces-coworking-strasbourg.webp"
                    alt="Espaces coworking Strasbourg"
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                  />
                  <Image
                    src="/images/projects/openspace-coworking-strasbourg-bis.webp"
                    alt="Open space coworking Strasbourg"
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                  />
                </div>
              </Link>
              <div className="page-home__spaces-content">
                <div className="page-home__spaces-header">
                  <Link href="/spaces#open-space" className="page-home__spaces-name">
                    L'open-space
                  </Link>
                  <Link href="/spaces#open-space" className="page-home__spaces-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
                <p className="page-home__spaces-category">
                  Zones variées et confortables, jusqu'à 60 places.
                </p>
                <p className="page-home__spaces-subcategory">
                  Venez directement ou réservez en avance, nous aurons toujours un espace et un
                  sourire pour vous accueillir.
                </p>
              </div>
            </div>

            {/* La verrière */}
            <div className="page-home__spaces-card">
              <Link href="/spaces#verriere">
                <div className="page-home__spaces-images">
                  <Image
                    src="/images/projects/salle-réunion-verrière-strasbourg.webp"
                    alt="Salle de réunion verrière Strasbourg"
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                  />
                </div>
              </Link>
              <div className="page-home__spaces-content">
                <div className="page-home__spaces-header">
                  <Link href="/spaces#verriere" className="page-home__spaces-name">
                    La verrière
                  </Link>
                  <Link href="/spaces#verriere" className="page-home__spaces-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
                <p className="page-home__spaces-category">
                  Petite salle de réunion équipée jusqu'à 4/5 personnes.
                </p>
              </div>
            </div>

            {/* L'étage */}
            <div className="page-home__spaces-card">
              <Link href="/spaces#etage">
                <div className="page-home__spaces-images">
                  <Image
                    src="/images/projects/salle-réunion-étage-strasbourg.webp"
                    alt="Salle de réunion étage Strasbourg"
                    width={600}
                    height={400}
                    loading="lazy"
                    quality={85}
                  />
                </div>
              </Link>
              <div className="page-home__spaces-content">
                <div className="page-home__spaces-header">
                  <Link href="/spaces#etage" className="page-home__spaces-name">
                    L'étage
                  </Link>
                  <Link href="/spaces#etage" className="page-home__spaces-icon">
                    <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                </div>
                <p className="page-home__spaces-category">
                  Salle de réunion équipée (10 à 15 personnes).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="page-home__testimonials py__130">
        <div className="container">
          <h1 className="title text-center">
            Merci pour vos retours! <br /> Parce que vous contribuez à notre succès...
          </h1>

          <div className="page-home__testimonials-wrapper">
            {/* Testimonial 1 */}
            <div className="page-home__testimonials-card">
              <div className="page-home__testimonials-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill" />
                ))}
              </div>
              <p className="page-home__testimonials-review">
                Un café incroyable pour le rapport qualité-prix. Les gérants sont très
                professionnels. Si vous ne savez pas quoi faire à Strasbourg pour attendre votre
                train ou pour travailler dans le calme avec un large matériel à disposition (prises
                + wifi + boissons à volonté pour les classiques), voici l'endroit idéal. Merci pour
                ce moment.
              </p>
              <div className="page-home__testimonials-footer">
                <div className="page-home__testimonials-reviewer">
                  <Image
                    src="/images/testimonail/1.png"
                    alt="Sacha Z*c*r*p**l*s"
                    width={60}
                    height={60}
                  />
                  <div>
                    <p>Sacha Z*c*r*p**l*s</p>
                    <small>Il y a 12 semaines</small>
                  </div>
                </div>
                <div>
                  <Image src="/images/testimonail/quotes1.svg" alt="Quote" width={40} height={40} />
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="page-home__testimonials-card">
              <div className="page-home__testimonials-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill" />
                ))}
              </div>
              <p className="page-home__testimonials-review">
                Avec mon collègue, j'ai l'habitude d'y aller pour travailler sur nos projets. Le
                service, et l'ambiance sont toujours très agréables, et le personnel est chaleureux
                et humain. Je recommande vivement pour ceux et celles qui veulent travailler, que ce
                soit pour les études, les projets personnels et autre, dans un espace calme avec des
                boissons de qualité 👌
              </p>
              <div className="page-home__testimonials-footer">
                <div className="page-home__testimonials-reviewer">
                  <Image
                    src="/images/testimonail/2.png"
                    alt="William D**NG"
                    width={60}
                    height={60}
                  />
                  <div>
                    <p>William D**NG</p>
                    <small>Il y a 18 semaines</small>
                  </div>
                </div>
                <div>
                  <Image src="/images/testimonail/quotes1.svg" alt="Quote" width={40} height={40} />
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="page-home__testimonials-card">
              <div className="page-home__testimonials-stars">
                {Array.from({ length: 5 }).map((_, i) => (
                  <i key={i} className="bi bi-star-fill" />
                ))}
              </div>
              <p className="page-home__testimonials-review">
                Un lieu cosy avec plein d'espérances différents. Un concept novateur pour tous les
                travailleurs indépendants avec la juste dose de sourires et de concentration. Un
                accueil super chaleureux et des boissons savoureuses. Mon nouveau spot pour
                travailler quand je suis à Strasbourg ✨
              </p>
              <div className="page-home__testimonials-footer">
                <div className="page-home__testimonials-reviewer">
                  <Image
                    src="/images/testimonail/5.png"
                    alt="Miriam B*ld*ll*"
                    width={60}
                    height={60}
                  />
                  <div>
                    <p>Miriam B*ld*ll*</p>
                    <small>Il y a 20 semaines</small>
                  </div>
                </div>
                <div>
                  <Image src="/images/testimonail/quotes1.svg" alt="Quote" width={40} height={40} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Preview Section */}
      <section className="page-home__blog py__130">
        <div className="container">
          <h1 className="title text-center">Entre projets et cappuccinos :</h1>
          <p className="page-home__blog-subtitle text-center">
            nos actus, nos conseils et la worklife des sans bureau fixe.
          </p>

          <div className="page-home__blog-grid">
            <p className="text-center">Section blog à venir...</p>
          </div>
        </div>
      </section>
    </>
  );
}
