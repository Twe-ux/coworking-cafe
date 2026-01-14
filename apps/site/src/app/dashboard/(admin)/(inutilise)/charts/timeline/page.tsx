import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllTimelineCharts from './components/AllTimelineCharts';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const TimelineCharts = () => {
  return (
    <Row>
      <Col xl={9}>
        <AllTimelineCharts />
      </Col>
      <Col xl={3}>
        <UIExamplesList
          examples={[
            { link: "#basic", label: "Basic Timeline" },
            { link: "#distributed", label: "Distributed Timeline" },
            { link: "#multi-series", label: "Multi Series Timeline" },
            { link: "#advanced", label: "Advanced Timeline" },
            { link: "#group-rows", label: "Multiple Series - Group Rows" },
          ]}
        />
      </Col>
    </Row>
  );
};

export default TimelineCharts;
