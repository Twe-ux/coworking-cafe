import { Model, model, models } from 'mongoose'
import { ProductLossDocument, ProductLossSchema } from './document'

export type ProductLossModelType = Model<ProductLossDocument>

let ProductLossModel: ProductLossModelType

// Force recreation of model to pick up schema changes in development
if (models.ProductLoss && process.env.NODE_ENV === 'production') {
  ProductLossModel = models.ProductLoss as ProductLossModelType
} else {
  if (models.ProductLoss) {
    delete models.ProductLoss
  }
  ProductLossModel = model<ProductLossDocument>(
    'ProductLoss',
    ProductLossSchema,
    'inventory-product-losses'
  )
}

if (!ProductLossModel) {
  throw new Error('ProductLoss model not initialized')
}

export { ProductLossModel as ProductLoss }
export default ProductLossModel
export type { ProductLossDocument, LossReason } from './document'
