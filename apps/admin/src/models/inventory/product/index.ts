import { Model, model, models } from 'mongoose'
import { ProductDocument, ProductSchema } from './document'

export type ProductModelType = Model<ProductDocument>

let ProductModel: ProductModelType

// Force recreation of model to pick up schema changes in development
if (models.Product && process.env.NODE_ENV === 'production') {
  ProductModel = models.Product as ProductModelType
} else {
  // Delete existing model to force schema reload in development
  if (models.Product) {
    delete models.Product
  }
  ProductModel = model<ProductDocument>('Product', ProductSchema)
}

if (!ProductModel) {
  throw new Error('Product model not initialized')
}

export { ProductModel as Product }
export default ProductModel
export type { ProductDocument } from './document'
