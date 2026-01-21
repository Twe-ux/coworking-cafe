import { MessageSchema } from './document';

/**
 * Instance Methods for Message Model
 */

/**
 * Mark message as read by a user
 */
MessageSchema.methods.markAsRead = async function (userId: string) {
  const alreadyRead = this.readBy.some((r: any) => r.user.toString() === userId);

  if (!alreadyRead) {
    this.readBy.push({
      user: userId as any,
      readAt: new Date(),
    });
    this.status = 'read';
    return this.save();
  }

  return this;
};

/**
 * Check if message has attachments
 */
MessageSchema.methods.hasAttachments = function (): boolean {
  return this.attachments && this.attachments.length > 0;
};
