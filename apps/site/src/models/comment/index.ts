import { Model, model, models } from "mongoose";
import { CommentDocument, CommentSchema } from "./document";
import { attachHooks } from "./hooks";
import { CommentMethods } from "./methods";
import { VirtualComment } from "./virtuals";

export type Comment = VirtualComment & CommentMethods;

let CommentModel: Model<CommentDocument>;

if (models.Comment) {
  CommentModel = models.Comment as Model<CommentDocument>;
} else {
  attachHooks();
  CommentModel = model<CommentDocument>("Comment", CommentSchema);
}

if (!CommentModel) {
  throw new Error("Comment model not initialized");
}

export { CommentModel as Comment };
