"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, FormEvent, ChangeEvent } from "react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        // Force navigation with full page reload to ensure session is properly set
        window.location.href = callbackUrl;
      }
    } catch (err) {
      setError("Une erreur est survenue lors de la connexion");
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="page-auth">
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-card__header">
                <h1 className="auth-card__title">Connexion</h1>
                <p className="auth-card__subtitle">
                  Connectez-vous à votre espace personnel
                </p>
              </div>

              {error && (
                <div className="auth-alert auth-alert--error" role="alert">
                  {error}
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

                <div className="auth-form__field">
                  <label htmlFor="password" className="auth-form__label">
                    Mot de passe
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

                <div className="auth-form__link-wrapper">
                  <Link href="/auth/forgot-password" className="auth-link">
                    Mot de passe oublié ?
                  </Link>
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
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              <div className="auth-card__footer">
                <p>
                  Vous n&apos;avez pas de compte ?{" "}
                  <Link href="/auth/register" className="auth-link auth-link--bold">
                    Créer un compte
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
