/**
 * ContactForm Component - apps/site
 * Formulaire de contact avec validation
 */

'use client';

import { useState } from 'react';
import { apiClient, handleApiError } from '@/lib/utils/api-client';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const SUBJECTS = [
  'Renseignements généraux',
  'Réservation',
  'Tarifs et abonnements',
  'Événements privés',
  'Partenariat',
  'Autre',
];

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.post('/contact', formData);

      if (response.success) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
        });
      } else {
        setError(response.error || 'Erreur lors de l\'envoi');
      }
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-contact__form">
      <h3 className="page-contact__form-title">Contactez-nous ici</h3>

      {success && (
        <div className="alert alert-success mb-3">
          Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
        </div>
      )}

      {error && <div className="alert alert-danger mb-3">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="form-group mb-3">
              <input
                type="text"
                name="name"
                className="form-control"
                placeholder="Votre nom *"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group mb-3">
              <input
                type="email"
                name="email"
                className="form-control"
                placeholder="Votre Email *"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group mb-3">
              <input
                type="tel"
                name="phone"
                className="form-control"
                placeholder="Votre téléphone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group mb-3">
              <select
                name="subject"
                className="form-select"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Sujet *</option>
                {SUBJECTS.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-12">
            <div className="form-group mb-3">
              <textarea
                name="message"
                className="form-control"
                rows={6}
                placeholder="Votre message *"
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="col-12">
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Envoi en cours...' : 'Envoyez votre message'}
              {!loading && (
                <img src="/icons/arrow-up-right.svg" alt="" className="ms-2" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
