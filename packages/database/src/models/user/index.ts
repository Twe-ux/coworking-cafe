import { Model, model, models } from "mongoose";
import { UserDocument, UserSchema } from "./document";
import { attachHooks } from "./hooks";
import { UserMethods } from "./methods";
import { VirtualUser } from "./virtuals";

export type User = VirtualUser & UserMethods;
export type { UserDocument };

// Attach hooks BEFORE model creation
// This ensures hooks are always available, even if model already exists
attachHooks();

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
