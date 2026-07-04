import { Suspense } from "react";
import LoginForm from "./LoginForm";
import "./auth.scss";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-section py__130">
          <div className="container ">
            <div className="row justify-content-center">
              <div className="col-lg-6 col-md-8">
                <div className="auth-card text-center">
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Chargement...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
