import { options as authOptions } from "@/lib/auth-options";
import { connectDB } from "@/lib/mongodb";
import { ContactMail } from "@/models/contactMail";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const getResendClient = () => {
  return new Resend(process.env.RESEND_API_KEY);
};

// GET - Get single message
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const message = await ContactMail.findById(id).lean();

    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la récupération du message" },
      { status: 500 }
    );
  }
}

// PUT - Update message (status, reply)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    const { id } = await params;

    const body = await request.json();
    const { status, reply } = body;

    const updateData: Record<string, unknown> = {};

    if (status) {
      updateData.status = status;
    }

    if (reply) {
      updateData.reply = reply;
      updateData.repliedAt = new Date();
      updateData.status = "replied";
      if (session?.user?.id) {
        updateData.repliedBy = session.user.id;
      }

      // Get original message to send reply
      const originalMessage = await ContactMail.findById(id);
      if (originalMessage) {
        try {
          const resend = getResendClient();
          const result = await resend.emails.send({
            from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
            to: originalMessage.email,
            subject: `Re: ${originalMessage.subject}`,
            html: `
              <!DOCTYPE html>
              <html lang="fr">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Réponse à votre message</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <!-- Main container -->
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                        <!-- Header -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #2c5f5d 0%, #3d7d7a 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                              CoworKing Café by Anticafé
                            </h1>
                            <p style="margin: 10px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 14px;">
                               by Anticafé
                            </p>
                          </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                          <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                              Bonjour <strong>${originalMessage.name}</strong>,
                            </p>

                            <p style="margin: 0 0 20px 0; color: #555555; font-size: 15px; line-height: 1.7;">
                              Merci pour votre message. Nous sommes ravis de pouvoir vous répondre :
                            </p>

                            <!-- Reply box -->
                            <div style="background-color: #f8f9fa; border-left: 4px solid #2c5f5d; padding: 20px; margin: 30px 0; border-radius: 4px;">
                              <p style="margin: 0; color: #333333; font-size: 15px; line-height: 1.7;">
                                ${reply.replace(/\n/g, "<br />")}
                              </p>
                            </div>

                            <p style="margin: 30px 0 20px 0; color: #555555; font-size: 15px; line-height: 1.7;">
                              Si vous avez d'autres questions, n'hésitez pas à nous recontacter. Nous serons heureux de vous aider.
                            </p>

                            <!-- Original message -->
                            <div style="margin-top: 40px; padding-top: 30px; border-top: 2px solid #e0e0e0;">
                              <p style="margin: 0 0 15px 0; color: #999999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                                Votre message original
                              </p>
                              <div style="background-color: #fafafa; padding: 20px; border-radius: 4px; border-left: 3px solid #cccccc;">
                                <p style="margin: 0 0 10px 0; color: #666666; font-size: 13px;">
                                  <strong>Sujet :</strong> ${
                                    originalMessage.subject
                                  }
                                </p>
                                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.6;">
                                  ${originalMessage.message.replace(
                                    /\n/g,
                                    "<br />"
                                  )}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
                            <p style="margin: 0 0 5px 0; color: #666666; font-size: 13px;">
                              CoworKing Café by Anticafé • Strasbourg
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px;">
                              Cet email est envoyé en réponse à votre demande de contact
                            </p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </body>
              </html>
            `,
          });
        } catch (error) {}
      }
    }

    const message = await ContactMail.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    ).lean();

    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du message" },
      { status: 500 }
    );
  }
}

// DELETE - Delete message
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const message = await ContactMail.findByIdAndDelete(id);

    if (!message) {
      return NextResponse.json(
        { error: "Message non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erreur lors de la suppression du message" },
      { status: 500 }
    );
  }
}
