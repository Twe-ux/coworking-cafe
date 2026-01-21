import { CommentSchema } from './document';

/**
 * Instance Methods for Comment Model
 */

/**
 * Approve comment
 */
CommentSchema.methods.approve = async function () {
  this.status = 'approved';
  return this.save();
};

/**
 * Reject comment
 */
CommentSchema.methods.reject = async function () {
  this.status = 'rejected';
  return this.save();
};

/**
 * Mark as spam
 */
CommentSchema.methods.markAsSpam = async function () {
  this.status = 'spam';
  return this.save();
};

/**
 * Check if comment is a reply
 */
CommentSchema.methods.isReply = function (): boolean {
  return !!this.parent;
};
