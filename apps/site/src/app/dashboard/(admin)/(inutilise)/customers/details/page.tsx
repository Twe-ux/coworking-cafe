import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { getAllProperty } from "@/helpers/data";
import { Metadata } from "next";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
} from "react-bootstrap";
import { customerData } from "./data";
import CustomerCard from './components/CustomerCard';
import CustomersDetails from './components/CustomersDetails';
import OwnProperty from './components/OwnProperty';
import PropertyCard from './components/PropertyCard';
import TransactionHistory from './components/TransactionHistory';
import Transactions from './components/Transactions';
import WeeklyInquiry from './components/WeeklyInquiry';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const CustomerDetailsPage = async () => {
  const propertyData = await getAllProperty();
  return (
    <>
      <DashboardPageTitle subName="Customers" title="Customer Overview" />
      <Row>
        <Col xl={8} lg={12}>
          <CustomersDetails />
          <Card>
            <CardBody>
              <Row>
                {customerData.map((customer, idx) => (
                  <Col lg={4} key={idx}>
                    <CustomerCard customer={customer} />
                  </Col>
                ))}
              </Row>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle as={"h4"}>Interested Properties (3)</CardTitle>
            </CardHeader>
          </Card>
          <Row className="mt-3">
            {propertyData.slice(0, 3).map((property, idx) => (
              <Col lg={4} key={idx}>
                <PropertyCard property={property} />
              </Col>
            ))}
          </Row>
        </Col>
        <Col xl={4} lg={12}>
          <WeeklyInquiry />
          <Transactions />
          <OwnProperty />
        </Col>
      </Row>
      <TransactionHistory />
    </>
  );
};

export default CustomerDetailsPage;
