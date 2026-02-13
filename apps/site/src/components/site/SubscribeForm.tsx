"use client";

import { Icon } from "@/components/common/Icon";
import { useState, FormEvent } from "react";

export default function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset states
    setError(null);
    setSuccess(false);

    // Validation email
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email) {
      setError("L'email est requis");
      return;
    }

    if (!emailRegex.test(email)) {
      setError("Email invalide");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Erreur API
        setError(data.error || "Erreur lors de l'inscription");
        return;
      }

      // Succès
      setSuccess(true);
      setEmail(""); // Reset le champ
    } catch (err) {
      setError("Erreur de connexion. Réessaye plus tard.");
      console.error("Newsletter subscription error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="subscribe">
      <div className="row justify-content-center">
        <div className="d-flex gap-2 flex-column mb-4 align-items-center text-center">
          <h2>Abonne-toi à notre newsletter</h2>
          <p className="mb-0">
            et reçois seulement une fois par mois toutes les actus, événements
            et promotions en cours...
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="d-flex gap-3 justify-content-center flex-column flex-md-row align-items-stretch"
        >
          <input
            className="input__btn"
            type="email"
            placeholder="Ton Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || success}
            required
          />
          <button
            type="submit"
            className="common__btn d-flex align-items-center"
            disabled={loading || success}
          >
            {loading ? (
              <>
                <span>Inscription...</span>
                <Icon name="spinner" className="icon-spin ms-2" />
              </>
            ) : success ? (
              <span>Inscrit ✓</span>
            ) : (
              <>
                <span>Inscris toi</span>
                <Icon name="arrow-right" className="ms-2" />
              </>
            )}
          </button>
        </form>

        {/* Messages d'erreur */}
        {error && (
          <div className="mt-3 text-center">
            <div className="alert alert-danger d-inline-block" role="alert">
              <Icon name="circle-exclamation" className="me-2" />
              {error}
            </div>
          </div>
        )}

        {/* Message de succès */}
        {success && (
          <div className="mt-3 text-center">
            <div className="alert alert-success d-inline-block" role="alert">
              <Icon name="circle-check" className="me-2" />
              Inscription réussie ! Merci de t'être abonné(e) à notre newsletter.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
