import mongoose from 'mongoose';
import { MessageSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Message =
  mongoose.models.Message || mongoose.model('Message', MessageSchema);

export type { MessageDocument, MessageType, MessageStatus, MessageAttachment, ReadReceipt } from './document';
