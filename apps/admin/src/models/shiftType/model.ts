import { Model, models, model, Schema } from "mongoose";
import { ShiftTypeDocument } from "./document";

const ShiftTypeSchema = new Schema<ShiftTypeDocument>(
  {
    name: {
      type: String,
      required: [true, "Le nom du shift type est requis"],
      trim: true,
    },
    startTime: {
      type: String,
      required: [true, "L'heure de début est requise"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"],
    },
    endTime: {
      type: String,
      required: [true, "L'heure de fin est requise"],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format d'heure invalide (HH:MM)"],
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for ordering
ShiftTypeSchema.index({ order: 1 });

const ShiftTypeModel: Model<ShiftTypeDocument> =
  models.ShiftType || model<ShiftTypeDocument>("ShiftType", ShiftTypeSchema);

export default ShiftTypeModel;
