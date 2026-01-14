import { Schema, Document, Types } from 'mongoose';

export type TimeEntryStatus = 'active' | 'completed';
export type ShiftNumber = 1 | 2;

/** Document d'une TimeEntry (pointage réel) */
export interface TimeEntryDocument extends Document {
  _id: Types.ObjectId;
  employeeId: Types.ObjectId;
  date: Date; // Date du jour (sans heure)
  clockIn: Date; // Heure de début (date complète)
  clockOut?: Date | null; // Heure de fin (date complète)
  shiftNumber: ShiftNumber; // 1 ou 2 (max 2 shifts par jour)
  totalHours?: number; // Durée totale en heures
  status: TimeEntryStatus;
  hasError?: boolean;
  errorType?: 'MISSING_CLOCK_OUT' | 'INVALID_TIME_RANGE' | 'DUPLICATE_ENTRY';
  errorMessage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Schema pour valider les objets TimeEntry dans la base de données */
export const TimeEntrySchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, "L'ID de l'employé est obligatoire"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'La date est obligatoire'],
      index: true,
      default: function () {
        // Utiliser la date actuelle au début de la journée (timezone Paris)
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      },
    },
    clockIn: {
      type: Date,
      required: [true, "L'heure d'arrivée est obligatoire"],
      default: Date.now,
    },
    clockOut: {
      type: Date,
      default: null,
    },
    shiftNumber: {
      type: Number,
      required: [true, 'Le numéro de shift est obligatoire'],
      enum: {
        values: [1, 2],
        message: 'Le numéro de shift doit être 1 ou 2',
      },
      default: 1,
    },
    totalHours: {
      type: Number,
      min: [0, "Le total d'heures ne peut pas être négatif"],
      max: [24, "Le total d'heures ne peut pas dépasser 24h"],
    },
    status: {
      type: String,
      required: [true, 'Le statut est obligatoire'],
      enum: {
        values: ['active', 'completed'],
        message: 'Le statut doit être "active" ou "completed"',
      },
      default: 'active',
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    errorType: {
      type: String,
      enum: ['MISSING_CLOCK_OUT', 'INVALID_TIME_RANGE', 'DUPLICATE_ENTRY'],
      required: false,
    },
    errorMessage: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index composés pour optimiser les recherches
TimeEntrySchema.index({ employeeId: 1, date: 1 });
TimeEntrySchema.index({ employeeId: 1, status: 1 });
TimeEntrySchema.index({ date: 1, status: 1 });
TimeEntrySchema.index({ status: 1, isActive: 1 });

// Index unique pour empêcher les doublons de shift par employé par jour
TimeEntrySchema.index(
  { employeeId: 1, date: 1, shiftNumber: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_employee_shift_per_day',
  }
);

// Virtuel pour calculer la durée en temps réel
TimeEntrySchema.virtual('currentDuration').get(function () {
  if (!this.clockOut) {
    const now = new Date();
    const durationMs = now.getTime() - this.clockIn.getTime();
    return Math.max(0, durationMs / (1000 * 60 * 60)); // en heures
  }
  return this.totalHours || 0;
});

// Middleware de validation avant sauvegarde
TimeEntrySchema.pre('save', async function (next) {
  try {
    // Vérifier que l'employé existe
    const Employee = this.model('Employee');
    const employee = await Employee.findById(this.employeeId);
    if (!employee) {
      throw new Error('Employé introuvable');
    }

    // Si c'est une nouvelle entrée, vérifier le nombre de shifts
    if (this.isNew) {
      const TimeEntry = this.model('TimeEntry');
      const existingShifts = await TimeEntry.countDocuments({
        employeeId: this.employeeId,
        date: this.date,
        isActive: true,
      });

      if (existingShifts >= 2) {
        throw new Error('Un employé ne peut avoir que 2 shifts maximum par jour');
      }

      // Déterminer automatiquement le numéro de shift
      if (existingShifts === 1) {
        this.shiftNumber = 2;
      } else {
        this.shiftNumber = 1;
      }
    }

    // Valider que clockOut est après clockIn
    if (this.clockOut && this.clockOut <= this.clockIn) {
      throw new Error("L'heure de sortie doit être postérieure à l'heure d'entrée");
    }

    // Calculer les heures totales si clockOut est défini
    if (this.clockOut && !this.totalHours) {
      const durationMs = this.clockOut.getTime() - this.clockIn.getTime();
      const hours = durationMs / (1000 * 60 * 60);
      this.totalHours = Math.round(hours * 100) / 100; // Arrondir à 2 décimales
    }

    // Mettre à jour le statut
    if (this.clockOut && this.status === 'active') {
      this.status = 'completed';
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});
