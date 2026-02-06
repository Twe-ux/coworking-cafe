import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

/**
 * SMTP Provider Configuration
 *
 * Supports multiple SMTP services:
 * - Gmail SMTP (500 emails/day)
 * - Custom SMTP (your hosting provider)
 * - Third-party SMTP (Brevo, SendGrid, etc.)
 */

export type SMTPProvider = 'gmail' | 'ovh' | 'custom' | 'brevo' | 'sendgrid';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

/**
 * Get SMTP configuration based on provider
 */
function getSMTPConfig(provider: SMTPProvider): SMTPConfig {
  switch (provider) {
    case 'gmail':
      return {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASSWORD!, // App password required
        },
      };

    case 'ovh':
      return {
        host: 'ssl0.ovh.net',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER!, // Full email: noreply@coworkingcafe.fr
          pass: process.env.SMTP_PASSWORD!,
        },
      };

    case 'brevo':
      return {
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.BREVO_SMTP_USER!,
          pass: process.env.BREVO_SMTP_PASSWORD!,
        },
      };

    case 'sendgrid':
      return {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY!,
        },
      };

    case 'custom':
      return {
        host: process.env.SMTP_HOST!,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASSWORD!,
        },
      };

    default:
      throw new Error(`Unknown SMTP provider: ${provider}`);
  }
}

/**
 * Create SMTP transporter
 */
export function createSMTPTransporter(provider?: SMTPProvider): Transporter {
  const selectedProvider = (provider || process.env.SMTP_PROVIDER || 'gmail') as SMTPProvider;
  const config = getSMTPConfig(selectedProvider);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: config.auth,
  });

  return transporter;
}

/**
 * Create SMTP transporter with custom credentials
 * Useful for sending from a different email address (e.g., strasbourg@coworkingcafe.fr)
 */
export function createSMTPTransporterWithCredentials(
  user: string,
  password: string,
  provider?: SMTPProvider
): Transporter {
  const selectedProvider = (provider || process.env.SMTP_PROVIDER || 'gmail') as SMTPProvider;

  // Get base config (host, port, secure) but override auth
  const baseConfig = getSMTPConfig(selectedProvider);

  const transporter = nodemailer.createTransport({
    host: baseConfig.host,
    port: baseConfig.port,
    secure: baseConfig.secure,
    auth: {
      user,
      pass: password,
    },
  });

  return transporter;
}

/**
 * Verify SMTP connection
 */
export async function verifySMTPConnection(provider?: SMTPProvider): Promise<boolean> {
  try {
    const transporter = createSMTPTransporter(provider);
    await transporter.verify();
    console.log('✅ SMTP connection verified');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:', error);
    return false;
  }
}
