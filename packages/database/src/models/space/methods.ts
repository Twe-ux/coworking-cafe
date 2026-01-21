import { SpaceDocument, SpaceSchema } from "./document";

export interface SpaceMethods extends SpaceDocument {
  isAvailableOn(date: Date): boolean;
  getPriceFor(type: "hourly" | "daily" | "weekly" | "monthly"): number | null;
}

SpaceSchema.methods.isAvailableOn = function (
  this: SpaceDocument,
  date: Date
): boolean {
  const dayOfWeek = date.getDay();
  const schedule = this.availability.find((a) => a.dayOfWeek === dayOfWeek);
  return schedule?.isAvailable ?? false;
};

SpaceSchema.methods.getPriceFor = function (
  this: SpaceDocument,
  type: "hourly" | "daily" | "weekly" | "monthly"
): number | null {
  return this.pricing[type] ?? null;
};
