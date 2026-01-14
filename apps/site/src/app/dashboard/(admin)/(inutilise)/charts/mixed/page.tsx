import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllMixedCharts from './components/AllMixedCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const MixedCharts = () => {
  return (
    <>
      <DashboardPageTitle title="Mixed" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllMixedCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#line-column", label: "Line & Column Chart" },
              { link: "#multiple-yaxis", label: "Multiple Y-Axis Chart" },
              { link: "#line-area", label: "Line & Area Chart" },
              { link: "#all", label: "Line, Column & Area Chart" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default MixedCharts;
