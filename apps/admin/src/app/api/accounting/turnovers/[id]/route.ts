import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { connectMongoose } from "@/lib/mongodb"
import Turnover from "@/models/turnover"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérification d'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérification des permissions (dev ou admin uniquement)
    const userRole = (session?.user as any)?.role
    if (!["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      )
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
    // Vérification d'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérification des permissions (dev ou admin uniquement)
    const userRole = (session?.user as any)?.role
    if (!["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      )
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
    // Vérification d'authentification
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      )
    }

    // Vérification des permissions (dev ou admin uniquement)
    const userRole = (session?.user as any)?.role
    if (!["dev", "admin"].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: "Permissions insuffisantes" },
        { status: 403 }
      )
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
