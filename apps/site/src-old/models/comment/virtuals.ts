import { CommentDocument, CommentSchema } from "./document";

/** Virtual object derived from the {@link CommentSchema} for approved comments. */
export interface VirtualApprovedComment extends CommentDocument {
  readonly status: "approved";
  readonly isApproved: true;
}

/** Virtual object derived from the {@link CommentSchema} for pending comments. */
export interface VirtualPendingComment extends CommentDocument {
  readonly status: "pending";
  readonly isApproved: false;
}

/** Virtual object derived from the {@link CommentSchema} for rejected comments. */
export interface VirtualRejectedComment extends CommentDocument {
  readonly status: "rejected";
  readonly isApproved: false;
}

/** Virtual object derived from the {@link CommentSchema} for spam comments. */
export interface VirtualSpamComment extends CommentDocument {
  readonly status: "spam";
  readonly isApproved: false;
}

export type VirtualComment =
  | VirtualApprovedComment
  | VirtualPendingComment
  | VirtualRejectedComment
  | VirtualSpamComment;

// Virtual for replies (nested comments)
CommentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parent",
});

// Virtual to check if approved
CommentSchema.virtual("isApproved").get(function (this: CommentDocument) {
  return this.status === "approved";
});

// Virtual to check if active (not deleted)
CommentSchema.virtual("isActive").get(function (this: CommentDocument) {
  return !this.deletedAt;
});

// Virtual to check if needs moderation
CommentSchema.virtual("needsModeration").get(function (this: CommentDocument) {
  return this.status === "pending";
});
