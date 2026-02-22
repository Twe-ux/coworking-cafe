import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import type { DevisFormData } from './DevisFormSchema'

const ATTENDEE_OPTIONS = [
  { value: '0-10', label: '0 a 10 personnes' },
  { value: '11-20', label: '11 a 20 personnes' },
  { value: '21-30', label: '21 a 30 personnes' },
  { value: '31-40', label: '31 a 40 personnes' },
  { value: '41-60', label: '41 a 60 personnes' },
] as const

interface FieldProps {
  register: UseFormRegister<DevisFormData>
  errors: FieldErrors<DevisFormData>
}

interface DateTimeSectionProps extends FieldProps {
  minDate: string
}

export function DateTimeSection({ register, errors, minDate }: DateTimeSectionProps) {
  return (
    <div className="mb-5">
      <h3 className="h4 mb-4">
        Date et horaires <span className="text-danger">*</span>
      </h3>
      <div className="row g-3">
        <div className="col-md-4">
          <label className="form-label">Date</label>
          <input
            {...register('date')}
            type="date"
            className={`form-control ${errors.date ? 'is-invalid' : ''}`}
            min={minDate}
          />
          {errors.date && (
            <div className="invalid-feedback">{errors.date.message}</div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">Heure de debut</label>
          <input
            {...register('startTime')}
            type="time"
            className={`form-control ${errors.startTime ? 'is-invalid' : ''}`}
          />
          {errors.startTime && (
            <div className="invalid-feedback">{errors.startTime.message}</div>
          )}
        </div>

        <div className="col-md-4">
          <label className="form-label">Heure de fin</label>
          <input
            {...register('endTime')}
            type="time"
            className={`form-control ${errors.endTime ? 'is-invalid' : ''}`}
          />
          {errors.endTime && (
            <div className="invalid-feedback">{errors.endTime.message}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export function AttendeesSection({ register, errors }: FieldProps) {
  return (
    <div className="mb-5">
      <h3 className="h4 mb-4">
        Nombre de participants <span className="text-danger">*</span>
      </h3>
      <select
        {...register('attendees')}
        className={`form-select ${errors.attendees ? 'is-invalid' : ''}`}
      >
        <option value="">Selectionnez</option>
        {ATTENDEE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {errors.attendees && (
        <div className="invalid-feedback">{errors.attendees.message}</div>
      )}
    </div>
  )
}

export function MessageSection({ register }: Pick<FieldProps, 'register'>) {
  return (
    <div className="mb-5">
      <h3 className="h4 mb-4">Message (optionnel)</h3>
      <textarea
        {...register('message')}
        className="form-control"
        rows={4}
        placeholder="Informations complementaires sur votre evenement : besoins specifiques, equipement, restauration..."
      />
    </div>
  )
}

interface SubmitButtonProps {
  isSubmitting: boolean
}

export function SubmitButton({ isSubmitting }: SubmitButtonProps) {
  return (
    <>
      <div className="d-grid">
        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              />
              Envoi en cours...
            </>
          ) : (
            'Demander un devis'
          )}
        </button>
      </div>
      <p className="text-muted text-center mt-3 small">
        <span className="text-danger">*</span> Champs obligatoires
      </p>
    </>
  )
}
