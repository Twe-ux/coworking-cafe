"use client";

import { useEffect } from "react";
import { Row, Col } from "react-bootstrap";
import { useTopbarContext } from "../../../context/useTopbarContext";
import StatisticsCards from "./components/StatisticsCards";
import ReservationsChart from "./components/ReservationsChart";
import RevenueChart from "./components/RevenueChart";
import RecentReservations from "./components/RecentReservations";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const BookingOverviewPage = () => {
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle("Booking Overview");
    setPageActions(null);

    return () => {
      setPageTitle("Dashboard");
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  return (
    <>
      {/* Statistics Cards */}
      <StatisticsCards />

      {/* Charts */}
      <Row>
        <Col lg={6}>
          <ReservationsChart />
        </Col>
        <Col lg={6}>
          <RevenueChart />
        </Col>
      </Row>

      {/* Recent Reservations */}
      <Row>
        <Col xs={12}>
          <RecentReservations />
        </Col>
      </Row>
    </>
  );
};

export default BookingOverviewPage;
