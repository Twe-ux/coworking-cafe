import { Document, ObjectId } from "mongoose";

export type MessageType = "text" | "image" | "file" | "audio" | "video";
export type MessageStatus = "sent" | "delivered" | "read" | "failed";

/**
 * Message attachment
 */
export interface MessageAttachment {
  url: string;
  type: "image" | "file" | "audio" | "video";
  name?: string;
  size?: number; // in bytes
  mimeType?: string;
}

/**
 * Read receipt
 */
export interface ReadReceipt {
  user: ObjectId;
  readAt: Date;
}

/**
 * Message document
 */
export interface MessageDocument extends Document {
  conversation: ObjectId;
  sender: ObjectId;
  content: string;
  type: MessageType;

  // Attachments
  attachments: MessageAttachment[];

  // Status
  status: MessageStatus;
  readBy: ReadReceipt[];

  // Reply/Thread
  replyTo?: ObjectId; // Reference to another message

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  editedAt?: Date;
  isDeleted: boolean;
}
