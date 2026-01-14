import { Metadata } from 'next';
import { getServerSession } from 'next-auth';
import { options as authOptions } from '@/lib/auth-options';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/db';
import { Employee } from '@/models/employee';
import ScheduleWrapper from '@/components/hr/ScheduleWrapper';
import { Card, Col, Row } from 'react-bootstrap';

export const metadata: Metadata = {
  title: 'Planning Employés',
  description: 'Gestion du planning mensuel des employés',
};

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/login');
  }

  // Connexion à la base de données
  await connectDB();

  // Récupérer tous les employés actifs
  const employees = await Employee.find({ isActive: true })
    .select('_id firstName lastName employeeRole contractualHours availability')
    .sort({ firstName: 1, lastName: 1 })
    .lean();

  // Convertir les ObjectIds en strings pour éviter les erreurs de sérialisation
  const serializedEmployees = employees.map((emp) => ({
    ...emp,
    _id: emp._id.toString(),
  }));

  return (
    <>
      <Row>
        <Col xs={12}>
          <div className="page-title-box">
            <h4 className="page-title">Planning Mensuel</h4>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs={12}>
          {serializedEmployees.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5">
                <p className="text-muted mb-3">
                  Aucun employé trouvé. Créez d'abord des employés pour gérer
                  leur planning.
                </p>
                <a href="/dashboard/hr/employees" className="btn btn-primary">
                  Gérer les employés
                </a>
              </Card.Body>
            </Card>
          ) : (
            <ScheduleWrapper employees={serializedEmployees} />
          )}
        </Col>
      </Row>
    </>
  );
}
