/**
 * BookingForm Component - apps/site
 * Formulaire de réservation multi-étapes (version simple)
 */

'use client';

import { FormEvent } from 'react';
import type { BookingFormData, ValidationErrors } from '@/types';

interface BookingFormProps {
  formData: BookingFormData;
  errors: ValidationErrors;
  loading: boolean;
  spaces: Array<{
    id: string;
    name: string;
    type: string;
    pricePerHour: number;
  }>;
  onFieldChange: (field: keyof BookingFormData, value: string | number) => void;
  onSubmit: (e: FormEvent) => void;
}

export function BookingForm({
  formData,
  errors,
  loading,
  spaces,
  onFieldChange,
  onSubmit,
}: BookingFormProps) {
  return (
    <form onSubmit={onSubmit} className="booking-form">
      <div className="booking-form__header">
        <h2 className="booking-form__title">Réservez votre espace</h2>
        <p className="booking-form__subtitle">
          Remplissez le formulaire ci-dessous pour réserver votre espace
        </p>
      </div>

      {/* Sélection de l'espace */}
      <div className="booking-form__field">
        <label htmlFor="spaceId" className="booking-form__label">
          Espace *
        </label>
        <select
          id="spaceId"
          value={formData.spaceId}
          onChange={(e) => onFieldChange('spaceId', e.target.value)}
          className={`booking-form__select ${
            errors.spaceId ? 'booking-form__select--error' : ''
          }`}
          disabled={loading}
          required
        >
          <option value="">Sélectionnez un espace</option>
          {spaces.map((space) => (
            <option key={space.id} value={space.id}>
              {space.name} - {space.pricePerHour}€/h
            </option>
          ))}
        </select>
        {errors.spaceId && (
          <span className="booking-form__error">{errors.spaceId}</span>
        )}
      </div>

      {/* Date */}
      <div className="booking-form__field">
        <label htmlFor="date" className="booking-form__label">
          Date *
        </label>
        <input
          type="date"
          id="date"
          value={formData.date}
          onChange={(e) => onFieldChange('date', e.target.value)}
          className={`booking-form__input ${
            errors.date ? 'booking-form__input--error' : ''
          }`}
          disabled={loading}
          required
        />
        {errors.date && <span className="booking-form__error">{errors.date}</span>}
      </div>

      {/* Horaires */}
      <div className="booking-form__row">
        <div className="booking-form__field">
          <label htmlFor="startTime" className="booking-form__label">
            Heure de début *
          </label>
          <input
            type="time"
            id="startTime"
            value={formData.startTime}
            onChange={(e) => onFieldChange('startTime', e.target.value)}
            className={`booking-form__input ${
              errors.startTime ? 'booking-form__input--error' : ''
            }`}
            disabled={loading}
            required
          />
          {errors.startTime && (
            <span className="booking-form__error">{errors.startTime}</span>
          )}
        </div>

        <div className="booking-form__field">
          <label htmlFor="endTime" className="booking-form__label">
            Heure de fin *
          </label>
          <input
            type="time"
            id="endTime"
            value={formData.endTime}
            onChange={(e) => onFieldChange('endTime', e.target.value)}
            className={`booking-form__input ${
              errors.endTime ? 'booking-form__input--error' : ''
            }`}
            disabled={loading}
            required
          />
          {errors.endTime && (
            <span className="booking-form__error">{errors.endTime}</span>
          )}
        </div>
      </div>

      {/* Nombre de personnes */}
      <div className="booking-form__field">
        <label htmlFor="numberOfPeople" className="booking-form__label">
          Nombre de personnes *
        </label>
        <input
          type="number"
          id="numberOfPeople"
          min="1"
          max="50"
          value={formData.numberOfPeople}
          onChange={(e) => onFieldChange('numberOfPeople', parseInt(e.target.value))}
          className={`booking-form__input ${
            errors.numberOfPeople ? 'booking-form__input--error' : ''
          }`}
          disabled={loading}
          required
        />
        {errors.numberOfPeople && (
          <span className="booking-form__error">{errors.numberOfPeople}</span>
        )}
      </div>

      {/* Code promo */}
      <div className="booking-form__field">
        <label htmlFor="promoCode" className="booking-form__label">
          Code promo (optionnel)
        </label>
        <input
          type="text"
          id="promoCode"
          value={formData.promoCode || ''}
          onChange={(e) => onFieldChange('promoCode', e.target.value.toUpperCase())}
          className="booking-form__input"
          placeholder="STUDENT2026"
          disabled={loading}
        />
        {errors.promoCode && (
          <span className="booking-form__error">{errors.promoCode}</span>
        )}
      </div>

      {/* Erreur générale */}
      {errors.general && (
        <div className="booking-form__alert booking-form__alert--error">
          {errors.general}
        </div>
      )}

      {/* Actions */}
      <div className="booking-form__actions">
        <button
          type="submit"
          className="btn btn--primary btn--lg"
          disabled={loading}
        >
          {loading ? 'Calcul en cours...' : 'Calculer le prix'}
        </button>
      </div>
    </form>
  );
}
