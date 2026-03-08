import { Model, model, models } from 'mongoose'
import { StockMovementDocument, StockMovementSchema } from './document'

export type StockMovementModelType = Model<StockMovementDocument>

let StockMovementModel: StockMovementModelType

// Force recreation of model to pick up schema changes in development
if (models.StockMovement && process.env.NODE_ENV === 'production') {
  StockMovementModel = models.StockMovement as StockMovementModelType
} else {
  // Delete existing model to force schema reload in development
  if (models.StockMovement) {
    delete models.StockMovement
  }
  StockMovementModel = model<StockMovementDocument>(
    'StockMovement',
    StockMovementSchema,
    'inventory-movements'
  )
}

if (!StockMovementModel) {
  throw new Error('StockMovement model not initialized')
}

export { StockMovementModel as StockMovement }
export default StockMovementModel
export type { StockMovementDocument, MovementType } from './document'
