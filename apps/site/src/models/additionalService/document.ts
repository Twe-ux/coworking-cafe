import { Schema, Document } from 'mongoose';

export type ServiceCategory = 'food' | 'beverage' | 'equipment' | 'other';

export interface AdditionalServiceDocument extends Document {
  name: string;
  slug: string;
  description?: string;
  category: ServiceCategory;
  price: number;
  dailyPrice?: number; // Prix forfait à la journée (optionnel)
  priceUnit: 'per-person' | 'flat-rate';
  vatRate: number; // Taux de TVA en pourcentage (ex: 10, 20, 5.5)
  isActive: boolean;
  isDeleted: boolean;
  availableForSpaceTypes?: string[]; // desk, meeting-room, event-space, etc.
  icon?: string;
  order: number; // Pour l'ordre d'affichage
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const AdditionalServiceSchema = new Schema<AdditionalServiceDocument>(
  {
    name: {
      type: String,
      required: [true, 'Le nom du service est requis'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      default: '', // Sera généré par le hook pre-save
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['food', 'beverage', 'equipment', 'other'],
      default: 'other',
    },
    price: {
      type: Number,
      required: [true, 'Le prix est requis'],
      min: [0, 'Le prix doit être positif'],
    },
    dailyPrice: {
      type: Number,
      min: [0, 'Le prix forfait jour doit être positif'],
    },
    priceUnit: {
      type: String,
      required: true,
      enum: ['per-person', 'flat-rate'],
      default: 'flat-rate',
    },
    vatRate: {
      type: Number,
      required: true,
      default: 20, // TVA normale par défaut
      min: [0, 'Le taux de TVA doit être positif'],
      max: [100, 'Le taux de TVA ne peut pas dépasser 100%'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    availableForSpaceTypes: {
      type: [String],
      default: [],
    },
    icon: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
AdditionalServiceSchema.index({ category: 1, isActive: 1 });
AdditionalServiceSchema.index({ slug: 1 });
AdditionalServiceSchema.index({ order: 1 });

export default AdditionalServiceSchema;
