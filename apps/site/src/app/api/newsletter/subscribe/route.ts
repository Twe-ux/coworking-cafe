import { NextRequest, NextResponse } from 'next/server';
import { Newsletter } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types';

interface SubscribeRequest {
  email: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: SubscribeRequest = await request.json();
    const { email } = body;

    // Validation champ requis
    if (!email) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'L\'email est requis' },
        { status: 400 }
      );
    }

    // Validation format email avec regex
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Vérifier si l'email est déjà abonné
    const existingSubscription = await Newsletter.findOne({
      email: normalizedEmail
    });

    if (existingSubscription) {
      // Si déjà abonné et actif
      if (existingSubscription.isSubscribed) {
        return NextResponse.json<ApiResponse<never>>(
          { success: false, error: 'Cet email est déjà abonné à la newsletter' },
          { status: 409 }
        );
      }

      // Si était désabonné, réactiver l'abonnement
      existingSubscription.isSubscribed = true;
      existingSubscription.subscribedAt = new Date();
      existingSubscription.unsubscribedAt = undefined;
      await existingSubscription.save();

      return NextResponse.json<ApiResponse<{ message: string }>>(
        {
          success: true,
          message: 'Votre abonnement à la newsletter a été réactivé avec succès !'
        },
        { status: 200 }
      );
    }

    // Créer un nouvel abonnement
    await Newsletter.create({
      email: normalizedEmail,
      isSubscribed: true,
      subscribedAt: new Date(),
      source: 'form'
    });

    return NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        message: 'Merci ! Vous êtes maintenant abonné à notre newsletter.'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);

    // Gérer les erreurs de validation Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Email invalide' },
        { status: 400 }
      );
    }

    // Gérer les erreurs de duplication (index unique)
    if (error instanceof Error && 'code' in error && error.code === 11000) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Cet email est déjà abonné à la newsletter' },
        { status: 409 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erreur serveur lors de l\'abonnement' },
      { status: 500 }
    );
  }
}
