import { NextRequest, NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongodb"
import CashEntry from "@/lib/models/CashEntry"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()

    const entry = await CashEntry.findById(params.id).lean()

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: "Cash entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entry,
    })
  } catch (error) {
    console.error("Error fetching cash entry:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cash entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()

    const body = await request.json()

    const updatedEntry = await CashEntry.findByIdAndUpdate(
      params.id,
      {
        prestaB2B: body.prestaB2B?.filter((item: any) => item.label && item.value),
        depenses: body.depenses?.filter((item: any) => item.label && item.value),
        virement: body.virement || 0,
        especes: body.especes || 0,
        cbClassique: body.cbClassique || 0,
        cbSansContact: body.cbSansContact || 0,
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Cash entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry,
    })
  } catch (error) {
    console.error("Error updating cash entry:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update cash entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectMongoose()

    const deletedEntry = await CashEntry.findByIdAndDelete(params.id).lean()

    if (!deletedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Cash entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Cash entry deleted successfully",
      data: deletedEntry,
    })
  } catch (error) {
    console.error("Error deleting cash entry:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete cash entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
