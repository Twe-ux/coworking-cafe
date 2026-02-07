import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';
import BookingSettings from "../../../../models/bookingSettings";
import { logger } from "../../../../lib/logger";
import { sendDepositCaptured } from "../../../../lib/email/emailService";
import { SpaceConfiguration } from '@coworking-cafe/database';
import type {
  PopulatedBooking,
  CheckAttendanceResult,
  CronApiResponse,
  StripePaymentIntentMinimal,
  SpaceConfigurationMinimal
} from "../../../../types/cron";
import { Types } from "mongoose";

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
    const unvalidatedBookings = (await Booking.find({
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
      .populate("space", "name type")
      .lean()) as unknown as PopulatedBooking[];

    logger.info(
      `Found ${unvalidatedBookings.length} unvalidated bookings from yesterday`,
      {
        component: "Cron /check-attendance",
        data: {
          count: unvalidatedBookings.length,
        },
      },
    );

    const results: CheckAttendanceResult = {
      captured: [],
      failed: [],
      skipped: [],
    };

    const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

    for (const booking of unvalidatedBookings) {
      const bookingId = (booking._id as unknown as Types.ObjectId).toString();

      try {
        // Get space configuration for email details
        const spaceConfig = (await SpaceConfiguration.findOne({
          spaceType: booking.spaceType,
        }).lean()) as unknown as SpaceConfigurationMinimal | null;

        // Check if payment intent exists and is capturable
        const paymentIntent = (await stripe.paymentIntents.retrieve(
          booking.stripePaymentIntentId,
        )) as StripePaymentIntentMinimal;

        if (paymentIntent.status !== "requires_capture") {
          logger.warn("Payment intent not in capturable state", {
            component: "Cron /check-attendance",
            data: {
              bookingId,
              status: paymentIntent.status,
            },
          });
          results.skipped.push(bookingId);
          continue;
        }

        // Capture the payment (charge the customer)
        await stripe.paymentIntents.capture(booking.stripePaymentIntentId);

        // Update booking status (need to fetch document to use .save())
        const bookingDoc = await Booking.findById(booking._id);
        if (bookingDoc) {
          bookingDoc.attendanceStatus = "absent";
          bookingDoc.status = "completed";
          bookingDoc.completedAt = new Date();
          bookingDoc.paymentStatus = "paid";
          await bookingDoc.save();
        }

        results.captured.push(bookingId);

        logger.info("Payment captured for no-show", {
          component: "Cron /check-attendance",
          data: {
            bookingId,
            paymentIntentId: booking.stripePaymentIntentId,
            amount: paymentIntent.amount,
          },
        });

        // Send notification email to customer
        try {
          const userEmail = booking.contactEmail || booking.user?.email;
          const userName = booking.contactName || booking.user?.givenName;

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
              name: userName || "Client",
              spaceName: spaceConfig?.name || booking.spaceType,
              date: new Date(booking.date).toLocaleDateString("fr-FR"),
              startTime: booking.startTime || "",
              endTime: booking.endTime || "",
              numberOfPeople: booking.numberOfPeople,
              totalPrice: booking.totalPrice,
              contactEmail: process.env.CONTACT_EMAIL || "contact@coworkingcafe.fr",
              depositAmount: depositAmount / 100,
            });

            logger.info("No-show email sent", {
              component: "Cron /check-attendance",
              data: {
                bookingId,
                email: userEmail,
              },
            });
          }
        } catch (emailError) {
          logger.error("Failed to send no-show email", {
            component: "Cron /check-attendance",
            data: {
              bookingId,
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
          bookingId,
          error: errorMessage,
        });

        logger.error("Failed to process unvalidated booking", {
          component: "Cron /check-attendance",
          data: {
            bookingId,
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
