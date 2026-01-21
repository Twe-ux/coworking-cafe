import { Schema, Document } from "mongoose";

/** Document of an {@link Employee}, as stored in the database. */
export interface EmployeeDocument extends Document {
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;

  // Informations contractuelles
  contractType: "CDI" | "CDD" | "Stage";
  contractualHours: number;
  hireDate: Date;
  hireTime?: string;
  endDate?: Date;
  endContractReason?: "démission" | "fin-periode-essai" | "rupture";

  // Rémunération
  level: string;
  step: number;
  hourlyRate: number;
  monthlySalary?: number;

  // Code de pointage
  clockingCode: string;

  // Rôle employé (métier)
  employeeRole: "Manager" | "Employé";

  // Disponibilités horaires
  availability: {
    monday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    tuesday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    wednesday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    thursday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    friday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    saturday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
    sunday: {
      available: boolean;
      slots: Array<{ start: string; end: string }>;
    };
  };

  // Statut onboarding
  onboardingStatus: {
    step1Completed: boolean;
    step2Completed: boolean;
    step3Completed: boolean;
    step4Completed: boolean;
    dpaeCompleted: boolean;
    dpaeCompletedAt?: Date;
    medicalVisitCompleted: boolean;
    medicalVisitCompletedAt?: Date;
    mutuelleCompleted: boolean;
    mutuelleCompletedAt?: Date;
    bankDetailsProvided: boolean;
    bankDetailsProvidedAt?: Date;
    registerCompleted: boolean;
    registerCompletedAt?: Date;
    contractGenerated: boolean;
    contractGeneratedAt?: Date;
    contractSent: boolean;
    contractSentAt?: Date;
  };

  // Planning de travail
  workSchedule?: {
    weeklyDistribution: string;
    timeSlots: string;
    weeklyDistributionData?: { [key: string]: { [week: string]: string } };
  };

  // Coordonnées bancaires
  bankDetails?: {
    iban: string;
    bic: string;
    bankName: string;
  };

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate Employee objects for the database. */
export const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    dateOfBirth: { type: Date, required: true },
    placeOfBirth: { type: String, trim: true },
    address: {
      street: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      city: { type: String, trim: true },
    },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse email valide"],
    },
    socialSecurityNumber: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^\d{15}$/,
        "Le numéro de sécurité sociale doit contenir 15 chiffres",
      ],
    },
    contractType: {
      type: String,
      enum: ["CDI", "CDD", "Stage"],
      required: true,
    },
    contractualHours: { type: Number, required: true, min: 0 },
    hireDate: { type: Date, required: true },
    hireTime: { type: String, trim: true },
    endDate: { type: Date },
    endContractReason: {
      type: String,
      enum: ["démission", "fin-periode-essai", "rupture"],
    },
    level: { type: String, trim: true },
    step: { type: Number, min: 1 },
    hourlyRate: { type: Number, min: 0 },
    monthlySalary: { type: Number, min: 0 },
    clockingCode: {
      type: String,
      required: true,
      match: [/^\d{4}$/, "Le code de pointage doit contenir 4 chiffres"],
    },
    employeeRole: {
      type: String,
      enum: ["Manager", "Employé"],
      required: true,
      default: "Employé",
    },
    availability: {
      monday: {
        available: { type: Boolean, default: true },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      tuesday: {
        available: { type: Boolean, default: true },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      wednesday: {
        available: { type: Boolean, default: true },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      thursday: {
        available: { type: Boolean, default: true },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      friday: {
        available: { type: Boolean, default: true },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      saturday: {
        available: { type: Boolean, default: false },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
      sunday: {
        available: { type: Boolean, default: false },
        slots: {
          type: [{ start: String, end: String }],
          default: [],
        },
      },
    },
    onboardingStatus: {
      step1Completed: { type: Boolean, default: false },
      step2Completed: { type: Boolean, default: false },
      step3Completed: { type: Boolean, default: false },
      step4Completed: { type: Boolean, default: false },
      dpaeCompleted: { type: Boolean, default: false },
      dpaeCompletedAt: { type: Date },
      medicalVisitCompleted: { type: Boolean, default: false },
      medicalVisitCompletedAt: { type: Date },
      mutuelleCompleted: { type: Boolean, default: false },
      mutuelleCompletedAt: { type: Date },
      bankDetailsProvided: { type: Boolean, default: false },
      bankDetailsProvidedAt: { type: Date },
      registerCompleted: { type: Boolean, default: false },
      registerCompletedAt: { type: Date },
      contractGenerated: { type: Boolean, default: false },
      contractGeneratedAt: { type: Date },
      contractSent: { type: Boolean, default: false },
      contractSentAt: { type: Date },
    },
    workSchedule: {
      weeklyDistribution: { type: String },
      timeSlots: { type: String },
      weeklyDistributionData: { type: Object },
    },
    bankDetails: {
      iban: { type: String, trim: true },
      bic: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ socialSecurityNumber: 1 }, { unique: true });
EmployeeSchema.index({ clockingCode: 1 }, { unique: true });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ deletedAt: 1 });
EmployeeSchema.index({ hireDate: 1 });
