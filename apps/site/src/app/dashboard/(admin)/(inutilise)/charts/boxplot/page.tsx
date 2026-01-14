import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllBoxPlotCharts from './components/AllBoxPlotCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const metadata: Metadata = { title: "Boxplot Alert" };

const BoxPlotCharts = () => {
  return (
    <>
      <DashboardPageTitle title="Boxplot" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllBoxPlotCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#basic", label: "Basic Boxplot" },
              { link: "#scatter", label: "Scatter Boxplot" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default BoxPlotCharts;
