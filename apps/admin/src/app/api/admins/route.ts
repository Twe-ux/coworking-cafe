import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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

/**
 * GET /api/admins
 * Récupère tous les admins avec un PIN configuré
 * PUBLIC - Accessible sans authentification
 */
export async function GET(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    const adminsCollection = db.collection<AdminDocument>('admins');

    // Récupérer tous les admins avec un dashboardPin
    const admins = await adminsCollection
      .find({
        dashboardPin: { $exists: true }
      })
      .project({
        _id: 1,
        email: 1,
        givenName: 1,
        role: 1,
      })
      .toArray();

    // Formater les données
    const formattedAdmins = admins.map((admin) => ({
      _id: admin._id.toString(),
      id: admin._id.toString(),
      name: admin.givenName || admin.email.split('@')[0],
      email: admin.email,
      role: admin.role,
    }));

    return NextResponse.json({
      success: true,
      data: formattedAdmins,
      count: formattedAdmins.length,
    });
  } catch (error: unknown) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des admins',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
