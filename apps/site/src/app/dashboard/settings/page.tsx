'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsSection } from '@/components/dashboard/SettingsSection';
import { Toggle } from '@/components/ui/Toggle';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { UserSettings, ApiResponse } from '@/types';

/**
 * Page Paramètres
 * Gestion des paramètres utilisateur
 * GET /api/user/settings + PUT /api/user/settings
 */
export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings');
      const result: ApiResponse<UserSettings> = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors du chargement');
        return;
      }

      setSettings(result.data || null);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      const result: ApiResponse<{ message: string }> = await response.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors de la sauvegarde');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateNotification = (key: keyof UserSettings['notifications'], value: boolean) => {
    if (!settings) return;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  const updatePrivacy = (key: keyof UserSettings['privacy'], value: boolean | string) => {
    if (!settings) return;
    setSettings({
      ...settings,
      privacy: {
        ...settings.privacy,
        [key]: value
      }
    });
  };

  if (loading) {
    return (
      <main className="page-dashboard-settings">
        <div className="page-dashboard-settings__loading">
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (error && !settings) {
    return (
      <main className="page-dashboard-settings">
        <Card>
          <Card.Body>
            <div className="page-dashboard-settings__error">
              <p>{error}</p>
              <Button onClick={fetchSettings}>Réessayer</Button>
            </div>
          </Card.Body>
        </Card>
      </main>
    );
  }

  if (!settings) return null;

  return (
    <main className="page-dashboard-settings">
      <div className="page-dashboard-settings__header">
        <h1 className="page-dashboard-settings__title">Paramètres</h1>
        <p className="page-dashboard-settings__subtitle">
          Gérez vos préférences et votre confidentialité
        </p>
      </div>

      <div className="page-dashboard-settings__content">
        <SettingsSection
          title="Notifications"
          description="Gérez vos préférences de notifications"
        >
          <div className="page-dashboard-settings__toggles">
            <Toggle
              label="Notifications par email"
              description="Recevoir des notifications par email"
              checked={settings.notifications.email}
              onCheckedChange={(checked) => updateNotification('email', checked)}
            />

            <Toggle
              label="Rappels de réservations"
              description="Recevoir des rappels avant vos réservations"
              checked={settings.notifications.bookingReminders}
              onCheckedChange={(checked) => updateNotification('bookingReminders', checked)}
            />

            <Toggle
              label="Promotions"
              description="Recevoir les offres promotionnelles"
              checked={settings.notifications.promotions}
              onCheckedChange={(checked) => updateNotification('promotions', checked)}
            />

            <Toggle
              label="Newsletter"
              description="Recevoir la newsletter mensuelle"
              checked={settings.notifications.newsletter}
              onCheckedChange={(checked) => updateNotification('newsletter', checked)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Confidentialité"
          description="Contrôlez la visibilité de vos informations"
        >
          <div className="page-dashboard-settings__privacy">
            <div className="page-dashboard-settings__field">
              <label className="page-dashboard-settings__field-label">
                Visibilité du profil
              </label>
              <Select
                value={settings.privacy.profileVisibility}
                onChange={(e) => updatePrivacy('profileVisibility', e.target.value)}
                options={[
                  { value: 'private', label: 'Privé' },
                  { value: 'public', label: 'Public' }
                ]}
              />
            </div>

            <Toggle
              label="Afficher mon email"
              description="Rendre mon adresse email visible publiquement"
              checked={settings.privacy.showEmail}
              onCheckedChange={(checked) => updatePrivacy('showEmail', checked)}
            />

            <Toggle
              label="Afficher mon téléphone"
              description="Rendre mon numéro de téléphone visible publiquement"
              checked={settings.privacy.showPhone}
              onCheckedChange={(checked) => updatePrivacy('showPhone', checked)}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Langue"
          description="Choisissez votre langue préférée"
        >
          <div className="page-dashboard-settings__field">
            <Select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value as 'fr' | 'en' })}
              options={[
                { value: 'fr', label: 'Français' },
                { value: 'en', label: 'English' }
              ]}
            />
          </div>
        </SettingsSection>

        <SettingsSection
          title="Compte"
          description="Gérez votre compte"
        >
          <div className="page-dashboard-settings__account-actions">
            <Button
              variant="outline"
              onClick={() => router.push('/auth/change-password')}
            >
              Changer mon mot de passe
            </Button>

            <Button
              variant="danger"
              onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                  // TODO: Implement account deletion
                }
              }}
            >
              Supprimer mon compte
            </Button>
          </div>
        </SettingsSection>
      </div>

      {success && (
        <div className="page-dashboard-settings__success" role="alert">
          Paramètres enregistrés avec succès
        </div>
      )}

      {error && (
        <div className="page-dashboard-settings__error" role="alert">
          {error}
        </div>
      )}

      <div className="page-dashboard-settings__actions">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          loading={saving}
        >
          Enregistrer les modifications
        </Button>
      </div>
    </main>
  );
}
