import mongoose from "mongoose"
import { PurchaseOrderDocument, PurchaseOrderSchema } from "./document"

export const PurchaseOrder =
  (mongoose.models.PurchaseOrder as mongoose.Model<PurchaseOrderDocument>) ||
  mongoose.model<PurchaseOrderDocument>("PurchaseOrder", PurchaseOrderSchema)

export type { PurchaseOrderDocument }
export type { OrderStatus, PurchaseOrderItem } from "./document"
