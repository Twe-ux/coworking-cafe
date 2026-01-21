import { z } from 'zod'

/**
 * Schema for cash entry item (PrestaB2B or Depense)
 */
const cashEntryItemSchema = z.object({
  label: z.string().min(1, 'Le libellé est requis'),
  value: z.number().min(0, 'La valeur doit être positive'),
})

/**
 * Validation schema for creating a cash entry
 */
export const createCashEntrySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date doit être au format YYYY-MM-DD')
    .refine(
      (date) => {
        const entryDate = new Date(date)
        const today = new Date()
        return entryDate <= today
      },
      'La date ne peut pas être dans le futur'
    ),
  prestaB2B: z.array(cashEntryItemSchema).optional(),
  depenses: z.array(cashEntryItemSchema).optional(),
  virement: z.number().min(0, 'Le montant virement doit être positif').optional(),
  especes: z.number().min(0, 'Le montant espèces doit être positif').optional(),
  cbClassique: z.number().min(0, 'Le montant CB classique doit être positif').optional(),
  cbSansContact: z.number().min(0, 'Le montant CB sans contact doit être positif').optional(),
})

/**
 * Validation schema for updating a cash entry
 * All fields are optional for partial updates
 */
export const updateCashEntrySchema = z.object({
  prestaB2B: z.array(cashEntryItemSchema).optional(),
  depenses: z.array(cashEntryItemSchema).optional(),
  virement: z.number().min(0, 'Le montant virement doit être positif').optional(),
  especes: z.number().min(0, 'Le montant espèces doit être positif').optional(),
  cbClassique: z.number().min(0, 'Le montant CB classique doit être positif').optional(),
  cbSansContact: z.number().min(0, 'Le montant CB sans contact doit être positif').optional(),
})

export type CreateCashEntryInput = z.infer<typeof createCashEntrySchema>
export type UpdateCashEntryInput = z.infer<typeof updateCashEntrySchema>
export type CashEntryItem = z.infer<typeof cashEntryItemSchema>
