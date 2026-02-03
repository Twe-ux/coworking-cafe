"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import "../login/auth.scss";

export default function ActivateAccountPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Lien d'activation invalide. Veuillez vérifier votre email.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/activate-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/auth/login");
        }, 3000);
      } else {
        setError(data.error || "Erreur lors de l'activation du compte");
      }
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  // État: Lien invalide
  if (!token) {
    return (
      <section className="auth-section py__130">
        <div className="container pb__130">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="auth-card text-center">
                <div className="mb-4">
                  <i
                    className="bi bi-exclamation-triangle text-warning"
                    style={{ fontSize: "4rem" }}
                  ></i>
                </div>

                <h2 className="auth-title">Lien invalide</h2>

                <p className="auth-subtitle mb-4">
                  Ce lien d'activation est invalide ou a expiré. Veuillez
                  vérifier votre email ou contacter le support.
                </p>

                <Link href="/" className="btn auth-btn">
                  <i className="bi bi-house-door me-2"></i>
                  Retour à l'accueil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // État: Succès
  if (success) {
    return (
      <section className="auth-section py__130">
        <div className="container pb__130">
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-8">
              <div className="auth-card text-center">
                <div className="mb-4">
                  <i
                    className="bi bi-check-circle-fill text-success"
                    style={{ fontSize: "5rem" }}
                  ></i>
                </div>

                <h2 className="auth-title text-success">Compte activé !</h2>

                <p className="auth-subtitle mb-3">
                  Votre compte a été activé avec succès. Vous pouvez maintenant
                  vous connecter avec votre email et votre nouveau mot de passe.
                </p>

                <p className="text-muted small mb-4">
                  <i className="bi bi-arrow-repeat me-1"></i>
                  Redirection automatique vers la page de connexion...
                </p>

                <Link href="/auth/login" className="btn auth-btn">
                  <i className="bi bi-box-arrow-in-right me-2"></i>
                  Se connecter maintenant
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // État: Formulaire d'activation
  return (
    <section className="auth-section py__130">
      <div className="container pb__130">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              {/* Header */}
              <div className="auth-header text-center">
                <div className="mb-3">
                  <span style={{ fontSize: "3rem" }}>🎉</span>
                </div>

                <h2 className="auth-title">Activez votre compte</h2>

                <p className="auth-subtitle">
                  Créez votre mot de passe pour accéder à tous vos avantages
                  membres
                </p>
              </div>

              {/* Benefits Box */}
              <div className="border border-success bg-light rounded-3 p-4 mb-4">
                <h6
                  className="fw-bold mb-3 "
                  style={{
                    lineHeight: "1.8",
                    fontSize: "1.2rem",
                    color: "var(--main-clr)",
                    // textDecoration: "underline",
                  }}
                >
                  <i className="bi bi-star-fill me-2"></i>
                  Vos avantages membres :
                </h6>
                <ul
                  className="mb-0 small "
                  style={{ lineHeight: "1.8", fontSize: "0.95rem" }}
                >
                  <li>
                    <strong>Offre de fidélité</strong> : Découvrir notre
                    programme membre
                  </li>
                  <li>
                    <strong>News</strong> : Restez informé des dernières
                    actualités
                  </li>
                  <li>
                    <strong>Réservations</strong> : Suivre et gérer toutes vos
                    réservations
                  </li>
                  <li>
                    <strong>Dashboard personnel</strong> : Gérez votre profil et
                    vos préférences
                  </li>
                </ul>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="auth-form">
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control auth-input"
                      id="password"
                      placeholder="Minimum 8 caractères"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                        padding: "0.25rem 0.5rem",
                        color: "#666",
                      }}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                  <div className="form-text">
                    <i className="bi bi-info-circle me-1"></i>
                    Utilisez au moins 8 caractères avec lettres et chiffres
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control auth-input"
                      id="confirmPassword"
                      placeholder="Retapez votre mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      disabled={loading}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                        padding: "0.25rem 0.5rem",
                        color: "#666",
                      }}
                    >
                      <i
                        className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                      ></i>
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="btn auth-btn w-100"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Activation en cours...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Activer mon compte
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
