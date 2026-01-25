import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { ContactMail } from '@/models/contactMail';
import type { ContactMailResponse, ContactMail as ContactMailType } from '@/types/contactMail';
import { Resend } from 'resend';
import logger from '@/lib/logger';
import { generateContactReplyEmail } from '@/lib/email/templates/contactReply';

/**
 * GET /api/messages/contact/[id]
 * Récupère un message de contact par ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContactMailResponse>> {
  // 1. Authentification
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ContactMailResponse>;
  }

  // 2. Connexion DB
  await connectMongoose();

  try {
    // 3. Récupérer le message
    const messageDoc = await ContactMail.findById(params.id);

    if (!messageDoc) {
      return errorResponse('Message non trouvé', 'ID invalide', 404);
    }

    // 4. Transformer les données
    const data: ContactMailType = {
      id: messageDoc._id.toString(),
      name: messageDoc.name,
      email: messageDoc.email,
      phone: messageDoc.phone,
      subject: messageDoc.subject,
      message: messageDoc.message,
      status: messageDoc.status,
      reply: messageDoc.reply,
      repliedAt: messageDoc.repliedAt ? messageDoc.repliedAt.toISOString() : undefined,
      repliedBy: messageDoc.repliedBy ? messageDoc.repliedBy.toString() : undefined,
      userId: messageDoc.userId ? messageDoc.userId.toString() : undefined,
      createdAt: messageDoc.createdAt.toISOString(),
      updatedAt: messageDoc.updatedAt.toISOString(),
    };

    return successResponse(data, 'Message récupéré avec succès');
  } catch (error) {
    logger.error('GET contact message error', error);
    return errorResponse(
      'Erreur lors de la récupération du message',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * PUT /api/messages/contact/[id]
 * Met à jour le statut ou ajoute une réponse
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContactMailResponse>> {
  // 1. Authentification
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ContactMailResponse>;
  }

  // 2. Connexion DB
  await connectMongoose();

  try {
    // 3. Parse body
    const body = await request.json();
    const { status, reply } = body;

    // 4. Récupérer le message original
    const message = await ContactMail.findById(params.id);

    if (!message) {
      return errorResponse('Message non trouvé', 'ID invalide', 404);
    }

    // 5. Si c'est une réponse
    if (reply) {
      // Mettre à jour le message
      message.status = 'replied';
      message.reply = reply;
      message.repliedAt = new Date();
      if (authResult.session?.user?.id) {
        message.repliedBy = authResult.session.user.id as any;
      }
      await message.save();

      // Envoyer l'email de réponse via Resend
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

        // Générer le HTML avec le template professionnel
        const htmlContent = generateContactReplyEmail({
          clientName: message.name,
          clientMessage: message.message,
          replyMessage: reply,
          subject: message.subject,
        });

        await resend.emails.send({
          from: fromEmail,
          to: message.email,
          subject: `Re: ${message.subject}`,
          html: htmlContent,
        });

        logger.info('Contact reply email sent successfully', {
          recipient: message.email,
          subject: message.subject,
        });
      } catch (emailError) {
        logger.error('Failed to send contact reply email', emailError);
        // Continue même si l'email échoue
      }
    } else if (status) {
      // Mise à jour simple du statut
      message.status = status;
      await message.save();
    }

    // 6. Retourner le message mis à jour
    const updatedData: ContactMailType = {
      id: message._id.toString(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      status: message.status,
      reply: message.reply,
      repliedAt: message.repliedAt ? message.repliedAt.toISOString() : undefined,
      repliedBy: message.repliedBy ? message.repliedBy.toString() : undefined,
      userId: message.userId ? message.userId.toString() : undefined,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };

    return successResponse(updatedData, 'Message mis à jour avec succès');
  } catch (error) {
    logger.error('PUT contact message error', error);
    return errorResponse(
      'Erreur lors de la mise à jour du message',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}

/**
 * DELETE /api/messages/contact/[id]
 * Supprime un message de contact
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse<ContactMailResponse>> {
  // 1. Authentification
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ContactMailResponse>;
  }

  // 2. Connexion DB
  await connectMongoose();

  try {
    // 3. Supprimer le message
    const message = await ContactMail.findByIdAndDelete(params.id);

    if (!message) {
      return errorResponse('Message non trouvé', 'ID invalide', 404);
    }

    const result: ContactMailType = {
      id: message._id.toString(),
      name: message.name,
      email: message.email,
      phone: message.phone,
      subject: message.subject,
      message: message.message,
      status: message.status,
      reply: message.reply,
      repliedAt: message.repliedAt ? message.repliedAt.toISOString() : undefined,
      repliedBy: message.repliedBy ? message.repliedBy.toString() : undefined,
      userId: message.userId ? message.userId.toString() : undefined,
      createdAt: message.createdAt.toISOString(),
      updatedAt: message.updatedAt.toISOString(),
    };

    return successResponse(result, 'Message supprimé avec succès', 200);
  } catch (error) {
    logger.error('DELETE contact message error', error);
    return errorResponse(
      'Erreur lors de la suppression du message',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
