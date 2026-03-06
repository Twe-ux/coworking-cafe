import { Model, model, models } from 'mongoose'
import { InventoryEntryDocument, InventoryEntrySchema } from './document'

export type InventoryEntryModelType = Model<InventoryEntryDocument>

let InventoryEntryModel: InventoryEntryModelType

// Force recreation of model to pick up schema changes in development
if (models.InventoryEntry && process.env.NODE_ENV === 'production') {
  InventoryEntryModel = models.InventoryEntry as InventoryEntryModelType
} else {
  // Delete existing model to force schema reload in development
  if (models.InventoryEntry) {
    delete models.InventoryEntry
  }
  InventoryEntryModel = model<InventoryEntryDocument>(
    'InventoryEntry',
    InventoryEntrySchema,
    'inventory-entries'
  )
}

if (!InventoryEntryModel) {
  throw new Error('InventoryEntry model not initialized')
}

export { InventoryEntryModel as InventoryEntry }
export default InventoryEntryModel
export type { InventoryEntryDocument, InventoryType, InventoryEntryItem } from './document'
