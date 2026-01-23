"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || null;

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Force a full page reload to /auth/login
        // This ensures the middleware sees the updated session and redirects properly
        window.location.href = callbackUrl || "/auth/login";
      }
    } catch (error) {
      setError("Une erreur est survenue lors de la connexion");
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-section py__130">
      <div className="container pb__130">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="auth-card">
              <div className="auth-header text-center mb-4">
                <h2 className="auth-title">Connexion</h2>
                <p className="auth-subtitle">
                  Connectez-vous à votre espace personnel
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form">
                <div className="mb-4">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-control auth-input"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
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

                <div className="d-flex justify-content-end mb-4">
                  <Link href="/auth/forgot-password" className="auth-link">
                    Mot de passe oublié ?
                  </Link>
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
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>

              <div className="auth-footer text-center mt-4">
                <p>
                  Vous n'avez pas de compte ?{" "}
                  <Link href="/auth/register" className="auth-link fw-bold">
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
