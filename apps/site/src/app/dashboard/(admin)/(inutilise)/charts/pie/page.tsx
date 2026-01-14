import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllPieCharts from './components/AllPieCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const PieCharts = () => {
  return (
    <>
      <DashboardPageTitle title="Pie" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllPieCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#simple_pie", label: "Simple Pie Chart" },
              { link: "#simple_donut", label: "Simple Donut Chart" },
              { link: "#monochrome", label: "Monochrome Pie Area" },
              { link: "#gradient", label: "Gradient Donut Chart" },
              { link: "#patterned", label: "Patterned Donut Chart" },
              { link: "#image", label: "Pie Chart with Image fill" },
              { link: "#update", label: "Donut Update" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default PieCharts;
