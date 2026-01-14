import dbConnect from "@/lib/mongodb/dbConnect";
import Shift from "@/lib/mongodb/models/Shift";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("🔍 Connexion DB...");
    await dbConnect();
    console.log("✅ DB connectée");

    console.log("🔍 Récupération shifts...");
    const shifts = await Shift.find({}).sort({
      date: -1,
      lastName: 1,
      firstName: 1,
    });
    console.log("✅ Shifts récupérés :", shifts.length);

    return NextResponse.json({ success: true, data: shifts }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Erreur route shift/list :", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
