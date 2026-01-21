import { ConversationSchema } from './document';

/**
 * Instance Methods for Conversation Model
 */

/**
 * Check if conversation is a group
 */
ConversationSchema.methods.isGroup = function (): boolean {
  return this.type === 'group';
};

/**
 * Add participant to conversation
 */
ConversationSchema.methods.addParticipant = async function (userId: string) {
  this.participants.push({
    user: userId as any,
    joinedAt: new Date(),
    unreadCount: 0,
  });
  return this.save();
};
