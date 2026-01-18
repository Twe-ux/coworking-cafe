import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse body
    const body: ContactFormData = await request.json()

    // Validation
    if (!body.name || !body.email || !body.subject || !body.message) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      )
    }

    // Validation email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Email invalide' },
        { status: 400 }
      )
    }

    // Envoyer l'email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: 'strasbourg@coworkingcafe.fr', // Email du café
      replyTo: body.email,
      subject: `[Contact Web] ${body.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
              <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <h2 style="color: #2c3e50; margin-bottom: 20px;">Nouveau message depuis le formulaire de contact</h2>

                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                  <p style="margin: 5px 0;"><strong>Nom :</strong> ${body.name}</p>
                  <p style="margin: 5px 0;"><strong>Email :</strong> <a href="mailto:${body.email}">${body.email}</a></p>
                  <p style="margin: 5px 0;"><strong>Téléphone :</strong> ${body.phone || 'Non renseigné'}</p>
                  <p style="margin: 5px 0;"><strong>Sujet :</strong> ${body.subject}</p>
                </div>

                <div style="background-color: #fff; padding: 20px; border-left: 4px solid #3498db; margin-bottom: 20px;">
                  <h3 style="color: #2c3e50; margin-top: 0;">Message :</h3>
                  <p style="white-space: pre-wrap;">${body.message}</p>
                </div>

                <p style="font-size: 12px; color: #7f8c8d; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
                  Cet email a été envoyé depuis le formulaire de contact du site CoworKing Café.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi de l\'email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      emailId: data?.id,
    })
  } catch (error) {
    console.error('POST /api/contact-mails error:', error)
    return NextResponse.json(
      {
        error: 'Erreur lors de l\'envoi du message',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    )
  }
}
