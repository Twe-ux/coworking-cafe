import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import connectDB from "@/lib/db";
import BookingSettings from "@/models/bookingSettings";
import { options } from "@/lib/auth-options";
import { logger } from "@/lib/logger";

/**
 * GET /api/admin/booking-settings
 * Get booking settings (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Get or create settings (singleton pattern)
    let settings = await BookingSettings.findOne();

    // Migration: Handle old format with single cancellationPolicy
    if (settings && (settings as any).cancellationPolicy && !settings.cancellationPolicyOpenSpace) {
      logger.info("Migrating old cancellation policy format to new format");
      const oldPolicy = (settings as any).cancellationPolicy;

      // Use updateOne to properly set new fields and remove old one
      await BookingSettings.updateOne(
        { _id: settings._id },
        {
          $set: {
            cancellationPolicyOpenSpace: oldPolicy,
            cancellationPolicyMeetingRooms: oldPolicy,
          },
          $unset: {
            cancellationPolicy: "",
          },
        }
      );

      // Re-fetch the updated settings
      settings = await BookingSettings.findOne();
    }

    if (!settings) {
      // Create default settings if none exist
      settings = await BookingSettings.create({
        cancellationPolicyOpenSpace: [
          { daysBeforeBooking: 7, chargePercentage: 0 },
          { daysBeforeBooking: 3, chargePercentage: 50 },
          { daysBeforeBooking: 0, chargePercentage: 100 },
        ],
        cancellationPolicyMeetingRooms: [
          { daysBeforeBooking: 7, chargePercentage: 0 },
          { daysBeforeBooking: 3, chargePercentage: 50 },
          { daysBeforeBooking: 0, chargePercentage: 100 },
        ],
        cronSchedules: {
          attendanceCheckTime: "10:00",
          dailyReportTime: "19:00",
        },
        depositPolicy: {
          minAmountRequired: 200,
          defaultPercent: 50,
          applyToSpaces: ["salle-etage"],
        },
        notificationEmail: "strasbourg@coworkingcafe.fr",
      });
    }

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error) {
    logger.error("Error fetching booking settings", {
      component: "API /admin/booking-settings GET",
      data: error,
    });
    return NextResponse.json(
      { error: "Failed to fetch booking settings" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/booking-settings
 * Update booking settings (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Check if user is admin or higher (level >= 80)
    if (session.user.role.level < 80) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const body = await request.json();

    // Find existing settings or create new
    let settings = await BookingSettings.findOne();

    if (settings) {
      // Ensure we have the new fields in the body
      const updateData: any = { ...body };

      // If body still has old cancellationPolicy, migrate it
      if (updateData.cancellationPolicy && !updateData.cancellationPolicyOpenSpace) {
        updateData.cancellationPolicyOpenSpace = updateData.cancellationPolicy;
        updateData.cancellationPolicyMeetingRooms = updateData.cancellationPolicy;
      }

      // Remove cancellationPolicy from updateData
      delete updateData.cancellationPolicy;

      // First unset the old field if it exists
      if ((settings as any).cancellationPolicy) {
        await BookingSettings.updateOne(
          { _id: settings._id },
          { $unset: { cancellationPolicy: "" } }
        );
      }

      // Then set the new data
      await BookingSettings.updateOne(
        { _id: settings._id },
        { $set: updateData }
      );

      // Re-fetch updated settings
      settings = await BookingSettings.findOne();
    } else {
      // Create new settings
      const createData: any = { ...body };

      // Ensure new format
      if (createData.cancellationPolicy && !createData.cancellationPolicyOpenSpace) {
        createData.cancellationPolicyOpenSpace = createData.cancellationPolicy;
        createData.cancellationPolicyMeetingRooms = createData.cancellationPolicy;
        delete createData.cancellationPolicy;
      }

      settings = await BookingSettings.create(createData);
    }

    logger.info("Booking settings updated", {
      component: "API /admin/booking-settings POST",
      data: {
        updatedBy: session.user.email,
      },
    });

    return NextResponse.json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    logger.error("Error updating booking settings", {
      component: "API /admin/booking-settings POST",
      data: error,
    });

    const errorMessage = error.message || "Failed to update booking settings";
    const validationErrors = error.errors
      ? Object.keys(error.errors).map((key) => ({
          field: key,
          message: error.errors[key].message,
        }))
      : null;

    return NextResponse.json(
      {
        error: errorMessage,
        validationErrors,
        details:
          process.env.NODE_ENV === "development" ? error.toString() : undefined,
      },
      { status: 500 }
    );
  }
}
