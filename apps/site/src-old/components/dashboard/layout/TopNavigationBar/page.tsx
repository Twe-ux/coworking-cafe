"use client";

import { Container } from "react-bootstrap";
import LeftSideBarToggle from "./components/LeftSideBarToggle";
import { useTopbarContext } from "../../../../context/useTopbarContext";

const page = () => {
  const { pageTitle, pageActions } = useTopbarContext();

  return (
    <header>
      <div className="topbar">
        <Container fluid>
          <div className="navbar-header">
            <div className="d-flex align-items-center gap-2">
              <LeftSideBarToggle />
              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: 600,
                  margin: 0,
                }}
              >
                {pageTitle}
              </h1>
            </div>
            <div className="d-flex align-items-center gap-2">{pageActions}</div>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default page;
