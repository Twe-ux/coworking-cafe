/**
 * Centralized Logger Utility
 * Replaces console.log with proper logging in development/production
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogOptions {
  component?: string;
  data?: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, options?: LogOptions): string {
    const timestamp = new Date().toISOString();
    const component = options?.component ? `[${options.component}]` : '';
    return `${timestamp} ${level.toUpperCase()} ${component} ${message}`;
  }

  info(message: string, options?: LogOptions) {
    if (this.isDev) {
      console.log(this.formatMessage('info', message, options), options?.data || '');
    }
  }

  warn(message: string, options?: LogOptions) {
    console.warn(this.formatMessage('warn', message, options), options?.data || '');
  }

  error(message: string, options?: LogOptions) {
    console.error(this.formatMessage('error', message, options), options?.data || '');
  }

  debug(message: string, options?: LogOptions) {
    if (this.isDev) {
      console.debug(this.formatMessage('debug', message, options), options?.data || '');
    }
  }
}

export const logger = new Logger();
