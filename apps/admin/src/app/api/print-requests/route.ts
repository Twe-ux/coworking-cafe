/**
 * API Route: Print Requests
 * GET /api/print-requests - List pending print requests
 */

import { NextResponse } from 'next/server';
import { fetchPrintRequests, getPrintStats } from '@coworking-cafe/email';

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
