"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "../login/auth.scss";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    givenName: "",
    username: "",
    newsletter: true,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsLoading(true);

    try {
      // Call registration API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          givenName: formData.givenName,
          username: formData.username || undefined,
          roleSlug: "client", // Default role for public registration
          newsletter: formData.newsletter,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Auto login after successful registration
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          "Inscription réussie mais erreur de connexion. Veuillez vous connecter manuellement."
        );
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
        return;
      }

      if (result?.ok) {
        router.push("/id");
        router.refresh();
      }
    } catch (error) {      setError(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'inscription"
      );
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-section py__130 ">
      <div className="container pb__130">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-header text-center mb-4">
                <h2 className="auth-title">Inscription</h2>
                <p className="auth-subtitle">
                  Créez votre compte pour réserver votre espace
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="mb-3">
                  <label htmlFor="givenName" className="form-label">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="givenName"
                    name="givenName"
                    className="form-control auth-input"
                    placeholder="Jean Dupont"
                    value={formData.givenName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Nom d'utilisateur (optionnel)
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="form-control auth-input"
                    placeholder="jeandupont"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control auth-input"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Mot de passe * (min. 8 caractères)
                  </label>
                  <div className="position-relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="form-control auth-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      disabled={isLoading}
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
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe *
                  </label>
                  <div className="position-relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="form-control auth-input"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      style={{ paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      className="btn btn-link position-absolute"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={{
                        top: "50%",
                        right: "0.5rem",
                        transform: "translateY(-50%)",
                        padding: "0.25rem 0.5rem",
                        color: "#666",
                      }}
                    >
                      <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="newsletter"
                      name="newsletter"
                      className="form-check-input"
                      checked={formData.newsletter}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <label htmlFor="newsletter" className="form-check-label">
                      Je souhaite recevoir la newsletter
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn auth-btn w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Inscription en cours...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </form>

              <div className="auth-footer text-center mt-4">
                <p>
                  Vous avez déjà un compte ?{" "}
                  <Link href="/auth/login" className="auth-link fw-bold">
                    Se connecter
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
