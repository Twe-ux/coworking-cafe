import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Check Payment Intent Details
 *
 * Usage: /api/debug/check-payment?paymentIntentId=pi_xxxxx
 *
 * This endpoint retrieves payment intent details from Stripe
 * to debug why bookings aren't being created for guest users.
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

    // Get the payment intent from Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return NextResponse.json({
      success: true,
      data: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        customer: paymentIntent.customer,
        metadata: paymentIntent.metadata,
        created: new Date(paymentIntent.created * 1000).toISOString(),
      },
      debug: {
        hasContactEmail: !!paymentIntent.metadata?.contactEmail,
        hasContactName: !!paymentIntent.metadata?.contactName,
        hasUserId: !!paymentIntent.metadata?.userId,
        hasCreateBookingFlag: paymentIntent.metadata?.createBookingOnAuthorization === 'true',
        allMetadataKeys: Object.keys(paymentIntent.metadata || {}),
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve payment intent',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
