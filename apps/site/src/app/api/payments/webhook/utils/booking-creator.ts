import { Booking } from '@coworking-cafe/database';
import type { BookingDocument } from '@coworking-cafe/database';
import {
  parseMetadata,
  generateConfirmationNumber,
  calculateDepositAmount,
} from './metadata-parser';

interface BookingData {
  metadata: Record<string, string>;
  stripePaymentIntentId?: string;
  stripeSetupIntentId?: string;
  stripeCustomerId: string;
  captureMethod: 'manual' | 'deferred';
  depositAmount?: number;
}

/**
 * Check if booking already exists for this payment/setup intent
 * Prevents duplicate bookings from webhook retries
 */
export async function checkExistingBooking(
  data: BookingData
): Promise<boolean> {
  const query = data.stripePaymentIntentId
    ? { stripePaymentIntentId: data.stripePaymentIntentId }
    : { stripeSetupIntentId: data.stripeSetupIntentId };

  const existing = await Booking.findOne(query);
  return !!existing;
}

/**
 * Create booking from payment/setup intent metadata
 * Shared logic between payment_intent and setup_intent handlers
 */
export async function createBookingFromIntent(
  data: BookingData
): Promise<BookingDocument> {
  const { metadata } = data;
  const { additionalServices, invoiceDetails } = parseMetadata(metadata);
  const confirmationNumber = generateConfirmationNumber();
  const depositAmountInCents =
    data.depositAmount ?? calculateDepositAmount(metadata);

  const bookingData = {
    spaceType: metadata.spaceType,
    date: new Date(metadata.date),
    startTime: metadata.startTime,
    endTime: metadata.endTime,
    numberOfPeople: parseInt(metadata.numberOfPeople),
    reservationType: metadata.reservationType || 'hourly',
    totalPrice: parseFloat(metadata.totalPrice),
    user: metadata.userId || null,
    contactEmail: metadata.contactEmail,
    contactName: metadata.contactName,
    contactPhone: metadata.contactPhone,
    companyName: metadata.companyName || '',
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    invoiceOption: false, // Always false for client bookings
    invoiceDetails,
    additionalServices,
    stripePaymentIntentId: data.stripePaymentIntentId,
    stripeSetupIntentId: data.stripeSetupIntentId,
    stripeCustomerId: data.stripeCustomerId,
    captureMethod: data.captureMethod,
    depositAmount: depositAmountInCents,
    requiresPayment: true,
    confirmationNumber,
    isPartialPrivatization: metadata.isPartialPrivatization === 'true',
    message: metadata.message || '',
  };

  try {
    return await Booking.create(bookingData);
  } catch (error: unknown) {
    // Handle duplicate key error (E11000) from race conditions
    if (
      error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 11000
    ) {
      console.log(
        '[BookingCreator] Duplicate booking detected (race condition), skipping'
      );
      throw new Error('DUPLICATE_BOOKING');
    }
    throw error;
  }
}
