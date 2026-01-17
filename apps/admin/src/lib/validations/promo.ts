import * as z from 'zod'

/**
 * Validation schema pour le formulaire de création de code promo
 */
export const promoCreateSchema = z.object({
  code: z
    .string()
    .min(3, 'Le code doit contenir au moins 3 caractères')
    .max(20, 'Le code doit contenir au plus 20 caractères')
    .regex(/^[A-Z0-9_-]+$/, 'Le code doit contenir uniquement lettres majuscules, chiffres, - et _'),
  token: z
    .string()
    .min(8, 'Le token doit contenir au moins 8 caractères')
    .max(50, 'Le token doit contenir au plus 50 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  discountType: z.enum(['percentage', 'fixed', 'free_item']),
  discountValue: z.number().min(0, 'La valeur doit être positive'),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  maxUses: z.number().min(0, 'Le nombre doit être positif ou 0 pour illimité'),
})

/**
 * Validation schema pour le formulaire de marketing
 */
export const promoMarketingSchema = z.object({
  title: z
    .string()
    .min(5, 'Le titre doit contenir au moins 5 caractères')
    .max(100, 'Le titre doit contenir au plus 100 caractères'),
  message: z
    .string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(1000, 'Le message doit contenir au plus 1000 caractères'),
  imageUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  ctaText: z
    .string()
    .min(3, 'Le texte du bouton doit contenir au moins 3 caractères')
    .max(50, 'Le texte du bouton doit contenir au plus 50 caractères'),
})

export type PromoCreateFormValues = z.infer<typeof promoCreateSchema>
export type PromoMarketingFormValues = z.infer<typeof promoMarketingSchema>
