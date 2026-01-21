import { Icon } from "@iconify/react";
import { Card } from "react-bootstrap";

interface SpaceConfiguration {
  spaceType: string;
  name: string;
  pricing: any;
  minCapacity: number;
  maxCapacity: number;
}

interface CalendarLegendProps {
  spaceConfigurations: SpaceConfiguration[];
  spaceTypeColors: Record<string, string>;
}

const CalendarLegend: React.FC<CalendarLegendProps> = ({
  spaceConfigurations,
  spaceTypeColors,
}) => {
  return (
    <Card
      className="border-0 shadow-sm mt-3"
      style={{ borderRadius: "16px", overflow: "hidden" }}
    >
      <Card.Body className="p-3">
        <div className="row align-items-center">
          <div className="col-md-8 mb-3 mb-md-0">
            <div className="d-flex align-items-center mb-3">
              <Icon
                icon="ri:palette-line"
                width={20}
                className="me-2 text-primary"
              />
              <h6 className="mb-0 fw-semibold">Types d&apos;espaces</h6>
            </div>
            <div className="d-flex flex-wrap gap-2">
              {spaceConfigurations.map((config) => {
                const color = spaceTypeColors[config.spaceType] || "#667eea";
                return (
                  <div
                    key={config.spaceType}
                    className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                    style={{
                      background: `${color}15`,
                      border: `1px solid ${color}30`,
                      fontSize: "0.8125rem",
                      fontWeight: 500,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: color,
                        marginRight: "8px",
                      }}
                    />
                    {config.name}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="col-md-4">
            <div className="d-flex align-items-center mb-3">
              <Icon
                icon="ri:flag-line"
                width={20}
                className="me-2 text-primary"
              />
              <h6 className="mb-0 fw-semibold">Statuts</h6>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <div
                className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                style={{
                  background: "#10B98115",
                  border: "1px solid #10B98130",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                <span
                  className="me-2"
                  style={{ fontSize: "14px", color: "#10B981" }}
                >
                  ✓
                </span>
                Confirmée
              </div>
              <div
                className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                style={{
                  background: "#F59E0B15",
                  border: "1px solid #F59E0B30",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                }}
              >
                <span
                  className="me-2"
                  style={{ fontSize: "14px", color: "#F59E0B" }}
                >
                  ⏱
                </span>
                En attente
              </div>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CalendarLegend;
