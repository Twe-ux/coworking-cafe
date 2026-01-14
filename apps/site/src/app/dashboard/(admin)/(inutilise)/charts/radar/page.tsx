import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllRadarCharts from './components/AllRadarCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const RadarCharts = () => {
  return (
    <>
      <DashboardPageTitle title="Radar" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllRadarCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { label: "Basic Radar Chart", link: "#basic" },
              { label: "Radar with Polygon-fill", link: "#polygon" },
              { label: "Radar – Multiple Series", link: "#multiple-series" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default RadarCharts;
