import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';
import { Payment } from '@coworking-cafe/database';
import { createPaymentIntent } from "../../../../lib/stripe";
import { logger } from "../../../../lib/logger";
import SpaceConfiguration from '@coworking-cafe/database';

/**
 * GET /api/cron/capture-deposits
 *
 * Cron job that runs daily to create payment intents for bookings that are 6 days away
 * For bookings that were created >6 days in advance (with SetupIntent)
 *
 * This should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/capture-deposits",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn("Unauthorized cron attempt", {
        component: "Cron /capture-deposits",
        data: {
          ip: request.headers.get("x-forwarded-for"),
        },
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Calculate target date (6 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 6);
    targetDate.setHours(0, 0, 0, 0);

    const targetDateEnd = new Date(targetDate);
    targetDateEnd.setHours(23, 59, 59, 999);

    logger.info("Starting capture-deposits cron", {
      component: "Cron /capture-deposits",
      data: {
        targetDate: targetDate.toISOString(),
      },
    });

    // Find confirmed bookings that:
    // 1. Are scheduled for exactly 6 days from now
    // 2. Have deferred capture method (SetupIntent was used)
    // 3. Don't have a payment intent yet
    // 4. Are not cancelled
    const bookings = await Reservation.find({
      date: {
        $gte: targetDate,
        $lte: targetDateEnd,
      },
      status: "confirmed",
      captureMethod: "deferred",
      stripePaymentIntentId: { $exists: false },
      stripeSetupIntentId: { $exists: true },
      stripeCustomerId: { $exists: true },
    })
      .populate("user", "email givenName")
      .populate("space", "name type");

    logger.info(
      `Found ${bookings.length} bookings requiring payment intent creation`,
      {
        component: "Cron /capture-deposits",
        data: {
          count: bookings.length,
        },
      },
    );

    const results = {
      success: [] as string[],
      failed: [] as { bookingId: string; error: string }[],
    };

    for (const booking of bookings) {
      try {
        // Get space configuration to calculate deposit amount
        const spaceConfig = await SpaceConfiguration.findOne({
          spaceType: booking.spaceType,
        });

        // Calculate deposit amount
        const amountInCents = Math.round(booking.totalPrice * 100);
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

          if (policy.minimumAmount && depositAmount < policy.minimumAmount) {
            depositAmount = policy.minimumAmount;
          }
        }

        // Get payment method from SetupIntent
        const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
        const setupIntent = await stripe.setupIntents.retrieve(
          booking.stripeSetupIntentId,
        );

        if (!setupIntent.payment_method) {
          throw new Error("No payment method found in SetupIntent");
        }

        // Create Payment Intent with manual capture
        const paymentIntent = await createPaymentIntent(
          depositAmount,
          "eur",
          {
            bookingId: (booking._id as any).toString(),
            userId: (booking.user as any)?._id?.toString(),
            type: "deferred_deposit_hold",
          },
          booking.stripeCustomerId,
          "manual", // Manual capture
          setupIntent.payment_method as string, // Use saved payment method
        );

        // Create Payment record
        await Payment.create({
          booking: booking._id as any,
          user: (booking.user as any)?._id,
          amount: depositAmount,
          currency: "EUR",
          status: "pending",
          paymentMethod: "card",
          stripePaymentIntentId: paymentIntent.id,
          stripeCustomerId: booking.stripeCustomerId,
          description: `Empreinte bancaire créée à J-6 pour ${booking.spaceType}`,
        });

        // Update booking
        booking.stripePaymentIntentId = paymentIntent.id;
        booking.captureMethod = "manual";
        booking.requiresPayment = true;
        await booking.save();

        results.success.push((booking._id as any).toString());

        logger.info(
          "Payment intent created successfully for deferred booking",
          {
            component: "Cron /capture-deposits",
            data: {
              bookingId: (booking._id as any).toString(),
              paymentIntentId: paymentIntent.id,
              amount: depositAmount,
            },
          },
        );

        // TODO: Send email notification to customer about the hold
        // await sendDepositHoldCreatedEmail(...)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.failed.push({
          bookingId: (booking._id as any).toString(),
          error: errorMessage,
        });

        logger.error("Failed to create payment intent for deferred booking", {
          component: "Cron /capture-deposits",
          data: {
            bookingId: (booking._id as any).toString(),
            error: errorMessage,
          },
        });
      }
    }

    logger.info("Capture-deposits cron completed", {
      component: "Cron /capture-deposits",
      data: {
        total: bookings.length,
        success: results.success.length,
        failed: results.failed.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cron job executed successfully",
      data: {
        totalProcessed: bookings.length,
        successCount: results.success.length,
        failedCount: results.failed.length,
        successIds: results.success,
        failures: results.failed,
      },
    });
  } catch (error) {
    logger.error("Capture-deposits cron failed", {
      component: "Cron /capture-deposits",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for Vercel Pro
