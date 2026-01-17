import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import { ContactMail } from '@/models/contactMail';
import type { ContactMailListResponse, ContactMail as ContactMailType } from '@/types/contactMail';

/**
 * GET /api/support/contact
 * Liste tous les messages de contact avec filtres et pagination
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<ContactMailListResponse>> {
  // 1. Authentification (dev/admin uniquement)
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) {
    return authResult.response as NextResponse<ContactMailListResponse>;
  }

  // 2. Connexion DB
  await connectMongoose();

  // 3. Query params
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  try {
    // 4. Construire le filtre
    const filter: Record<string, unknown> = {};
    if (status !== 'all') {
      filter.status = status;
    }

    // 5. Compter le total
    const total = await ContactMail.countDocuments(filter);

    // 6. Récupérer les messages
    const messageDocs = await ContactMail.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // 7. Transformer les données
    const data: ContactMailType[] = messageDocs.map((msg) => ({
      id: msg._id.toString(),
      name: msg.name,
      email: msg.email,
      phone: msg.phone,
      subject: msg.subject,
      message: msg.message,
      status: msg.status,
      reply: msg.reply,
      repliedAt: msg.repliedAt ? msg.repliedAt.toISOString() : undefined,
      repliedBy: msg.repliedBy ? msg.repliedBy.toString() : undefined,
      userId: msg.userId ? msg.userId.toString() : undefined,
      createdAt: msg.createdAt.toISOString(),
      updatedAt: msg.updatedAt.toISOString(),
    }));

    // 8. Retourner les données
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/support/contact error:', error);
    return errorResponse(
      'Erreur lors de la récupération des messages',
      error instanceof Error ? error.message : 'Erreur inconnue'
    );
  }
}
