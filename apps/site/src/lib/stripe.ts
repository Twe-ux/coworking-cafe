/**
 * Stripe Server-Side Integration
 *
 * IMPORTANT: Before using this file, install Stripe packages:
 * npm install stripe @stripe/stripe-js
 *
 * Then add your Stripe keys to .env.local:
 * STRIPE_SECRET_KEY=sk_test_...
 * STRIPE_PUBLISHABLE_KEY=pk_test_...
 * STRIPE_WEBHOOK_SECRET=whsec_...
 */

import Stripe from 'stripe';

// Use a placeholder during build if env var is not set
// Runtime will fail if actually used without proper key
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_build_placeholder';



/**
 * Initialize Stripe with the secret key
 * Uses the latest API version
 */
export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Validate that Stripe is properly configured
 * Throws error if used at runtime without proper key
 */
function validateStripeConfig(): void {
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_build_placeholder') {
    throw new Error(
      'STRIPE_SECRET_KEY is not properly configured. Please add it to your environment variables.\n' +
      'Get your keys from: https://dashboard.stripe.com/test/apikeys'
    );
  }
}

/**
 * Get Stripe publishable key for client-side usage
 */
export function getStripePublishableKey(): string {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    throw new Error(
      'STRIPE_PUBLISHABLE_KEY is not defined. Please add it to your .env.local file.'
    );
  }
  return process.env.STRIPE_PUBLISHABLE_KEY;
}

/**
 * Create a Payment Intent for a booking
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata?: Stripe.MetadataParam,
  customerId?: string,
  captureMethod?: 'automatic' | 'manual',
  paymentMethod?: string
): Promise<Stripe.PaymentIntent> {
  validateStripeConfig();
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: currency.toLowerCase(),
      metadata: metadata || {},
      customer: customerId, // Link to Stripe customer
      capture_method: captureMethod || 'automatic',
      payment_method_types: ['card'], // Only card payments (no Klarna, Amazon Pay, etc.)
      ...(paymentMethod && {
        payment_method: paymentMethod,
        confirm: true, // Auto-confirm when payment method is provided
      }),
    });

    return paymentIntent;
  } catch (error) {
    throw error;
  }
}

/**
 * Retrieve a Payment Intent by ID
 */
export async function retrievePaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  validateStripeConfig();
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw error;
  }
}

/**
 * Cancel a Payment Intent (for hold release when customer shows up)
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  validateStripeConfig();
  try {
    const paymentIntent = await stripe.paymentIntents.cancel(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    throw error;
  }
}

/**
 * Capture a Payment Intent (for no-show charges)
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.PaymentIntent> {
  validateStripeConfig();
  try {
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
      amount_to_capture: amount ? Math.round(amount) : undefined,
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a Setup Intent for saving payment method without charging
 */
export async function createSetupIntent(
  customerId: string,
  metadata?: Stripe.MetadataParam
): Promise<Stripe.SetupIntent> {
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      metadata: metadata || {},
      payment_method_types: ['card'], // Only card payments (no Klarna, Amazon Pay, etc.)
    });

    return setupIntent;
  } catch (error) {
    throw error;
  }
}

/**
 * Create a refund for a payment
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount) : undefined, // Partial refund if amount specified
      reason: reason || 'requested_by_customer',
    });

    return refund;
  } catch (error) {
    throw error;
  }
}

/**
 * Verify Stripe webhook signature
 * This ensures the webhook request is actually from Stripe
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error(
      'STRIPE_WEBHOOK_SECRET is not defined. Please add it to your .env.local file.\n' +
      'Get it from: https://dashboard.stripe.com/test/webhooks'
    );
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Format amount for display (convert cents to currency)
 */
export function formatAmountForDisplay(
  amount: number,
  currency: string = 'EUR'
): string {
  const numberFormat = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  });

  return numberFormat.format(amount / 100);
}

/**
 * Format amount for Stripe (convert currency to cents)
 */
export function formatAmountForStripe(
  amount: number,
  currency: string = 'EUR'
): number {
  // Some currencies don't use decimal places (e.g., JPY, KRW)
  const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
}

/**
 * Get the Stripe customer ID or create a new one
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name?: string,
  metadata?: Stripe.MetadataParam
): Promise<Stripe.Customer> {
  try {
    // Search for existing customer by email
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      return existingCustomers.data[0];
    }

    // Create new customer if none exists
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: metadata || {},
    });

    return customer;
  } catch (error) {
    throw error;
  }
}
