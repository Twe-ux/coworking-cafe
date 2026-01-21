import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Offres Étudiants Strasbourg - Coworking -25%',
  description: 'Offre spéciale étudiants : -25% sur tous nos tarifs de coworking à Strasbourg. Dès 4,50€/h. Espace de travail calme, WiFi rapide, café illimité. Carte étudiante requise.',
  keywords: [
    'coworking etudiant strasbourg',
    'espace travail etudiant strasbourg',
    'revision strasbourg',
    'bibliotheque alternative strasbourg',
    'tarif etudiant coworking',
    'cafe etudiant strasbourg'
  ],
  openGraph: {
    title: 'Offres Étudiants -25% | CoworKing Café Strasbourg',
    description: 'Tarif préférentiel pour étudiants. Espace calme pour réviser ou travailler.',
    url: 'https://www.coworkingcafe.fr/student-offers',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-student-offers.jpg',
        width: 1200,
        height: 630,
        alt: 'Offres étudiants CoworKing Café Strasbourg'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Offres Étudiants -25% | CoworKing Café',
    description: 'Tarif préférentiel pour étudiants à Strasbourg',
    images: ['/images/og-student-offers.jpg']
  },
  alternates: {
    canonical: 'https://www.coworkingcafe.fr/student-offers'
  }
};

interface StudentPlan {
  id: string;
  name: string;
  regularPrice: number;
  studentPrice: number;
  unit: string;
  discount: number;
  features: string[];
}

const studentPlans: StudentPlan[] = [
  {
    id: 'hourly',
    name: 'À l\'heure',
    regularPrice: 6,
    studentPrice: 4.5,
    unit: '/heure',
    discount: 25,
    features: [
      'Accès open-space',
      'WiFi haut débit fibre',
      'Café & thé illimités',
      'Prises électriques',
      'Calme garanti',
      'Pas de durée minimum'
    ]
  },
  {
    id: 'daily',
    name: 'À la journée',
    regularPrice: 35,
    studentPrice: 26,
    unit: '/jour',
    discount: 25,
    features: [
      'Tous les avantages À l\'heure',
      'Accès 8h-20h',
      'Casier sécurisé',
      'Snacks inclus',
      'Idéal pour révisions intensives',
      'Annulation gratuite'
    ]
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    regularPrice: 290,
    studentPrice: 217,
    unit: '/mois',
    discount: 25,
    features: [
      'Accès illimité 8h-20h',
      'Bureau dédié (sous réserve)',
      'Casier personnel',
      'Réduction salles réunion (-20%)',
      'Sans engagement',
      'Parfait pour le semestre'
    ]
  }
];

interface Benefit {
  icon: string;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: '📚',
    title: 'Espace Calme',
    description: 'Ambiance studieuse et silencieuse, idéale pour les révisions et la concentration.'
  },
  {
    icon: '☕',
    title: 'Café Illimité',
    description: 'Café, thé, eau à volonté. Restez productif toute la journée sans dépenser plus.'
  },
  {
    icon: '🚀',
    title: 'WiFi Très Haut Débit',
    description: 'Fibre optique pour vos recherches, vidéos de cours et visioconférences.'
  },
  {
    icon: '👥',
    title: 'Communauté',
    description: 'Rencontrez d\'autres étudiants, créez des groupes de travail, partagez vos connaissances.'
  }
];

interface University {
  name: string;
  distance: string;
}

const nearbyUniversities: University[] = [
  { name: 'Université de Strasbourg', distance: '10 min' },
  { name: 'EM Strasbourg', distance: '15 min' },
  { name: 'INSA Strasbourg', distance: '20 min' },
  { name: 'Sciences Po Strasbourg', distance: '12 min' }
];

function StudentPricingCard({ plan }: { plan: StudentPlan }) {
  return (
    <div className="student-pricing-card">
      <div className="student-pricing-card__discount-badge">
        -{plan.discount}%
      </div>

      <div className="student-pricing-card__header">
        <h2 className="student-pricing-card__name">{plan.name}</h2>

        <div className="student-pricing-card__prices">
          <div className="student-pricing-card__price--regular">
            <span className="student-pricing-card__price-amount--striked">
              {plan.regularPrice}€
            </span>
          </div>
          <div className="student-pricing-card__price--student">
            <span className="student-pricing-card__price-amount">
              {plan.studentPrice}€
            </span>
            <span className="student-pricing-card__price-unit">{plan.unit}</span>
          </div>
        </div>
      </div>

      <div className="student-pricing-card__body">
        <ul className="student-pricing-card__features">
          {plan.features.map((feature, index) => (
            <li key={index} className="student-pricing-card__feature">
              ✓ {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="student-pricing-card__footer">
        <a href="/booking" className="btn btn-primary btn-lg w-100">
          Réserver
        </a>
      </div>
    </div>
  );
}

export default function StudentOffersPage() {
  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'SpecialAnnouncement',
    name: 'Offre Étudiants CoworKing Café',
    text: 'Réduction de 25% sur tous les tarifs pour les étudiants',
    category: 'https://www.wikidata.org/wiki/Q3918',
    audience: {
      '@type': 'EducationalAudience',
      educationalRole: 'student'
    },
    validFrom: '2026-01-01',
    validThrough: '2026-12-31'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />

      <main className="page-student-offers">
        <section className="page-student-offers__hero">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-12 col-lg-6">
                <div className="page-student-offers__hero-badge">
                  🎓 Offre Spéciale Étudiants
                </div>
                <h1 className="page-student-offers__hero-title">
                  -25% sur Tous les Tarifs
                </h1>
                <p className="page-student-offers__hero-subtitle">
                  Un espace de travail calme et équipé au cœur de Strasbourg,
                  à tarif préférentiel pour les étudiants.
                </p>
                <div className="page-student-offers__hero-cta">
                  <a href="/booking" className="btn btn-primary btn-lg">
                    Réserver maintenant
                  </a>
                  <a href="#conditions" className="btn btn-outline-primary btn-lg">
                    Voir les conditions
                  </a>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="page-student-offers__hero-image">
                  <Image
                    src="/images/student-working.jpg"
                    alt="Étudiant travaillant au CoworKing Café Strasbourg"
                    width={600}
                    height={400}
                    priority
                    quality={90}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-student-offers__pricing">
          <div className="container">
            <h2 className="page-student-offers__pricing-title">
              Tarifs Préférentiels Étudiants
            </h2>

            <div className="row">
              {studentPlans.map((plan) => (
                <div key={plan.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <StudentPricingCard plan={plan} />
                </div>
              ))}
            </div>

            <div className="page-student-offers__pricing-note">
              <p>
                💡 <strong>Astuce :</strong> Pour une semaine de révisions,
                optez pour 5 journées = 130€ au lieu de 175€ (économie de 45€)
              </p>
            </div>
          </div>
        </section>

        <section className="page-student-offers__benefits">
          <div className="container">
            <h2 className="page-student-offers__benefits-title">
              Pourquoi Choisir le CoworKing Café ?
            </h2>

            <div className="row">
              {benefits.map((benefit, index) => (
                <div key={index} className="col-12 col-sm-6 col-lg-3 mb-4">
                  <div className="benefit-card">
                    <div className="benefit-card__icon">{benefit.icon}</div>
                    <h3 className="benefit-card__title">{benefit.title}</h3>
                    <p className="benefit-card__description">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-student-offers__testimonials">
          <div className="container">
            <h2 className="page-student-offers__testimonials-title">
              Ce que Disent les Étudiants
            </h2>

            <div className="row">
              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="testimonial-card">
                  <div className="testimonial-card__rating">⭐⭐⭐⭐⭐</div>
                  <p className="testimonial-card__text">
                    &quot;Parfait pour réviser mes partiels. Bien plus calme
                    qu&apos;à la BU et le café illimité est un vrai plus !&quot;
                  </p>
                  <p className="testimonial-card__author">
                    - Emma, L3 Droit
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="testimonial-card">
                  <div className="testimonial-card__rating">⭐⭐⭐⭐⭐</div>
                  <p className="testimonial-card__text">
                    &quot;J&apos;y vais tous les mercredis pour travailler sur
                    mon mémoire. Ambiance studieuse, WiFi rapide, je recommande.&quot;
                  </p>
                  <p className="testimonial-card__author">
                    - Thomas, M2 Sciences Po
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="testimonial-card">
                  <div className="testimonial-card__rating">⭐⭐⭐⭐⭐</div>
                  <p className="testimonial-card__text">
                    &quot;L&apos;abonnement mensuel est parfait pour le semestre.
                    J&apos;ai mon bureau attitré et je peux venir quand je veux.&quot;
                  </p>
                  <p className="testimonial-card__author">
                    - Sarah, EM Strasbourg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-student-offers__location">
          <div className="container">
            <h2 className="page-student-offers__location-title">
              Proche de Votre Université
            </h2>
            <p className="page-student-offers__location-subtitle">
              Situé au centre-ville, accessible facilement depuis toutes les universités strasbourgeoises.
            </p>

            <div className="row">
              {nearbyUniversities.map((university, index) => (
                <div key={index} className="col-12 col-sm-6 col-lg-3 mb-3">
                  <div className="university-card">
                    <span className="university-card__name">{university.name}</span>
                    <span className="university-card__distance">
                      📍 {university.distance}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <p className="page-student-offers__location-transport">
              🚇 Arrêt de tram : Homme de Fer (lignes A, B, C, D)
            </p>
          </div>
        </section>

        <section id="conditions" className="page-student-offers__conditions">
          <div className="container">
            <h2 className="page-student-offers__conditions-title">
              Conditions d&apos;Accès
            </h2>

            <div className="page-student-offers__conditions-content">
              <h3>Qui peut bénéficier de l&apos;offre étudiante ?</h3>
              <p>
                Tous les étudiants inscrits dans un établissement d&apos;enseignement supérieur
                (université, école de commerce, école d&apos;ingénieurs, etc.) peuvent bénéficier
                de notre tarif préférentiel.
              </p>

              <h3>Quels justificatifs fournir ?</h3>
              <ul>
                <li>Carte étudiante en cours de validité</li>
                <li>OU Certificat de scolarité de l&apos;année en cours</li>
              </ul>

              <h3>Comment en profiter ?</h3>
              <ol>
                <li>Présentez votre carte étudiante à l&apos;accueil lors de votre première visite</li>
                <li>La réduction est appliquée automatiquement sur tous vos passages</li>
                <li>Pour l&apos;abonnement mensuel, envoyez votre justificatif par email</li>
              </ol>

              <h3>Validité de l&apos;offre</h3>
              <p>
                L&apos;offre est valable toute l&apos;année universitaire (septembre à août).
                Le justificatif doit être renouvelé chaque année.
              </p>
            </div>
          </div>
        </section>

        <section className="page-student-offers__cta">
          <div className="container">
            <div className="page-student-offers__cta-content">
              <h2 className="page-student-offers__cta-title">
                Prêt à Booster Votre Productivité ?
              </h2>
              <p className="page-student-offers__cta-text">
                Rejoignez les centaines d&apos;étudiants qui travaillent déjà au CoworKing Café.
              </p>
              <div className="page-student-offers__cta-actions">
                <a href="/booking" className="btn btn-primary btn-lg">
                  Réserver ma place
                </a>
                <a href="/contact" className="btn btn-outline-primary btn-lg">
                  Demander une visite
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
