/**
 * Types centralisés pour le module HR (Human Resources)
 * Conventions CLAUDE.md : types explicites, pas de any
 */

// ==================== EMPLOYEE ====================

export interface EmployeeAddress {
  street: string;
  postalCode: string;
  city: string;
}

export type ContractType = "CDI" | "CDD" | "Stage";
export type EmployeeRole = "Manager" | "Employé";
export type EndContractReason = "démission" | "fin-periode-essai" | "rupture";

export interface TimeSlot {
  start: string; // Format HH:MM
  end: string; // Format HH:MM
}

export interface AvailabilityDay {
  available: boolean;
  slots: TimeSlot[];
}

export interface WeeklyAvailability {
  monday?: AvailabilityDay;
  tuesday?: AvailabilityDay;
  wednesday?: AvailabilityDay;
  thursday?: AvailabilityDay;
  friday?: AvailabilityDay;
  saturday?: AvailabilityDay;
  sunday?: AvailabilityDay;
}

export interface OnboardingStatus {
  step1Completed?: boolean;
  step2Completed?: boolean;
  step3Completed?: boolean;
  step4Completed?: boolean;
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
}

export interface WorkSchedule {
  weeklyDistribution: string;
  timeSlots: string;
  weeklyDistributionData?: {
    [day: string]: {
      [week: string]: string;
    };
  };
}

export interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth?: string;
  address: EmployeeAddress;
  email: string;
  phone: string;
  socialSecurityNumber: string;
  contractType: ContractType;
  contractualHours: number;
  level: string;
  step: number;
  hourlyRate: number;
  employeeRole: EmployeeRole;
  isActive: boolean;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  endContractReason?: EndContractReason;
  onboardingStatus: OnboardingStatus;
  workSchedule?: WorkSchedule;
  availability?: WeeklyAvailability;
  clockingCode?: string;
  employeeColor?: string;
  deletedAt?: Date;
}

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  address: EmployeeAddress;
  phone: string;
  email: string;
  socialSecurityNumber: string;
  contractType: ContractType;
  contractualHours: number;
  hireDate: string;
  hireTime?: string;
  endDate?: string;
  level: string;
  step: number;
  hourlyRate: number;
  clockingCode: string;
  employeeRole: EmployeeRole;
  availability: WeeklyAvailability;
}

// ==================== SHIFT ====================

export type ShiftType = "morning" | "afternoon" | "night" | "full-day";

export interface Shift {
  _id: string;
  employeeId: string;
  date: Date;
  startTime: string; // Format HH:MM
  endTime: string; // Format HH:MM
  type: ShiftType;
  location?: string;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShiftFormData {
  employeeId: string;
  date: Date | string;
  startTime: string;
  endTime: string;
  type: ShiftType;
  location?: string;
  notes?: string;
}

// ==================== TIME ENTRY (Clocking) ====================

export interface TimeEntry {
  _id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // ISO timestamp
  clockOut?: string; // ISO timestamp
  totalHours?: number;
  notes?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClockingStats {
  totalHoursWeek: number;
  totalHoursMonth: number;
  totalDaysWorked: number;
  averageHoursPerDay: number;
}

// ==================== API RESPONSES ====================

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ==================== FILTERS & QUERIES ====================

export interface EmployeeFilters {
  active?: boolean;
  archived?: boolean;
  contractType?: ContractType;
  role?: EmployeeRole;
}

export interface ShiftFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
  type?: ShiftType;
}

export interface TimeEntryFilters {
  employeeId?: string;
  startDate?: string;
  endDate?: string;
}
