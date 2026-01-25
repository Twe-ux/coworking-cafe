import { z } from 'zod'

/**
 * Validation schema for creating an employee
 * Validates all required fields for employee creation
 */
export const createEmployeeSchema = z.object({
  // Personal information
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom ne peut pas dépasser 50 caractères')
    .trim(),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .trim(),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de naissance doit être au format YYYY-MM-DD')
    .refine((date) => {
      const birthDate = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      return age >= 16 && age <= 100
    }, 'L\'employé doit avoir entre 16 et 100 ans'),
  placeOfBirth: z
    .object({
      city: z.string().trim().optional(),
      department: z.string().trim().optional(),
      country: z.string().trim().optional(),
    })
    .optional()
    .nullable()
    .transform((val) => {
      // Si l'objet existe mais tous les champs sont vides, retourner undefined
      if (!val) return undefined;
      if (!val.city && !val.department && !val.country) return undefined;
      return val;
    }),
  nationality: z.string().trim().optional(),
  address: z
    .object({
      street: z.string().trim().optional(),
      postalCode: z.string().trim().optional(),
      city: z.string().trim().optional(),
    })
    .optional(),
  phone: z
    .string()
    .min(10, 'Le téléphone doit contenir au moins 10 caractères')
    .trim(),
  email: z.string().email('Veuillez fournir une adresse email valide').trim().toLowerCase(),
  socialSecurityNumber: z
    .string()
    .trim()
    .transform((val) => val.replace(/\s/g, '')) // Remove spaces
    .refine(
      (val) => /^\d{15}$/.test(val),
      'Le numéro de sécurité sociale doit contenir exactement 15 chiffres'
    ),

  // Contract information
  contractType: z.enum(['CDI', 'CDD', 'Stage'], {
    message: 'Type de contrat invalide',
  }),
  contractualHours: z
    .number()
    .min(0, 'Le nombre d\'heures contractuelles doit être positif')
    .max(168, 'Le nombre d\'heures ne peut pas dépasser 168h par semaine'),
  hireDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date d\'embauche doit être au format YYYY-MM-DD'),
  hireTime: z.string().regex(/^\d{2}:\d{2}$/, 'L\'heure d\'embauche doit être au format HH:mm').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de fin doit être au format YYYY-MM-DD').optional(),
  endContractReason: z.enum(['démission', 'fin-periode-essai', 'rupture']).optional(),

  // Compensation
  level: z.string().trim().optional(),
  step: z.number().int().min(1, 'L\'échelon doit être supérieur à 0').optional(),
  hourlyRate: z.number().min(0, 'Le taux horaire doit être positif').optional(),
  monthlySalary: z.number().min(0, 'Le salaire mensuel doit être positif').optional(),

  // Employee role
  employeeRole: z.enum(['Manager', 'Assistant manager', 'Employé polyvalent'], {
    message: 'Rôle employé invalide',
  }),

  // Clocking
  clockingCode: z
    .string()
    .regex(/^\d{4}$/, 'Le code de pointage doit contenir 4 chiffres')
    .trim(),

  // Color for planning
  color: z.string().trim().optional(),

  // Availability (optional)
  availability: z
    .object({
      monday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      tuesday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      wednesday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      thursday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      friday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      saturday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
      sunday: z.object({
        available: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/),
          })
        ),
      }),
    })
    .optional(),

  // Bank details (optional)
  bankDetails: z
    .object({
      iban: z.string().trim(),
      bic: z.string().trim(),
      bankName: z.string().trim(),
    })
    .optional(),
})

/**
 * Validation schema for updating an employee
 * All fields are optional for partial updates
 */
export const updateEmployeeSchema = createEmployeeSchema.partial()

/**
 * Validation schema for ending an employee contract
 */
export const endContractSchema = z.object({
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La date de fin doit être au format YYYY-MM-DD'),
  endContractReason: z.enum(['démission', 'fin-periode-essai', 'rupture'], {
    message: 'Raison de fin de contrat invalide',
  }),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>
export type EndContractInput = z.infer<typeof endContractSchema>
