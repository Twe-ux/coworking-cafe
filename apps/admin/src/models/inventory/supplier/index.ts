import { Model, model, models } from 'mongoose'
import { SupplierDocument, SupplierSchema } from './document'

export type SupplierModelType = Model<SupplierDocument>

let SupplierModel: SupplierModelType

// Force recreation of model to pick up schema changes in development
if (models.Supplier && process.env.NODE_ENV === 'production') {
  SupplierModel = models.Supplier as SupplierModelType
} else {
  // Delete existing model to force schema reload in development
  if (models.Supplier) {
    delete models.Supplier
  }
  SupplierModel = model<SupplierDocument>('Supplier', SupplierSchema, 'inventory-suppliers')
}

if (!SupplierModel) {
  throw new Error('Supplier model not initialized')
}

export { SupplierModel as Supplier }
export default SupplierModel
export type { SupplierDocument } from './document'
