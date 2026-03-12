import { Document, Schema, model, models, Model, Types } from "mongoose";

/**
 * Creator metadata
 */
export interface B2BRevenueCreator {
  userId: Types.ObjectId;
  name: string;
}

/**
 * Document of a B2B Revenue entry, as stored in the database
 */
export interface B2BRevenueDocument extends Document {
  serviceDate: string;    // Date de prestation (YYYY-MM-DD) - vide si répartition mensuelle
  invoiceDate: string;    // Date de facturation (YYYY-MM-DD)
  client: string;         // Nom du client
  revenueHT_5_5?: number; // CA HT TVA 5.5%
  revenueHT_10?: number;  // CA HT TVA 10%
  revenueHT_20?: number;  // CA HT TVA 20%
  revenueHT: number;      // CA HT Total (somme des 3 taux)
  isMonthlyDistribution?: boolean; // true si répartition mensuelle
  distributionMonth?: string;      // Format "YYYY-MM" pour répartition mensuelle
  createdBy: B2BRevenueCreator;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Schema used to validate B2B Revenue objects for the database
 */
export const B2BRevenueSchema = new Schema<B2BRevenueDocument>(
  {
    serviceDate: {
      type: String,
      required: false, // Optional si répartition mensuelle
      validate: {
        validator: function(v: string) {
          // Allow empty string for monthly distribution
          if (!v || v === '') return true;
          // Otherwise must match YYYY-MM-DD format
          return /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: 'serviceDate must be in YYYY-MM-DD format or empty for monthly distribution'
      }
    },
    invoiceDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    client: {
      type: String,
      required: true,
      trim: true,
    },
    revenueHT_5_5: {
      type: Number,
      min: 0,
      default: 0,
    },
    revenueHT_10: {
      type: Number,
      min: 0,
      default: 0,
    },
    revenueHT_20: {
      type: Number,
      min: 0,
      default: 0,
    },
    revenueHT: {
      type: Number,
      required: true,
      min: 0,
    },
    isMonthlyDistribution: {
      type: Boolean,
      default: false,
    },
    distributionMonth: {
      type: String,
      match: /^\d{4}-\d{2}$/, // Format YYYY-MM
    },
    createdBy: {
      userId: {
        type: Schema.Types.ObjectId,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
    },
  },
  {
    timestamps: true,
    collection: "accounting-b2b-revenue", // Collection name with prefix
  }
);

// Indexes for efficient queries
B2BRevenueSchema.index({ serviceDate: 1 });
B2BRevenueSchema.index({ invoiceDate: 1 });
B2BRevenueSchema.index({ client: 1 });
B2BRevenueSchema.index({ distributionMonth: 1 });

// Create or retrieve model
let B2BRevenueModel: Model<B2BRevenueDocument>;

if (models.B2BRevenue) {
  B2BRevenueModel = models.B2BRevenue as Model<B2BRevenueDocument>;
} else {
  B2BRevenueModel = model<B2BRevenueDocument>("B2BRevenue", B2BRevenueSchema, "accounting-b2b-revenue");
}

if (!B2BRevenueModel) {
  throw new Error("B2BRevenue model not initialized");
}

export { B2BRevenueModel as B2BRevenue };
export default B2BRevenueModel;
