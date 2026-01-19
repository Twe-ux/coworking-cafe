import mongoose from 'mongoose'
import { UserSchema, type UserDocument } from './document'

export type { User, UserDocument } from './document'

// Vérifier si le model existe déjà (utile en dev avec hot reload)
export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>('User', UserSchema)
