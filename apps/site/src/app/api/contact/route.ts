import { NextRequest, NextResponse } from 'next/server';
import { ContactMail } from '@coworking-cafe/database';
import type { ApiResponse } from '@/types';

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const body: ContactRequest = await request.json();
    const { name, email, subject, message } = body;

    // Validation des champs requis
    if (!name || !email || !subject || !message) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation email avec regex
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation longueur minimum
    if (name.trim().length < 2) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      );
    }

    if (subject.trim().length < 3) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Le sujet doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    if (message.trim().length < 10) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Le message doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    // Sauvegarder dans la base de données
    await ContactMail.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'unread'
    });

    return NextResponse.json<ApiResponse<{ message: string }>>(
      {
        success: true,
        message: 'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error processing contact form:', error);

    // Gérer les erreurs de validation Mongoose
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Erreur serveur lors de l\'envoi du message' },
      { status: 500 }
    );
  }
}
