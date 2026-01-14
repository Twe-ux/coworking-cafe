import { Schema, Document } from "mongoose";

/** Document of an Employee, as stored in the database. */
export interface EmployeeDocument extends Document {
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth: string; // Lieu de naissance
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string; // N° Sécu (15 chiffres)

  // Informations contractuelles
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number; // Nombre d'heures hebdomadaires
  hireDate: Date;
  hireTime?: string; // Heure d'entrée (ex: "9H30")
  endDate?: Date; // Pour CDD et Stage
  endContractReason?: 'démission' | 'fin-periode-essai' | 'rupture'; // Motif de fin de contrat

  // Rémunération
  level: string; // Niveau (I, II, III, IV, V)
  step: number; // Échelon (1, 2, 3, etc.)
  hourlyRate: number; // Taux horaire en euros
  monthlySalary?: number; // Salaire mensuel brut (calculé automatiquement)

  // Code de pointage
  clockingCode: string; // Code PIN 4 chiffres

  // Rôle employé
  employeeRole: 'Manager' | 'Employé';

  // Disponibilités horaires (par jour) - Plusieurs créneaux possibles
  availability: {
    monday: { available: boolean; slots: Array<{ start: string; end: string }> };
    tuesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    wednesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    thursday: { available: boolean; slots: Array<{ start: string; end: string }> };
    friday: { available: boolean; slots: Array<{ start: string; end: string }> };
    saturday: { available: boolean; slots: Array<{ start: string; end: string }> };
    sunday: { available: boolean; slots: Array<{ start: string; end: string }> };
  };

  // Statut du processus de création
  onboardingStatus: {
    step1Completed: boolean; // Informations employé
    step2Completed: boolean; // Documents administratifs
    step3Completed: boolean; // Planning
    step4Completed: boolean; // Contrat généré
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
    weeklyDistribution: string; // Tableau de répartition hebdomadaire
    timeSlots: string; // Plages horaires
    weeklyDistributionData?: { // Données du tableau de répartition
      [key: string]: { [week: string]: string };
    };
  };

  // Coordonnées bancaires
  bankDetails?: {
    iban: string;
    bic: string;
    bankName: string;
  };

  // Statut
  isActive: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

/** Schema used to validate Employee objects for the database. */
export const EmployeeSchema = new Schema<EmployeeDocument>(
  {
    // Informations personnelles
    firstName: {
      type: String,
      required: [true, "Le prénom est requis"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Le nom est requis"],
      trim: true,
    },
    dateOfBirth: {
      type: Date,
      required: [true, "La date de naissance est requise"],
    },
    placeOfBirth: {
      type: String,
      required: false,
      trim: true,
    },
    address: {
      street: {
        type: String,
        required: false,
        trim: true,
      },
      postalCode: {
        type: String,
        required: false,
        trim: true,
      },
      city: {
        type: String,
        required: false,
        trim: true,
      },
    },
    phone: {
      type: String,
      required: [true, "Le téléphone est requis"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Veuillez fournir une adresse email valide"],
    },
    socialSecurityNumber: {
      type: String,
      required: [true, "Le numéro de sécurité sociale est requis"],
      trim: true,
      match: [/^\d{15}$/, "Le numéro de sécurité sociale doit contenir 15 chiffres"],
    },

    // Informations contractuelles
    contractType: {
      type: String,
      enum: ['CDI', 'CDD', 'Stage'],
      required: [true, "Le type de contrat est requis"],
    },
    contractualHours: {
      type: Number,
      required: [true, "Le nombre d'heures contractuelles est requis"],
      min: [0, "Le nombre d'heures doit être positif"],
    },
    hireDate: {
      type: Date,
      required: [true, "La date d'embauche est requise"],
    },
    hireTime: {
      type: String,
      required: false,
      trim: true,
    },
    endDate: {
      type: Date,
    },
    endContractReason: {
      type: String,
      enum: ['démission', 'fin-periode-essai', 'rupture'],
    },

    // Rémunération
    level: {
      type: String,
      required: false,
      trim: true,
    },
    step: {
      type: Number,
      required: false,
      min: [1, "L'échelon doit être supérieur à 0"],
    },
    hourlyRate: {
      type: Number,
      required: false,
      min: [0, "Le taux horaire doit être positif"],
    },
    monthlySalary: {
      type: Number,
      min: [0, "Le salaire mensuel doit être positif"],
    },

    // Code de pointage
    clockingCode: {
      type: String,
      required: [true, "Le code de pointage est requis"],
      match: [/^\d{4}$/, "Le code de pointage doit contenir 4 chiffres"],
    },

    // Rôle employé
    employeeRole: {
      type: String,
      enum: ['Manager', 'Employé'],
      required: [true, "Le rôle de l'employé est requis"],
      default: 'Employé',
    },

    // Disponibilités horaires - Plusieurs créneaux par jour
    availability: {
      monday: {
        available: { type: Boolean, default: true },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      tuesday: {
        available: { type: Boolean, default: true },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      wednesday: {
        available: { type: Boolean, default: true },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      thursday: {
        available: { type: Boolean, default: true },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      friday: {
        available: { type: Boolean, default: true },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      saturday: {
        available: { type: Boolean, default: false },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
      sunday: {
        available: { type: Boolean, default: false },
        slots: { type: [{ start: String, end: String }], default: [] },
      },
    },

    // Statut du processus de création
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

    // Planning de travail
    workSchedule: {
      weeklyDistribution: { type: String },
      timeSlots: { type: String },
      weeklyDistributionData: { type: Object },
    },

    // Coordonnées bancaires
    bankDetails: {
      iban: { type: String, trim: true },
      bic: { type: String, trim: true },
      bankName: { type: String, trim: true },
    },

    // Statut
    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: {
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
EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ socialSecurityNumber: 1 }, { unique: true });
EmployeeSchema.index({ clockingCode: 1 }, { unique: true });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ deletedAt: 1 });
EmployeeSchema.index({ hireDate: 1 });
