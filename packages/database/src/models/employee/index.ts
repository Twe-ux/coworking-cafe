import { Model, model, models } from "mongoose";
import { EmployeeDocument, EmployeeSchema } from "./document";
import { attachHooks } from "./hooks";
import { EmployeeMethods } from "./methods";
import { VirtualEmployee } from "./virtuals";

export type Employee = VirtualEmployee & EmployeeMethods;

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
export type { EmployeeDocument } from "./document";
