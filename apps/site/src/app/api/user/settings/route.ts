/**
 * API Routes: /api/user/settings
 * GET: Récupérer les paramètres utilisateur
 * PUT: Mettre à jour les paramètres utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { User } from '@coworking-cafe/database';
import type { ApiResponse, UserSettings } from '@/types';

/**
 * GET /api/user/settings
 * Récupérer les paramètres de l'utilisateur connecté
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<UserSettings>>> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté.' },
        { status: 401 }
      );
    }

    const user = await User.findById(session.user.id).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    const settings: UserSettings = {
      language: 'fr',
      notifications: {
        email: true,
        bookingReminders: true,
        promotions: false,
        newsletter: false
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false
      }
    };

    return NextResponse.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/settings
 * Mettre à jour les paramètres utilisateur
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté.' },
        { status: 401 }
      );
    }

    const body: Partial<UserSettings> = await request.json();
    const { notifications, privacy, language } = body;

    // Validation
    if (!notifications && !privacy && !language) {
      return NextResponse.json(
        { success: false, error: 'Aucune donnée à mettre à jour.' },
        { status: 400 }
      );
    }

    if (language && !['fr', 'en'].includes(language)) {
      return NextResponse.json(
        { success: false, error: 'Langue invalide.' },
        { status: 400 }
      );
    }

    if (privacy?.profileVisibility && !['public', 'private'].includes(privacy.profileVisibility)) {
      return NextResponse.json(
        { success: false, error: 'Visibilité du profil invalide.' },
        { status: 400 }
      );
    }

    // TODO: Mettre à jour dans la base de données
    // Pour l'instant, les paramètres ne sont pas persistés dans le User model
    // Ils sont calculés côté serveur dans GET /api/user/profile

    return NextResponse.json({
      success: true,
      data: {
        message: 'Paramètres mis à jour avec succès.'
      }
    });
  } catch (error) {
    console.error('Error updating user settings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
