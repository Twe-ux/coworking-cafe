import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import UIExamplesList from "@/components/dashboard/UIExamplesList";
import type { Metadata } from "next";
import { Col, Row } from "react-bootstrap";
import AllClipboards from './components/AllClipboards';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const Clipboard = () => {
  return (
    <>
      <DashboardPageTitle title="Clipboard" subName="Form" />
      <Row>
        <Col xl={9}>
          <AllClipboards />
        </Col>
        <Col xl={3}>
          <UIExamplesList
            examples={[
              {
                link: "#copy-from-element",
                label: "Copy text from another element",
              },
              {
                link: "#cut-from-element",
                label: "Cut text from another element",
              },
              {
                link: "#copy-from-attribute",
                label: "Copy text from attribute",
              },
            ]}
          />
        </Col>
      </Row>
    </>
  );
};

export default Clipboard;
