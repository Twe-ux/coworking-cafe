/**
 * Secure logging utility for production environments
 * Prevents sensitive data leakage in production logs
 */

type LogLevel = 'dev' | 'info' | 'warn' | 'error' | 'secure';

interface LoggerOptions {
  includeTimestamp?: boolean;
  sanitize?: boolean;
}

const defaultOptions: LoggerOptions = {
  includeTimestamp: true,
  sanitize: true,
};

/**
 * Sanitizes data to prevent sensitive information leakage
 */
function sanitizeData(data: unknown): unknown {
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  const sanitized: Record<string, unknown> = {};
  const sensitiveKeys = [
    'password',
    'token',
    'secret',
    'pin',
    'apiKey',
    'accessToken',
    'refreshToken',
    'authorization',
    'cookie',
  ];

  for (const [key, value] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = sensitiveKeys.some((k) => lowerKey.includes(k));

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, msg: string, options: LoggerOptions): string {
  const timestamp = options.includeTimestamp ? `${getTimestamp()} ` : '';
  return `${timestamp}[${level.toUpperCase()}] ${msg}`;
}

const logger = {
  /**
   * Development-only logs
   * Only shows in development environment
   */
  dev(msg: string, data?: unknown, options: LoggerOptions = defaultOptions): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMsg = formatMessage('dev', msg, options);
      if (data !== undefined) {
        const output = options.sanitize ? sanitizeData(data) : data;
        console.log(formattedMsg, output);
      } else {
        console.log(formattedMsg);
      }
    }
  },

  /**
   * Informational logs
   * Shows in all environments
   */
  info(msg: string, data?: unknown, options: LoggerOptions = defaultOptions): void {
    const formattedMsg = formatMessage('info', msg, options);
    if (data !== undefined) {
      const output = options.sanitize ? sanitizeData(data) : data;
      console.log(formattedMsg, output);
    } else {
      console.log(formattedMsg);
    }
  },

  /**
   * Warning logs
   * Shows in all environments
   */
  warn(msg: string, data?: unknown, options: LoggerOptions = defaultOptions): void {
    const formattedMsg = formatMessage('warn', msg, options);
    if (data !== undefined) {
      const output = options.sanitize ? sanitizeData(data) : data;
      console.warn(formattedMsg, output);
    } else {
      console.warn(formattedMsg);
    }
  },

  /**
   * Error logs
   * Shows in all environments
   */
  error(msg: string, error?: unknown, options: LoggerOptions = defaultOptions): void {
    const formattedMsg = formatMessage('error', msg, options);
    if (error !== undefined) {
      const output = options.sanitize ? sanitizeData(error) : error;
      console.error(formattedMsg, output);
    } else {
      console.error(formattedMsg);
    }
  },

  /**
   * Security-sensitive logs
   * Only shows sanitized version in development
   * Completely silent in production
   */
  secure(msg: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      const formattedMsg = formatMessage('secure', msg, { includeTimestamp: true, sanitize: true });
      if (data !== undefined) {
        console.log(formattedMsg, sanitizeData(data));
      } else {
        console.log(formattedMsg);
      }
    }
  },
};

export default logger;
