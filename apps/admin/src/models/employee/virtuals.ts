import { EmployeeDocument } from "./document";
import { EmployeeMethods, getFullName, getOnboardingProgress, isOnboardingComplete } from "./methods";

export type VirtualEmployee = EmployeeDocument & EmployeeMethods;

export function attachVirtuals() {
  // Attach methods as virtuals if needed
}
