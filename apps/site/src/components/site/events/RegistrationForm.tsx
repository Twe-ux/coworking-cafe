"use client";

import { useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface RegistrationFormProps {
  eventSlug: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
}

type FormStatus = "idle" | "sending" | "success" | "error";

const INITIAL_FORM: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  message: "",
};

export default function RegistrationForm({ eventSlug }: RegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    try {
      const response = await fetch(`/api/events/${eventSlug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || undefined,
          message: formData.message || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setFormData(INITIAL_FORM);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
      }
    } catch {
      setStatus("error");
      setErrorMessage("Erreur de connexion. Veuillez réessayer.");
    }
  };

  if (status === "success") {
    return (
      <div className="event-registration__success">
        <CheckCircle size={48} className="event-registration__success-icon" />
        <h3 className="event-registration__success-title">
          Inscription confirmée !
        </h3>
        <p className="event-registration__success-text">
          Merci pour votre inscription. Vous recevrez un email de confirmation
          sous peu.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="event-registration__form">
      <div className="row g-3">
        {/* First Name */}
        <div className="col-md-6">
          <label
            htmlFor="reg-firstName"
            className="form-label small fw-semibold"
          >
            Prénom *
          </label>
          <input
            type="text"
            className="form-control"
            id="reg-firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            maxLength={100}
            autoComplete="given-name"
          />
        </div>

        {/* Last Name */}
        <div className="col-md-6">
          <label
            htmlFor="reg-lastName"
            className="form-label small fw-semibold"
          >
            Nom *
          </label>
          <input
            type="text"
            className="form-control"
            id="reg-lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            maxLength={100}
            autoComplete="family-name"
          />
        </div>

        {/* Email */}
        <div className="col-md-6">
          <label htmlFor="reg-email" className="form-label small fw-semibold">
            Email *
          </label>
          <input
            type="email"
            className="form-control"
            id="reg-email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        {/* Phone */}
        <div className="col-md-6">
          <label htmlFor="reg-phone" className="form-label small fw-semibold">
            Téléphone
          </label>
          <input
            type="tel"
            className="form-control"
            id="reg-phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>

        {/* Message */}
        <div className="col-12">
          <label htmlFor="reg-message" className="form-label small fw-semibold">
            Message / Commentaire
          </label>
          <textarea
            className="form-control"
            id="reg-message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleChange}
            maxLength={500}
            placeholder="Une question, un besoin particulier ?"
          />
        </div>

        {/* Error message */}
        {status === "error" && errorMessage && (
          <div className="col-12">
            <div
              className="alert alert-danger d-flex align-items-center gap-2 mb-0"
              role="alert"
            >
              <AlertCircle size={18} />
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Submit button */}
        <div className="col-12">
          <button
            type="submit"
            className="common__btn w-100 justify-content-center"
            disabled={status === "sending"}
          >
            {status === "sending" ? (
              <>
                <Loader2 size={18} className="event-registration__spinner" />
                <span>Inscription en cours...</span>
              </>
            ) : (
              <span>S&apos;inscrire</span>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
