import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllOffcanvas from './components/AllOffcanvas';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Offcanvas = () => {
  return (
    <>
      <DashboardPageTitle subName="UI" title="Offcanvas" />
      <Row>
        <Col xl={9}>
          <AllOffcanvas />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { label: "Default Offcanvas", link: "#default" },
              { label: "Static Backdrop", link: "#static-backdrop" },
              { label: "Offcanvas Position", link: "#offcanvas-position" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Offcanvas;
