import mongoose from 'mongoose';
import { ConversationSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Conversation =
  mongoose.models.Conversation || mongoose.model('Conversation', ConversationSchema);

export type { ConversationDocument, ConversationType, ConversationParticipant } from './document';
