import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs Coworking Strasbourg - Formules Flexibles',
  description: 'Découvrez nos tarifs de coworking à Strasbourg : à l\'heure, à la journée ou au mois. De 6€/h à 290€/mois. Concept anticafé avec café et thé illimités. Sans engagement.',
  keywords: [
    'tarif coworking strasbourg',
    'prix coworking strasbourg',
    'formule coworking',
    'abonnement coworking strasbourg',
    'coworking pas cher strasbourg',
    'anticafé tarif'
  ],
  openGraph: {
    title: 'Tarifs Coworking Strasbourg | CoworKing Café',
    description: 'Formules flexibles de 6€/h à 290€/mois. Café et thé illimités. Sans engagement.',
    url: 'https://www.coworkingcafe.fr/pricing',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-pricing.jpg',
        width: 1200,
        height: 630,
        alt: 'Tarifs CoworKing Café Strasbourg'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Coworking Strasbourg',
    description: 'Formules flexibles sans engagement',
    images: ['/images/og-pricing.jpg']
  },
  alternates: {
    canonical: 'https://www.coworkingcafe.fr/pricing'
  }
};

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  unit: string;
  description: string;
  features: string[];
  recommended?: boolean;
  ctaText: string;
}

const plans: PricingPlan[] = [
  {
    id: 'hourly',
    name: 'À l\'heure',
    price: 6,
    unit: '/heure',
    description: 'Idéal pour une session de travail ponctuelle',
    features: [
      'Accès open-space',
      'WiFi haut débit',
      'Café & thé illimités',
      'Prises électriques',
      'Espace détente',
      'Pas de réservation obligatoire'
    ],
    ctaText: 'Venir travailler'
  },
  {
    id: 'daily',
    name: 'À la journée',
    price: 35,
    unit: '/jour',
    description: 'Pour une journée de travail complète',
    features: [
      'Tous les avantages À l\'heure',
      'Accès 8h-20h',
      'Casier sécurisé pour la journée',
      'Snacks inclus',
      'Réduction de 30% vs horaire',
      'Annulation gratuite'
    ],
    recommended: true,
    ctaText: 'Réserver une journée'
  },
  {
    id: 'monthly',
    name: 'Mensuel',
    price: 290,
    unit: '/mois',
    description: 'L\'abonnement pour les habitués',
    features: [
      'Accès illimité 8h-20h',
      'Bureau dédié (sous réserve)',
      'Casier personnel sécurisé',
      'Adresse professionnelle',
      'Réduction salles de réunion (-20%)',
      'Sans engagement (résiliable)',
      'Domiciliation possible (+50€/mois)'
    ],
    ctaText: 'S\'abonner'
  }
];

interface FAQ {
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    question: 'Comment fonctionne la tarification anticafé ?',
    answer: 'Vous payez uniquement le temps passé dans notre espace. Les consommations (café, thé, eau) sont illimitées et incluses dans le tarif horaire. Aucun minimum de temps, vous restez aussi longtemps que vous le souhaitez.'
  },
  {
    question: 'Puis-je réserver une salle de réunion ?',
    answer: 'Oui, nos salles de réunion sont disponibles à la réservation. Petite salle (6 pers) : 25€/h. Grande salle (12 pers) : 45€/h. Les abonnés mensuels bénéficient de -20% sur les salles.'
  },
  {
    question: 'Y a-t-il un engagement minimum ?',
    answer: 'Aucun engagement. Même pour l\'abonnement mensuel, vous pouvez résilier à tout moment. Nous fonctionnons sur la confiance et la flexibilité.'
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    answer: 'Nous acceptons la carte bancaire (Visa, Mastercard), Swile, Ticket Restaurant pour la restauration, et les virements bancaires pour les abonnements mensuels.'
  },
  {
    question: 'Proposez-vous des tarifs étudiants ?',
    answer: 'Oui ! Les étudiants bénéficient de -25% sur tous nos tarifs sur présentation de leur carte étudiante. Voir notre page Offres Étudiants pour plus de détails.'
  },
  {
    question: 'Peut-on tester avant de s\'abonner ?',
    answer: 'Absolument. Nous vous recommandons de commencer par une formule à l\'heure ou à la journée pour découvrir l\'espace. Aucune obligation de vous abonner.'
  }
];

function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div className={`pricing-card ${plan.recommended ? 'pricing-card--recommended' : ''}`}>
      {plan.recommended && (
        <div className="pricing-card__badge">Populaire</div>
      )}

      <div className="pricing-card__header">
        <h2 className="pricing-card__name">{plan.name}</h2>
        <div className="pricing-card__price">
          <span className="pricing-card__price-amount">{plan.price}€</span>
          <span className="pricing-card__price-unit">{plan.unit}</span>
        </div>
        <p className="pricing-card__description">{plan.description}</p>
      </div>

      <div className="pricing-card__body">
        <ul className="pricing-card__features">
          {plan.features.map((feature, index) => (
            <li key={index} className="pricing-card__feature">
              ✓ {feature}
            </li>
          ))}
        </ul>
      </div>

      <div className="pricing-card__footer">
        <a
          href="/booking"
          className={`btn ${plan.recommended ? 'btn-primary' : 'btn-outline-primary'} btn-lg w-100`}
        >
          {plan.ctaText}
        </a>
      </div>
    </div>
  );
}

export default function PricingPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  const offerSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Formules Coworking CoworKing Café',
    itemListElement: plans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Offer',
        name: plan.name,
        description: plan.description,
        price: plan.price,
        priceCurrency: 'EUR',
        availability: 'https://schema.org/InStock'
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offerSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="page-pricing">
        <section className="page-pricing__hero">
          <div className="container">
            <h1 className="page-pricing__hero-title">
              Tarifs Flexibles et Sans Engagement
            </h1>
            <p className="page-pricing__hero-subtitle">
              Choisissez la formule qui vous correspond. Café et thé illimités inclus.
            </p>
          </div>
        </section>

        <section className="page-pricing__plans">
          <div className="container">
            <div className="row">
              {plans.map((plan) => (
                <div key={plan.id} className="col-12 col-md-6 col-lg-4 mb-4">
                  <PricingCard plan={plan} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-pricing__comparison">
          <div className="container">
            <h2 className="page-pricing__comparison-title">
              Comparaison des Formules
            </h2>

            <div className="table-responsive">
              <table className="table page-pricing__comparison-table">
                <thead>
                  <tr>
                    <th>Avantages</th>
                    <th>À l&apos;heure</th>
                    <th>À la journée</th>
                    <th>Mensuel</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Accès open-space</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>WiFi haut débit</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Café & thé illimités</td>
                    <td>✓</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Snacks inclus</td>
                    <td>-</td>
                    <td>✓</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Bureau dédié</td>
                    <td>-</td>
                    <td>-</td>
                    <td>✓</td>
                  </tr>
                  <tr>
                    <td>Casier sécurisé</td>
                    <td>-</td>
                    <td>Journée</td>
                    <td>Personnel</td>
                  </tr>
                  <tr>
                    <td>Réduction salles réunion</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-20%</td>
                  </tr>
                  <tr>
                    <td>Adresse professionnelle</td>
                    <td>-</td>
                    <td>-</td>
                    <td>✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="page-pricing__extras">
          <div className="container">
            <h2 className="page-pricing__extras-title">Options Supplémentaires</h2>

            <div className="row">
              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="pricing-extra-card">
                  <h3 className="pricing-extra-card__title">Salle de Réunion Petite</h3>
                  <p className="pricing-extra-card__price">25€/heure</p>
                  <p className="pricing-extra-card__description">
                    Jusqu&apos;à 6 personnes. Écran TV, tableau blanc, WiFi dédié.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="pricing-extra-card">
                  <h3 className="pricing-extra-card__title">Salle de Réunion Grande</h3>
                  <p className="pricing-extra-card__price">45€/heure</p>
                  <p className="pricing-extra-card__description">
                    Jusqu&apos;à 12 personnes. Vidéoprojecteur, audio, tables modulables.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-6 col-lg-4 mb-4">
                <div className="pricing-extra-card">
                  <h3 className="pricing-extra-card__title">Domiciliation</h3>
                  <p className="pricing-extra-card__price">+50€/mois</p>
                  <p className="pricing-extra-card__description">
                    Adresse professionnelle au centre de Strasbourg. Gestion du courrier.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pricing__faq">
          <div className="container">
            <h2 className="page-pricing__faq-title">Questions Fréquentes</h2>

            <div className="page-pricing__faq-list">
              {faqs.map((faq, index) => (
                <details key={index} className="page-pricing__faq-item">
                  <summary className="page-pricing__faq-question">
                    {faq.question}
                  </summary>
                  <p className="page-pricing__faq-answer">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="page-pricing__cta">
          <div className="container">
            <div className="page-pricing__cta-content">
              <h2 className="page-pricing__cta-title">
                Prêt à commencer ?
              </h2>
              <p className="page-pricing__cta-text">
                Venez découvrir notre espace ou réservez directement en ligne.
              </p>
              <div className="page-pricing__cta-actions">
                <a href="/booking" className="btn btn-primary btn-lg">
                  Réserver maintenant
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
