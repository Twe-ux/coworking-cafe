import { z } from 'zod'

// ─── Supplier ───────────────────────────────────────────

const categoryEnum = z.enum(['food', 'cleaning', 'emballage', 'papeterie', 'divers'])

const dlcAlertConfigSchema = z.object({
  enabled: z.boolean(),
  days: z.array(z.number().int().min(0).max(6)),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Format HH:mm requis'),
})

export const supplierCreateSchema = z.object({
  name: z.string().min(2, 'Nom min 2 caractères').max(100),
  contact: z.string().min(2, 'Contact min 2 caractères').max(100),
  email: z.string().email('Email invalide').max(100).optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  categories: z.array(categoryEnum)
    .min(1, 'Au moins une catégorie requise')
    .max(5),
  notes: z.string().max(500).optional(),
  deliveryReminderMessage: z.string().max(500).optional(),
  isActive: z.boolean().optional(),
  requiresStockManagement: z.boolean().optional().default(true),
  dlcAlertConfig: dlcAlertConfigSchema.optional(),
  orderEmailConfig: z.object({
    showReference: z.boolean(),
    quantityDisplay: z.enum(['type', 'unit']),
  }).optional(),
})

export const supplierUpdateSchema = supplierCreateSchema.partial()

// ─── Product ────────────────────────────────────────────

const packagingTypeEnum = z.enum(['pack', 'unit'])
const priceTypeEnum = z.enum(['unit', 'pack'])
const packageUnitEnum = z.enum(['kg', 'L', 'unit'])

export const productCreateSchema = z.object({
  name: z.string().min(2, 'Nom min 2 caractères').max(100),
  category: categoryEnum,
  unitPriceHT: z.number().min(0, 'Prix doit être >= 0'),
  vatRate: z.number().min(0).max(100, 'TVA entre 0 et 100%'),
  supplierId: z.string().min(1, 'Fournisseur requis'),
  supplierReference: z.string().max(100).optional(),
  packagingType: packagingTypeEnum.optional().default('unit'),
  priceType: priceTypeEnum.optional().default('unit'),
  unitsPerPackage: z.number().int().min(1).max(1000).optional().default(1),
  packageUnit: packageUnitEnum.optional(),
  packagingDescription: z.string().max(200).optional(),
  minStock: z.number().min(0, 'Stock min doit être >= 0').optional(),
  maxStock: z.number().min(0, 'Stock max doit être >= 0').optional(),
  hasShortDLC: z.boolean().optional(),
  dlcAlertConfig: dlcAlertConfigSchema.optional(),
  criticalStockAlert: z.boolean().optional().default(false),
}).refine(
  data => {
    // Only validate stock comparison if both are provided
    if (data.minStock !== undefined && data.maxStock !== undefined) {
      return data.minStock < data.maxStock
    }
    return true
  },
  {
    message: 'Stock min doit être inférieur au stock max',
    path: ['minStock'],
  }
)

export const productUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  category: categoryEnum.optional(),
  unitPriceHT: z.number().min(0, 'Prix doit être >= 0').optional(),
  vatRate: z.number().min(0).max(100).optional(),
  supplierId: z.string().min(1).optional(),
  supplierReference: z.string().max(100).optional(),
  packagingType: packagingTypeEnum.optional(),
  priceType: priceTypeEnum.optional(),
  unitsPerPackage: z.number().int().min(1).max(1000).optional(),
  packageUnit: packageUnitEnum.optional(),
  packagingDescription: z.string().max(200).optional(),
  minStock: z.number().min(0).optional(),
  maxStock: z.number().min(0).optional(),
  hasShortDLC: z.boolean().optional(),
  dlcAlertConfig: dlcAlertConfigSchema.optional(),
  criticalStockAlert: z.boolean().optional(),
  isActive: z.boolean().optional(),
})

// ─── Direct Purchase ────────────────────────────────────

const directPurchaseItemSchema = z.object({
  productId: z.string().min(1, 'Produit requis'),
  quantity: z.number().min(0.01, 'Quantité doit être > 0'),
  unitPriceHT: z.number().min(0, 'Prix doit être >= 0'),
})

export const directPurchaseSchema = z.object({
  supplier: z.string().min(2, 'Nom fournisseur min 2 caractères').max(100),
  items: z.array(directPurchaseItemSchema)
    .min(1, 'Au moins un produit requis'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
  invoiceNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
})

// ─── Product Loss ───────────────────────────────────────

const lossReasonEnum = z.enum(['expiration', 'damage', 'theft', 'error', 'other'])

export const productLossSchema = z.object({
  quantity: z.number().min(0.01, 'Quantité doit être > 0'),
  reason: lossReasonEnum,
  notes: z.string().max(500).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
})

// ─── Inventory Entry ────────────────────────────────────

const inventoryTypeEnum = z.enum(['monthly', 'weekly'])

export const inventoryEntryCreateSchema = z.object({
  type: inventoryTypeEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format YYYY-MM-DD requis'),
  title: z.string().max(200).optional(),
  taskId: z.string().optional(),
})

// ─── Helper ─────────────────────────────────────────────

/**
 * Format Zod errors into a single readable message
 */
export function formatZodError(error: z.ZodError<unknown>): string {
  return error.issues.map((issue: z.ZodIssue) => {
    const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
    return `${path}${issue.message}`
  }).join(', ')
}
