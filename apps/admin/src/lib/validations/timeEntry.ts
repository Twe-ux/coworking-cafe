import { z } from 'zod'

/**
 * Validation schema for clock-in request
 */
export const clockInSchema = z.object({
  employeeId: z.string().min(1, 'ID employé requis'),
  pin: z.string().regex(/^\d{4}$/, 'Le PIN doit être composé de 4 chiffres'),
  clockIn: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'L\'heure d\'entrée doit être au format HH:mm')
    .optional(),
  justificationNote: z.string().max(500, 'La note de justification ne peut pas dépasser 500 caractères').optional(),
})

/**
 * Validation schema for clock-out request
 * PIN optionnel pour permettre l'arrêt de pointage sans re-saisie
 */
export const clockOutSchema = z.object({
  employeeId: z.string().min(1, 'ID employé requis'),
  pin: z.string().regex(/^\d{4}$/, 'Le PIN doit être composé de 4 chiffres').optional(),
  timeEntryId: z.string().optional(),
  clockOut: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'L\'heure de sortie doit être au format HH:mm')
    .optional(),
  justificationNote: z.string().max(500, 'La note de justification ne peut pas dépasser 500 caractères').optional(),
})

/**
 * Validation schema for creating a time entry (admin manual entry)
 */
export const createTimeEntrySchema = z
  .object({
    employeeId: z.string().min(1, 'ID employé requis'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD'),
    clockIn: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure d\'entrée doit être au format HH:mm'),
    clockOut: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'L\'heure de sortie doit être au format HH:mm')
      .optional()
      .nullable(),
    shiftNumber: z.union([z.literal(1), z.literal(2)]),
  })
  .refine(
    (data) => {
      if (!data.clockOut) return true
      return data.clockOut !== data.clockIn
    },
    {
      message: 'L\'heure de sortie doit être différente de l\'heure d\'entrée',
      path: ['clockOut'],
    }
  )

/**
 * Validation schema for updating a time entry
 */
export const updateTimeEntrySchema = z
  .object({
    clockIn: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure d\'entrée doit être au format HH:mm').optional(),
    clockOut: z
      .string()
      .regex(/^\d{2}:\d{2}$/, 'L\'heure de sortie doit être au format HH:mm')
      .optional()
      .nullable(),
    status: z.enum(['active', 'completed']).optional(),
  })
  .refine(
    (data) => {
      if (!data.clockIn || !data.clockOut) return true
      return data.clockOut !== data.clockIn
    },
    {
      message: 'L\'heure de sortie doit être différente de l\'heure d\'entrée',
      path: ['clockOut'],
    }
  )

export type ClockInInput = z.infer<typeof clockInSchema>
export type ClockOutInput = z.infer<typeof clockOutSchema>
export type CreateTimeEntryInput = z.infer<typeof createTimeEntrySchema>
export type UpdateTimeEntryInput = z.infer<typeof updateTimeEntrySchema>
