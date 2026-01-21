import { z } from 'zod'

/**
 * Validation schema for creating a shift
 */
export const createShiftSchema = z
  .object({
    employeeId: z.string().min(1, 'ID employé requis'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD'),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure de début doit être au format HH:mm'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure de fin doit être au format HH:mm'),
    type: z.enum(['SHIFT', 'LEAVE'], {
      message: 'Type de shift invalide',
    }).optional(),
  })
  .refine(
    (data) => {
      return data.endTime !== data.startTime
    },
    {
      message: 'L\'heure de fin doit être différente de l\'heure de début',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const [startHour, startMinute] = data.startTime.split(':').map(Number)
      const [endHour, endMinute] = data.endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute

      return endMinutes > startMinutes
    },
    {
      message: 'L\'heure de fin doit être après l\'heure de début',
      path: ['endTime'],
    }
  )

/**
 * Validation schema for updating a shift
 */
export const updateShiftSchema = z
  .object({
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure de début doit être au format HH:mm').optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure de fin doit être au format HH:mm').optional(),
    type: z.enum(['SHIFT', 'LEAVE']).optional(),
  })
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      return data.endTime !== data.startTime
    },
    {
      message: 'L\'heure de fin doit être différente de l\'heure de début',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true
      const [startHour, startMinute] = data.startTime.split(':').map(Number)
      const [endHour, endMinute] = data.endTime.split(':').map(Number)
      const startMinutes = startHour * 60 + startMinute
      const endMinutes = endHour * 60 + endMinute

      return endMinutes > startMinutes
    },
    {
      message: 'L\'heure de fin doit être après l\'heure de début',
      path: ['endTime'],
    }
  )

/**
 * Validation schema for bulk shift creation
 */
export const bulkCreateShiftsSchema = z.object({
  shifts: z
    .array(createShiftSchema)
    .min(1, 'Au moins un shift doit être fourni')
    .max(100, 'Maximum 100 shifts peuvent être créés à la fois'),
})

export type CreateShiftInput = z.infer<typeof createShiftSchema>
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>
export type BulkCreateShiftsInput = z.infer<typeof bulkCreateShiftsSchema>
