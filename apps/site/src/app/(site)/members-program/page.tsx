import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Programme Fidélité Coworking Strasbourg',
  description: 'Rejoignez notre programme de fidélité et profitez d\'avantages exclusifs : réductions, événements privés, priorité de réservation. 3 niveaux de membership.',
  keywords: [
    'programme fidelite coworking',
    'membre coworking strasbourg',
    'avantages coworking',
    'club coworking',
    'communaute coworking strasbourg'
  ],
  openGraph: {
    title: 'Programme de Fidélité | CoworKing Café Strasbourg',
    description: 'Avantages exclusifs pour nos membres fidèles',
    url: 'https://www.coworkingcafe.fr/members-program',
    siteName: 'CoworKing Café',
    images: [
      {
        url: '/images/og-members.jpg',
        width: 1200,
        height: 630,
        alt: 'Programme de fidélité CoworKing Café'
      }
    ],
    locale: 'fr_FR',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Programme de Fidélité | CoworKing Café',
    description: 'Avantages exclusifs pour nos membres',
    images: ['/images/og-members.jpg']
  },
  alternates: {
    canonical: 'https://www.coworkingcafe.fr/members-program'
  }
};

interface MembershipTier {
  id: string;
  name: string;
  icon: string;
  requirement: string;
  discount: number;
  color: string;
  benefits: string[];
}

const tiers: MembershipTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    icon: '🥉',
    requirement: '5 visites ou 1 mois',
    discount: 5,
    color: '#CD7F32',
    benefits: [
      'Réduction 5% sur tous les tarifs',
      'Newsletter mensuelle exclusive',
      'Accès au groupe Slack privé',
      'Invitation aux événements networking',
      'Café gratuit lors de votre anniversaire'
    ]
  },
  {
    id: 'silver',
    name: 'Silver',
    icon: '🥈',
    requirement: '15 visites ou 3 mois',
    discount: 10,
    color: '#C0C0C0',
    benefits: [
      'Tous les avantages Bronze',
      'Réduction 10% sur tous les tarifs',
      'Priorité de réservation salles de réunion',
      '1 heure de salle de réunion offerte/mois',
      'Casier personnel sécurisé',
      'Accès avant-première nouveautés'
    ]
  },
  {
    id: 'gold',
    name: 'Gold',
    icon: '🥇',
    requirement: '30 visites ou 6 mois',
    discount: 15,
    color: '#FFD700',
    benefits: [
      'Tous les avantages Silver',
      'Réduction 15% sur tous les tarifs',
      'Bureau dédié garanti',
      '3 heures de salle de réunion offertes/mois',
      'Invitation événements VIP',
      'Domiciliation gratuite',
      'Parrainage : 1 mois offert pour chaque filleul'
    ]
  }
];

interface Event {
  title: string;
  date: string;
  type: string;
  description: string;
}

const upcomingEvents: Event[] = [
  {
    title: 'Networking Breakfast',
    date: 'Premier jeudi du mois',
    type: 'Networking',
    description: 'Petit-déjeuner mensuel pour rencontrer d\'autres membres et échanger sur vos projets.'
  },
  {
    title: 'Workshop Productivité',
    date: 'Tous les 3 mois',
    type: 'Formation',
    description: 'Ateliers pratiques sur la gestion du temps, organisation et outils de productivité.'
  },
  {
    title: 'Friday Apéro',
    date: 'Dernier vendredi du mois',
    type: 'Social',
    description: 'Apéritif convivial pour se détendre après une semaine de travail.'
  }
];

function TierCard({ tier }: { tier: MembershipTier }) {
  return (
    <div className="tier-card" style={{ '--tier-color': tier.color } as React.CSSProperties}>
      <div className="tier-card__header">
        <div className="tier-card__icon">{tier.icon}</div>
        <h2 className="tier-card__name">{tier.name}</h2>
        <p className="tier-card__requirement">{tier.requirement}</p>
      </div>

      <div className="tier-card__discount">
        <span className="tier-card__discount-amount">-{tier.discount}%</span>
        <span className="tier-card__discount-label">sur tous les tarifs</span>
      </div>

      <div className="tier-card__body">
        <h3 className="tier-card__benefits-title">Avantages</h3>
        <ul className="tier-card__benefits">
          {tier.benefits.map((benefit, index) => (
            <li key={index} className="tier-card__benefit">
              ✓ {benefit}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function MembersProgramPage() {
  const programSchema = {
    '@context': 'https://schema.org',
    '@type': 'LoyaltyProgram',
    name: 'Programme de Fidélité CoworKing Café',
    description: 'Programme à 3 niveaux offrant des réductions et avantages exclusifs',
    offers: tiers.map((tier) => ({
      '@type': 'Offer',
      name: `Niveau ${tier.name}`,
      description: tier.requirement,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: `${tier.discount}%`,
        priceCurrency: 'EUR'
      }
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(programSchema) }}
      />

      <main className="page-members-program">
        <section className="page-members-program__hero">
          <div className="container">
            <h1 className="page-members-program__hero-title">
              Programme de Fidélité
            </h1>
            <p className="page-members-program__hero-subtitle">
              Plus vous venez, plus vous gagnez. Profitez de réductions exclusives
              et d&apos;avantages sur mesure.
            </p>
          </div>
        </section>

        <section className="page-members-program__how-it-works">
          <div className="container">
            <h2 className="page-members-program__how-it-works-title">
              Comment Ça Marche ?
            </h2>

            <div className="row">
              <div className="col-12 col-md-4 mb-4">
                <div className="how-it-works-card">
                  <div className="how-it-works-card__number">1</div>
                  <h3 className="how-it-works-card__title">Inscrivez-vous</h3>
                  <p className="how-it-works-card__description">
                    Créez votre compte gratuitement lors de votre première visite
                    ou directement en ligne.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4 mb-4">
                <div className="how-it-works-card">
                  <div className="how-it-works-card__number">2</div>
                  <h3 className="how-it-works-card__title">Cumulez des Visites</h3>
                  <p className="how-it-works-card__description">
                    Chaque passage est comptabilisé. Accédez à votre tableau de bord
                    pour suivre votre progression.
                  </p>
                </div>
              </div>

              <div className="col-12 col-md-4 mb-4">
                <div className="how-it-works-card">
                  <div className="how-it-works-card__number">3</div>
                  <h3 className="how-it-works-card__title">Profitez des Avantages</h3>
                  <p className="how-it-works-card__description">
                    Les réductions sont appliquées automatiquement. Les avantages
                    sont activés dès que vous atteignez un niveau.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-members-program__tiers">
          <div className="container">
            <h2 className="page-members-program__tiers-title">
              Les 3 Niveaux de Membership
            </h2>

            <div className="row">
              {tiers.map((tier) => (
                <div key={tier.id} className="col-12 col-lg-4 mb-4">
                  <TierCard tier={tier} />
                </div>
              ))}
            </div>

            <div className="page-members-program__tiers-note">
              <p>
                💡 <strong>Bon à savoir :</strong> Votre niveau est conservé
                tant que vous effectuez au moins 1 visite tous les 3 mois.
              </p>
            </div>
          </div>
        </section>

        <section className="page-members-program__events">
          <div className="container">
            <h2 className="page-members-program__events-title">
              Événements Exclusifs Membres
            </h2>
            <p className="page-members-program__events-subtitle">
              Participez à nos événements réguliers réservés aux membres du programme.
            </p>

            <div className="row">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="col-12 col-md-4 mb-4">
                  <div className="event-card">
                    <div className="event-card__type">{event.type}</div>
                    <h3 className="event-card__title">{event.title}</h3>
                    <p className="event-card__date">📅 {event.date}</p>
                    <p className="event-card__description">{event.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="page-members-program__referral">
          <div className="container">
            <div className="referral-box">
              <h2 className="referral-box__title">
                🎁 Programme de Parrainage
              </h2>
              <p className="referral-box__description">
                Parrainez vos amis et gagnez 1 mois d&apos;abonnement gratuit
                pour chaque filleul inscrit. Votre filleul bénéficie également
                de 10% de réduction sur son premier mois.
              </p>
              <div className="referral-box__conditions">
                <h3>Conditions :</h3>
                <ul>
                  <li>Membre niveau Gold uniquement</li>
                  <li>Votre filleul doit s&apos;inscrire à un abonnement mensuel</li>
                  <li>Pas de limite au nombre de parrainages</li>
                </ul>
              </div>
              <a href="/dashboard" className="btn btn-primary btn-lg">
                Obtenir mon code de parrainage
              </a>
            </div>
          </div>
        </section>

        <section className="page-members-program__faq">
          <div className="container">
            <h2 className="page-members-program__faq-title">
              Questions Fréquentes
            </h2>

            <div className="page-members-program__faq-list">
              <details className="page-members-program__faq-item">
                <summary className="page-members-program__faq-question">
                  L&apos;inscription au programme est-elle gratuite ?
                </summary>
                <p className="page-members-program__faq-answer">
                  Oui, totalement gratuite. Il vous suffit de créer un compte
                  lors de votre première visite ou en ligne.
                </p>
              </details>

              <details className="page-members-program__faq-item">
                <summary className="page-members-program__faq-question">
                  Comment sont comptabilisées les visites ?
                </summary>
                <p className="page-members-program__faq-answer">
                  Chaque passage est comptabilisé comme 1 visite, quelle que soit
                  la durée. Pour les abonnés mensuels, chaque mois compte comme 5 visites.
                </p>
              </details>

              <details className="page-members-program__faq-item">
                <summary className="page-members-program__faq-question">
                  Puis-je perdre mon niveau ?
                </summary>
                <p className="page-members-program__faq-answer">
                  Votre niveau reste actif tant que vous effectuez au moins 1 visite
                  tous les 3 mois. En cas d&apos;inactivité, vous revenez au niveau Bronze.
                </p>
              </details>

              <details className="page-members-program__faq-item">
                <summary className="page-members-program__faq-question">
                  Les réductions sont-elles cumulables avec d&apos;autres offres ?
                </summary>
                <p className="page-members-program__faq-answer">
                  Les réductions fidélité ne sont pas cumulables avec l&apos;offre
                  étudiante ni les codes promo ponctuels. La réduction la plus
                  avantageuse est automatiquement appliquée.
                </p>
              </details>

              <details className="page-members-program__faq-item">
                <summary className="page-members-program__faq-question">
                  Comment suivre ma progression ?
                </summary>
                <p className="page-members-program__faq-answer">
                  Connectez-vous à votre tableau de bord en ligne. Vous y verrez
                  votre nombre de visites, votre niveau actuel et les avantages débloqués.
                </p>
              </details>
            </div>
          </div>
        </section>

        <section className="page-members-program__cta">
          <div className="container">
            <div className="page-members-program__cta-content">
              <h2 className="page-members-program__cta-title">
                Rejoignez Notre Communauté
              </h2>
              <p className="page-members-program__cta-text">
                Inscrivez-vous gratuitement et commencez à profiter des avantages dès aujourd&apos;hui.
              </p>
              <div className="page-members-program__cta-actions">
                <a href="/auth/register" className="btn btn-primary btn-lg">
                  Créer mon compte
                </a>
                <a href="/contact" className="btn btn-outline-primary btn-lg">
                  En savoir plus
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
