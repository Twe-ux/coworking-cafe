import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { devisFormSchema } from '@/components/site/privatization/DevisFormSchema'
import { sendPrivatizationRequestEmail } from '@/lib/email/templates/privatizationRequest'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Server-side validation with Zod
    const validatedData = devisFormSchema.parse(body)

    const adminEmail = process.env.ADMIN_EMAIL || 'contact@coworkingcafe.fr'

    // Send admin notification email
    await sendPrivatizationRequestEmail({
      to: adminEmail,
      data: validatedData,
      type: 'admin',
    })

    // Send client confirmation email
    await sendPrivatizationRequestEmail({
      to: validatedData.email,
      data: validatedData,
      type: 'client',
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/privatization/devis error:', error)

    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
