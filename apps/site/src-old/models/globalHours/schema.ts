import { Schema } from "mongoose";
import { GlobalHoursConfigurationDocument } from "./document";

const dayHoursSchema = new Schema(
  {
    isOpen: {
      type: Boolean,
      required: true,
      default: true,
    },
    openTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    closeTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
  },
  { _id: false }
);

const weeklyHoursSchema = new Schema(
  {
    monday: { type: dayHoursSchema, required: true },
    tuesday: { type: dayHoursSchema, required: true },
    wednesday: { type: dayHoursSchema, required: true },
    thursday: { type: dayHoursSchema, required: true },
    friday: { type: dayHoursSchema, required: true },
    saturday: { type: dayHoursSchema, required: true },
    sunday: { type: dayHoursSchema, required: true },
  },
  { _id: false }
);

const exceptionalClosureSchema = new Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    reason: {
      type: String,
    },
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isFullDay: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const globalHoursConfigurationSchema = new Schema<GlobalHoursConfigurationDocument>(
  {
    defaultHours: {
      type: weeklyHoursSchema,
      required: true,
    },
    exceptionalClosures: {
      type: [exceptionalClosureSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche rapide
globalHoursConfigurationSchema.index({ createdAt: -1 });

export default globalHoursConfigurationSchema;
