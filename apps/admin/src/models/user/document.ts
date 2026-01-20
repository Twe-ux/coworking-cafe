import { Schema, Document as MongooseDocument, Types } from 'mongoose'

export interface User {
  id: string
  name: string
  email: string
  role: 'dev' | 'admin' | 'staff'
  pin: string
  createdAt: Date
  updatedAt: Date
}

export interface UserDocument extends MongooseDocument, Omit<User, 'id' | '_id'> {
  _id: Types.ObjectId
}

export const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ['dev', 'admin', 'staff'],
      required: true,
      default: 'staff',
    },
    pin: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 6,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        // Ne jamais renvoyer le PIN dans les réponses JSON
        delete ret.pin
        return ret
      },
    },
  }
)

// Index pour recherche rapide par email
UserSchema.index({ email: 1 })
