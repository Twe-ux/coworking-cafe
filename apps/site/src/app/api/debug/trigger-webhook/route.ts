import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Manually trigger webhook for a payment intent
 *
 * Usage: /api/debug/trigger-webhook?paymentIntentId=pi_xxxxx
 *
 * This endpoint manually calls the test-webhook endpoint to create a booking.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('paymentIntentId');

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: 'Missing paymentIntentId parameter' },
        { status: 400 }
      );
    }

    // Call the test webhook endpoint
    const webhookUrl = new URL('/api/payments/test-webhook', request.url);

    const response = await fetch(webhookUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentIntentId }),
    });

    const data = await response.json();

    return NextResponse.json({
      success: response.ok,
      webhookResponse: data,
      statusCode: response.status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to trigger webhook',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
