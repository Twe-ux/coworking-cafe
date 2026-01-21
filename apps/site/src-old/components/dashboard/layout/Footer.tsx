import { currentYear } from "../../../context/constants";
import Link from "next/link";
import { Col, Container, Row } from "react-bootstrap";
import IconifyIcon from "../wrappers/IconifyIcon";

const Footer = () => {
  return (
    <footer className="footer">
      <Container fluid>
        <Row>
          <Col xs={12} className="text-center">
            {currentYear} © CoworKing Café by Anticafé. Crafted by{" "}
            <IconifyIcon
              icon="solar:hearts-bold-duotone"
              className="fs-18 align-middle text-danger"
            />{" "}
            <Link href="" className="fw-bold footer-text" target="_blank">
              Twe-Ux
            </Link>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
