import PageTitle from '@/components/site/PageTitle'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Demande Envoyée | CoworKing Café Strasbourg",
  description: "Votre demande de privatisation a bien été envoyée. Nous vous répondrons sous 48h ouvrées.",
  robots: 'noindex, nofollow'
}

export default function MerciPage() {
  return (
    <>
      <PageTitle title="Demande Envoyée !" />

      <section className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="mb-4">
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '5rem' }}></i>
            </div>

            <h2 className="h3 mb-4">Merci pour votre demande !</h2>

            <div className="alert alert-success mb-4">
              <p className="mb-0">
                <i className="bi bi-envelope-check me-2"></i>
                Vous recevrez une <strong>confirmation par email</strong> sous peu.
              </p>
            </div>

            <p className="lead mb-4">
              Notre équipe va étudier votre demande et reviendra vers vous sous <strong>48h ouvrées</strong> avec un devis personnalisé.
            </p>

            <p className="text-muted mb-5">
              Nous nous réjouissons de vous accueillir au CoworKing Café pour votre événement !
            </p>

            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link href="/privatization" className="btn btn-primary">
                <i className="bi bi-arrow-left me-2"></i>
                Retour à Privatisation
              </Link>
              <Link href="/" className="btn btn-outline-secondary">
                <i className="bi bi-house me-2"></i>
                Accueil
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
