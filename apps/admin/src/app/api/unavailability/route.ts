import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectMongoose } from '@/lib/mongodb';
import Unavailability from '@/models/unavailability';
import Employee from '@/models/employee';
import type { IUnavailabilityWithEmployee } from '@/types/unavailability';

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

    const query: any = {};

    if (employeeId) {
      query.employeeId = employeeId;
    }

    if (status) {
      query.status = status;
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

    const formattedData: IUnavailabilityWithEmployee[] = unavailabilities.map((item: any) => ({
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
  } catch (error: any) {
    console.error('❌ Erreur API GET unavailability:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des indisponibilités',
        details: error.message,
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
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: 'Indisponibilité créée avec succès',
        data: {
          ...populated,
          _id: populated!._id.toString(),
          employeeId: (populated!.employeeId as any)._id.toString(),
          employee: {
            _id: (populated!.employeeId as any)._id.toString(),
            firstName: (populated!.employeeId as any).firstName,
            lastName: (populated!.employeeId as any).lastName,
            email: (populated!.employeeId as any).email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('❌ Erreur API POST unavailability:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la création de l\'indisponibilité',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
