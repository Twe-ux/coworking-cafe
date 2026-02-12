import { SpaceConfiguration } from '@coworking-cafe/database';
import { sendBookingInitialEmail } from '@/lib/email/emailService';
import { getSpaceTypeName } from '@/lib/space-names';

interface EmailData {
  contactEmail: string;
  contactName: string;
  spaceType: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalPrice: number;
  bookingId: string;
  depositAmount: number;
  captureMethod: 'manual' | 'automatic';
  additionalServices?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  numberOfPeople: number;
}

/**
 * Send booking confirmation email to customer
 * Non-blocking - logs errors without throwing
 */
export async function sendBookingConfirmationEmail(
  data: EmailData
): Promise<void> {
  try {
    const spaceConfig = await SpaceConfiguration.findOne({
      spaceType: data.spaceType,
    });

    const formattedDate = data.date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const timeRange =
      data.startTime && data.endTime
        ? `${data.startTime} - ${data.endTime}`
        : 'Journée complète';

    await sendBookingInitialEmail(data.contactEmail, {
      name: data.contactName,
      spaceName: spaceConfig?.name || getSpaceTypeName(data.spaceType),
      date: formattedDate,
      time: timeRange,
      price: data.totalPrice,
      bookingId: data.bookingId,
      requiresPayment: true,
      depositAmount: data.depositAmount,
      captureMethod: data.captureMethod,
      additionalServices: data.additionalServices,
      numberOfPeople: data.numberOfPeople,
    });

    console.log('[EmailSender] Booking confirmation sent to', data.contactEmail);
  } catch (error) {
    console.error('[EmailSender] Failed to send booking email:', error);
    // Don't throw - email failure shouldn't fail booking creation
  }
}

/**
 * Send admin notification for new booking
 * Non-blocking - logs errors without throwing
 */
export async function sendAdminNotification(bookingId: string): Promise<void> {
  try {
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    const notificationsSecret = process.env.NOTIFICATIONS_SECRET;

    if (!notificationsSecret) {
      console.warn(
        '[EmailSender] NOTIFICATIONS_SECRET not configured, skipping admin notification'
      );
      return;
    }

    const response = await fetch(`${adminUrl}/api/notifications/booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${notificationsSecret}`,
      },
      body: JSON.stringify({ bookingId }),
    });

    if (response.ok) {
      console.log('[EmailSender] Admin notification sent for booking', bookingId);
    } else {
      const result = await response.json().catch(() => ({}));
      console.error('[EmailSender] Admin notification failed:', result);
    }
  } catch (error) {
    console.error('[EmailSender] Failed to send admin notification:', error);
    // Don't throw - notification failure shouldn't fail booking creation
  }
}
