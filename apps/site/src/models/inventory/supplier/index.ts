import mongoose from "mongoose"
import { SupplierDocument, SupplierSchema } from "./document"

export const Supplier =
  (mongoose.models.Supplier as mongoose.Model<SupplierDocument>) ||
  mongoose.model<SupplierDocument>("Supplier", SupplierSchema)

export type { SupplierDocument }
