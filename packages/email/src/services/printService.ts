/**
 * Print Service - Manage Print Requests via Email
 *
 * Workflow:
 * 1. Client sends email with attachments to impression@coworkingcafe.fr
 * 2. IMAP reads emails and extracts attachments
 * 3. Dashboard admin displays print requests
 * 4. Staff downloads/prints documents
 * 5. Mark as processed
 */

import { fetchUnreadEmails, markAsRead } from '../providers/imap';
import type { ParsedMail, Attachment } from 'mailparser';
import * as fs from 'fs/promises';
import * as path from 'path';

// Extend ParsedMail to include uid from IMAP
interface ParsedMailWithUid extends ParsedMail {
  uid?: number;
}

export interface PrintRequest {
  id: string;
  from: string;
  subject: string;
  date: Date;
  text?: string;
  attachments: PrintAttachment[];
  status: 'pending' | 'processed';
  uid?: number;
}

export interface PrintAttachment {
  filename: string;
  contentType: string;
  size: number;
  content: Buffer;
}

/**
 * Fetch pending print requests
 */
export async function fetchPrintRequests(): Promise<PrintRequest[]> {
  try {
    const emails = await fetchUnreadEmails() as ParsedMailWithUid[];

    const printRequests: PrintRequest[] = emails
      .filter(email => email.attachments && email.attachments.length > 0)
      .map(email => ({
        id: email.messageId || `email-${Date.now()}`,
        from: email.from?.text || 'Unknown',
        subject: email.subject || 'No subject',
        date: email.date || new Date(),
        text: email.text,
        attachments: email.attachments
          .filter((att): att is Attachment =>
            att.contentType !== undefined &&
            !att.contentType.startsWith('image/') ||
            att.filename !== undefined
          )
          .map(att => ({
            filename: att.filename || 'unnamed',
            contentType: att.contentType,
            size: att.size,
            content: att.content,
          })),
        status: 'pending' as const,
        uid: email.uid,
      }));

    return printRequests;
  } catch (error) {
    console.error('Error fetching print requests:', error);
    throw error;
  }
}

/**
 * Save attachment to temporary directory
 */
export async function saveAttachment(
  attachment: PrintAttachment,
  tempDir: string = '/tmp/print-requests'
): Promise<string> {
  try {
    // Create temp directory if not exists
    await fs.mkdir(tempDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const safeFilename = attachment.filename.replace(/[^a-z0-9.-]/gi, '_');
    const filePath = path.join(tempDir, `${timestamp}-${safeFilename}`);

    // Write file
    await fs.writeFile(filePath, attachment.content);

    return filePath;
  } catch (error) {
    console.error('Error saving attachment:', error);
    throw error;
  }
}

/**
 * Mark print request as processed
 */
export async function markPrintRequestProcessed(uid: number): Promise<void> {
  try {
    await markAsRead(uid);
  } catch (error) {
    console.error('Error marking print request as processed:', error);
    throw error;
  }
}

/**
 * Get print request statistics
 */
export async function getPrintStats(): Promise<{
  pending: number;
  totalAttachments: number;
}> {
  try {
    const requests = await fetchPrintRequests();
    const totalAttachments = requests.reduce(
      (sum, req) => sum + req.attachments.length,
      0
    );

    return {
      pending: requests.length,
      totalAttachments,
    };
  } catch (error) {
    console.error('Error getting print stats:', error);
    return {
      pending: 0,
      totalAttachments: 0,
    };
  }
}

/**
 * Filter printable attachments
 * (PDF, Word, Excel, Images)
 */
export function isPrintableAttachment(contentType: string): boolean {
  const printableTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
  ];

  return printableTypes.some(type => contentType.includes(type));
}

/**
 * Clean old print files (cleanup task)
 */
export async function cleanOldPrintFiles(
  tempDir: string = '/tmp/print-requests',
  maxAgeHours: number = 24
): Promise<number> {
  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = maxAgeHours * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      const age = now - stats.mtimeMs;

      if (age > maxAge) {
        await fs.unlink(filePath);
        deletedCount++;
      }
    }

    return deletedCount;
  } catch (error) {
    console.error('Error cleaning old print files:', error);
    return 0;
  }
}
