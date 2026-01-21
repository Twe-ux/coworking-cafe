'use client';

import { useState, useEffect } from 'react';

interface SettingsClientProps {
  initialNewsletter: boolean;
}

export default function SettingsClient({ initialNewsletter }: SettingsClientProps) {
  const [newsletter, setNewsletter] = useState(initialNewsletter);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleNewsletterChange = async (checked: boolean) => {
    setNewsletter(checked);
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/newsletter', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newsletter: checked }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      setMessage({
        type: 'success',
        text: checked ? 'Inscrit à la newsletter !' : 'Désinscrit de la newsletter',
      });

      // Auto-hide success message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setNewsletter(!checked); // Revert on error
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Une erreur est survenue',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'danger'} mb-4`} role="alert">
          {message.text}
        </div>
      )}

      <div className="mb-3 form-check form-switch">
        <input
          className="form-check-input"
          type="checkbox"
          id="newsletter"
          checked={newsletter}
          onChange={(e) => handleNewsletterChange(e.target.checked)}
          disabled={saving}
        />
        <label className="form-check-label" htmlFor="newsletter">
          Newsletter mensuelle
          {saving && <span className="ms-2 spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
        </label>
        <small className="d-block text-muted">
          Recevez une fois par mois toutes les actus, événements et promotions en cours
        </small>
      </div>
    </>
  );
}
