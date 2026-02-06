import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface AdminDocument {
  _id: ObjectId;
  email: string;
  password: string;
  givenName?: string;
  role: 'dev' | 'admin' | 'staff';
  dashboardPin?: string; // Hashed PIN for dashboard login
  employeeId?: ObjectId | null;
}

interface VerifyPinRequest {
  adminId: string;
  pin: string;
}

/**
 * POST /api/admins/verify-pin
 * Vérifier le PIN d'un admin
 * PUBLIC - Accessible sans authentification
 */
export async function POST(request: NextRequest) {
  try {
    const body: VerifyPinRequest = await request.json();

    // Validation
    if (!body.adminId || !body.pin) {
      return NextResponse.json(
        {
          success: false,
          error: 'ID admin et PIN sont obligatoires',
        },
        { status: 400 }
      );
    }

    // Validation du format PIN (6 chiffres)
    if (!/^\d{6}$/.test(body.pin)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Le PIN doit contenir 6 chiffres',
        },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const adminsCollection = db.collection<AdminDocument>('admins');

    // Rechercher l'admin avec le PIN
    const admin = await adminsCollection.findOne({
      _id: new ObjectId(body.adminId),
    });

    if (!admin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Admin introuvable',
        },
        { status: 404 }
      );
    }

    // Vérifier que l'admin a un PIN
    if (!admin.dashboardPin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aucun PIN configuré pour cet admin',
        },
        { status: 403 }
      );
    }

    // Vérifier le PIN (hashé avec bcrypt)
    const isPinValid = await bcrypt.compare(body.pin, admin.dashboardPin);

    if (!isPinValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'PIN incorrect',
        },
        { status: 401 }
      );
    }

    // PIN valide, retourner les infos admin
    const adminData = {
      id: admin._id.toString(),
      name: admin.givenName || admin.email.split('@')[0],
      email: admin.email,
      role: admin.role,
    };

    return NextResponse.json({
      success: true,
      data: adminData,
      message: 'PIN vérifié avec succès',
    });
  } catch (error: unknown) {
    console.error('Verify admin PIN error:', error);

    // Gestion erreur ObjectId invalide
    if (error instanceof Error && (error.name === 'BSONError' || error.message.includes('ObjectId'))) {
      return NextResponse.json(
        {
          success: false,
          error: "Format d'ID admin invalide",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la vérification du PIN',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
