import { TurnoverDocument } from "./document";

export interface TurnoverMethods extends TurnoverDocument {
  // Add instance methods here if needed in the future
}

// Example:
// TurnoverSchema.methods.calculateTotalHT = function (
//   this: TurnoverDocument
// ): number {
//   return this["vat-20"]["total-ht"] +
//          this["vat-10"]["total-ht"] +
//          this["vat-55"]["total-ht"] +
//          this["vat-0"]["total-ht"];
// };
