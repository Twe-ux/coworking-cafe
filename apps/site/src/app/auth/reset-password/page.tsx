"use client";

import { useState, useEffect, Suspense, FormEvent, ChangeEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import "@/styles/pages/_auth.scss";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token manquant. Veuillez utiliser le lien reçu par email.");
    }
  }, [token]);

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token manquant");
      return;
    }

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage("Mot de passe réinitialisé avec succès ! Redirection...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.message || "Une erreur est survenue");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <section className="page-auth">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-card__header">
                <h1 className="auth-card__title">Nouveau mot de passe</h1>
                <p className="auth-card__subtitle">
                  Créez un nouveau mot de passe sécurisé
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
                  <label htmlFor="password" className="auth-form__label">
                    Nouveau mot de passe
                  </label>
                  <div className="auth-form__password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="auth-form__input form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      minLength={8}
                      disabled={isLoading || !token}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="auth-form__password-toggle"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                  <small className="auth-form__helper">Minimum 8 caractères</small>
                </div>

                <div className="auth-form__field">
                  <label htmlFor="confirmPassword" className="auth-form__label">
                    Confirmer le mot de passe
                  </label>
                  <div className="auth-form__password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="auth-form__input form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={handleConfirmPasswordChange}
                      required
                      minLength={8}
                      disabled={isLoading || !token}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="auth-form__password-toggle"
                      onClick={toggleConfirmPasswordVisibility}
                      aria-label={
                        showConfirmPassword
                          ? "Masquer le mot de passe"
                          : "Afficher le mot de passe"
                      }
                    >
                      <i
                        className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="auth-form__submit btn"
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border auth-spinner"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Réinitialisation...
                    </>
                  ) : (
                    "Réinitialiser le mot de passe"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
