import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Booking } from '@coworking-cafe/database';
import { logger } from "../../../../lib/logger";
import { sendBookingReminder } from "../../../../lib/email/emailService";

/**
 * GET /api/cron/send-reminders
 *
 * Cron job that runs daily to send reminder emails 24h before reservations
 * Sends reminders to customers with upcoming confirmed reservations
 *
 * Configure in Northflank:
 * - Create a Cron Job (HTTP Request type)
 * - URL: https://your-domain.com/api/cron/send-reminders
 * - Schedule: 0 10 * * * (daily at 10:00 AM)
 * - Method: GET
 * - Header: Authorization: Bearer ${CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn("Unauthorized cron attempt", {
        component: "Cron /send-reminders",
        data: {
          ip: request.headers.get("x-forwarded-for"),
        },
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Calculate tomorrow's date range (reservations in 24h)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    logger.info("Starting send-reminders cron", {
      component: "Cron /send-reminders",
      data: {
        targetDate: tomorrow.toISOString(),
      },
    });

    // Find confirmed reservations for tomorrow
    const upcomingBookings = await Booking.find({
      date: {
        $gte: tomorrow,
        $lte: tomorrowEnd,
      },
      status: "confirmed",
    })
      .populate("user", "email givenName")
      .populate("space", "name");

    logger.info(`Found ${upcomingBookings.length} reservations for tomorrow`, {
      component: "Cron /send-reminders",
      data: {
        count: upcomingBookings.length,
      },
    });

    const results = {
      sent: [] as string[],
      failed: [] as { bookingId: string; error: string }[],
      skipped: [] as string[],
    };

    for (const booking of upcomingBookings) {
      try {
        const userEmail = booking.contactEmail || (booking.user as any)?.email;
        const userName =
          booking.contactName || (booking.user as any)?.givenName;

        if (!userEmail) {
          logger.warn("No email found for booking", {
            component: "Cron /send-reminders",
            data: {
              bookingId: (booking._id as any).toString(),
            },
          });
          results.skipped.push((booking._id as any).toString());
          continue;
        }

        // Format time range
        const startTime = booking.startTime || "09:00";
        const endTime = booking.endTime || "18:00";
        const timeRange = `${startTime} - ${endTime}`;

        // Send reminder email
        await sendBookingReminder(userEmail, {
          name: userName,
          spaceName: (booking.space as any)?.name || booking.spaceType,
          date: new Date(booking.date).toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          time: timeRange,
        });

        results.sent.push((booking._id as any).toString());

        logger.info("Reminder email sent", {
          component: "Cron /send-reminders",
          data: {
            bookingId: (booking._id as any).toString(),
            email: userEmail,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        results.failed.push({
          bookingId: (booking._id as any).toString(),
          error: errorMessage,
        });

        logger.error("Failed to send reminder email", {
          component: "Cron /send-reminders",
          data: {
            bookingId: (booking._id as any).toString(),
            error: errorMessage,
          },
        });
      }
    }

    logger.info("Send-reminders cron completed", {
      component: "Cron /send-reminders",
      data: {
        total: upcomingBookings.length,
        sent: results.sent.length,
        failed: results.failed.length,
        skipped: results.skipped.length,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Reminder emails processed",
      data: {
        totalProcessed: upcomingBookings.length,
        sentCount: results.sent.length,
        failedCount: results.failed.length,
        skippedCount: results.skipped.length,
        sentIds: results.sent,
        failures: results.failed,
        skippedIds: results.skipped,
      },
    });
  } catch (error) {
    logger.error("Send-reminders cron failed", {
      component: "Cron /send-reminders",
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
export const maxDuration = 300; // 5 minutes
