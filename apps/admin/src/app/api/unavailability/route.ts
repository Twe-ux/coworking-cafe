import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectMongoose } from '@/lib/mongodb';
import Unavailability from '@/models/unavailability';
import Employee from '@/models/employee';
import type { IUnavailabilityWithEmployee, UnavailabilityStatus, UnavailabilityType, UnavailabilityRequestedBy } from '@/types/unavailability';
import { Types } from 'mongoose';

interface PopulatedEmployee {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
}

interface PopulatedApprover {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
}

interface PopulatedUnavailability {
  _id: Types.ObjectId;
  employeeId: PopulatedEmployee;
  startDate: string;
  endDate: string;
  reason?: string;
  type: UnavailabilityType;
  status: UnavailabilityStatus;
  requestedBy: UnavailabilityRequestedBy;
  approvedBy?: PopulatedApprover;
  approvedAt?: Date;
  rejectionReason?: string;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * GET /api/unavailability - Get all unavailabilities with filters
 */
// Force dynamic rendering (no static analysis at build time)
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    await connectMongoose();

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    interface UnavailabilityQuery {
      employeeId?: string;
      status?: UnavailabilityStatus;
      $or?: Array<{
        startDate?: { $gte?: string; $lte?: string };
        endDate?: { $gte?: string; $lte?: string };
      }>;
    }

    const query: UnavailabilityQuery = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status as UnavailabilityStatus;
    }

    if (startDate && endDate) {
      query.$or = [
        {
          startDate: { $gte: startDate, $lte: endDate },
        },
        {
          endDate: { $gte: startDate, $lte: endDate },
        },
        {
          startDate: { $lte: startDate },
          endDate: { $gte: endDate },
        },
      ];
    }

    const unavailabilities = await Unavailability.find(query)
      .populate('employeeId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ startDate: -1, createdAt: -1 })
      .lean();

    const formattedData: IUnavailabilityWithEmployee[] = (unavailabilities as unknown as PopulatedUnavailability[]).map((item) => ({
      _id: item._id.toString(),
      employeeId: item.employeeId._id.toString(),
      startDate: item.startDate,
      endDate: item.endDate,
      reason: item.reason,
      type: item.type,
      status: item.status,
      requestedBy: item.requestedBy,
      approvedBy: item.approvedBy?._id.toString(),
      approvedAt: item.approvedAt,
      rejectionReason: item.rejectionReason,
      notificationSent: item.notificationSent,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      employee: {
        _id: item.employeeId._id.toString(),
        firstName: item.employeeId.firstName,
        lastName: item.employeeId.lastName,
        email: item.employeeId.email,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      count: formattedData.length,
    });
  } catch (error: unknown) {
    console.error('❌ Erreur API GET unavailability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des indisponibilités',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/unavailability - Create a new unavailability (admin only)
 */
export async function POST(request: NextRequest) {
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
    const { employeeId, startDate, endDate, reason, type } = body;

    if (!employeeId || !startDate || !endDate || !type) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données manquantes',
          details: 'employeeId, startDate, endDate, type sont requis',
        },
        { status: 400 }
      );
    }

    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé introuvable' },
        { status: 404 }
      );
    }

    const unavailabilityData = {
      employeeId,
      startDate,
      endDate,
      reason: reason || '',
      type,
      status: 'approved', // Admin creates approved by default
      requestedBy: 'admin',
      approvedBy: session.user.id,
      approvedAt: new Date(),
      notificationSent: false,
    };

    const newUnavailability = new Unavailability(unavailabilityData);
    await newUnavailability.save();

    const populated = await Unavailability.findById(newUnavailability._id)
      .populate('employeeId', 'firstName lastName email')
      .lean() as unknown as PopulatedUnavailability | null;

    if (!populated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur lors de la récupération de l\'indisponibilité créée',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Indisponibilité créée avec succès',
        data: {
          ...populated,
          _id: populated._id.toString(),
          employeeId: populated.employeeId._id.toString(),
          employee: {
            _id: populated.employeeId._id.toString(),
            firstName: populated.employeeId.firstName,
            lastName: populated.employeeId.lastName,
            email: populated.employeeId.email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('❌ Erreur API POST unavailability:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'indisponibilité',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
