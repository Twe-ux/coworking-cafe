import PageTitle from "@/components/site/PageTitle";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Demande Envoyée | CoworKing Café Strasbourg",
  description:
    "Votre demande de privatisation a bien été envoyée. Nous vous répondrons sous 48h ouvrées.",
  robots: "noindex, nofollow",
};

export default function MerciPage() {
  return (
    <>
      <PageTitle title="Demande Envoyée !" />

      <section className="container pt-5 pb__130">
        <div className="row justify-content-center pb__130">
          <div className="col-lg-8 text-center">
            <div className="mb-4">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "5rem" }}
              ></i>
            </div>

            <h2 className="h3 mb-4">Merci pour votre demande !</h2>

            <div className="alert alert-success mb-4">
              <p className="mb-0 text-success">
                <i className="bi bi-envelope-check me-2"></i>
                Vous recevrez une <strong>confirmation par email</strong> sous
                peu.
              </p>
            </div>

            <p className="lead mb-4  text-black">
              Notre équipe va étudier votre demande et reviendra vers vous sous{" "}
              <strong>48h ouvrées</strong> avec un devis personnalisé.
            </p>

            <p className="text-muted mb-5  text-black">
              Nous nous réjouissons de vous accueillir au CoworKing Café pour
              votre événement !
            </p>

            <div className="d-flex gap-3 justify-content-center flex-column flex-md-row">
              <Link href="/privatization" className="btn__priva_sucess">
                <i className="bi bi-arrow-left me-2"></i>
                <span>Retour à Privatisation</span>
              </Link>
              <Link href="/" className=" btn__priva_yellow">
                <i className="bi bi-house me-2"></i>
                <span>Accueil</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
