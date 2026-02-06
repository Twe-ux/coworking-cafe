/**
 * API Route: Mark Print Request as Processed
 * POST /api/print-requests/[id]/mark-processed
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPrintRequests, markPrintRequestProcessed } from '@coworking-cafe/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Find print request
    const requests = await fetchPrintRequests();
    const printRequest = requests.find((r) => r.id === params.id);

    if (!printRequest) {
      return NextResponse.json(
        { success: false, error: 'Print request not found' },
        { status: 404 }
      );
    }

    if (!printRequest.uid) {
      return NextResponse.json(
        { success: false, error: 'No UID available' },
        { status: 400 }
      );
    }

    // Mark as processed (read)
    await markPrintRequestProcessed(printRequest.uid);

    return NextResponse.json({
      success: true,
      message: 'Print request marked as processed',
    });
  } catch (error) {
    console.error('Error marking print request as processed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to mark as processed' },
      { status: 500 }
    );
  }
}
