"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import "../login/auth.scss";

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

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Auto-login après reset password
        const loginResult = await signIn("credentials", {
          email: data.data.email,
          password: password,
          redirect: false,
        });

        if (loginResult?.ok) {
          // Connexion réussie, rediriger vers le dashboard client
          setMessage("Mot de passe réinitialisé avec succès ! Connexion...");
          router.push("/id");
        } else {
          // Si connexion échoue, afficher message et rediriger vers login
          setMessage("Mot de passe réinitialisé avec succès ! Redirection...");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2000);
        }
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
    <section className="auth-section py-5" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-header text-center mb-4">
                <h2 className="auth-title">Nouveau mot de passe</h2>
                <p className="auth-subtitle">
                  Créez un nouveau mot de passe sécurisé
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {message && (
                <div className="alert alert-success" role="alert">
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Nouveau mot de passe
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      className="form-control auth-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading || !token}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ textDecoration: "none", color: "#198754" }}
                    >
                      <i
                        className={`bi ${
                          showPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                  <small className="text-muted">Minimum 8 caractères</small>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      className="form-control auth-input"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={isLoading || !token}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{ textDecoration: "none", color: "#198754" }}
                    >
                      <i
                        className={`bi ${
                          showConfirmPassword ? "bi-eye-slash" : "bi-eye"
                        }`}
                      ></i>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn auth-btn w-100"
                  disabled={isLoading || !token}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
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

              <div className="auth-footer text-center mt-4">
                <p>
                  <Link href="/auth/login" className="auth-link fw-bold">
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <section className="auth-section py-5" style={{ minHeight: "100vh" }}>
          <div className="container">
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
      <ResetPasswordForm />
    </Suspense>
  );
}
