import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllPagination from './components/AllPagination';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Pagination = () => {
  return (
    <>
      <DashboardPageTitle subName="UI" title="Pagination" />
      <Row>
        <Col xl={9}>
          <AllPagination />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#default-buttons", label: "Default Pagination" },
              { link: "#rounded-pagination", label: "Rounded Pagination" },
              { link: "#alignment", label: "Alignment" },
              { link: "#sizing", label: "Sizing" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Pagination;
