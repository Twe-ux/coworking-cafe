import { Model, model, models } from 'mongoose'
import { PurchaseOrderDocument, PurchaseOrderSchema } from './document'

export type PurchaseOrderModelType = Model<PurchaseOrderDocument>

let PurchaseOrderModel: PurchaseOrderModelType

// Force recreation of model to pick up schema changes in development
if (models.PurchaseOrder && process.env.NODE_ENV === 'production') {
  PurchaseOrderModel = models.PurchaseOrder as PurchaseOrderModelType
} else {
  if (models.PurchaseOrder) {
    delete models.PurchaseOrder
  }
  PurchaseOrderModel = model<PurchaseOrderDocument>(
    'PurchaseOrder',
    PurchaseOrderSchema
  )
}

if (!PurchaseOrderModel) {
  throw new Error('PurchaseOrder model not initialized')
}

export { PurchaseOrderModel as PurchaseOrder }
export default PurchaseOrderModel
export type { PurchaseOrderDocument, OrderStatus, PurchaseOrderItem } from './document'
