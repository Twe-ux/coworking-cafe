import { Schema, Types } from "mongoose";
import { ConversationDocument } from "./document";

const participantSchema = new Schema(
  {
    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastReadAt: {
      type: Date,
    },
    unreadCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { _id: false }
);

const conversationSchema = new Schema<ConversationDocument>(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      required: true,
      default: "direct",
    },
    participants: {
      type: [participantSchema],
      required: true,
      validate: {
        validator: function (participants: unknown[]) {
          return participants.length >= 2;
        },
        message: "A conversation must have at least 2 participants",
      },
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
    },
    lastMessage: {
      type: Types.ObjectId,
      ref: "Message",
    },
    lastMessageAt: {
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
conversationSchema.index({ "participants.user": 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ type: 1 });
conversationSchema.index({ isDeleted: 1 });

// Compound index for finding direct conversations between two users
conversationSchema.index({ type: 1, "participants.user": 1 });

export default conversationSchema;
