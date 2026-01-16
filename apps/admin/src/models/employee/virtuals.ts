import { EmployeeDocument, EmployeeSchema } from './document';

/** Virtual object for an employee with full name */
export interface VirtualEmployeeWithFullName extends EmployeeDocument {
  readonly fullName: string;
}

/** Virtual object for an active employee */
export interface VirtualActiveEmployee extends EmployeeDocument {
  readonly isActiveEmployee: true;
  deletedAt?: undefined;
}

/** Virtual object for an inactive/deleted employee */
export interface VirtualInactiveEmployee extends EmployeeDocument {
  readonly isActiveEmployee: false;
  deletedAt: Date;
}

export type VirtualEmployee = VirtualEmployeeWithFullName &
  (VirtualActiveEmployee | VirtualInactiveEmployee);

// Insert the virtuals into the EmployeeSchema
EmployeeSchema.virtual('fullName').get(function (this: EmployeeDocument) {
  return `${this.firstName} ${this.lastName}`;
});

EmployeeSchema.virtual('isActiveEmployee').get(function (this: EmployeeDocument) {
  return this.isActive && !this.deletedAt;
});
