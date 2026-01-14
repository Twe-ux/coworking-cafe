import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import FileUpload from "@/components/dashboard/FileUpload";
import { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AddCustomer from './components/AddCustomer';
import CustomerAddCard from './components/CustomerAddCard';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const CustomerAddPage = () => {
  return (
    <>
      <DashboardPageTitle title="Customers Add" subName="Real Estate" />
      <Row>
        <CustomerAddCard />
        <Col xl={9} lg={12}>
          <FileUpload title="Add Customer Photo" />
          <AddCustomer />
        </Col>
      </Row>
    </>
  );
};

export default CustomerAddPage;
