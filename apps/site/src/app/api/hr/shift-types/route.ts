import dbConnect from "@/lib/mongodb";
import ShiftTypeModel from "@/models/shiftType/model";
import { NextRequest, NextResponse } from "next/server";

// GET - Récupérer tous les shift types
export async function GET() {
  try {
    await dbConnect();

    const shiftTypes = await ShiftTypeModel.find({ isActive: true }).sort({ order: 1 });

    // Si aucun shift type n'existe, créer les types par défaut
    if (shiftTypes.length === 0) {
      const defaultShiftTypes = [
        { name: "Morning", startTime: "09:30", endTime: "14:30", order: 0 },
        { name: "Afternoon", startTime: "12:00", endTime: "18:00", order: 1 },
        { name: "Evening", startTime: "18:00", endTime: "22:00", order: 2 },
        { name: "Night", startTime: "22:00", endTime: "06:00", order: 3 },
      ];

      const created = await ShiftTypeModel.insertMany(defaultShiftTypes);
      return NextResponse.json({ shiftTypes: created }, { status: 200 });
    }

    return NextResponse.json({ shiftTypes }, { status: 200 });
  } catch (error: any) {    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération des shift types" },
      { status: 500 }
    );
  }
}

// POST - Créer un nouveau shift type
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, startTime, endTime } = body;

    // Get the highest order value and add 1
    const maxOrderShiftType = await ShiftTypeModel.findOne().sort({ order: -1 });
    const order = maxOrderShiftType ? maxOrderShiftType.order + 1 : 0;

    const shiftType = await ShiftTypeModel.create({
      name,
      startTime,
      endTime,
      order,
    });

    return NextResponse.json({ shiftType }, { status: 201 });
  } catch (error: any) {    return NextResponse.json(
      { error: error.message || "Erreur lors de la création du shift type" },
      { status: 400 }
    );
  }
}
