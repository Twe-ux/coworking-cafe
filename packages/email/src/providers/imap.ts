/**
 * IMAP Provider - Receive Emails
 *
 * IMAP = Internet Message Access Protocol
 * Used to READ emails from a mailbox
 *
 * Use cases:
 * - Read contact form replies
 * - Process incoming reservations
 * - Auto-reply system
 * - Email monitoring
 */

import Imap from 'imap';
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
 * Connect to IMAP mailbox
 */
export function connectImap(config?: IMAPConfig): Imap {
  const imapConfig = config || getOVHImapConfig();

  return new Imap({
    user: imapConfig.user,
    password: imapConfig.password,
    host: imapConfig.host,
    port: imapConfig.port,
    tls: imapConfig.tls,
    tlsOptions: {
      rejectUnauthorized: false,
      servername: imapConfig.host, // Force SNI
    },
    authTimeout: 10000,
    connTimeout: 10000,
    // Force auth methods
    autotls: 'always',
  });
}

/**
 * Fetch unread emails
 */
export async function fetchUnreadEmails(): Promise<ParsedMail[]> {
  return new Promise((resolve, reject) => {
    const imap = connectImap();
    const emails: ParsedMail[] = [];

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        // Search for unread emails
        imap.search(['UNSEEN'], (searchErr, results) => {
          if (searchErr) {
            reject(searchErr);
            return;
          }

          if (results.length === 0) {
            imap.end();
            resolve([]);
            return;
          }

          const fetch = imap.fetch(results, { bodies: '' });

          fetch.on('message', (msg) => {
            msg.on('body', (stream) => {
              simpleParser(stream as any).then(parsed => {
                emails.push(parsed);
              }).catch(parseErr => {
                console.error('Error parsing email:', parseErr);
              });
            });
          });

          fetch.once('error', reject);

          fetch.once('end', () => {
            imap.end();
          });
        });
      });
    });

    imap.once('error', reject);

    imap.once('end', () => {
      resolve(emails);
    });

    imap.connect();
  });
}

/**
 * Mark email as read
 */
export async function markAsRead(uid: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const imap = connectImap();

    imap.once('ready', () => {
      imap.openBox('INBOX', false, (err) => {
        if (err) {
          reject(err);
          return;
        }

        imap.addFlags(uid, ['\\Seen'], (flagErr) => {
          imap.end();
          if (flagErr) {
            reject(flagErr);
          } else {
            resolve();
          }
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
}

/**
 * Get inbox stats
 */
export async function getInboxStats(): Promise<{
  total: number;
  unread: number;
}> {
  return new Promise((resolve, reject) => {
    const imap = connectImap();

    imap.once('ready', () => {
      imap.openBox('INBOX', true, (err, box) => {
        if (err) {
          reject(err);
          return;
        }

        imap.search(['UNSEEN'], (searchErr, results) => {
          imap.end();
          if (searchErr) {
            reject(searchErr);
            return;
          }

          resolve({
            total: box.messages.total,
            unread: results.length,
          });
        });
      });
    });

    imap.once('error', reject);
    imap.connect();
  });
}
