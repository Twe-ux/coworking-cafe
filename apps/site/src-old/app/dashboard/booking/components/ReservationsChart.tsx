"use client";

import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ReservationData {
  date: string;
  count: number;
}

const ReservationsChart = () => {
  const [data, setData] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/booking/stats");
      const result = await response.json();

      if (result.success) {
        setData(result.data.reservationsPerDay);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "area",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#3762ea"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [50, 100, 100, 100],
      },
    },
    xaxis: {
      categories: data.map((item) => {
        const date = new Date(item.date);
        return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
      }),
      labels: {
        style: {
          colors: "#8c9097",
          fontSize: "11px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#8c9097",
          fontSize: "11px",
          fontWeight: 600,
        },
      },
    },
    grid: {
      borderColor: "#f1f1f1",
    },
    tooltip: {
      x: {
        format: "dd MMM yyyy",
      },
    },
  };

  const series = [
    {
      name: "Réservations",
      data: data.map((item) => item.count),
    },
  ];

  if (loading) {
    return (
      <Card>
        <Card.Body>
          <div className="placeholder-glow">
            <span className="placeholder col-12" style={{ height: "350px" }}></span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h5 className="card-title mb-4">Réservations par jour (30 derniers jours)</h5>
        <Chart options={chartOptions} series={series} type="area" height={350} />
      </Card.Body>
    </Card>
  );
};

export default ReservationsChart;
