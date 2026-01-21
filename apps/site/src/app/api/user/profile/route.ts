/**
 * API Routes: /api/user/profile
 * GET: Récupérer le profil utilisateur
 * PUT: Mettre à jour le profil utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { User } from '@coworking-cafe/database';
import type { ApiResponse, ClientProfile, UpdateProfileData } from '@/types';

/**
 * GET /api/user/profile
 * Récupérer le profil de l'utilisateur connecté
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ApiResponse<ClientProfile>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour consulter votre profil.' },
        { status: 401 }
      );
    }

    // 2. RÉCUPÉRER L'UTILISATEUR
    const user = await User.findById(session.user.id)
      .select('-password') // Exclure le mot de passe
      .lean();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    // 3. CALCULER LES STATISTIQUES
    // TODO: Implémenter les vraies stats depuis Booking
    const stats = {
      totalBookings: 0,
      totalSpent: 0,
      favoriteSpace: undefined,
      memberSince: user.createdAt,
      loyaltyPoints: 0,
    };

    // 4. FORMATER LA RÉPONSE
    const profile: ClientProfile = {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role as 'client',
      preferences: {
        language: 'fr',
        notifications: {
          email: true,
          bookingReminders: true,
          promotions: false,
          newsletter: false,
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showPhone: false,
        },
      },
      stats,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la récupération du profil.',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/profile
 * Mettre à jour le profil utilisateur
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    // 1. VÉRIFIER AUTHENTIFICATION
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: 'Vous devez être connecté pour modifier votre profil.' },
        { status: 401 }
      );
    }

    const body: UpdateProfileData = await request.json();
    const { firstName, lastName, phone, avatar } = body;

    // 2. VALIDATION DES DONNÉES
    const updateData: Partial<UpdateProfileData> = {};

    if (firstName !== undefined) {
      if (firstName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Le prénom doit contenir au moins 2 caractères.' },
          { status: 400 }
        );
      }
      updateData.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (lastName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'Le nom doit contenir au moins 2 caractères.' },
          { status: 400 }
        );
      }
      updateData.lastName = lastName.trim();
    }

    if (phone !== undefined) {
      // Validation téléphone français
      const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      if (phone && !phoneRegex.test(phone)) {
        return NextResponse.json(
          { success: false, error: 'Numéro de téléphone invalide.' },
          { status: 400 }
        );
      }
      updateData.phone = phone || undefined;
    }

    if (avatar !== undefined) {
      updateData.avatar = avatar || undefined;
    }

    // 3. VÉRIFIER QU'IL Y A DES DONNÉES À METTRE À JOUR
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune donnée à mettre à jour.' },
        { status: 400 }
      );
    }

    // 4. METTRE À JOUR L'UTILISATEUR
    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, error: 'Utilisateur introuvable.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Profil mis à jour avec succès.',
      },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Une erreur est survenue lors de la mise à jour du profil.',
      },
      { status: 500 }
    );
  }
}
