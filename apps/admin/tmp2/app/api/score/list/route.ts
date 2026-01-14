import dbConnect from "@/lib/mongodb/dbConnect";
import Shift from "@/lib/mongodb/models/Shift";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    // Récupérer les données de Shift
    const shifts = await Shift.find({});

    // Formater les données pour inclure startTime et endTime
    const formattedData = shifts.map((shift) => ({
      id: shift._id,
      firstName: shift.firstName,
      lastName: shift.lastName,
      date: shift.date,
      startTime: shift.startTime || "",
      endTime: shift.endTime || "",
    }));

    return NextResponse.json(formattedData, { status: 200 });
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des données de Shift :",
      error,
    );
    return NextResponse.json(
      { success: false, error: "Erreur lors de la récupération des données" },
      { status: 500 },
    );
  }
}
