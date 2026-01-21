/**
 * Contact Page - apps/site
 * Page contact avec formulaire et informations pratiques
 */

import type { Metadata } from 'next';
import { ContactForm } from './ContactForm';
import { GoogleMap } from '@/components/shared/GoogleMap';

export const metadata: Metadata = {
  title: 'Contactez-nous | CoworKing Café - Espace de Coworking à Strasbourg',
  description:
    'Contactez CoworKing Café pour toute question ou réservation. 1 rue de la Division Leclerc, 67000 Strasbourg. Téléphone: 09 87 33 45 19',
  keywords: [
    'contact coworking strasbourg',
    'réservation coworking',
    'adresse coworking café',
    'téléphone coworking',
    'horaires coworking strasbourg',
  ],
  openGraph: {
    title: 'Contactez-nous - CoworKing Café Strasbourg',
    description:
      'Contactez-nous pour réserver votre espace ou poser vos questions. Situé au coeur de Strasbourg.',
    url: 'https://coworkingcafe.fr/contact',
    siteName: 'CoworKing Café',
    type: 'website',
  },
  alternates: {
    canonical: 'https://coworkingcafe.fr/contact',
  },
};

export default function ContactPage() {
  // Schema.org LocalBusiness pour SEO
  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://coworkingcafe.fr/#organization',
    name: 'CoworKing Café',
    telephone: '09 87 33 45 19',
    email: 'strasbourg@coworkingcafe.fr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '1 rue de la Division Leclerc',
      addressLocality: 'Strasbourg',
      postalCode: '67000',
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 48.5831,
      longitude: 7.752,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <main className="page-contact">
        <section className="page-contact__hero">
          <div className="container">
            <h1 className="page-contact__title">Contactez-nous</h1>
          </div>
        </section>

        <section className="page-contact__content py__130">
          <div className="container">
            <div className="row justify-content-between align-items-start">
              <div className="col-lg-5">
                <div className="page-contact__info">
                  <h2 className="page-contact__info-title">Contactez-nous</h2>
                  <p className="page-contact__info-desc">
                    N&apos;hésitez pas à nous contacter dès aujourd&apos;hui pour discuter de vos
                    besoins.
                  </p>

                  <ul className="page-contact__info-list">
                    <li className="page-contact__info-item">
                      <img
                        src="/icons/phone.svg"
                        alt="Téléphone"
                        className="page-contact__info-icon"
                      />
                      <div className="page-contact__info-content">
                        <strong>Appelez nous:</strong>
                        <p>09 87 33 45 19</p>
                      </div>
                    </li>

                    <li className="page-contact__info-item">
                      <img
                        src="/icons/email1.svg"
                        alt="Email"
                        className="page-contact__info-icon"
                      />
                      <div className="page-contact__info-content">
                        <strong>Envoyer un message:</strong>
                        <p>
                          <a
                            href="mailto:strasbourg@coworkingcafe.fr"
                            className="page-contact__email"
                          >
                            strasbourg@coworkingcafe.fr
                          </a>
                        </p>
                      </div>
                    </li>

                    <li className="page-contact__info-item">
                      <img
                        src="/icons/location.svg"
                        alt="Adresse"
                        className="page-contact__info-icon"
                      />
                      <div className="page-contact__info-content">
                        <div className="mb-4">
                          <strong>Emplacement:</strong>
                          <p>1 rue de la Division Leclerc</p>
                          <p>67000 STRASBOURG</p>
                        </div>

                        <div className="d-flex gap-5">
                          <div>
                            <strong>Tram:</strong>
                            <p>Arrêt Langstross - Grand&apos;Rue</p>
                            <p>Ligne A - D</p>
                          </div>
                          <div>
                            <strong>Parking:</strong>
                            <p>Place Gutemberg</p>
                            <p>5 min à pieds</p>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="col-lg-6 mt-5 mt-lg-0">
                <ContactForm />
              </div>
            </div>
          </div>
        </section>

        <GoogleMap />
      </main>
    </>
  );
}
