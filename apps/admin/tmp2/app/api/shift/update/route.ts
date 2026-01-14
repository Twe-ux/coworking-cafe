import dbConnect from "@/lib/mongodb/dbConnect";
import Shift from "@/lib/mongodb/models/Shift";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();

    const { shiftId, field, value } = await request.json();

    if (!shiftId || !field || value === undefined) {
      return NextResponse.json(
        { message: "Missing required fields: shiftId, field, value" },
        { status: 400 },
      );
    }

    // Construire l'objet de mise à jour
    const updateObj: any = {};
    updateObj[field] = value;

    // Mettre à jour le shift
    const updatedShift = await Shift.findByIdAndUpdate(
      shiftId,
      { $set: updateObj },
      { new: true, runValidators: true },
    );

    if (!updatedShift) {
      return NextResponse.json({ message: "Shift not found" }, { status: 404 });
    }

    console.log(`Shift ${shiftId} updated: ${field} = ${value}`);

    return NextResponse.json(
      {
        message: "Shift updated successfully",
        shift: updatedShift,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating shift:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
