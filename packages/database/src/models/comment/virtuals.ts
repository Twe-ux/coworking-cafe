import { CommentSchema } from './document';

/**
 * Virtual: isApproved
 * Check if comment is approved
 */
CommentSchema.virtual('isApproved').get(function () {
  return this.status === 'approved';
});

/**
 * Virtual: isSpam
 * Check if comment is spam
 */
CommentSchema.virtual('isSpam').get(function () {
  return this.status === 'spam';
});
