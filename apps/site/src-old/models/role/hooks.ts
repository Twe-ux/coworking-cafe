import { RoleSchema, RoleDocument } from "./document";
import { Query, HydratedDocument } from "mongoose";

export function attachHooks() {
  // Empêcher la suppression des rôles système
  RoleSchema.pre("deleteOne", async function (this: Query<any, RoleDocument>, next) {
    const doc = await this.model.findOne(this.getFilter());
    if (doc && doc.isSystem) {
      throw new Error("Cannot delete system role");
    }
    next();
  });

  // Empêcher la modification du slug des rôles système
  RoleSchema.pre("save", async function (this: HydratedDocument<RoleDocument>, next) {
    if (!this.isNew && this.isModified("slug") && this.isSystem) {
      throw new Error("Cannot modify slug of system role");
    }
    next();
  });
}
