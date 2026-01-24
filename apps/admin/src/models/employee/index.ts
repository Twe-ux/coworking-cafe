import { Model, model, models, HydratedDocument } from 'mongoose';
import { EmployeeDocument, EmployeeSchema } from './document';
import { attachHooks } from './hooks';
import { EmployeeMethods } from './methods';
import { VirtualEmployee } from './virtuals';

// Type complet avec méthodes et virtuals
export type EmployeeWithMethods = HydratedDocument<EmployeeDocument> & EmployeeMethods;

// Type Model avec méthodes
export type EmployeeModelType = Model<EmployeeDocument, {}, EmployeeMethods>;

export type Employee = VirtualEmployee & EmployeeMethods;

let EmployeeModel: EmployeeModelType;

// Force recreation of model to pick up schema changes in development
if (models.Employee && process.env.NODE_ENV === 'production') {
  EmployeeModel = models.Employee as EmployeeModelType;
} else {
  // Delete existing model to force schema reload in development
  if (models.Employee) {
    delete models.Employee;
  }
  attachHooks();
  EmployeeModel = model<EmployeeDocument, EmployeeModelType>('Employee', EmployeeSchema);
}

if (!EmployeeModel) {
  throw new Error('Employee model not initialized');
}

export { EmployeeModel as Employee };
export default EmployeeModel;
export type { EmployeeDocument } from './document';
