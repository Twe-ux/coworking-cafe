import mongoose from "mongoose"
import { InventoryEntryDocument, InventoryEntrySchema } from "./document"

export const InventoryEntry =
  (mongoose.models.InventoryEntry as mongoose.Model<InventoryEntryDocument>) ||
  mongoose.model<InventoryEntryDocument>("InventoryEntry", InventoryEntrySchema)

export type { InventoryEntryDocument }
export type { InventoryType, InventoryEntryItem } from "./document"
