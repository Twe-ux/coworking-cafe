"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";
import "@/styles/pages/_auth.scss";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  givenName: string;
  username: string;
  newsletter: boolean;
}

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
          roleSlug: "client",
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
        router.push("/dashboard");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de l'inscription"
      );
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
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-card__header">
                <h1 className="auth-card__title">Inscription</h1>
                <p className="auth-card__subtitle">
                  Créez votre compte pour réserver votre espace
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="auth-form__field">
                  <label htmlFor="givenName" className="auth-form__label">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    id="givenName"
                    name="givenName"
                    className="auth-form__input form-control"
                    placeholder="Jean Dupont"
                    value={formData.givenName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="username" className="auth-form__label">
                    Nom d&apos;utilisateur (optionnel)
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    className="auth-form__input form-control"
                    placeholder="jeandupont"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="email" className="auth-form__label">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="auth-form__input form-control"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="auth-form__field">
                  <label htmlFor="password" className="auth-form__label">
                    Mot de passe * (min. 8 caractères)
                  </label>
                  <div className="auth-form__password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      className="auth-form__input form-control"
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
                </div>

                <div className="auth-form__field">
                  <label htmlFor="confirmPassword" className="auth-form__label">
                    Confirmer le mot de passe *
                  </label>
                  <div className="auth-form__password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      className="auth-form__input form-control"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
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

                <div className="auth-form__checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="newsletter"
                    name="newsletter"
                    className="auth-form__checkbox form-check-input"
                    checked={formData.newsletter}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                  <label htmlFor="newsletter" className="auth-form__checkbox-label">
                    Je souhaite recevoir la newsletter
                  </label>
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
                      Inscription en cours...
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </button>
              </form>

              <div className="auth-card__footer">
                <p>
                  Vous avez déjà un compte ?{" "}
                  <Link href="/auth/login" className="auth-link auth-link--bold">
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
