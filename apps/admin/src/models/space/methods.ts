import { SpaceDocument, SpaceSchema } from "./document";

export interface SpaceMethods extends SpaceDocument {
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  softDelete(): Promise<void>;
  incrementView(): Promise<void>;
  incrementBooking(): Promise<void>;
  decrementBooking(): Promise<void>;
  isAvailableOnDay(dayOfWeek: number): boolean;
}

/** Activate the space */
SpaceSchema.methods.activate = async function (
  this: SpaceDocument
): Promise<void> {
  this.isActive = true;
  await this.save();
};

/** Deactivate the space */
SpaceSchema.methods.deactivate = async function (
  this: SpaceDocument
): Promise<void> {
  this.isActive = false;
  await this.save();
};

/** Soft delete the space */
SpaceSchema.methods.softDelete = async function (
  this: SpaceDocument
): Promise<void> {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save();
};

/** Increment view count */
SpaceSchema.methods.incrementView = async function (
  this: SpaceDocument
): Promise<void> {
  this.viewCount += 1;
  await this.save();
};

/** Increment booking count */
SpaceSchema.methods.incrementBooking = async function (
  this: SpaceDocument
): Promise<void> {
  this.bookingCount += 1;
  await this.save();
};

/** Decrement booking count */
SpaceSchema.methods.decrementBooking = async function (
  this: SpaceDocument
): Promise<void> {
  this.bookingCount = Math.max(0, this.bookingCount - 1);
  await this.save();
};

/** Check if space is available on a specific day */
SpaceSchema.methods.isAvailableOnDay = function (
  this: SpaceDocument,
  dayOfWeek: number
): boolean {
  const schedule = this.availability.find((a) => a.dayOfWeek === dayOfWeek);
  return schedule?.isAvailable ?? false;
};
