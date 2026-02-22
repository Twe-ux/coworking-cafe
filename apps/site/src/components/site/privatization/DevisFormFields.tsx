import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { DevisFormData } from './DevisFormSchema'

const EVENT_TYPES = [
  { value: 'atelier', label: 'Atelier' },
  { value: 'team-building', label: 'Team Building' },
  { value: 'conference', label: 'Conference' },
  { value: 'reunion', label: 'Reunion' },
  { value: 'autre', label: 'Autre' },
] as const

export interface FieldProps {
  register: UseFormRegister<DevisFormData>
  errors: FieldErrors<DevisFormData>
}

export function ContactSection({ register, errors }: FieldProps) {
  return (
    <div className="mb-5">
      <h3 className="h4 mb-4">Informations de contact</h3>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label">
            Nom du contact <span className="text-danger">*</span>
          </label>
          <input
            {...register('contactName')}
            type="text"
            className={`form-control ${errors.contactName ? 'is-invalid' : ''}`}
            placeholder="Jean Dupont"
          />
          {errors.contactName && (
            <div className="invalid-feedback">{errors.contactName.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Societe</label>
          <input
            {...register('company')}
            type="text"
            className="form-control"
            placeholder="Ma Societe SAS"
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            {...register('email')}
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            placeholder="contact@exemple.fr"
          />
          {errors.email && (
            <div className="invalid-feedback">{errors.email.message}</div>
          )}
        </div>

        <div className="col-md-6">
          <label className="form-label">Telephone</label>
          <input
            {...register('phone')}
            type="tel"
            className="form-control"
            placeholder="06 12 34 56 78"
          />
        </div>
      </div>
    </div>
  )
}

interface EventTypeSectionProps extends FieldProps {
  eventType: string | undefined
}

export function EventTypeSection({ register, errors, eventType }: EventTypeSectionProps) {
  return (
    <div className="mb-5">
      <h3 className="h4 mb-4">
        Type d&apos;evenement <span className="text-danger">*</span>
      </h3>
      <div className="row g-2">
        {EVENT_TYPES.map(({ value, label }) => (
          <div className="col-md-6" key={value}>
            <div className="form-check">
              <input
                {...register('eventType')}
                type="radio"
                value={value}
                id={`event-${value}`}
                className="form-check-input"
              />
              <label className="form-check-label" htmlFor={`event-${value}`}>
                {label}
              </label>
            </div>
          </div>
        ))}
      </div>
      {errors.eventType && (
        <div className="text-danger mt-2">{errors.eventType.message}</div>
      )}

      {eventType === 'autre' && (
        <div className="mt-3">
          <label className="form-label">
            Precisez le type d&apos;evenement <span className="text-danger">*</span>
          </label>
          <input
            {...register('eventTypeOther')}
            type="text"
            className={`form-control ${errors.eventTypeOther ? 'is-invalid' : ''}`}
            placeholder="Ex: Lancement de produit, formation..."
          />
          {errors.eventTypeOther && (
            <div className="invalid-feedback">{errors.eventTypeOther.message}</div>
          )}
        </div>
      )}
    </div>
  )
}
