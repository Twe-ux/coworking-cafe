"use client";

import { useState } from "react";

export function ContactDPOForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");

    // Simuler l'envoi du formulaire
    setTimeout(() => {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setStatus("idle"), 3000);
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="border rounded-3 p-4" style={{ borderColor: "#e5e7eb" }}>
      <h3 className="h5 fw-semibold text-dark mb-4">
        📝 Formulaire de contact DPO
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label htmlFor="name" className="form-label small fw-semibold">
              Nom complet *
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label htmlFor="email" className="form-label small fw-semibold">
              Email *
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="col-12">
            <label htmlFor="subject" className="form-label small fw-semibold">
              Objet de votre demande *
            </label>
            <select
              className="form-select"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez un objet</option>
              <option value="acces">Droit d&apos;accès à mes données</option>
              <option value="rectification">Droit de rectification</option>
              <option value="suppression">Droit à l&apos;effacement</option>
              <option value="portabilite">Droit à la portabilité</option>
              <option value="opposition">Droit d&apos;opposition</option>
              <option value="limitation">Droit à la limitation</option>
              <option value="autre">Autre question</option>
            </select>
          </div>
          <div className="col-12">
            <label htmlFor="message" className="form-label small fw-semibold">
              Message *
            </label>
            <textarea
              className="form-control"
              id="message"
              name="message"
              rows={4}
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="col-12">
            <button
              type="submit"
              className="btn w-100"
              style={{
                backgroundColor: "#417972",
                color: "white",
              }}
              disabled={status === "sending"}
            >
              {status === "sending" ? "Envoi en cours..." : "Envoyer ma demande"}
            </button>
          </div>
          {status === "success" && (
            <div className="col-12">
              <div className="alert alert-success mb-0" role="alert">
                ✅ Votre demande a été envoyée avec succès. Nous vous répondrons dans un délai d&apos;un mois.
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
