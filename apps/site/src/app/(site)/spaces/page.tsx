import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Nos Espaces de Coworking à Strasbourg',
  description: 'Découvrez nos espaces de travail à Strasbourg : open-space moderne, salles de réunion équipées, bureaux privatifs. WiFi haut débit, équipements professionnels inclus.',
  keywords: [
    'espace coworking strasbourg',
    'salle reunion strasbourg',
    'bureau privatif strasbourg',
    'open-space strasbourg',
    'espace de travail strasbourg',
    'coworking equipé strasbourg'
  ],
  openGraph: {
    title: 'Nos Espaces de Coworking à Strasbourg | CoworKing Café',
    description: 'Open-space, salles de réunion, bureaux privatifs - Équipements professionnels au cœur de Strasbourg',
    url: 'https://www.coworkingcafe.fr/spaces',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-spaces.jpg',
        width: 1200,
        height: 630,
        alt: 'Espaces de coworking CoworKing Café Strasbourg'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nos Espaces de Coworking à Strasbourg',
    description: 'Open-space, salles de réunion, bureaux privatifs équipés',
    images: ['/images/og-spaces.jpg']
  },
  alternates: {
    canonical: 'https://www.coworkingcafe.fr/spaces'
  }
};

interface Space {
  id: string;
  name: string;
  type: 'open-space' | 'meeting-room' | 'private-office';
  capacity: number;
  surface: number;
  pricePerHour: number;
  description: string;
  amenities: string[];
  image: string;
}

const spaces: Space[] = [
  {
    id: '1',
    name: 'Open-Space Principal',
    type: 'open-space',
    capacity: 30,
    surface: 120,
    pricePerHour: 6,
    description: 'Espace de travail collaboratif et convivial au cœur de Strasbourg. Idéal pour freelances, télétravailleurs et étudiants.',
    amenities: [
      'WiFi haut débit (fibre)',
      'Prises électriques',
      'Café & thé à volonté',
      'Tables ajustables',
      'Lumière naturelle',
      'Espace détente'
    ],
    image: '/images/spaces/open-space.jpg'
  },
  {
    id: '2',
    name: 'Salle de Réunion Petite',
    type: 'meeting-room',
    capacity: 6,
    surface: 20,
    pricePerHour: 25,
    description: 'Salle de réunion privatisable pour vos rendez-vous clients, brainstormings ou visioconférences.',
    amenities: [
      'Écran TV 55"',
      'Connexion HDMI',
      'Tableau blanc',
      'WiFi dédié',
      'Climatisation',
      'Isolation phonique'
    ],
    image: '/images/spaces/meeting-room-small.jpg'
  },
  {
    id: '3',
    name: 'Salle de Réunion Grande',
    type: 'meeting-room',
    capacity: 12,
    surface: 35,
    pricePerHour: 45,
    description: 'Grande salle de réunion équipée pour vos formations, présentations et événements professionnels.',
    amenities: [
      'Vidéoprojecteur HD',
      'Système audio',
      'Tableau blanc géant',
      'Tables modulables',
      'WiFi haut débit',
      'Machine à café Nespresso'
    ],
    image: '/images/spaces/meeting-room-large.jpg'
  },
  {
    id: '4',
    name: 'Bureau Privatif',
    type: 'private-office',
    capacity: 4,
    surface: 15,
    pricePerHour: 18,
    description: 'Bureau fermé et privatif pour votre équipe. Calme et concentration garantis.',
    amenities: [
      'Bureau dédié',
      'Rangements sécurisés',
      'WiFi privé',
      'Fenêtre avec vue',
      'Climatisation',
      'Accès 24/7 (formule mensuelle)'
    ],
    image: '/images/spaces/private-office.jpg'
  }
];

function SpaceTypeIcon({ type }: { type: Space['type'] }) {
  const icons = {
    'open-space': '🏢',
    'meeting-room': '👥',
    'private-office': '🚪'
  };

  return <span className="space-card__icon">{icons[type]}</span>;
}

export default function SpacesPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Espaces de Coworking CoworKing Café',
    description: 'Nos différents espaces de travail à Strasbourg',
    itemListElement: spaces.map((space, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Product',
        name: space.name,
        description: space.description,
        image: `https://www.coworkingcafe.fr${space.image}`,
        offers: {
          '@type': 'Offer',
          price: space.pricePerHour,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2026-12-31'
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: '4.8',
          reviewCount: '127'
        }
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="page-spaces">
        <section className="page-spaces__hero">
          <div className="container">
            <h1 className="page-spaces__hero-title">
              Nos Espaces de Coworking à Strasbourg
            </h1>
            <p className="page-spaces__hero-subtitle">
              Des espaces de travail modernes et équipés au cœur du centre-ville.
              Choisissez l&apos;espace qui correspond à vos besoins.
            </p>
          </div>
        </section>

        <section className="page-spaces__filters">
          <div className="container">
            <div className="page-spaces__filters-group">
              <button className="page-spaces__filter-btn page-spaces__filter-btn--active">
                Tous les espaces
              </button>
              <button className="page-spaces__filter-btn">
                Open-Space
              </button>
              <button className="page-spaces__filter-btn">
                Salles de réunion
              </button>
              <button className="page-spaces__filter-btn">
                Bureaux privatifs
              </button>
            </div>
          </div>
        </section>

        <section className="page-spaces__grid">
          <div className="container">
            <div className="row">
              {spaces.map((space) => (
                <div key={space.id} className="col-12 col-md-6 col-lg-6 mb-4">
                  <article className="space-card">
                    <div className="space-card__image-wrapper">
                      <Image
                        src={space.image}
                        alt={`${space.name} - ${space.description}`}
                        width={600}
                        height={400}
                        className="space-card__image"
                        loading="lazy"
                        quality={85}
                      />
                      <div className="space-card__badge">
                        <SpaceTypeIcon type={space.type} />
                      </div>
                    </div>

                    <div className="space-card__content">
                      <h2 className="space-card__title">{space.name}</h2>

                      <div className="space-card__meta">
                        <span className="space-card__meta-item">
                          <strong>Capacité:</strong> {space.capacity} personnes
                        </span>
                        <span className="space-card__meta-item">
                          <strong>Surface:</strong> {space.surface}m²
                        </span>
                      </div>

                      <p className="space-card__description">
                        {space.description}
                      </p>

                      <div className="space-card__amenities">
                        <h3 className="space-card__amenities-title">Équipements</h3>
                        <ul className="space-card__amenities-list">
                          {space.amenities.map((amenity, index) => (
                            <li key={index} className="space-card__amenity">
                              ✓ {amenity}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-card__footer">
                        <div className="space-card__price">
                          <span className="space-card__price-amount">
                            {space.pricePerHour}€
                          </span>
                          <span className="space-card__price-unit">/heure</span>
                        </div>
                        <a
                          href="/booking"
                          className="btn btn-primary space-card__cta"
                        >
                          Réserver
                        </a>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-spaces__cta">
          <div className="container">
            <div className="page-spaces__cta-content">
              <h2 className="page-spaces__cta-title">
                Besoin d&apos;aide pour choisir ?
              </h2>
              <p className="page-spaces__cta-text">
                Notre équipe est là pour vous conseiller et vous faire visiter nos espaces.
              </p>
              <div className="page-spaces__cta-actions">
                <a href="/contact" className="btn btn-primary">
                  Nous contacter
                </a>
                <a href="/pricing" className="btn btn-outline-primary">
                  Voir les tarifs
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
