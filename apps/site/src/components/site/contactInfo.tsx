"use client";
import SlideUp from "@/utils/animations/slideUp";
import ProtectedEmail from "../common/ProtectedEmail";
import { useState } from "react";

const ContactInfo = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const subjects = [
    "Renseignements généraux",
    "Réservation",
    "Tarifs et abonnements",
    "Événements privés",
    "Partenariat",
    "Autre",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact-mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch {
      setError("Erreur lors de l'envoi du message");
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="contact" id="contact">
      <div className="container">
        <div className="row justify-content-between align-items-center">
          <SlideUp className="col-lg-5">
            <div className="location">
              <h3 className="t__54">Contactez-nous</h3>
              <p className="location__disc">
                N'hésitez pas à nous contacter dès aujourd'hui pour discuter de
                vos besoins.
              </p>
              <ul>
                <li>
                  <img src="/icons/phone.svg" alt="img" />
                  <div>
                    <b>Applez nous:</b>
                    <p>09 87 33 45 19</p>
                  </div>
                </li>
                <li>
                  <img src="/icons/email1.svg" alt="img" />
                  <div>
                    <b>Envoyer un message:</b>
                    <p>
                      <ProtectedEmail
                        user="strasbourg"
                        domain="coworkingcafe.fr"
                        className="email"
                      />
                    </p>
                  </div>
                </li>
                <li>
                  <img src="/icons/location.svg" alt="img" />
                  <div className="d-flex flex-column gap-4 " id="emplacement">
                    <div>
                      <b>Emplacement:</b>
                      <p>1 rue de la Division Leclerc</p>
                      <p>67000 STRASBOURG</p>
                    </div>
                    <div className="d-flex gap-5">
                      <div>
                        <b>Tram:</b>
                        <p>Arrêt Langstross - Grand'Rue</p>
                        <p>Ligne A - D</p>
                      </div>
                      <div>
                        <b>Parking:</b>
                        <p>Place Gutemberg</p>
                        <p>5 min à pieds</p>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </SlideUp>
          <SlideUp className="col-lg-6 mt-5 mt-lg-0">
            <div className="contact__form">
              <h5 className="t__28">Contactez-nous ici</h5>
              {success && (
                <div className="alert alert-success mb-3">
                  Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
                </div>
              )}
              {error && (
                <div className="alert alert-danger mb-3">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="name"
                      placeholder="Votre nom *"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      placeholder="Votre Email *"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Votre téléphone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="form-select"
                    >
                      <option value="">Sujet *</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <textarea
                      name="message"
                      placeholder="Votre message *"
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <button type="submit" className="common__btn" disabled={loading}>
                      {loading ? "Envoi en cours..." : "Envoyez votre message"}
                      {!loading && <img src="/icons/arrow-up-right.svg" alt="img" />}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </SlideUp>
        </div>
      </div>
    </section>
  );
};

export default ContactInfo;
