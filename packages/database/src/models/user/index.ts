import { Model, model, models } from "mongoose";
import { UserDocument, UserSchema } from "./document";
import { attachHooks } from "./hooks";
import { attachMethods, type UserMethods } from "./methods";
import { attachVirtuals, type VirtualUser } from "./virtuals";

export type User = VirtualUser & UserMethods;
export type { UserDocument };

// Attach all schema extensions BEFORE model creation.
// Using explicit attach functions (not side-effect imports) because TypeScript/SWC
// elides imports that are only used as types, preventing the side effects from running.
attachHooks();
attachMethods();
attachVirtuals();

let UserModel: Model<UserDocument>;

if (models.User) {
  UserModel = models.User as Model<UserDocument>;
} else {
  UserModel = model<UserDocument>("User", UserSchema);
}

if (!UserModel) {
  throw new Error("User model not initialized");
}

export { UserModel as User };
