/**
 * API Route: Print Requests
 * GET /api/print-requests - List pending print requests
 */

import { NextResponse } from 'next/server';

// ============================================================
// Types
// ============================================================

interface PrintAttachment {
  filename: string;
  contentType: string;
  size: number;
}

interface PrintRequest {
  id: string;
  from: string;
  subject: string;
  date: string;
  text?: string;
  attachments: PrintAttachment[];
  status: string;
  uid?: string;
}

interface PrintStats {
  total: number;
  pending: number;
  processed: number;
}

// ============================================================
// Temporary Stub Functions
// TODO: Replace with real implementation when @coworking-cafe/email/services/printService is created
// ============================================================

async function fetchPrintRequests(): Promise<PrintRequest[]> {
  // TODO: Implement email fetching when the service is ready
  // This should connect to IMAP and fetch emails from the print inbox
  return [];
}

async function getPrintStats(): Promise<PrintStats> {
  // TODO: Implement stats calculation when the service is ready
  return {
    total: 0,
    pending: 0,
    processed: 0,
  };
}

// ============================================================
// API Route Handler
// ============================================================

export async function GET() {
  try {
    const [requests, stats] = await Promise.all([
      fetchPrintRequests(),
      getPrintStats(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        requests: requests.map((req) => ({
          id: req.id,
          from: req.from,
          subject: req.subject,
          date: req.date,
          text: req.text?.substring(0, 200), // Preview
          attachments: req.attachments.map((att) => ({
            filename: att.filename,
            contentType: att.contentType,
            size: att.size,
            sizeFormatted: formatFileSize(att.size),
          })),
          status: req.status,
          uid: req.uid,
        })),
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching print requests:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch print requests',
      },
      { status: 500 }
    );
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
