import { ObjectId, Schema, Types, Document } from "mongoose";

export interface AdditionalServiceItem {
  service: ObjectId;
  name: string; // Nom du service au moment de la réservation
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

/** Document of a {@link Reservation}, as stored in the database. */
export interface ReservationDocument extends Document {
  user: ObjectId;
  space?: ObjectId; // DEPRECATED: Old reference to Space model (kept for backward compatibility)
  spaceType: "open-space" | "salle-verriere" | "salle-etage" | "evenementiel" | "desk" | "meeting-room" | "meeting-room-glass" | "meeting-room-floor" | "private-office" | "event-space"; // New: spaceType from SpaceConfiguration
  date: Date;
  startTime?: string; // Format: "HH:mm" - Optional for full day reservations
  endTime?: string; // Format: "HH:mm" - Optional for full day reservations
  numberOfPeople: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  attendanceStatus?: "present" | "absent"; // Pour marquer la présence/absence le jour J

  // Pricing
  basePrice: number; // Prix de base de l'espace
  servicesPrice: number; // Prix total des services supplémentaires
  totalPrice: number; // basePrice + servicesPrice
  reservationType?: "hourly" | "daily" | "weekly" | "monthly"; // Type de réservation

  // Contact information
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;

  // Services supplémentaires
  additionalServices: AdditionalServiceItem[];

  // Payment
  requiresPayment: boolean; // true si paiement requis avant confirmation
  notes?: string;
  specialRequests?: string;
  confirmationNumber?: string;
  isPartialPrivatization?: boolean; // Pour événementiel : indique si privatisation partielle (pas de fermeture du café)
  paymentStatus: "unpaid" | "pending" | "paid" | "refunded" | "failed" | "partial";
  paymentMethod?: "card" | "cash" | "bank-transfer";
  amountPaid?: number; // Montant déjà payé (pour paiements partiels)
  invoiceOption?: boolean; // Client souhaite payer sur facture
  stripePaymentIntentId?: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSetupIntentId?: string; // Pour les réservations > 7 jours (save card for later charge)
  captureMethod?: "automatic" | "manual" | "deferred"; // Type de capture pour l'empreinte

  // Cancellation
  cancelledAt?: Date;
  cancellationFee?: number; // Frais d'annulation appliqués
  refundAmount?: number; // Montant remboursé après annulation
  cancelledBy?: ObjectId; // Utilisateur qui a effectué l'annulation

  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

/** Schema used to validate Reservation objects for the database. */
export const ReservationSchema = new Schema<ReservationDocument>(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: false, // Optional: allows guest bookings (non-registered users)
      index: true,
    },
    space: {
      type: Types.ObjectId,
      ref: "Space",
      required: false, // DEPRECATED: Made optional for backward compatibility
      index: true,
    },
    spaceType: {
      type: String,
      enum: {
        values: ["open-space", "salle-verriere", "salle-etage", "evenementiel", "desk", "meeting-room", "meeting-room-glass", "meeting-room-floor", "private-office", "event-space"],
        message: "{VALUE} is not a valid space type",
      },
      required: [true, "Space type is required"],
      index: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    startTime: {
      type: String,
      required: false,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    endTime: {
      type: String,
      required: false,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"],
    },
    numberOfPeople: {
      type: Number,
      required: [true, "Number of people is required"],
      min: [1, "At least 1 person required"],
      max: [100, "Maximum 100 people allowed"],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ["pending", "confirmed", "cancelled", "completed"],
        message: "{VALUE} is not a valid status",
      },
      default: "pending",
      index: true,
    },
    attendanceStatus: {
      type: String,
      enum: {
        values: ["present", "absent"],
        message: "{VALUE} is not a valid attendance status",
      },
      required: false,
    },
    basePrice: {
      type: Number,
      required: [true, "Base price is required"],
      min: [0, "Price cannot be negative"],
      default: 0,
    },
    servicesPrice: {
      type: Number,
      default: 0,
      min: [0, "Services price cannot be negative"],
    },
    totalPrice: {
      type: Number,
      required: [true, "Total price is required"],
      min: [0, "Price cannot be negative"],
    },
    reservationType: {
      type: String,
      enum: {
        values: ["hourly", "daily", "weekly", "monthly"],
        message: "{VALUE} is not a valid reservation type",
      },
    },
    contactName: {
      type: String,
      trim: true,
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    contactPhone: {
      type: String,
      trim: true,
    },
    additionalServices: {
      type: [
        {
          service: {
            type: Types.ObjectId,
            ref: "AdditionalService",
            required: true,
          },
          name: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1,
          },
          unitPrice: {
            type: Number,
            required: true,
            min: 0,
          },
          totalPrice: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      default: [],
    },
    requiresPayment: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },
    specialRequests: {
      type: String,
      trim: true,
      maxlength: [1000, "Special requests cannot exceed 1000 characters"],
    },
    confirmationNumber: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },
    isPartialPrivatization: {
      type: Boolean,
      default: false,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: {
        values: ["unpaid", "pending", "paid", "refunded", "failed", "partial"],
        message: "{VALUE} is not a valid payment status",
      },
      default: "unpaid",
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: {
        values: ["card", "cash", "bank-transfer"],
        message: "{VALUE} is not a valid payment method",
      },
    },
    amountPaid: {
      type: Number,
      min: [0, "Amount paid cannot be negative"],
      default: 0,
    },
    invoiceOption: {
      type: Boolean,
      default: false,
    },
    stripePaymentIntentId: {
      type: String,
      trim: true,
      unique: true, // Prevent duplicate reservations for same payment intent
      sparse: true, // Allow multiple null values
    },
    stripeSessionId: {
      type: String,
      trim: true,
    },
    stripeCustomerId: {
      type: String,
      trim: true,
    },
    stripeSetupIntentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },
    captureMethod: {
      type: String,
      enum: {
        values: ["automatic", "manual", "deferred"],
        message: "{VALUE} is not a valid capture method",
      },
    },
    cancelledAt: {
      type: Date,
    },
    cancellationFee: {
      type: Number,
      min: [0, "Cancellation fee cannot be negative"],
      default: 0,
    },
    refundAmount: {
      type: Number,
      min: [0, "Refund amount cannot be negative"],
      default: 0,
    },
    cancelledBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
ReservationSchema.index({ user: 1, date: 1 });
ReservationSchema.index({ space: 1, date: 1 });
ReservationSchema.index({ status: 1, date: 1 });
ReservationSchema.index({ date: 1, spaceType: 1 });
// stripePaymentIntentId and confirmationNumber indexes are already defined in schema with sparse option

// Compound index to prevent double bookings
ReservationSchema.index({
  space: 1,
  date: 1,
  startTime: 1,
  endTime: 1,
  status: 1,
});
