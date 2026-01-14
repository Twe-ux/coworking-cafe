import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllCandlestickCharts from './components/AllCandlestickCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const CandlestickCharts = () => {
  return (
    <>
      <DashboardPageTitle title="Candlestick" subName="Charts" />
      <Row>
        <Col xl={9}>
          <AllCandlestickCharts />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#simple", label: "Simple Candlestick Chart" },
              { link: "#x-axis", label: "Category X-Axis" },
              { link: "#line", label: "Candlestick with Line" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default CandlestickCharts;
