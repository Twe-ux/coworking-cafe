import { Model, model, models } from "mongoose";
import { PermissionDocument, PermissionSchema } from "./document";
import { attachHooks } from "./hooks";
import { PermissionMethods } from "./methods";
import { VirtualPermission } from "./virtuals";

export type Permission = VirtualPermission & PermissionMethods;

let PermissionModel: Model<PermissionDocument>;

if (models.Permission) {
  PermissionModel = models.Permission as Model<PermissionDocument>;
} else {
  attachHooks();
  PermissionModel = model<PermissionDocument>("Permission", PermissionSchema);
}

if (!PermissionModel) {
  throw new Error("Permission model not initialized");
}

export { PermissionModel as Permission };
