import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';
import BookingSettings from "../../../../models/bookingSettings";
import { logger } from "../../../../lib/logger";
import { sendDepositCaptured } from "../../../../lib/email/emailService";
import SpaceConfiguration from '@coworking-cafe/database';

/**
 * GET /api/cron/check-attendance
 *
 * Cron job that runs daily at 10:00 AM (configured in BookingSettings)
 * Checks reservations from yesterday (J-1) and automatically processes them if not validated:
 * - If attendanceStatus is not set → mark as 'absent' and capture payment
 * - Captures the payment intent for no-shows
 * - Sends notification emails
 *
 * This should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/check-attendance",
 *     "schedule": "0 10 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn("Unauthorized cron attempt", {
        component: "Cron /check-attendance",
        data: {
          ip: request.headers.get("x-forwarded-for"),
        },
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get booking settings for notification email
    const settings = await BookingSettings.findOne();

    // Calculate yesterday's date range
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    logger.info("Starting check-attendance cron", {
      component: "Cron /check-attendance",
      data: {
        checkDate: yesterday.toISOString(),
      },
    });

    // Find confirmed reservations from yesterday that haven't been validated
    const unvalidatedBookings = await Reservation.find({
      date: {
        $gte: yesterday,
        $lte: yesterdayEnd,
      },
      status: "confirmed",
      attendanceStatus: { $exists: false }, // Not yet validated
      requiresPayment: true, // Only process bookings that require payment
      stripePaymentIntentId: { $exists: true }, // Must have a payment intent
    })
      .populate("user", "email givenName")
      .populate("space", "name type");

    logger.info(
      `Found ${unvalidatedBookings.length} unvalidated bookings from yesterday`,
      {
        component: "Cron /check-attendance",
        data: {
          count: unvalidatedBookings.length,
        },
      },
    );

    const results = {
      captured: [] as string[],
      failed: [] as { bookingId: string; error: string }[],
      skipped: [] as string[],
    };

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    for (const booking of unvalidatedBookings) {
      try {
        // Get space configuration for email details
        const spaceConfig = await SpaceConfiguration.findOne({
          spaceType: booking.spaceType,
        });

        // Check if payment intent exists and is capturable
        const paymentIntent = await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId,
        );

        if (paymentIntent.status !== "requires_capture") {
          logger.warn("Payment intent not in capturable state", {
            component: "Cron /check-attendance",
            data: {
              bookingId: (booking._id as any).toString(),
              status: paymentIntent.status,
            },
          });
          results.skipped.push((booking._id as any).toString());
          continue;
        }

        // Capture the payment (charge the customer)
        await stripe.paymentIntents.capture(booking.stripePaymentIntentId);

        // Update booking status
        booking.attendanceStatus = "absent";
        booking.status = "completed";
        booking.completedAt = new Date();
        booking.paymentStatus = "paid";
        await booking.save();

        results.captured.push((booking._id as any).toString());

        logger.info("Payment captured for no-show", {
          component: "Cron /check-attendance",
          data: {
            bookingId: (booking._id as any).toString(),
            paymentIntentId: booking.stripePaymentIntentId,
            amount: paymentIntent.amount,
          },
        });

        // Send notification email to customer
        try {
          const userEmail =
            booking.contactEmail || (booking.user as any)?.email;
          const userName =
            booking.contactName || (booking.user as any)?.givenName;

          if (userEmail) {
            // Calculate deposit amount
            const depositAmount = spaceConfig?.depositPolicy?.enabled
              ? spaceConfig.depositPolicy.fixedAmount ||
                Math.round(
                  booking.totalPrice *
                    100 *
                    ((spaceConfig.depositPolicy.percentage || 100) / 100),
                )
              : booking.totalPrice * 100;

            await sendDepositCaptured(userEmail, {
              name: userName,
              spaceName: spaceConfig?.name || booking.spaceType,
              date: new Date(booking.date).toLocaleDateString("fr-FR"),
              depositAmount: depositAmount / 100,
            });

            logger.info("No-show email sent", {
              component: "Cron /check-attendance",
              data: {
                bookingId: (booking._id as any).toString(),
                email: userEmail,
              },
            });
          }
        } catch (emailError) {
          logger.error("Failed to send no-show email", {
            component: "Cron /check-attendance",
            data: {
              bookingId: (booking._id as any).toString(),
              error:
                emailError instanceof Error ? emailError.message : "Unknown",
            },
          });
          // Don't fail the whole process if email fails
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.failed.push({
          bookingId: (booking._id as any).toString(),
          error: errorMessage,
        });

        logger.error("Failed to process unvalidated booking", {
          component: "Cron /check-attendance",
          data: {
            bookingId: (booking._id as any).toString(),
            error: errorMessage,
          },
        });
      }
    }

    logger.info("Check-attendance cron completed", {
      component: "Cron /check-attendance",
      data: {
        total: unvalidatedBookings.length,
        captured: results.captured.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Attendance check completed",
      data: {
        totalProcessed: unvalidatedBookings.length,
        capturedCount: results.captured.length,
        failedCount: results.failed.length,
        skippedCount: results.skipped.length,
        capturedIds: results.captured,
        failures: results.failed,
        skippedIds: results.skipped,
      },
    });
  } catch (error) {
    logger.error("Check-attendance cron failed", {
      component: "Cron /check-attendance",
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
