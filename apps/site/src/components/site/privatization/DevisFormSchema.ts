import { z } from 'zod'

export const devisFormSchema = z.object({
  // Contact
  contactName: z.string().min(2, 'Nom requis (min 2 caractères)'),
  company: z.string().optional(),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),

  // Event type
  eventType: z.enum(
    ['atelier', 'team-building', 'conference', 'reunion', 'autre'],
    { message: "Type d'événement requis" }
  ),
  eventTypeOther: z.string().optional(),

  // Date & time
  date: z.string().regex(
    /^\d{4}-\d{2}-\d{2}$/,
    'Format date invalide (YYYY-MM-DD)'
  ),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format heure invalide (HH:mm)'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Format heure invalide (HH:mm)'),

  // Attendees
  attendees: z.enum(
    ['0-10', '11-20', '21-30', '31-40', '41-60'],
    { message: 'Nombre de participants requis' }
  ),

  // Message
  message: z.string().optional(),
}).refine(
  (data) => {
    if (data.eventType === 'autre' && !data.eventTypeOther) {
      return false
    }
    return true
  },
  {
    message: "Précisez le type d'événement",
    path: ['eventTypeOther'],
  }
)

export type DevisFormData = z.infer<typeof devisFormSchema>
