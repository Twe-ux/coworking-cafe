"use client";

import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueData {
  date: string;
  revenue: number;
}

const RevenueChart = () => {
  const [data, setData] = useState<RevenueData[]>([]);
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
        setData(result.data.revenuePerDay);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const chartOptions: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ["#10b981"],
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: "50%",
      },
    },
    dataLabels: {
      enabled: false,
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
        formatter: (value) => `${value.toFixed(0)}€`,
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
      y: {
        formatter: (value) => `${value.toFixed(2)}€`,
      },
    },
  };

  const series = [
    {
      name: "Revenus",
      data: data.map((item) => item.revenue),
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
        <h5 className="card-title mb-4">Revenus par jour (30 derniers jours)</h5>
        <Chart options={chartOptions} series={series} type="bar" height={350} />
      </Card.Body>
    </Card>
  );
};

export default RevenueChart;
