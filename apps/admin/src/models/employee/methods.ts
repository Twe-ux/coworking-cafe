import { EmployeeDocument, EmployeeSchema } from './document';

export interface EmployeeMethods extends EmployeeDocument {
  getFullName(): string;
  getEmploymentStatus(): 'draft' | 'waiting' | 'active' | 'inactive';
  getOnboardingProgress(): number;
  isOnboardingComplete(): boolean;
  verifyPin(pin: string): boolean;
}

// Get full name
EmployeeSchema.methods.getFullName = function (this: EmployeeDocument): string {
  return `${this.firstName} ${this.lastName}`;
};

// Get employment status
EmployeeSchema.methods.getEmploymentStatus = function (
  this: EmployeeDocument
): 'draft' | 'waiting' | 'active' | 'inactive' {
  // Si c'est un brouillon
  if (this.isDraft) {
    return 'draft';
  }

  // Si l'employé est marqué comme inactif
  if (!this.isActive) {
    return 'inactive';
  }

  // Si la date d'embauche est dans le futur
  if (this.hireDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const hireDate = new Date(this.hireDate);
    hireDate.setHours(0, 0, 0, 0);

    if (hireDate > today) {
      return 'waiting';
    }
  }

  // Sinon, employé actif
  return 'active';
};

// Get onboarding progress percentage
EmployeeSchema.methods.getOnboardingProgress = function (this: EmployeeDocument): number {
  const steps = [
    this.onboardingStatus.step1Completed,
    this.onboardingStatus.step2Completed,
    this.onboardingStatus.step3Completed,
    this.onboardingStatus.step4Completed,
  ];
  const completed = steps.filter(Boolean).length;
  return Math.round((completed / steps.length) * 100);
};

// Check if onboarding is complete
EmployeeSchema.methods.isOnboardingComplete = function (this: EmployeeDocument): boolean {
  return (
    this.onboardingStatus.contractGenerated &&
    this.onboardingStatus.dpaeCompleted &&
    this.onboardingStatus.bankDetailsProvided &&
    this.onboardingStatus.contractSent
  );
};

// Verify PIN code
EmployeeSchema.methods.verifyPin = function (this: EmployeeDocument, pin: string): boolean {
  return this.clockingCode === pin;
};
