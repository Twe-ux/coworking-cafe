export interface TimeSlot {
  start: string;
  end: string;
}

export interface AvailabilityDay {
  available: boolean;
  slots: TimeSlot[];
}

export interface EmployeeAvailability {
  monday: AvailabilityDay;
  tuesday: AvailabilityDay;
  wednesday: AvailabilityDay;
  thursday: AvailabilityDay;
  friday: AvailabilityDay;
  saturday: AvailabilityDay;
  sunday: AvailabilityDay;
}

export interface OnboardingStatus {
  step1Completed?: boolean;
  step2Completed?: boolean;
  step3Completed?: boolean;
  step4Completed?: boolean;
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
  contractGenerated: boolean;
  contractGeneratedAt?: Date;
  contractSent: boolean;
  contractSentAt?: Date;
}

export interface Employee {
  _id?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
  phone: string;
  email: string;
  socialSecurityNumber: string;
  contractType: 'CDI' | 'CDD' | 'Stage';
  contractualHours: number;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  endContractReason?: string;
  level?: string;
  step?: number;
  hourlyRate?: number;
  monthlySalary?: number;
  clockingCode: string;
  employeeRole: string;
  isActive: boolean;
  onboardingStatus?: OnboardingStatus;
  availability?: EmployeeAvailability;
  workSchedule?: {
    weeklyDistribution: string;
    timeSlots: string;
    weeklyDistributionData?: {
      [key: string]: { [week: string]: string };
    };
  };
}
