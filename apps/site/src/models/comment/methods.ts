import { CommentDocument, CommentSchema } from "./document";

export interface CommentMethods extends CommentDocument {
  approve(): Promise<void>;
  reject(): Promise<void>;
  markAsSpam(): Promise<void>;
  incrementLike(): Promise<void>;
  isReply(): boolean;
}

/** Approve the comment */
CommentSchema.methods.approve = async function (
  this: CommentDocument
): Promise<void> {
  this.status = "approved";
  await this.save();
};

/** Reject the comment */
CommentSchema.methods.reject = async function (
  this: CommentDocument
): Promise<void> {
  this.status = "rejected";
  await this.save();
};

/** Mark comment as spam */
CommentSchema.methods.markAsSpam = async function (
  this: CommentDocument
): Promise<void> {
  this.status = "spam";
  await this.save();
};

/** Increment like count */
CommentSchema.methods.incrementLike = async function (
  this: CommentDocument
): Promise<void> {
  this.likeCount += 1;
  await this.save();
};

/** Check if this is a reply to another comment */
CommentSchema.methods.isReply = function (this: CommentDocument): boolean {
  return !!this.parent;
};
