import { NextRequest } from 'next/server';
import { verifyWebhookSignature } from '@/lib/stripe';
import type Stripe from 'stripe';

/**
 * Validates incoming webhook request
 * - Verifies Stripe signature
 * - Parses event object
 *
 * @throws Error if signature missing or invalid
 */
export async function validateWebhookRequest(
  request: NextRequest
): Promise<Stripe.Event> {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    throw new Error('No stripe signature found');
  }

  try {
    return verifyWebhookSignature(body, signature);
  } catch (err) {
    throw new Error(
      `Webhook signature verification failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}
