import mongoose from "mongoose"
import { StockMovementDocument, StockMovementSchema } from "./document"

export const StockMovement =
  (mongoose.models.StockMovement as mongoose.Model<StockMovementDocument>) ||
  mongoose.model<StockMovementDocument>("StockMovement", StockMovementSchema)

export type { StockMovementDocument }
export type { MovementType } from "./document"
