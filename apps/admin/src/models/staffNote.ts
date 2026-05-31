import mongoose, { Schema, type Document } from 'mongoose'

export interface StaffNoteDocument extends Document {
  destination: 'staff' | 'admin'
  title: string
  content: string
  senderEmployeeId: string
  senderName: string
  isRead: boolean
  readAt?: string
  createdAt: Date
  updatedAt: Date
}

const StaffNoteSchema = new Schema<StaffNoteDocument>(
  {
    destination: { type: String, enum: ['staff', 'admin'], required: true },
    content: { type: String, required: true, maxlength: 1000, trim: true },
    senderEmployeeId: { type: String, required: true },
    senderName: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    readAt: { type: String },
  },
  { timestamps: true }
)

StaffNoteSchema.index({ destination: 1, isRead: 1 })
StaffNoteSchema.index({ createdAt: -1 })

export const StaffNote =
  mongoose.models.StaffNote ||
  mongoose.model<StaffNoteDocument>('StaffNote', StaffNoteSchema, 'notes-staff')
