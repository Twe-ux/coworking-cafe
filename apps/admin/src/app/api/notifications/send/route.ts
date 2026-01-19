import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendNewContactNotification } from '@/lib/push-notifications';
import { ContactMail } from '@coworking-cafe/database';

/**
 * POST /api/notifications/send
 * Envoie une notification push pour un nouveau message de contact
 * Cette API peut être appelée depuis apps/site ou en interne
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'messageId manquant' },
        { status: 400 }
      );
    }

    // Récupérer le message de contact
    const message = await ContactMail.findById(messageId);

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message introuvable' },
        { status: 404 }
      );
    }

    // Compter le nombre de messages non lus
    const unreadCount = await ContactMail.countDocuments({ status: 'unread' });

    // Envoyer la notification push
    await sendNewContactNotification({
      id: message._id.toString(),
      name: message.name,
      subject: message.subject,
      message: message.message,
      unreadCount,
    });

    console.log('[Notifications] Push notification sent for message:', messageId);

    return NextResponse.json({
      success: true,
      message: 'Notification envoyée avec succès',
    });
  } catch (error) {
    console.error('[Notifications] Send error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de l\'envoi de la notification',
      },
      { status: 500 }
    );
  }
}
