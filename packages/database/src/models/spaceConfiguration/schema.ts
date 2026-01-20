import { Schema } from "mongoose";
import { SpaceConfigurationDocument } from "./document";

const pricingTierSchema = new Schema(
  {
    minPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    maxPeople: {
      type: Number,
      required: true,
      min: 1,
    },
    hourlyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    extraPersonHourly: {
      type: Number,
      min: 0,
    },
    extraPersonDaily: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const pricingStructureSchema = new Schema(
  {
    hourly: {
      type: Number,
      required: true,
      min: 0,
    },
    daily: {
      type: Number,
      required: true,
      min: 0,
    },
    weekly: {
      type: Number,
      required: true,
      min: 0,
    },
    monthly: {
      type: Number,
      required: true,
      min: 0,
    },
    perPerson: {
      type: Boolean,
      default: false,
    },
    maxHoursBeforeDaily: {
      type: Number,
      min: 0,
    },
    dailyRatePerPerson: {
      type: Number,
      min: 0,
    },
    tiers: {
      type: [pricingTierSchema],
      default: [],
    },
  },
  { _id: false }
);

const availableReservationTypesSchema = new Schema(
  {
    hourly: {
      type: Boolean,
      default: true,
    },
    daily: {
      type: Boolean,
      default: true,
    },
    weekly: {
      type: Boolean,
      default: false,
    },
    monthly: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

const depositPolicySchema = new Schema(
  {
    enabled: {
      type: Boolean,
      default: false,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    fixedAmount: {
      type: Number,
      min: 0,
    },
    minimumAmount: {
      type: Number,
      min: 0,
    },
  },
  { _id: false }
);

const spaceConfigurationSchema = new Schema<SpaceConfigurationDocument>(
  {
    spaceType: {
      type: String,
      enum: ["open-space", "salle-verriere", "salle-etage", "evenementiel"],
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    pricing: {
      type: pricingStructureSchema,
      required: true,
    },
    availableReservationTypes: {
      type: availableReservationTypesSchema,
      required: true,
    },
    requiresQuote: {
      type: Boolean,
      default: false,
    },
    depositPolicy: {
      type: depositPolicySchema,
    },
    minCapacity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    maxCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    imageUrl: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    features: {
      type: [String],
      default: [],
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

spaceConfigurationSchema.index({ isActive: 1, isDeleted: 1 });

export default spaceConfigurationSchema;
