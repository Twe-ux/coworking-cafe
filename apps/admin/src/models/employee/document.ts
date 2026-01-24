import { Document, Schema, Types } from 'mongoose';

/**
 * Employee Document Interface
 * Combines HR (onboarding, contract) + Planning (color, pin)
 */
export interface EmployeeDocument extends Document {
  _id: Types.ObjectId;

  // ===== PARTIE HR (de site) =====
  // Informations personnelles
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  placeOfBirth?: {
    city: string;
    department: string;
    country: string;
  };
  address: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;

  // Informations contractuelles
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number;
  hireDate: Date;
  hireTime?: string;
  endDate?: Date;
  endContractReason?: 'démission' | 'fin-periode-essai' | 'rupture';

  // Rémunération
  level: string;
  step: number;
  hourlyRate: number;
  monthlySalary?: number;

  // Rôle employé (pour HR)
  employeeRole: 'Manager' | 'Assistant manager' | 'Employé polyvalent';

  // Disponibilités horaires
  availability: {
    monday: { available: boolean; slots: Array<{ start: string; end: string }> };
    tuesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    wednesday: { available: boolean; slots: Array<{ start: string; end: string }> };
    thursday: { available: boolean; slots: Array<{ start: string; end: string }> };
    friday: { available: boolean; slots: Array<{ start: string; end: string }> };
    saturday: { available: boolean; slots: Array<{ start: string; end: string }> };
    sunday: { available: boolean; slots: Array<{ start: string; end: string }> };
  };

  // Statut onboarding
  onboardingStatus: {
    step1Completed: boolean;
    step2Completed: boolean;
    step3Completed: boolean;
    step4Completed: boolean;
    contractGenerated: boolean;
    contractGeneratedAt?: Date;
    dpaeCompleted: boolean;
    dpaeCompletedAt?: Date;
    medicalVisitCompleted?: boolean;
    medicalVisitCompletedAt?: Date;
    mutuelleCompleted?: boolean;
    mutuelleCompletedAt?: Date;
    bankDetailsProvided: boolean;
    bankDetailsProvidedAt?: Date;
    registerCompleted?: boolean;
    registerCompletedAt?: Date;
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

  // ===== PARTIE PLANNING (de tmp) =====
  // Code pointage (PIN 4 chiffres)
  clockingCode: string;

  // PIN dashboard admin (6 chiffres, hashé) - uniquement Manager/Assistant Manager
  dashboardPinHash?: string;

  // Couleur pour calendrier planning
  color: string;

  // ===== COMMUN =====
  isActive: boolean;
  isDraft?: boolean; // Brouillon en cours de création
  createdBy?: string; // ID de l'utilisateur qui a créé le brouillon
  employmentStatus?: 'draft' | 'waiting' | 'active' | 'inactive'; // Statut calculé
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
      required: [true, 'Le prénom est requis'],
      trim: true,
      minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères'],
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'La date de naissance est requise'],
    },
    placeOfBirth: {
      city: String,
      department: String,
      country: String,
      _id: false,
    },
    address: {
      street: String,
      postalCode: String,
      city: String,
      _id: false,
    },
    phone: {
      type: String,
      required: [true, 'Le téléphone est requis'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Veuillez fournir une adresse email valide'],
    },
    socialSecurityNumber: {
      type: String,
      required: [true, 'Le numéro de sécurité sociale est requis'],
      trim: true,
      match: [/^\d{15}$/, 'Le numéro de sécurité sociale doit contenir 15 chiffres'],
    },

    // Informations contractuelles
    contractType: {
      type: String,
      enum: ['CDI', 'CDD', 'Stage'],
      required: [true, 'Le type de contrat est requis'],
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
      trim: true,
    },
    step: {
      type: Number,
      min: [1, "L'échelon doit être supérieur à 0"],
    },
    hourlyRate: {
      type: Number,
      min: [0, 'Le taux horaire doit être positif'],
    },
    monthlySalary: {
      type: Number,
      min: [0, 'Le salaire mensuel doit être positif'],
    },

    // Rôle employé (HR)
    employeeRole: {
      type: String,
      enum: ['Manager', 'Assistant manager', 'Employé polyvalent'],
      required: [true, "Le rôle de l'employé est requis"],
      default: 'Employé polyvalent',
    },

    // Disponibilités
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

    // Onboarding
    onboardingStatus: {
      type: {
        step1Completed: { type: Boolean, default: false },
        step2Completed: { type: Boolean, default: false },
        step3Completed: { type: Boolean, default: false },
        step4Completed: { type: Boolean, default: false },
        contractGenerated: { type: Boolean, default: false },
        contractGeneratedAt: { type: Date },
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
        contractSent: { type: Boolean, default: false },
        contractSentAt: { type: Date },
      },
      required: false,
      _id: false,
    },

    // Planning de travail
    workSchedule: {
      type: {
        weeklyDistribution: { type: String },
        timeSlots: { type: String },
        weeklyDistributionData: { type: Object },
      },
      required: false,
      _id: false,
    },

    // Coordonnées bancaires
    bankDetails: {
      type: {
        iban: { type: String, trim: true },
        bic: { type: String, trim: true },
        bankName: { type: String, trim: true },
      },
      required: false,
      _id: false,
    },

    // Code pointage (PIN 4 chiffres)
    clockingCode: {
      type: String,
      required: [true, 'Le code de pointage est requis'],
      match: [/^\d{4}$/, 'Le code de pointage doit contenir 4 chiffres'],
    },

    // PIN dashboard admin (6 chiffres, hashé) - uniquement Manager/Assistant Manager
    dashboardPinHash: {
      type: String,
      required: false, // Optionnel (seulement pour Manager/Assistant Manager)
    },

    // Couleur pour planning
    color: {
      type: String,
      required: [true, 'La couleur est obligatoire'],
      default: function () {
        const colors = [
          'bg-blue-500',
          'bg-green-500',
          'bg-purple-500',
          'bg-orange-500',
          'bg-red-500',
          'bg-teal-500',
          'bg-indigo-500',
          'bg-pink-500',
          'bg-yellow-500',
          'bg-cyan-500',
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      },
    },

    // Statut
    isActive: {
      type: Boolean,
      default: true,
    },

    isDraft: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: String,
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
EmployeeSchema.index({ email: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ socialSecurityNumber: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ clockingCode: 1 }, { unique: true, sparse: true });
EmployeeSchema.index({ isActive: 1 });
EmployeeSchema.index({ isDraft: 1, createdBy: 1 });
EmployeeSchema.index({ deletedAt: 1 });
EmployeeSchema.index({ hireDate: 1 });
EmployeeSchema.index({ firstName: 1, lastName: 1 });
