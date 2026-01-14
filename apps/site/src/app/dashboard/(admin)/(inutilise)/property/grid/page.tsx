import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import { Metadata } from "next";
import { Row } from "react-bootstrap";
import PropertiesData from './components/PropertiesData';
import PropertiesFilter from './components/PropertiesFilter';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const PropertyGridPage = () => {
  return (
    <>
      <DashboardPageTitle title="Listing Grid" subName="Real Estate" />
      <Row>
        <PropertiesFilter />
        <PropertiesData />
      </Row>
    </>
  );
};

export default PropertyGridPage;
