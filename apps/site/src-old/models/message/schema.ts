import { Schema, Types } from "mongoose";
import { MessageDocument } from "./document";

const attachmentSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["image", "file", "audio", "video"],
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
    size: {
      type: Number,
      min: 0,
    },
    mimeType: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const readReceiptSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    readAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const messageSchema = new Schema<MessageDocument>(
  {
    conversation: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "audio", "video"],
      default: "text",
    },
    attachments: {
      type: [attachmentSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
      index: true,
    },
    readBy: {
      type: [readReceiptSchema],
      default: [],
    },
    replyTo: {
      type: Types.ObjectId,
      ref: "Message",
    },
    deletedAt: {
      type: Date,
    },
    editedAt: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({ conversation: 1, createdAt: -1 }); // For loading messages in a conversation
messageSchema.index({ sender: 1, createdAt: -1 }); // For user's sent messages
messageSchema.index({ isDeleted: 1 });

export default messageSchema;
