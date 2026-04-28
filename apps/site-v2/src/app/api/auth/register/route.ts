import { NextResponse } from "next/server"
import { z } from "zod"
import {
  connectToDatabase,
  User as UserModel,
  Role as RoleModel,
} from "@coworking-cafe/database"

const registerSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court (8 caractères min.)"),
  firstName: z.string().min(2, "Prénom trop court (2 caractères min.)"),
  lastName: z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 })
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? "Données invalides" },
      { status: 400 }
    )
  }

  const { email, password, firstName, lastName } = parsed.data

  try {
    await connectToDatabase()

    const role = await RoleModel.findOne({ slug: "client" })
    if (!role) {
      return NextResponse.json(
        { error: "Configuration serveur incorrecte" },
        { status: 500 }
      )
    }

    await new UserModel({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: role._id,
    }).save()

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    // Mongoose duplicate key error
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code: number }).code === 11000
    ) {
      return NextResponse.json({ error: "Email déjà utilisé" }, { status: 409 })
    }
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
