import { Model, model, models } from "mongoose";
import { UserDocument, UserSchema } from "./document";
import { attachHooks } from "./hooks";
import { UserMethods } from "./methods";
import { VirtualUser } from "./virtuals";

export type User = VirtualUser & UserMethods;
export type { UserDocument };

let UserModel: Model<UserDocument>;

if (models.User) {
  UserModel = models.User as Model<UserDocument>;
} else {
  attachHooks();
  UserModel = model<UserDocument>("User", UserSchema);
}

if (!UserModel) {
  throw new Error("User model not initialized");
}

export { UserModel as User };
