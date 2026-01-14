import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import FileUpload from "@/components/dashboard/FileUpload";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import PropertyAdd from './components/PropertyAdd';
import PropertyAddCard from './components/PropertyAddCard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const PropertyAddPage = () => {
  return (
    <>
      <DashboardPageTitle title="Add Property" subName="Real Estate" />
      <Row>
        <PropertyAddCard />
        <Col xl={9} lg={8}>
          <FileUpload title="Add Property Photo" />
          <PropertyAdd />
        </Col>
      </Row>
    </>
  );
};

export default PropertyAddPage;
