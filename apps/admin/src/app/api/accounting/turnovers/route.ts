import { NextRequest, NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongodb"
import { requireAuth } from "@/lib/api/auth"
import Turnover from "@/models/turnover"

// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    let query = {}
    if (startDate && endDate) {
      query = {
        _id: {
          $gte: startDate,
          $lte: endDate,
        },
      }
    }

    const entries = await Turnover.find(query).sort({ _id: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: entries,
      count: entries.length,
    })
  } catch (error) {
    console.error("Error fetching turnovers:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch turnovers",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["dev", "admin"])
    if (!authResult.authorized) {
      return authResult.response
    }

    await connectMongoose()

    const body = await request.json()

    // Validate required fields
    if (!body.date) {
      return NextResponse.json(
        {
          success: false,
          error: "Date is required",
        },
        { status: 400 }
      )
    }

    // Format date as YYYY/MM/DD for _id
    const dateObj = new Date(body.date)
    const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`

    // Check if entry already exists
    const existing = await Turnover.findById(formattedDate)
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Turnover entry for this date already exists",
        },
        { status: 409 }
      )
    }

    const turnover = new Turnover({
      _id: formattedDate,
      "vat-20": body["vat-20"] || { "total-ht": 0, "total-ttc": 0, "total-taxes": 0 },
      "vat-10": body["vat-10"] || { "total-ht": 0, "total-ttc": 0, "total-taxes": 0 },
      "vat-55": body["vat-55"] || { "total-ht": 0, "total-ttc": 0, "total-taxes": 0 },
      "vat-0": body["vat-0"] || { "total-ht": 0, "total-ttc": 0, "total-taxes": 0 },
    })

    await turnover.save()

    return NextResponse.json(
      {
        success: true,
        data: turnover,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating turnover:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create turnover",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
