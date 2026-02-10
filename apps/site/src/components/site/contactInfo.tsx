"use client";
import SlideUp from "../../utils/animations/slideUp";
import Image from "next/image";
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const subjects = [
    "Renseignements généraux",
    "Réservation",
    "Tarifs et abonnements",
    "Événements privés",
    "Partenariat",
    "Autre",
  ];

  const validatePhone = (phone: string): string | null => {
    if (!phone) return null; // Champ optionnel
    const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[\s.-]?\d{2}){4})$/;
    if (!phoneRegex.test(phone)) {
      return "Format invalide. Ex: 06 12 34 56 78 ou 0612345678";
    }
    return null;
  };

  const validateEmail = (email: string): string | null => {
    if (!email) return "L'email est requis";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Format d'email invalide";
    }
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Effacer l'erreur du champ quand l'utilisateur tape
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: "" });
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    let errorMessage: string | null = null;

    if (name === "phone" && value) {
      errorMessage = validatePhone(value);
    } else if (name === "email") {
      errorMessage = validateEmail(value);
    } else if (name === "name" && !value) {
      errorMessage = "Le nom est requis";
    } else if (name === "message" && !value) {
      errorMessage = "Le message est requis";
    }

    if (errorMessage) {
      setFieldErrors({ ...fieldErrors, [name]: errorMessage });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation de tous les champs
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Le nom est requis";
    }

    const emailError = validateEmail(formData.email);
    if (emailError) {
      errors.email = emailError;
    }

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }

    if (!formData.subject) {
      errors.subject = "Le sujet est requis";
    }

    if (!formData.message.trim()) {
      errors.message = "Le message est requis";
    }

    // Si des erreurs, arrêter la soumission
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Veuillez corriger les erreurs dans le formulaire");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/contact-mails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setFieldErrors({});
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
                  <Image
                    src="/icons/phone.svg"
                    alt="Icône téléphone"
                    width={24}
                    height={24}
                    loading="lazy"
                  />
                  <div>
                    <b>Applez nous:</b>
                    <p>09 87 33 45 19</p>
                  </div>
                </li>
                <li>
                  <Image
                    src="/icons/email1.svg"
                    alt="Icône email"
                    width={24}
                    height={24}
                    loading="lazy"
                  />
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
                  <Image
                    src="/icons/location.svg"
                    alt="Icône localisation"
                    width={24}
                    height={24}
                    loading="lazy"
                  />
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
                  Votre message a été envoyé avec succès. Nous vous répondrons
                  dans les plus brefs délais.
                </div>
              )}
              {error && <div className="alert alert-danger mb-3">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="text"
                      name="name"
                      placeholder="Votre nom *"
                      value={formData.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldErrors.name ? "is-invalid" : ""}
                      required
                    />
                    {fieldErrors.name && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.name}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <input
                      type="email"
                      name="email"
                      placeholder="Votre Email *"
                      value={formData.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldErrors.email ? "is-invalid" : ""}
                      required
                    />
                    {fieldErrors.email && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.email}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="06 12 34 56 78"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldErrors.phone ? "is-invalid" : ""}
                    />
                    {fieldErrors.phone && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.phone}
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`form-select ${fieldErrors.subject ? "is-invalid" : ""}`}
                      required
                    >
                      <option value="">Sujet *</option>
                      {subjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.subject && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.subject}
                      </div>
                    )}
                  </div>
                  <div className="col-12">
                    <textarea
                      name="message"
                      placeholder="Votre message *"
                      value={formData.message}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={fieldErrors.message ? "is-invalid" : ""}
                      required
                    />
                    {fieldErrors.message && (
                      <div className="invalid-feedback d-block">
                        {fieldErrors.message}
                      </div>
                    )}
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="common__btn"
                      disabled={loading}
                    >
                      {loading ? "Envoi en cours..." : "Envoyez votre message"}
                      {!loading && (
                        <Image
                          src="/icons/arrow-up-right.svg"
                          alt="Icône lien externe"
                          width={16}
                          height={16}
                          loading="lazy"
                        />
                      )}
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
