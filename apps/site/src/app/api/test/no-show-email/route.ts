import { NextRequest, NextResponse } from 'next/server';
import { sendDepositCaptured } from '@/lib/email/emailService';
import { getAuthUser } from '@/lib/api-helpers';

/**
 * GET /api/test/no-show-email?email=test@example.com
 *
 * Test route to verify no-show email template and delivery
 * ONLY WORKS IN DEVELOPMENT MODE
 *
 * Usage:
 * http://localhost:3000/api/test/no-show-email?email=your-email@example.com
 */
export async function GET(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Test routes are disabled in production' },
      { status: 403 }
    );
  }

  try {
    // Check if user is admin
    const user = await getAuthUser();
    if (!user || !user.role?.level || user.role.level < 50) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get email from query params
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        {
          error: 'Email parameter required',
          usage: '/api/test/no-show-email?email=your-email@example.com'
        },
        { status: 400 }
      );
    }

    // Send test no-show email
    const success = await sendDepositCaptured(email, {
      name: 'Jean Dupont',
      spaceName: 'Salle de réunion Grande',
      date: new Date().toLocaleDateString('fr-FR'),
      depositAmount: 70.00,
    });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Email de test de no-show envoyé à ${email}`,
        details: {
          template: 'depositCaptured',
          recipient: email,
          testData: {
            name: 'Jean Dupont',
            spaceName: 'Salle de réunion Grande',
            date: new Date().toLocaleDateString('fr-FR'),
            depositAmount: 70.00,
          }
        }
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Échec de l\'envoi de l\'email - vérifiez les logs serveur'
        },
        { status: 500 }
      );
    }
  } catch (error) {    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
