import { SpaceDocument, SpaceSchema } from "./document";

/** Virtual object derived from the {@link SpaceSchema} */
export type VirtualSpace = SpaceDocument;

// Virtual for bookings reference
SpaceSchema.virtual("bookings", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "space",
});

// Virtual to check if space has any pricing configured
SpaceSchema.virtual("hasPricing").get(function (this: SpaceDocument) {
  return !!(
    this.pricing?.hourly ||
    this.pricing?.daily ||
    this.pricing?.weekly ||
    this.pricing?.monthly
  );
});

// Virtual to get the minimum price for display
SpaceSchema.virtual("minPrice").get(function (this: SpaceDocument) {
  const prices = [
    this.pricing?.hourly,
    this.pricing?.daily,
    this.pricing?.weekly,
    this.pricing?.monthly,
  ].filter((price): price is number => typeof price === "number" && price > 0);

  return prices.length > 0 ? Math.min(...prices) : 0;
});

// Virtual to check if space is fully configured and ready to be booked
SpaceSchema.virtual("isBookable").get(function (this: SpaceDocument) {
  return (
    this.isActive &&
    !this.isDeleted &&
    this.availability.length > 0 &&
    (this.pricing?.hourly ||
      this.pricing?.daily ||
      this.pricing?.weekly ||
      this.pricing?.monthly)
  );
});

// Virtual to get average rating (placeholder for future rating system)
SpaceSchema.virtual("averageRating").get(function (this: SpaceDocument) {
  // TODO: Calculate from reviews/ratings when implemented
  return 0;
});

// Virtual to get occupancy rate (placeholder)
SpaceSchema.virtual("occupancyRate").get(function (this: SpaceDocument) {
  // TODO: Calculate based on bookings vs available time slots
  return 0;
});
