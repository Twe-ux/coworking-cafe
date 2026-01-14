import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllFormValidation from './components/AllFormValidation';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Validation = () => {
  return (
    <>
      <DashboardPageTitle title="Form Validation" subName="Form" />
      <Row>
        <Col xl={9}>
          <AllFormValidation />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#browser-defaults", label: "Browser Defaults" },
              { link: "#custom-styles", label: "Custom Styles" },
              { link: "#server-side", label: "Server side" },
              { link: "#supported-elements", label: "Supported Elements" },
              { link: "#tooltips", label: "Tooltips" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Validation;
