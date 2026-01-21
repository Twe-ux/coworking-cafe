import { EmployeeDocument, EmployeeSchema } from "./document";

export interface EmployeeMethods extends EmployeeDocument {
  getFullName(): string;
  getOnboardingProgress(): number;
  isOnboardingComplete(): boolean;
}

EmployeeSchema.methods.getFullName = function (
  this: EmployeeDocument
): string {
  return `${this.firstName} ${this.lastName}`;
};

EmployeeSchema.methods.getOnboardingProgress = function (
  this: EmployeeDocument
): number {
  const status = this.onboardingStatus;
  const steps = [
    status.step1Completed,
    status.step2Completed,
    status.step3Completed,
    status.step4Completed,
    status.dpaeCompleted,
    status.medicalVisitCompleted,
    status.mutuelleCompleted,
    status.bankDetailsProvided,
    status.registerCompleted,
    status.contractGenerated,
    status.contractSent,
  ];
  const completedSteps = steps.filter((step) => step).length;
  return Math.round((completedSteps / steps.length) * 100);
};

EmployeeSchema.methods.isOnboardingComplete = function (
  this: EmployeeDocument
): boolean {
  const status = this.onboardingStatus;
  return (
    status.step1Completed &&
    status.step2Completed &&
    status.step3Completed &&
    status.step4Completed &&
    status.dpaeCompleted &&
    status.medicalVisitCompleted &&
    status.mutuelleCompleted &&
    status.bankDetailsProvided &&
    status.registerCompleted &&
    status.contractGenerated &&
    status.contractSent
  );
};
