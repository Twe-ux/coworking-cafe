import { logger } from "@/lib/logger";
import { connectDB } from "@/lib/mongodb";
import BookingSettings from "@/models/bookingSettings";
import { Reservation } from "@/models/reservation";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * GET /api/cron/daily-report
 *
 * Cron job that runs daily at 19:00 (configured in BookingSettings)
 * Sends an email report to admin with all unvalidated reservations
 * Includes:
 * - Reservations from yesterday (J-1) not yet validated (attendance)
 * - Pending reservations waiting for confirmation
 * - Upcoming reservations for next 7 days
 *
 * This should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
 * Add to vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/daily-report",
 *     "schedule": "0 19 * * *"
 *   }]
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      logger.warn("Unauthorized cron attempt", {
        component: "Cron /daily-report",
        data: {
          ip: request.headers.get("x-forwarded-for"),
        },
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get booking settings for notification email
    const settings = await BookingSettings.findOne();
    const notificationEmail =
      settings?.notificationEmail || "strasbourg@coworkingcafe.fr";

    logger.info("Starting daily-report cron", {
      component: "Cron /daily-report",
      data: {
        recipient: notificationEmail,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Unvalidated bookings from yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setHours(23, 59, 59, 999);

    const unvalidatedYesterday = await Reservation.find({
      date: { $gte: yesterday, $lte: yesterdayEnd },
      status: "confirmed",
      attendanceStatus: { $exists: false },
    })
      .populate("user", "email givenName")
      .populate("space", "name type")
      .sort({ startTime: 1 });

    // 2. Pending reservations (waiting for admin confirmation)
    const pendingReservations = await Reservation.find({
      status: "pending",
      date: { $gte: today },
    })
      .populate("user", "email givenName")
      .populate("space", "name type")
      .sort({ date: 1, startTime: 1 })
      .limit(20);

    // 3. Upcoming confirmed reservations (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingReservations = await Reservation.find({
      date: { $gte: today, $lte: nextWeek },
      status: "confirmed",
    })
      .populate("user", "email givenName")
      .populate("space", "name type")
      .sort({ date: 1, startTime: 1 })
      .limit(50);

    // 4. Reservations requiring deposit payment setup (J-6 upcoming)
    const sixDaysFromNow = new Date(today);
    sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);
    const sixDaysEnd = new Date(sixDaysFromNow);
    sixDaysEnd.setHours(23, 59, 59, 999);

    const depositPendingReservations = await Reservation.find({
      date: { $gte: sixDaysFromNow, $lte: sixDaysEnd },
      status: "confirmed",
      captureMethod: "deferred",
      stripePaymentIntentId: { $exists: false },
    })
      .populate("user", "email givenName")
      .populate("space", "name type")
      .sort({ startTime: 1 });

    logger.info("Daily report data collected", {
      component: "Cron /daily-report",
      data: {
        unvalidatedYesterday: unvalidatedYesterday.length,
        pending: pendingReservations.length,
        upcoming: upcomingReservations.length,
        depositPending: depositPendingReservations.length,
      },
    });

    // Generate HTML email
    const emailHtml = generateReportEmail({
      unvalidatedYesterday,
      pendingReservations,
      upcomingReservations,
      depositPendingReservations,
      reportDate: new Date(),
    });

    // Send email using Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "CoworKing Café by Anticafé <noreply@coworkingcafe.fr>",
      to: notificationEmail,
      subject: `📊 Rapport quotidien - ${new Date().toLocaleDateString(
        "fr-FR"
      )}`,
      html: emailHtml,
    });

    logger.info("Daily report email sent", {
      component: "Cron /daily-report",
      data: {
        recipient: notificationEmail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Daily report sent successfully",
      data: {
        recipient: notificationEmail,
        stats: {
          unvalidatedYesterday: unvalidatedYesterday.length,
          pending: pendingReservations.length,
          upcoming: upcomingReservations.length,
          depositPending: depositPendingReservations.length,
        },
      },
    });
  } catch (error) {
    logger.error("Daily-report cron failed", {
      component: "Cron /daily-report",
      data: {
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

function generateReportEmail(data: {
  unvalidatedYesterday: any[];
  pendingReservations: any[];
  upcomingReservations: any[];
  depositPendingReservations: any[];
  reportDate: Date;
}): string {
  const {
    unvalidatedYesterday,
    pendingReservations,
    upcomingReservations,
    depositPendingReservations,
    reportDate,
  } = data;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    });

  const formatTime = (time?: string) => time || "N/A";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { background: #417972; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .section { margin: 20px 0; padding: 20px; background: #f9f9f9; border-radius: 8px; }
    .urgent { background: #fff3cd; border-left: 4px solid #ff9800; }
    .warning { background: #ffe6e6; border-left: 4px solid #f44336; }
    .info { background: #e3f2fd; border-left: 4px solid #2196f3; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; background: white; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #417972; color: white; font-weight: 600; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
    .badge-danger { background: #f44336; color: white; }
    .badge-warning { background: #ff9800; color: white; }
    .badge-info { background: #2196f3; color: white; }
    .badge-success { background: #4caf50; color: white; }
    h2 { color: #417972; margin-top: 0; }
    .count { font-size: 24px; font-weight: bold; color: #417972; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">📊 Rapport Quotidien des Réservations</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">${reportDate.toLocaleDateString(
        "fr-FR",
        { weekday: "long", year: "numeric", month: "long", day: "numeric" }
      )}</p>
    </div>

    ${
      unvalidatedYesterday.length > 0
        ? `
    <div class="section warning">
      <h2>⚠️ Réservations J-1 Non Validées</h2>
      <p><span class="count">${
        unvalidatedYesterday.length
      }</span> réservation(s) d'hier n'ont pas encore été validées (présence/absence).</p>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Espace</th>
            <th>Horaire</th>
            <th>Montant</th>
            <th>Confirmation</th>
          </tr>
        </thead>
        <tbody>
          ${unvalidatedYesterday
            .map(
              (booking) => `
            <tr>
              <td>${
                booking.contactName || (booking.user as any)?.givenName || "N/A"
              }<br><small>${
                booking.contactEmail || (booking.user as any)?.email || ""
              }</small></td>
              <td>${(booking.space as any)?.name || booking.spaceType}</td>
              <td>${formatTime(booking.startTime)} - ${formatTime(
                booking.endTime
              )}</td>
              <td>${booking.totalPrice.toFixed(2)}€</td>
              <td>${booking.confirmationNumber || "N/A"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <p style="margin-top: 15px;"><strong>Action requise :</strong> Ces réservations seront automatiquement marquées comme "absent" demain matin à 10h si non validées.</p>
    </div>
    `
        : ""
    }

    ${
      pendingReservations.length > 0
        ? `
    <div class="section urgent">
      <h2>🕐 Réservations en Attente de Confirmation</h2>
      <p><span class="count">${
        pendingReservations.length
      }</span> réservation(s) en attente de votre confirmation.</p>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Espace</th>
            <th>Date</th>
            <th>Horaire</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          ${pendingReservations
            .map(
              (booking) => `
            <tr>
              <td>${
                booking.contactName || (booking.user as any)?.givenName || "N/A"
              }<br><small>${
                booking.contactEmail || (booking.user as any)?.email || ""
              }</small></td>
              <td>${(booking.space as any)?.name || booking.spaceType}</td>
              <td>${formatDate(booking.date)}</td>
              <td>${formatTime(booking.startTime)} - ${formatTime(
                booking.endTime
              )}</td>
              <td>${booking.totalPrice.toFixed(2)}€</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    ${
      depositPendingReservations.length > 0
        ? `
    <div class="section info">
      <h2>💳 Empreintes Bancaires à Créer Demain (J-6)</h2>
      <p><span class="count">${
        depositPendingReservations.length
      }</span> réservation(s) nécessitent la création d'une empreinte bancaire demain.</p>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Espace</th>
            <th>Date réservation</th>
            <th>Horaire</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          ${depositPendingReservations
            .map(
              (booking) => `
            <tr>
              <td>${
                booking.contactName || (booking.user as any)?.givenName || "N/A"
              }<br><small>${
                booking.contactEmail || (booking.user as any)?.email || ""
              }</small></td>
              <td>${(booking.space as any)?.name || booking.spaceType}</td>
              <td>${formatDate(booking.date)}</td>
              <td>${formatTime(booking.startTime)} - ${formatTime(
                booking.endTime
              )}</td>
              <td>${booking.totalPrice.toFixed(2)}€</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      <p style="margin-top: 15px;"><em>Ces empreintes seront créées automatiquement demain à 2h du matin.</em></p>
    </div>
    `
        : ""
    }

    <div class="section">
      <h2>📅 Réservations Confirmées (7 prochains jours)</h2>
      <p><span class="count">${
        upcomingReservations.length
      }</span> réservation(s) confirmée(s).</p>
      ${
        upcomingReservations.length > 0
          ? `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Client</th>
            <th>Espace</th>
            <th>Horaire</th>
            <th>Personnes</th>
            <th>Montant</th>
          </tr>
        </thead>
        <tbody>
          ${upcomingReservations
            .map(
              (booking) => `
            <tr>
              <td>${formatDate(booking.date)}</td>
              <td>${
                booking.contactName || (booking.user as any)?.givenName || "N/A"
              }</td>
              <td>${(booking.space as any)?.name || booking.spaceType}</td>
              <td>${formatTime(booking.startTime)} - ${formatTime(
                booking.endTime
              )}</td>
              <td>${booking.numberOfPeople}</td>
              <td>${booking.totalPrice.toFixed(2)}€</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
      `
          : '<p style="color: #999;">Aucune réservation confirmée pour les 7 prochains jours.</p>'
      }
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #666;">
      <p>Ce rapport est généré automatiquement tous les jours à 19h.</p>
      <p><a href="${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/dashboard/booking/reservations" style="color: #417972;">Voir toutes les réservations dans le dashboard →</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes for Vercel Pro
