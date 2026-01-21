"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import Link from "next/link";
import { Metadata } from "next";
import "@/styles/pages/_auth.scss";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setEmail("");
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="page-auth">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-card__header">
                <h1 className="auth-card__title">Mot de passe oublié</h1>
                <p className="auth-card__subtitle">
                  Entrez votre email pour recevoir un lien de réinitialisation
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className="auth-alert auth-alert--success" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form__field">
                  <label htmlFor="email" className="auth-form__label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="auth-form__input form-control"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button
                  type="submit"
                  className="auth-form__submit btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border auth-spinner"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Envoi en cours...
                    </>
                  ) : (
                    "Envoyer le lien"
                  )}
                </button>
              </form>

              <div className="auth-card__footer">
                <p>
                  <Link href="/auth/login" className="auth-link auth-link--bold">
                    ← Retour à la connexion
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
