import PageTitle from "@/components/site/PageTitle";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nos Boissons | CoworKing Café by Anticafé",
  description:
    "Découvrez notre carte de boissons chaudes et froides, incluses à volonté dans votre forfait temps. Cafés, thés, matcha, boissons glacées et bien plus.",
  openGraph: {
    title: "Nos Boissons - CoworKing Café by Anticafé",
    description:
      "Découvrez notre sélection de boissons chaudes et froides, toutes incluses dans votre forfait.",
    type: "website",
  },
};

export default function BoissonsPage() {
  return (
    <>
      <PageTitle title="Nos Boissons" />
      <section className="py__130">
        <div className="container">
          <div className="text-center mb-5">
            <h3 className="mb-3">Notre Sélection de Boissons</h3>
            <p className="lead">
              Toutes nos boissons chaudes et froides sont incluses à volonté
              dans votre forfait temps
            </p>
          </div>

          <div className="row">
            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">☕ Boissons Chaudes</h4>
                  <ul className="list-unstyled mt-3">
                    <li>✓ Café espresso</li>
                    <li>✓ Café allongé</li>
                    <li>✓ Cappuccino</li>
                    <li>✓ Latte</li>
                    <li>✓ Thés variés</li>
                    <li>✓ Chocolat chaud</li>
                    <li>✓ Matcha latte</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="col-lg-6 mb-4">
              <div className="card h-100">
                <div className="card-body">
                  <h4 className="card-title">🧊 Boissons Froides</h4>
                  <ul className="list-unstyled mt-3">
                    <li>✓ Café glacé</li>
                    <li>✓ Iced latte</li>
                    <li>✓ Frappés</li>
                    <li>✓ Thés glacés</li>
                    <li>✓ Jus de fruits</li>
                    <li>✓ Smoothies</li>
                    <li>✓ Limonades maison</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-5">
            <p className="text-muted">
              Toutes nos boissons sont préparées avec soin par notre équipe.
              <br />
              Pour les boissons à emporter, consultez notre{" "}
              <a href="/take-away" className="text-primary">
                carte Take Away
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
