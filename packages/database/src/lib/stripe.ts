import Stripe from 'stripe';

/**
 * Stripe Client Instance
 * Configured with API key from environment
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

/**
 * Create a Payment Intent for a reservation
 * Supports both automatic and manual capture
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'eur',
  metadata?: Stripe.MetadataParam,
  customerId?: string,
  captureMethod?: 'automatic' | 'manual',
  paymentMethod?: string
): Promise<Stripe.PaymentIntent> {
  const params: Stripe.PaymentIntentCreateParams = {
    amount: Math.round(amount), // Amount in cents
    currency: currency.toLowerCase(),
    metadata: metadata || {},
    capture_method: captureMethod || 'automatic',
    payment_method_types: ['card'],
  };

  if (customerId) {
    params.customer = customerId;
  }

  if (paymentMethod) {
    params.payment_method = paymentMethod;
    params.confirm = true; // Auto-confirm when payment method is provided
  }

  return stripe.paymentIntents.create(params);
}

/**
 * Cancel a Payment Intent (release authorization hold)
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Capture a Payment Intent (charge after no-show)
 */
export async function capturePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.capture(paymentIntentId);
}

/**
 * Retrieve a Payment Intent
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Create a Customer
 */
export async function createCustomer(params: {
  email: string;
  name?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> {
  return stripe.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata,
  });
}

/**
 * Get Customer by ID
 */
export async function getCustomer(customerId: string): Promise<Stripe.Customer | Stripe.DeletedCustomer> {
  return stripe.customers.retrieve(customerId);
}

/**
 * Create a Refund
 */
export async function createRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<Stripe.Refund> {
  return stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? Math.round(amount * 100) : undefined,
    reason,
  });
}

/**
 * Construct Webhook Event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Verify Webhook Signature
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
): boolean {
  try {
    constructWebhookEvent(payload, signature, webhookSecret);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Format amount from cents to euros
 */
export function formatAmount(amountInCents: number): string {
  const euros = amountInCents / 100;
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(euros);
}

/**
 * Convert euros to cents for Stripe
 */
export function toCents(euros: number): number {
  return Math.round(euros * 100);
}

/**
 * Format amount for Stripe (convert currency to cents)
 */
export function formatAmountForStripe(
  amount: number,
  currency: string = 'EUR'
): number {
  // Some currencies don't use decimal places (e.g., JPY, KRW)
  const zeroDecimalCurrencies = [
    'BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG',
    'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'
  ];

  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    return Math.round(amount);
  }

  return Math.round(amount * 100);
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
 * Get or create a Stripe customer
 * Searches by email first, creates new if not found
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
      payment_method_types: ['card'],
    });

    return setupIntent;
  } catch (error) {
    throw error;
  }
}
