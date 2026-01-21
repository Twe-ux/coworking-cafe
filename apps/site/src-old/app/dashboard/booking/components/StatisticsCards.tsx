"use client";

import { useEffect, useState } from "react";
import { Row, Col, Card } from "react-bootstrap";
import { Icon } from "@iconify/react";

interface BookingStats {
  todayReservations: number;
  monthlyRevenue: number;
  occupancyRate: number;
}

const StatisticsCards = () => {
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/booking/stats");
      const data = await response.json();

      if (data.success) {
        setStats({
          todayReservations: data.data.todayReservations,
          monthlyRevenue: data.data.monthlyRevenue,
          occupancyRate: data.data.occupancyRate,
        });
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Row className="mb-4">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <Card>
              <Card.Body>
                <div className="placeholder-glow">
                  <span className="placeholder col-12"></span>
                  <span className="placeholder col-8"></span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row className="mb-4">
      {/* Today's Reservations */}
      <Col md={4}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center">
                  <Icon icon="ri:calendar-check-line" className="text-primary" width={24} />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <p className="text-muted mb-1 text-uppercase fw-semibold fs-12">
                  Réservations du jour
                </p>
                <h4 className="mb-0">{stats?.todayReservations || 0}</h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Monthly Revenue */}
      <Col md={4}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm rounded-circle bg-success bg-opacity-10 d-flex align-items-center justify-content-center">
                  <Icon icon="ri:money-euro-circle-line" className="text-success" width={24} />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <p className="text-muted mb-1 text-uppercase fw-semibold fs-12">CA du mois</p>
                <h4 className="mb-0">{(stats?.monthlyRevenue || 0).toFixed(2)}€</h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>

      {/* Occupancy Rate */}
      <Col md={4}>
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex align-items-center">
              <div className="flex-shrink-0">
                <div className="avatar-sm rounded-circle bg-info bg-opacity-10 d-flex align-items-center justify-content-center">
                  <Icon icon="ri:bar-chart-line" className="text-info" width={24} />
                </div>
              </div>
              <div className="flex-grow-1 ms-3">
                <p className="text-muted mb-1 text-uppercase fw-semibold fs-12">
                  Taux d'occupation
                </p>
                <h4 className="mb-0">{stats?.occupancyRate || 0}%</h4>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default StatisticsCards;
