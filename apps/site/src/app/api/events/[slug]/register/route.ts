import { NextRequest, NextResponse } from "next/server";
import { Event, EventRegistration } from "@coworking-cafe/database";
import { connectDB } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

interface RegisterBody {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
}

/**
 * POST /api/events/[slug]/register
 * Register for an internal event
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const body = (await request.json()) as RegisterBody;

    // Validate required fields
    if (!body.firstName?.trim() || !body.lastName?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { success: false, error: "Nom, prénom et email sont requis." },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // Find the event
    const event = await Event.findOne({
      slug: params.slug,
      status: "published",
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Événement introuvable." },
        { status: 404 }
      );
    }

    // Check the event accepts internal registration
    if (event.registrationType !== "internal") {
      return NextResponse.json(
        { success: false, error: "Cet événement n'accepte pas les inscriptions en ligne." },
        { status: 400 }
      );
    }

    // Check event is not past
    const today = new Date().toISOString().split("T")[0];
    if (event.date < today) {
      return NextResponse.json(
        { success: false, error: "Cet événement est déjà passé." },
        { status: 400 }
      );
    }

    // Check capacity
    if (
      event.maxParticipants &&
      (event.currentParticipants || 0) >= event.maxParticipants
    ) {
      return NextResponse.json(
        { success: false, error: "Cet événement est complet." },
        { status: 400 }
      );
    }

    // Check duplicate registration
    const existing = await EventRegistration.findOne({
      eventId: event._id,
      email: body.email.toLowerCase().trim(),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "Vous êtes déjà inscrit(e) à cet événement." },
        { status: 409 }
      );
    }

    // Create registration
    const registration = await EventRegistration.create({
      eventId: event._id,
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: body.email.toLowerCase().trim(),
      phone: body.phone?.trim() || undefined,
      message: body.message?.trim() || undefined,
      status: "confirmed",
      registeredAt: today,
    });

    // Increment participant count
    await Event.findByIdAndUpdate(event._id, {
      $inc: { currentParticipants: 1 },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: registration._id.toString(),
          firstName: registration.firstName,
          lastName: registration.lastName,
          email: registration.email,
          status: registration.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/events/[slug]/register error:", error);

    // Handle duplicate key error (unique index on eventId + email)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: number }).code === 11000
    ) {
      return NextResponse.json(
        { success: false, error: "Vous êtes déjà inscrit(e) à cet événement." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Une erreur est survenue. Veuillez réessayer." },
      { status: 500 }
    );
  }
}
