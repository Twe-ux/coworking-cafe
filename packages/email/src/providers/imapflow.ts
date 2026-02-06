/**
 * IMAP Provider using ImapFlow (modern library)
 *
 * ImapFlow is more modern and better maintained than node-imap
 * Works better with OVH IMAP servers
 */

import { ImapFlow } from 'imapflow';
import { simpleParser, ParsedMail } from 'mailparser';

export interface IMAPConfig {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

/**
 * Get IMAP configuration for OVH
 */
export function getOVHImapConfig(): IMAPConfig {
  return {
    user: process.env.IMAP_USER || process.env.SMTP_USER!,
    password: process.env.IMAP_PASSWORD || process.env.SMTP_PASSWORD!,
    host: process.env.IMAP_HOST || 'ssl0.ovh.net',
    port: parseInt(process.env.IMAP_PORT || '993'),
    tls: true,
  };
}

/**
 * Fetch unread emails
 */
export async function fetchUnreadEmails(): Promise<ParsedMail[]> {
  const config = getOVHImapConfig();

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    // Connect
    await client.connect();

    // Open INBOX
    await client.mailboxOpen('INBOX');

    // Search for unseen messages
    const messages: ParsedMail[] = [];

    for await (const message of client.fetch('1:*', {
      envelope: true,
      source: true,
      uid: true,
    }, {
      uid: true,
    })) {
      // Check if message is unseen
      if (!message.flags || !message.flags.has('\\Seen')) {
        // Parse email
        if (message.source) {
          const parsed = await simpleParser(message.source);

          // Add UID to parsed email
          (parsed as any).uid = message.uid;

          messages.push(parsed);
        }
      }
    }

    await client.logout();

    return messages;
  } catch (error) {
    console.error('Error fetching emails:', error);
    throw error;
  }
}

/**
 * Mark email as read
 */
export async function markAsRead(uid: number): Promise<void> {
  const config = getOVHImapConfig();

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();
    await client.mailboxOpen('INBOX');

    // Mark as seen
    await client.messageFlagsAdd(
      { uid },
      ['\\Seen'],
      { uid: true }
    );

    await client.logout();
  } catch (error) {
    console.error('Error marking email as read:', error);
    throw error;
  }
}

/**
 * Get inbox stats
 */
export async function getInboxStats(): Promise<{
  total: number;
  unread: number;
}> {
  const config = getOVHImapConfig();

  const client = new ImapFlow({
    host: config.host,
    port: config.port,
    secure: config.tls,
    auth: {
      user: config.user,
      pass: config.password,
    },
    logger: false,
  });

  try {
    await client.connect();

    const mailbox = await client.mailboxOpen('INBOX');

    const total = mailbox.exists;

    // Count unseen
    const unseenMessages = await client.search({ seen: false });
    const unread = Array.isArray(unseenMessages) ? unseenMessages.length : 0;

    await client.logout();

    return {
      total,
      unread,
    };
  } catch (error) {
    console.error('Error getting inbox stats:', error);
    throw error;
  }
}
