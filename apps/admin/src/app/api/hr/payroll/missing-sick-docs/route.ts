import { type NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api/auth';
import { successResponse, errorResponse } from '@/lib/api/response';
import { connectMongoose } from '@/lib/mongodb';
import Absence from '@/models/absence';

/**
 * GET /api/hr/payroll/missing-sick-docs?month=X&year=Y
 * Returns sick_leave absences for the month that have no uploaded document
 */
export async function GET(request: NextRequest) {
  const authResult = await requireAuth(['dev', 'admin']);
  if (!authResult.authorized) return authResult.response;

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get('month') ?? '');
  const year = parseInt(searchParams.get('year') ?? '');

  if (!month || !year || month < 1 || month > 12) {
    return errorResponse('Paramètres month et year requis', undefined, 400);
  }

  try {
    await connectMongoose();

    const monthStart = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const monthEnd = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const absences = await Absence.find({
      type: 'sick_leave',
      isActive: true,
      endDate: { $gte: monthStart },
      startDate: { $lte: monthEnd },
      'sickLeaveDocument.contentBase64': { $exists: false },
    })
      .populate('employeeId', 'firstName lastName')
      .select('_id employeeId startDate endDate')
      .lean();

    const result = absences.map((a) => {
      const emp = a.employeeId as unknown as { firstName: string; lastName: string };
      return {
        _id: a._id,
        employeeName: `${emp?.firstName ?? ''} ${emp?.lastName ?? ''}`.trim(),
        startDate: a.startDate,
        endDate: a.endDate,
      };
    });

    return successResponse(result);
  } catch (error) {
    console.error('Error fetching missing sick docs:', error);
    return errorResponse('Erreur serveur');
  }
}
