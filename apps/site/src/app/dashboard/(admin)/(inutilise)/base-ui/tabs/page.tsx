import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import AllNavTabs from './components/AllNavTabs';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Tabs = () => {
  return (
    <>
      <Row>
        <Col xl={9}>
          <AllNavTabs />
        </Col>

        <Col xl={3}>
          <UIExamplesList
            examples={[
              { link: "#default", label: "Nav Tabs" },
              { link: "#tab-justify", label: "Tabs Justify" },
              { link: "#nav-pills", label: "Nav Pills" },
              { link: "#pills-justify", label: "Pills Justified" },
              { link: "#tab-vertical-left", label: "Tabs Vertical Left" },
              { link: "#tab-vertical-right", label: "Tabs Vertical right" },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Tabs;
