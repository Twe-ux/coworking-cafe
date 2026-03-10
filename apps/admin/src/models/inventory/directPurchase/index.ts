import { Model, model, models } from 'mongoose'
import { DirectPurchaseDocument, DirectPurchaseSchema } from './document'

export type DirectPurchaseModelType = Model<DirectPurchaseDocument>

let DirectPurchaseModel: DirectPurchaseModelType

// Force recreation of model to pick up schema changes in development
if (models.DirectPurchase && process.env.NODE_ENV === 'production') {
  DirectPurchaseModel = models.DirectPurchase as DirectPurchaseModelType
} else {
  if (models.DirectPurchase) {
    delete models.DirectPurchase
  }
  DirectPurchaseModel = model<DirectPurchaseDocument>(
    'DirectPurchase',
    DirectPurchaseSchema,
    'inventory-direct-purchases'
  )
}

if (!DirectPurchaseModel) {
  throw new Error('DirectPurchase model not initialized')
}

export { DirectPurchaseModel as DirectPurchase }
export default DirectPurchaseModel
export type { DirectPurchaseDocument, DirectPurchaseItemDoc } from './document'
