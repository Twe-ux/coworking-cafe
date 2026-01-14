import dbConnect from "@/lib/mongodb/dbConnect";
import Shift from "@/lib/mongodb/models/Shift";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    // Récupérer les utilisateurs uniques à partir des champs firstName et lastName
    const shifts = await Shift.aggregate([
      {
        $group: {
          _id: "$staffId",
          firstName: { $first: "$firstName" },
          lastName: { $first: "$lastName" },
          dates: { $addToSet: "$date" }, // Ajout des dates uniques
        },
      },
      {
        $project: {
          _id: 0,
          staffId: "$_id",
          firstName: 1,
          lastName: 1,
          fullName: { $concat: ["$firstName", " ", "$lastName"] },
          dates: 1,
        },
      },
      {
        $sort: {
          firstName: 1,
          lastName: 1,
        },
      },
    ]);

    console.log(`Utilisateurs récupérés : ${shifts.length}`);

    return NextResponse.json({ success: true, data: shifts }, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erreur lors de la récupération des utilisateurs",
      },
      { status: 500 },
    );
  }
}
