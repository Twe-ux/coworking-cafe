import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllToasts from './components/AllToasts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Toasts = () => {
  return (
    <>
      <DashboardPageTitle subName="UI" title="Toasts" />
      <Row>
        <Col xl={9}>
          <AllToasts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#basic_examples", label: "Basic Examples" },
              { link: "#live_example", label: "Live example" },
              { link: "#default_buttons", label: "Staking" },
              { link: "#custom_content", label: "Custom Content" },
              { link: "#transcluent", label: "Transcluent" },
              { link: "#placement", label: "Placement" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Toasts;
