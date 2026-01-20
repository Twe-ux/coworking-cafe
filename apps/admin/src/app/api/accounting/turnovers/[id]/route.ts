import { NextRequest, NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongodb"
import { requireAuth } from "@/lib/api/auth"
import Turnover from "@/models/turnover"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const entry = await Turnover.findById(params.id).lean()

    if (!entry) {
      return NextResponse.json(
        {
          success: false,
          error: "Turnover entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entry,
    })
  } catch (error) {
    console.error("Error fetching turnover:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch turnover",
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
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const body = await request.json()

    const updatedEntry = await Turnover.findByIdAndUpdate(
      params.id,
      {
        "vat-20": body["vat-20"],
        "vat-10": body["vat-10"],
        "vat-55": body["vat-55"],
        "vat-0": body["vat-0"],
      },
      { new: true, runValidators: true }
    ).lean()

    if (!updatedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Turnover entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updatedEntry,
    })
  } catch (error) {
    console.error("Error updating turnover:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update turnover",
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
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const deletedEntry = await Turnover.findByIdAndDelete(params.id).lean()

    if (!deletedEntry) {
      return NextResponse.json(
        {
          success: false,
          error: "Turnover entry not found",
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Turnover entry deleted successfully",
      data: deletedEntry,
    })
  } catch (error) {
    console.error("Error deleting turnover:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete turnover",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
