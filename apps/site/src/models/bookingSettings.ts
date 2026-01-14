import mongoose, { Schema, model, models } from "mongoose";

export interface CancellationPolicyTier {
  daysBeforeBooking: number; // Jours calendaires avant la réservation
  chargePercentage: number; // Pourcentage de frais d'annulation
}

export interface BookingSettingsDocument extends mongoose.Document {
  // Politique d'annulation pour l'open-space (place)
  cancellationPolicyOpenSpace: CancellationPolicyTier[];

  // Politique d'annulation pour les salles de réunion (salle-etage, salle-verriere)
  cancellationPolicyMeetingRooms: CancellationPolicyTier[];

  // Horaires des cron jobs
  cronSchedules: {
    attendanceCheckTime: string; // Format "HH:mm" (ex: "10:00")
    dailyReportTime: string; // Format "HH:mm" (ex: "19:00")
  };

  // Politique d'accompte
  depositPolicy: {
    minAmountRequired: number; // Montant minimum pour exiger un accompte
    defaultPercent: number; // Pourcentage par défaut (ex: 50)
    applyToSpaces: string[]; // Types d'espaces concernés (ex: ["salle-etage"])
  };

  // Email pour les notifications
  notificationEmail: string; // Email de destination pour les rapports (ex: "strasbourg@coworkingcafe.fr")

  createdAt: Date;
  updatedAt: Date;
}

const BookingSettingsSchema = new Schema<BookingSettingsDocument>(
  {
    cancellationPolicyOpenSpace: {
      type: [
        {
          daysBeforeBooking: {
            type: Number,
            required: true,
            min: 0,
          },
          chargePercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
        },
      ],
      default: [
        { daysBeforeBooking: 7, chargePercentage: 0 },
        { daysBeforeBooking: 3, chargePercentage: 50 },
        { daysBeforeBooking: 0, chargePercentage: 100 },
      ],
    },
    cancellationPolicyMeetingRooms: {
      type: [
        {
          daysBeforeBooking: {
            type: Number,
            required: true,
            min: 0,
          },
          chargePercentage: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
        },
      ],
      default: [
        { daysBeforeBooking: 7, chargePercentage: 0 },
        { daysBeforeBooking: 3, chargePercentage: 50 },
        { daysBeforeBooking: 0, chargePercentage: 100 },
      ],
    },
    cronSchedules: {
      type: {
        attendanceCheckTime: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          default: "10:00",
        },
        dailyReportTime: {
          type: String,
          required: true,
          match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
          default: "19:00",
        },
      },
      default: {
        attendanceCheckTime: "10:00",
        dailyReportTime: "19:00",
      },
    },
    depositPolicy: {
      type: {
        minAmountRequired: {
          type: Number,
          required: true,
          min: 0,
          default: 200,
        },
        defaultPercent: {
          type: Number,
          required: true,
          min: 0,
          max: 100,
          default: 50,
        },
        applyToSpaces: {
          type: [String],
          default: ["salle-etage"],
        },
      },
      default: {
        minAmountRequired: 200,
        defaultPercent: 50,
        applyToSpaces: ["salle-etage"],
      },
    },
    notificationEmail: {
      type: String,
      required: true,
      default: "strasbourg@coworkingcafe.fr",
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    strict: false, // Allow fields not defined in schema (for migration)
  }
);

// Ensure only one settings document exists
BookingSettingsSchema.index({}, { unique: true });

const BookingSettings =
  models.BookingSettings ||
  model<BookingSettingsDocument>("BookingSettings", BookingSettingsSchema);

export default BookingSettings;
