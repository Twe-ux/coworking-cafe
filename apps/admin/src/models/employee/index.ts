import { Model, model, models } from "mongoose";
import { EmployeeDocument, EmployeeSchema } from "./document";
import { attachHooks } from "./hooks";
import { EmployeeMethods, getFullName, getOnboardingProgress, isOnboardingComplete } from "./methods";

// Attach methods to schema
EmployeeSchema.methods.getFullName = getFullName;
EmployeeSchema.methods.getOnboardingProgress = getOnboardingProgress;
EmployeeSchema.methods.isOnboardingComplete = isOnboardingComplete;

export type Employee = EmployeeMethods;

let EmployeeModel: Model<EmployeeDocument>;

if (models.Employee) {
  EmployeeModel = models.Employee as Model<EmployeeDocument>;
} else {
  attachHooks();
  EmployeeModel = model<EmployeeDocument>("Employee", EmployeeSchema);
}

if (!EmployeeModel) {
  throw new Error("Employee model not initialized");
}

export { EmployeeModel as Employee };
