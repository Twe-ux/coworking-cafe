import { Document, Types } from "mongoose";

export interface ShiftTypeDocument extends Document {
  _id: Types.ObjectId;
  name: string;
  startTime: string; // Format "HH:MM"
  endTime: string; // Format "HH:MM"
  order: number; // For sorting
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
