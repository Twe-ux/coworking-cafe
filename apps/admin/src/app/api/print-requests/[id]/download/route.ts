/**
 * API Route: Download Attachment
 * GET /api/print-requests/[id]/download?filename=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchPrintRequests } from '@coworking-cafe/email';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename required' },
        { status: 400 }
      );
    }

    // Fetch print requests
    const requests = await fetchPrintRequests();
    const request_item = requests.find((r) => r.id === params.id);

    if (!request_item) {
      return NextResponse.json(
        { success: false, error: 'Print request not found' },
        { status: 404 }
      );
    }

    // Find attachment
    const attachment = request_item.attachments.find(
      (att) => att.filename === filename
    );

    if (!attachment) {
      return NextResponse.json(
        { success: false, error: 'Attachment not found' },
        { status: 404 }
      );
    }

    // Return file as download
    return new NextResponse(attachment.content as unknown as BodyInit, {
      headers: {
        'Content-Type': attachment.contentType,
        'Content-Disposition': `attachment; filename="${attachment.filename}"`,
        'Content-Length': attachment.size.toString(),
      },
    });
  } catch (error) {
    console.error('Error downloading attachment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
