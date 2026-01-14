import { NextRequest, NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongodb"
import CashEntry from "@/models/cashEntry"
import type { PrestaB2BItem, DepenseItem } from "@/types/accounting"

export async function POST(request: NextRequest) {
  try {
    await connectMongoose()

    const body = await request.json()

    // Validate required fields
    if (!body._id && !body.date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 }
      )
    }

    // Use provided _id or format date as YYYY/MM/DD
    const entryId = body._id || body.date

    // Check if entry already exists
    const existing = await CashEntry.findById(entryId)
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Cash entry for this date already exists",
        },
        { status: 409 }
      )
    }

    const cashEntry = new CashEntry({
      _id: entryId,
      prestaB2B: body.prestaB2B?.filter((item: PrestaB2BItem) => item.label && item.value !== undefined),
      depenses: body.depenses?.filter((item: DepenseItem) => item.label && item.value !== undefined),
      virement: body.virement || 0,
      especes: body.especes || 0,
      cbClassique: body.cbClassique || 0,
      cbSansContact: body.cbSansContact || 0,
    })

    await cashEntry.save()

    return NextResponse.json(
      {
        success: true,
        data: cashEntry,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating cash entry:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create cash entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectMongoose()

    const body = await request.json()

    // Validate required fields
    if (!body._id && !body.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Entry ID is required",
        },
        { status: 400 }
      )
    }

    const entryId = body._id || body.id

    // Find existing entry
    const existing = await CashEntry.findById(entryId)
    if (!existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Cash entry not found",
        },
        { status: 404 }
      )
    }

    // Update the entry
    const updateData = {
      prestaB2B: body.prestaB2B?.filter((item: PrestaB2BItem) => item.label && item.value !== undefined) || [],
      depenses: body.depenses?.filter((item: DepenseItem) => item.label && item.value !== undefined) || [],
      virement: body.virement || 0,
      especes: body.especes || 0,
      cbClassique: body.cbClassique || 0,
      cbSansContact: body.cbSansContact || 0,
    }

    const updated = await CashEntry.findByIdAndUpdate(
      entryId,
      updateData,
      { new: true, runValidators: true }
    )

    return NextResponse.json({
      success: true,
      data: updated,
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
