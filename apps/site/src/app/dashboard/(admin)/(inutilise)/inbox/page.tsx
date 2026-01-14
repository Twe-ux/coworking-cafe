import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { Metadata } from "next";
import { Card, Row } from "react-bootstrap";
import EmailView from './components/EmailView';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const InboxPage = () => {
  return (
    <>
      <DashboardPageTitle title="Inbox" subName="Real Estate" />
      <Card>
        <Row className="g-0">
          <EmailView />
        </Row>
      </Card>
    </>
  );
};

export default InboxPage;
