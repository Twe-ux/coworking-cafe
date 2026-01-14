import { Schema, Document, Types } from 'mongoose';

/** Document d'un Shift (créneau de travail planifié) */
export interface ShiftDocument extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  date: Date;
  startTime: string; // Format "HH:MM" (ex: "09:00")
  endTime: string; // Format "HH:MM" (ex: "17:00")
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema pour valider les objets Shift dans la base de données */
export const ShiftSchema = new Schema<ShiftDocument>(
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
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Format d'heure invalide (HH:MM)",
      },
    },
    endTime: {
      type: String,
      required: [true, "L'heure de fin est requise"],
      validate: {
        validator: function (v: string) {
          return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v);
        },
        message: "Format d'heure invalide (HH:MM)",
      },
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
);

// Index composé pour éviter les créneaux en conflit
ShiftSchema.index({ employeeId: 1, date: 1, startTime: 1 }, { unique: true });

// Index pour recherche par date
ShiftSchema.index({ date: 1, isActive: 1 });

// Validation personnalisée : endTime doit être après startTime
ShiftSchema.pre('save', function (next) {
  if (this.startTime && this.endTime) {
    const start = new Date(`2000-01-01 ${this.startTime}`);
    let end = new Date(`2000-01-01 ${this.endTime}`);

    // Gérer les créneaux qui passent minuit (détection automatique)
    if (end <= start) {
      // Si l'heure de fin est inférieure ou égale à l'heure de début,
      // c'est probablement un créneau de nuit qui passe minuit
      end.setDate(end.getDate() + 1);
    }
  }
  next();
});

// Virtuel pour formater la date en français
ShiftSchema.virtual('formattedDate').get(function () {
  return this.date.toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris',
  });
});

// Virtuel pour afficher la période complète
ShiftSchema.virtual('timeRange').get(function () {
  return `${this.startTime} - ${this.endTime}`;
});
