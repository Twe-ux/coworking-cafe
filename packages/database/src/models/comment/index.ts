import mongoose from 'mongoose';
import { CommentSchema } from './document';
import './methods';
import './hooks';
import './virtuals';

export const Comment =
  mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export type { CommentDocument } from './document';
