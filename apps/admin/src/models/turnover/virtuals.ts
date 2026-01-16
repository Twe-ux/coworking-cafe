import { TurnoverDocument, TurnoverSchema } from "./document";

// Add virtual properties here if needed in the future

// Example:
// export interface VirtualTurnover extends TurnoverDocument {
//   readonly totalHT: number;
//   readonly totalTTC: number;
// }

// TurnoverSchema.virtual("totalHT").get(function (this: TurnoverDocument) {
//   return this["vat-20"]["total-ht"] +
//          this["vat-10"]["total-ht"] +
//          this["vat-55"]["total-ht"] +
//          this["vat-0"]["total-ht"];
// });

// TurnoverSchema.virtual("totalTTC").get(function (this: TurnoverDocument) {
//   return this["vat-20"]["total-ttc"] +
//          this["vat-10"]["total-ttc"] +
//          this["vat-55"]["total-ttc"] +
//          this["vat-0"]["total-ttc"];
// });
