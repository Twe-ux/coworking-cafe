import dbConnect from "@/lib/mongodb";
import ShiftTypeModel from "@/models/shiftType/model";
import { NextRequest, NextResponse } from "next/server";

// PUT - Mettre à jour un shift type
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const body = await req.json();
    const { name, startTime, endTime } = body;

    const shiftType = await ShiftTypeModel.findByIdAndUpdate(
      params.id,
      { name, startTime, endTime },
      { new: true, runValidators: true }
    );

    if (!shiftType) {
      return NextResponse.json(
        { error: "Shift type non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ shiftType }, { status: 200 });
  } catch (error: any) {    return NextResponse.json(
      { error: error.message || "Erreur lors de la mise à jour du shift type" },
      { status: 400 }
    );
  }
}

// DELETE - Supprimer un shift type (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const shiftType = await ShiftTypeModel.findByIdAndUpdate(
      params.id,
      { isActive: false },
      { new: true }
    );

    if (!shiftType) {
      return NextResponse.json(
        { error: "Shift type non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Shift type supprimé" }, { status: 200 });
  } catch (error: any) {    return NextResponse.json(
      { error: error.message || "Erreur lors de la suppression du shift type" },
      { status: 500 }
    );
  }
}
