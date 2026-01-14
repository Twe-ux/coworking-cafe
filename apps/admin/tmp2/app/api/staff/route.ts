import dbConnect from "@/lib/mongodb/dbConnect";
import Staff from "@/lib/mongodb/models/Staff";
import { NextResponse } from "next/server";

export async function GET() {
  await dbConnect();

  try {
    const newStaff = await Staff.find({});
    return NextResponse.json(
      { success: true, data: newStaff },
      { status: 200 },
    );
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 },
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();

    // Validation des champs requis
    const requiredFields = ["firstName", "lastName", "email", "phone", "mdp"];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Le champ ${field} est requis` },
          { status: 400 },
        );
      }
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide" },
        { status: 400 },
      );
    }

    // Vérifier si l'email existe déjà
    const existingStaff = await Staff.findOne({ email: body.email });
    if (existingStaff) {
      return NextResponse.json(
        { success: false, error: "Un employé avec cet email existe déjà" },
        { status: 400 },
      );
    }

    // Créer le nouveau staff avec les données reçues
    const newStaff = new Staff({
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      numberSecu: body.numberSecu || "",
      adresse: body.adresse || "",
      zipcode: body.zipcode || "",
      city: body.city || "",
      framework: body.framework || "",
      times: body.times || "",
      hourlyRate: Number(body.hourlyRate) || 0,
      startDate: body.startDate ? new Date(body.startDate) : new Date(),
      endDate: body.endDate ? new Date(body.endDate) : null,
      contract: body.contract || "",
      mdp: Number(body.mdp) || Math.floor(Math.random() * 9999), // Générer un mdp si pas fourni
      isActive: body.isActive !== undefined ? body.isActive : true,
    });

    const savedStaff = await newStaff.save();

    return NextResponse.json(
      {
        success: true,
        data: savedStaff,
        message: `${body.firstName} ${body.lastName} a été créé avec succès !`,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Erreur lors de la création du staff:", error);

    // Gestion des erreurs spécifiques MongoDB
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: "Un employé avec cet email existe déjà" },
        { status: 400 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
