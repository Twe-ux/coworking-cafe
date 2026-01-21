import { ConversationSchema } from './document';

/**
 * Virtual: participantCount
 * Returns number of participants
 */
ConversationSchema.virtual('participantCount').get(function () {
  return this.participants.length;
});
