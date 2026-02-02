import { B2BRevenueSchema } from "./document";

/**
 * Mongoose hooks for B2BRevenue
 */
export function attachHooks() {
  // Pre-save hook: Ensure TVA is calculated correctly
  B2BRevenueSchema.pre("save", function (next) {
    // Auto-calculate TVA if not set
    if (this.isNew || this.isModified("ht") || this.isModified("ttc")) {
      this.tva = this.ttc - this.ht;
    }
    next();
  });

  // Pre-update hook: Same for updates
  B2BRevenueSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate() as any;
    if (update.$set && (update.$set.ht !== undefined || update.$set.ttc !== undefined)) {
      const ht = update.$set.ht ?? 0;
      const ttc = update.$set.ttc ?? 0;
      update.$set.tva = ttc - ht;
    }
    next();
  });
}
