import { EmployeeDocument } from "./document";

export interface EmployeeMethods {
  getFullName(): string;
  getOnboardingProgress(): number;
  isOnboardingComplete(): boolean;
}

/**
 * Get employee's full name
 */
export function getFullName(this: EmployeeDocument): string {
  return `${this.firstName} ${this.lastName}`;
}

/**
 * Calculate onboarding progress (0-100%)
 */
export function getOnboardingProgress(this: EmployeeDocument): number {
  const steps = [
    this.onboardingStatus.contractGenerated,
    this.onboardingStatus.dpaeCompleted,
    this.onboardingStatus.bankDetailsProvided,
    this.onboardingStatus.contractSent,
  ];

  const completedSteps = steps.filter(Boolean).length;
  return Math.round((completedSteps / steps.length) * 100);
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(this: EmployeeDocument): boolean {
  return (
    this.onboardingStatus.contractGenerated &&
    this.onboardingStatus.dpaeCompleted &&
    this.onboardingStatus.bankDetailsProvided &&
    this.onboardingStatus.contractSent
  );
}
