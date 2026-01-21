import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';
import { Payment } from '@coworking-cafe/database';
import SpaceConfiguration from '@coworking-cafe/database';
import {
  createPaymentIntent,
  formatAmountForStripe,
} from "../../../../lib/stripe";
import { sendDepositHoldConfirmation } from "../../../../lib/email/emailService";

export const dynamic = "force-dynamic";

/**
 * POST /api/cron/create-holds
 *
 * Cron job endpoint - Create payment holds (empreintes bancaires) for bookings 7 days out
 *
 * This should be called daily (e.g., at 00:00 UTC) via:
 * - Vercel Cron Jobs
 * - GitHub Actions
 * - External cron service (cron-job.org, etc.)
 *
 * Security: Add CRON_SECRET to env and verify it in production
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret in production
    const authHeader = request.headers.get("authorization");
    if (process.env.NODE_ENV === "production" && process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }
    }

    await connectDB();

    // Calculate target date (7 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    targetDate.setHours(0, 0, 0, 0); // Start of day

    const endOfTargetDate = new Date(targetDate);
    endOfTargetDate.setHours(23, 59, 59, 999); // End of day
    // Find all confirmed bookings that:
    // 1. Are scheduled for exactly 7 days from now
    // 2. Have a setupIntentId (card saved)
    // 3. Don't have a paymentIntentId yet (no hold created)
    // 4. Require payment
    // 5. Are not cancelled
    const bookings = await Reservation.find({
      date: {
        $gte: targetDate,
        $lte: endOfTargetDate,
      },
      status: { $ne: "cancelled" },
      requiresPayment: true,
      stripeSetupIntentId: { $exists: true, $ne: null },
      stripePaymentIntentId: { $exists: false }, // No hold created yet
    })
      .populate("user", "email givenName username")
      .populate("space", "name type");
    const results = {
      success: [] as Array<{
        bookingId: string;
        paymentIntentId: string;
        depositAmount: number;
        customerEmail: string;
      }>,
      failed: [] as Array<{ bookingId: string; error: string }>,
      total: bookings.length,
    };

    // Process each booking
    for (const booking of bookings) {
      try {
        // Get space configuration for deposit policy
        const spaceConfig = await SpaceConfiguration.findOne({
          spaceType: booking.spaceType,
        });

        // Calculate deposit amount
        const amountInCents = formatAmountForStripe(booking.totalPrice);
        let depositAmount = amountInCents;

        if (spaceConfig?.depositPolicy?.enabled) {
          const policy = spaceConfig.depositPolicy;
          if (policy.fixedAmount) {
            depositAmount = policy.fixedAmount;
          } else if (policy.percentage) {
            depositAmount = Math.round(
              amountInCents * (policy.percentage / 100),
            );
          }

          // Apply minimum if set
          if (policy.minimumAmount && depositAmount < policy.minimumAmount) {
            depositAmount = policy.minimumAmount;
          }
        }

        // Get user details
        const bookingUser = booking.user as any;
        const userEmail = bookingUser?.email || booking.contactEmail;
        const userName = bookingUser?.givenName || booking.contactName;

        if (!booking.stripeCustomerId) {
          results.failed.push({
            bookingId: (booking._id as any).toString(),
            error: "No Stripe customer ID",
          });
          continue;
        }

        // Create Payment Intent with manual capture (hold)
        const paymentIntent = await createPaymentIntent(
          depositAmount,
          "eur",
          {
            bookingId: (booking._id as any).toString(),
            userId: bookingUser?._id?.toString(),
            type: "deposit_hold",
            createdBy: "cron_j-7",
          },
          booking.stripeCustomerId,
          "manual", // Manual capture for hold
        );
        // Create Payment record in database
        await Payment.create({
          booking: booking._id,
          user: bookingUser?._id,
          amount: depositAmount,
          currency: "EUR",
          status: "pending",
          paymentMethod: "card",
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: booking.stripeCustomerId,
          description: `Empreinte bancaire J-7 - ${booking.spaceType}`,
        });

        // Update booking
        booking.stripePaymentIntentId = paymentIntent.id;
        booking.captureMethod = "manual";
        await booking.save();
        // Send email notification
        const spaceName =
          typeof booking.space === "object" &&
          booking.space !== null &&
          "name" in booking.space
            ? (booking.space as { name: string }).name
            : booking.spaceType;

        await sendDepositHoldConfirmation(userEmail, {
          name: userName || "Client",
          spaceName,
          date: new Date(booking.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          startTime: booking.startTime || "",
          endTime: booking.endTime || "",
          depositAmount: depositAmount / 100,
          totalPrice: booking.totalPrice,
        });
        results.success.push({
          bookingId: (booking._id as any).toString(),
          paymentIntentId: paymentIntent.id,
          depositAmount: depositAmount / 100,
          customerEmail: userEmail,
        });
      } catch (error) {
        results.failed.push({
          bookingId: (booking._id as any).toString(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} bookings`,
      results,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// Also allow GET for testing (remove in production)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { success: false, error: "GET not allowed in production. Use POST." },
      { status: 405 },
    );
  }

  // In development, allow GET for easy testing
  return POST(request);
}
