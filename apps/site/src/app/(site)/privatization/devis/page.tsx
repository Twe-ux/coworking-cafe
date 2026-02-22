import { DevisForm } from "@/components/site/privatization";
import PageTitle from "@/components/site/PageTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demande de Devis Privatisation | CoworKing Café Strasbourg",
  description:
    "Demandez un devis personnalisé pour privatiser notre espace de 180m² pour vos événements professionnels à Strasbourg. Réponse sous 48h ouvrées.",
  robots: "noindex, nofollow",
};

export default function DevisPage() {
  return (
    <>
      <PageTitle title="Demande de Devis Privatisation" />

      <section className="container pb__130 ">
        <div className="row justify-content-center pb__130">
          <div className="col-lg-8">
            <div className="alert mt-4">
              <i className="bi bi-info-circle me-2"></i>
              Remplissez ce formulaire et nous vous répondrons sous{" "}
              <strong>48h ouvrées</strong> avec un devis personnalisé.
            </div>

            <div className="card shadow-sm">
              <div className="card-body p-4 p-md-5">
                <DevisForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
