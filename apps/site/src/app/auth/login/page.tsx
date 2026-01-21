import { Suspense } from "react";
import { Metadata } from "next";
import LoginForm from "./LoginForm";
import "@/styles/pages/_auth.scss";

export const metadata: Metadata = {
  title: "Connexion | CoworKing Café",
  description: "Connectez-vous à votre espace personnel CoworKing Café",
  robots: {
    index: false,
    follow: false,
  },
};

function LoadingFallback() {
  return (
    <section className="page-auth">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-card__header">
                <div
                  className="spinner-border text-primary"
                  role="status"
                  style={{ width: "3rem", height: "3rem" }}
                >
                  <span className="visually-hidden">Chargement...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}
