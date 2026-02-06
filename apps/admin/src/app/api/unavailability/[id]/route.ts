import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectMongoose } from '@/lib/mongodb';
import Unavailability from '@/models/unavailability';
import Employee from '@/models/employee';
import { sendEmail } from '@/lib/email/emailService';
import { generateUnavailabilityApprovedEmail } from '@/lib/email/templates/unavailabilityApproved';
import { generateUnavailabilityRejectedEmail } from '@/lib/email/templates/unavailabilityRejected';
import { Types } from 'mongoose';

// Type pour employee populé depuis MongoDB
interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

// Type pour unavailability populé
interface PopulatedUnavailability {
  _id: Types.ObjectId;
  employeeId: PopulatedEmployee;
  startDate: string;
  endDate: string;
  reason?: string;
  type: string;
  status: string;
  requestedBy: string;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;
  rejectionReason?: string;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/unavailability/[id] - Get a single unavailability
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectMongoose();

    const unavailability = await Unavailability.findById(params.id)
      .populate('employeeId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .lean() as PopulatedUnavailability | null;

    if (!unavailability) {
      return NextResponse.json(
        { success: false, error: 'Indisponibilité introuvable' },
        { status: 404 }
      );
    }

    const employee = unavailability.employeeId as PopulatedEmployee;

    return NextResponse.json({
      success: true,
      data: {
        ...unavailability,
        _id: unavailability._id.toString(),
        employeeId: employee._id.toString(),
        employee: {
          _id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        },
      },
    });
  } catch (error: unknown) {
    console.error('❌ Erreur API GET unavailability/[id]:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Format d\'ID invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération de l\'indisponibilité',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/unavailability/[id] - Update unavailability (approve, reject, modify)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userRole = session?.user?.role;
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    await connectMongoose();

    const body = await request.json();
    const { status, rejectionReason, ...updateData } = body;

    const unavailability = await Unavailability.findById(params.id);
    if (!unavailability) {
      return NextResponse.json(
        { success: false, error: 'Indisponibilité introuvable' },
        { status: 404 }
      );
    }

    if (status === 'approved') {
      unavailability.status = 'approved';
      unavailability.approvedBy = new Types.ObjectId(session.user.id);
      unavailability.approvedAt = new Date();
      unavailability.rejectionReason = undefined;
    } else if (status === 'rejected') {
      unavailability.status = 'rejected';
      unavailability.approvedBy = new Types.ObjectId(session.user.id);
      unavailability.approvedAt = new Date();
      unavailability.rejectionReason = rejectionReason || '';
    } else if (status === 'cancelled') {
      unavailability.status = 'cancelled';
    } else if (Object.keys(updateData).length > 0) {
      Object.assign(unavailability, updateData);
    }

    await unavailability.save();

    const populated = await Unavailability.findById(unavailability._id)
      .populate('employeeId', 'firstName lastName email')
      .lean() as PopulatedUnavailability | null;

    if (!populated) {
      return NextResponse.json(
        { success: false, error: 'Indisponibilité introuvable après mise à jour' },
        { status: 404 }
      );
    }

    // Send email notification
    const employee = populated.employeeId as PopulatedEmployee;
    const employeeFullName = `${employee.firstName} ${employee.lastName}`;

    if (status === 'approved' && !unavailability.notificationSent) {
      const emailHtml = generateUnavailabilityApprovedEmail({
        employeeName: employeeFullName,
        type: unavailability.type,
        startDate: unavailability.startDate,
        endDate: unavailability.endDate,
        reason: unavailability.reason,
      });

      await sendEmail({
        to: employee.email,
        subject: 'Demande d\'indisponibilité approuvée - CoworKing Café',
        html: emailHtml,
      });

      unavailability.notificationSent = true;
      await unavailability.save();
    } else if (status === 'rejected' && !unavailability.notificationSent) {
      const emailHtml = generateUnavailabilityRejectedEmail({
        employeeName: employeeFullName,
        type: unavailability.type,
        startDate: unavailability.startDate,
        endDate: unavailability.endDate,
        reason: unavailability.reason,
        rejectionReason: rejectionReason || 'Non spécifié',
      });

      await sendEmail({
        to: employee.email,
        subject: 'Demande d\'indisponibilité refusée - CoworKing Café',
        html: emailHtml,
      });

      unavailability.notificationSent = true;
      await unavailability.save();
    }

    return NextResponse.json({
      success: true,
      message: 'Indisponibilité mise à jour avec succès',
      data: {
        ...populated,
        _id: populated._id.toString(),
        employeeId: employee._id.toString(),
        employee: {
          _id: employee._id.toString(),
          firstName: employee.firstName,
          lastName: employee.lastName,
          email: employee.email,
        },
      },
    });
  } catch (error: unknown) {
    console.error('❌ Erreur API PUT unavailability/[id]:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Format d\'ID invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la mise à jour de l\'indisponibilité',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/unavailability/[id] - Delete an unavailability
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const userRole = session?.user?.role;
    if (!userRole || !['dev', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { success: false, error: 'Permissions insuffisantes' },
        { status: 403 }
      );
    }

    await connectMongoose();

    const unavailability = await Unavailability.findByIdAndDelete(params.id);

    if (!unavailability) {
      return NextResponse.json(
        { success: false, error: 'Indisponibilité introuvable' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Indisponibilité supprimée avec succès',
    });
  } catch (error: unknown) {
    console.error('❌ Erreur API DELETE unavailability/[id]:', error);

    if (error && typeof error === 'object' && 'name' in error && error.name === 'CastError') {
      return NextResponse.json(
        { success: false, error: 'Format d\'ID invalide' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la suppression de l\'indisponibilité',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
