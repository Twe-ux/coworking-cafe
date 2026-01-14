import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import type { Metadata } from "next";
import { Card, CardBody, Col, Row } from "react-bootstrap";
import CalendarPage from './components/CalendarPage';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Schedule = () => {
  return (
    <>
      <DashboardPageTitle title="Calendar" subName="Pages" />
      <Row>
        <Col xs={12}>
          <Card>
            <CardBody>
              <Row>
                <CalendarPage />
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default Schedule;
