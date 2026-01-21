import { MessageSchema } from './document';

/**
 * Virtual: isRead
 * Check if message is read
 */
MessageSchema.virtual('isRead').get(function () {
  return this.status === 'read';
});

/**
 * Virtual: isEdited
 * Check if message was edited
 */
MessageSchema.virtual('isEdited').get(function () {
  return !!this.editedAt;
});
