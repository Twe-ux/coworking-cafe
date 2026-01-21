'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ClientProfile, UpdateProfileData } from '@/types';

/**
 * Props du composant ProfileForm
 */
export interface ProfileFormProps {
  profile: ClientProfile;
  onUpdate: (data: UpdateProfileData) => Promise<boolean>;
  updating: boolean;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

/**
 * Composant ProfileForm
 * Formulaire d'édition du profil utilisateur
 * Validation inline avec regex téléphone français
 */
export function ProfileForm({ profile, onUpdate, updating }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
    avatar: profile.avatar || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState(false);

  // Reset success message après 3 secondes
  useEffect(() => {
    if (success) {
      const timeout = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [success]);

  const handleChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    setSuccess(false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation prénom
    if (!formData.firstName || formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    // Validation nom
    if (!formData.lastName || formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation téléphone (regex français)
    if (formData.phone) {
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Numéro de téléphone invalide';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const updated = await onUpdate(formData);

    if (updated) {
      setSuccess(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="profile-form__avatar">
        <div className="profile-form__avatar-preview">
          {formData.avatar ? (
            <img src={formData.avatar} alt={`${formData.firstName || ''} ${formData.lastName || ''}`} />
          ) : (
            <div className="profile-form__avatar-placeholder">
              {formData.firstName?.charAt(0) || ''}{formData.lastName?.charAt(0) || ''}
            </div>
          )}
        </div>
        <div className="profile-form__avatar-actions">
          <p className="profile-form__avatar-text">Photo de profil</p>
          <Button type="button" variant="outline" size="sm">
            Changer la photo
          </Button>
        </div>
      </div>

      <div className="profile-form__fields">
        <Input
          label="Prénom"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          error={errors.firstName}
          required
          disabled={updating}
        />

        <Input
          label="Nom"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          error={errors.lastName}
          required
          disabled={updating}
        />

        <Input
          label="Email"
          type="email"
          value={profile.email}
          disabled
          readOnly
        />

        <Input
          label="Téléphone"
          type="tel"
          placeholder="+33 6 12 34 56 78"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          error={errors.phone}
          disabled={updating}
        />
      </div>

      {success && (
        <div className="profile-form__success" role="alert">
          Profil mis à jour avec succès
        </div>
      )}

      <div className="profile-form__actions">
        <Button type="submit" variant="primary" loading={updating}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}
