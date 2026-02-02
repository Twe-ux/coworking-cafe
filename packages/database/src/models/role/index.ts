import { Model, model, models } from "mongoose";
import { RoleDocument, RoleSchema } from "./document";
import { attachHooks } from "./hooks";
import { RoleMethods } from "./methods";
import { VirtualRole } from "./virtuals";

export type Role = VirtualRole & RoleMethods;
export type { RoleDocument };

let RoleModel: Model<RoleDocument>;

if (models.Role) {
  RoleModel = models.Role as Model<RoleDocument>;
} else {
  attachHooks();
  RoleModel = model<RoleDocument>("Role", RoleSchema);
}

if (!RoleModel) {
  throw new Error("Role model not initialized");
}

export { RoleModel as Role };
