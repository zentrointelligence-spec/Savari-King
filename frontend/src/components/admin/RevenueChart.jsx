import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RevenueChart = ({ data }) => {
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 200,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
        callbacks: {
          label: function (context) {
            return `₹${context.parsed.y.toLocaleString("en-IN")}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return "₹" + value.toLocaleString("en-IN");
          },
        },
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    onResize: (chart, size) => {
      // Limiter la hauteur maximale pour éviter la croissance infinie
      if (size.height > 500) {
        chart.resize(size.width, 500);
      }
    },
  }), []);

  const chartData = useMemo(() => ({
    labels: data?.labels || [],
    datasets: [
      {
        label: "Revenue",
        data: data?.values || [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        pointRadius: 4,
        pointBackgroundColor: "white",
        pointBorderWidth: 2,
        tension: 0.3,
        fill: true,
      },
      {
        label: "Previous Period",
        data: data?.previous_values || [],
        borderColor: "rgb(156, 163, 175)",
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  }), [data]);

  if (!data || !data.labels || !data.values) {
    return <div className="flex items-center justify-center h-64 text-gray-500">No data available</div>;
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default RevenueChart;
