import { EmployeeDocument, EmployeeSchema } from "./document";

/** Virtual object derived from the {@link EmployeeSchema}. */
export interface VirtualEmployee extends EmployeeDocument {
  readonly fullName: string;
}

// Insert the virtuals into the EmployeeSchema
EmployeeSchema.virtual("fullName").get(function (this: EmployeeDocument) {
  return `${this.firstName} ${this.lastName}`;
});
