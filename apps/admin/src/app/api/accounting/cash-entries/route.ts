import { NextRequest, NextResponse } from "next/server"
import { connectMongoose } from "@/lib/mongodb"
import { requireAuth } from "@/lib/api/auth"
import CashEntry from "@/models/cashEntry"
import type { PrestaB2BItem, DepenseItem } from "@/types/accounting"
import { parseAndValidate } from "@/lib/api/validation"
import { createCashEntrySchema } from "@/lib/validations/cashEntry"

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

    const entries = await CashEntry.find(query).sort({ _id: -1 }).lean()

    // Ajouter le champ date pour chaque entrée (copie de _id)
    const entriesWithDate = entries.map(entry => ({
      ...entry,
      date: entry._id
    }))

    return NextResponse.json({
      success: true,
      data: entriesWithDate,
      count: entriesWithDate.length,
    })
  } catch (error) {
    console.error("Error fetching cash entries:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch cash entries",
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

    // Validate request body with Zod
    const validation = await parseAndValidate(request, createCashEntrySchema)
    if (!validation.success) {
      return validation.response
    }

    const body = validation.data

    // Format date as YYYY/MM/DD for _id
    const dateObj = new Date(body.date)
    const formattedDate = `${dateObj.getFullYear()}/${String(dateObj.getMonth() + 1).padStart(2, "0")}/${String(dateObj.getDate()).padStart(2, "0")}`

    // Check if entry already exists
    const existing = await CashEntry.findById(formattedDate)
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
      _id: formattedDate,
      prestaB2B: body.prestaB2B?.filter((item: PrestaB2BItem) => item.label && item.value),
      depenses: body.depenses?.filter((item: DepenseItem) => item.label && item.value),
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
