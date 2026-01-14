import DashboardPageTitle from "@/components/dashboard/DashboardPageTitle";
import IconifyIcon from "@/components/dashboard/wrappers/IconifyIcon";
import { Metadata } from "next";
import { Card, CardHeader, Col, Row } from "react-bootstrap";
import AgentList from './components/AgentList';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

const ListViewPage = () => {
  return (
    <>
      <DashboardPageTitle subName="Real Estate" title="Agent List" />
      <Row>
        <Col lg={12}>
          <Card>
            <CardHeader className="border-0">
              <Row className="justify-content-between">
                <Col lg={6}>
                  <Row className="align-items-center">
                    <Col lg={6}>
                      <form className="app-search d-none d-md-block me-auto">
                        <div className="position-relative">
                          <input
                            type="search"
                            className="form-control"
                            placeholder="Search Agent"
                            autoComplete="off"
                          />
                          <IconifyIcon
                            icon="solar:magnifer-broken"
                            className="search-widget-icon"
                          />
                        </div>
                      </form>
                    </Col>
                    <Col lg={4}>
                      <h5 className="text-dark fw-medium mb-0">
                        311 <span className="text-muted"> Agent</span>
                      </h5>
                    </Col>
                  </Row>
                </Col>
                <Col lg={6}>
                  <div className="text-md-end mt-3 mt-md-0">
                    <button
                      type="button"
                      className="btn btn-outline-primary me-2"
                    >
                      <IconifyIcon icon="ri:settings-2-line" className="me-1" />
                      More Setting
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-primary me-2"
                    >
                      <IconifyIcon icon="ri:filter-line" className="me-1" />{" "}
                      Filters
                    </button>
                    <button type="button" className="btn btn-success me-1">
                      <IconifyIcon icon="ri:add-line" /> New Agent
                    </button>
                  </div>
                </Col>
              </Row>
            </CardHeader>
          </Card>
        </Col>
      </Row>
      <AgentList />
    </>
  );
};

export default ListViewPage;
