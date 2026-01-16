import { Schema, Types, Document } from 'mongoose'

/** Document of a {@link Shift}, as stored in the database. */
export interface IShift extends Document {
  employeeId: Types.ObjectId
  date: Date
  startTime: string
  endTime: string
  type: string
  location?: string
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

/** Schema used to validate Shift objects for the database. */
export const ShiftSchema = new Schema<IShift>(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, "L'ID de l'employé est requis"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'La date est requise'],
      index: true,
    },
    startTime: {
      type: String,
      required: [true, "L'heure de début est requise"],
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
        },
        message: "Format d'heure invalide (HH:MM)",
      },
    },
    endTime: {
      type: String,
      required: [true, "L'heure de fin est requise"],
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v)
        },
        message: "Format d'heure invalide (HH:MM)",
      },
    },
    type: {
      type: String,
      required: [true, 'Le type de créneau est requis'],
      trim: true,
      maxlength: [50, 'Le type de créneau ne peut pas dépasser 50 caractères'],
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "L'emplacement ne peut pas dépasser 100 caractères"],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères'],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes
// Index composé pour éviter les créneaux en conflit
ShiftSchema.index({ employeeId: 1, date: 1, startTime: 1 }, { unique: true })

// Index pour recherche par date
ShiftSchema.index({ date: 1, isActive: 1 })
