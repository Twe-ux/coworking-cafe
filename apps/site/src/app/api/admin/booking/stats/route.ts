import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { options } from "@/lib/auth-options";
import connectDB from "@/lib/db";
import { Reservation } from "@/models/reservation";
import { logger } from "@/lib/logger";

// Force dynamic rendering for this route (uses session/headers)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(options);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Check if user is admin or staff (level >= 60)
    if (session.user.role.level < 60) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Last 30 days for charts
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Today's reservations
    const todayReservations = await Reservation.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: { $in: ["confirmed", "pending"] },
    });

    // 2. Monthly revenue (confirmed and paid reservations)
    const monthlyRevenueResult = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
          status: "confirmed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const monthlyRevenue = monthlyRevenueResult.length > 0 ? monthlyRevenueResult[0].total : 0;

    // 3. Occupancy rate (simplified - based on confirmed reservations vs capacity)
    // Assuming average capacity per day is 100 slots (you can adjust this)
    const monthlyReservations = await Reservation.countDocuments({
      date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth },
      status: "confirmed",
    });

    const daysInMonth = lastDayOfMonth.getDate();
    const totalCapacity = daysInMonth * 100; // 100 slots per day
    const occupancyRate = totalCapacity > 0 ? Math.round((monthlyReservations / totalCapacity) * 100) : 0;

    // 4. Reservations per day (last 30 days)
    const reservationsPerDay = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo, $lte: today },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // 5. Revenue per day (last 30 days)
    const revenuePerDay = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: thirtyDaysAgo, $lte: today },
          status: "confirmed",
          paymentStatus: "paid",
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" },
          },
          revenue: { $sum: "$totalPrice" },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // 6. Recent reservations (last 10)
    const recentReservations = await Reservation.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email username")
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        todayReservations,
        monthlyRevenue,
        occupancyRate,
        reservationsPerDay: reservationsPerDay.map((item) => ({
          date: item._id,
          count: item.count,
        })),
        revenuePerDay: revenuePerDay.map((item) => ({
          date: item._id,
          revenue: item.revenue,
        })),
        recentReservations,
      },
    });
  } catch (error) {
    logger.error("Error fetching booking stats:", { data: error });
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
