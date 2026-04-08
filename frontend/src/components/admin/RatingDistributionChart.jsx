import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const RatingDistributionChart = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.parsed.y} reviews`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  const chartData = {
    labels: Object.keys(data).map(
      (rating) => `${rating} Star${rating > 1 ? "s" : ""}`
    ),
    datasets: [
      {
        label: "Number of Reviews",
        data: Object.values(data),
        backgroundColor: [
          "rgba(239, 68, 68, 0.7)", // Red for 1 star
          "rgba(249, 115, 22, 0.7)", // Orange for 2 stars
          "rgba(234, 179, 8, 0.7)", // Yellow for 3 stars
          "rgba(101, 163, 13, 0.7)", // Lime for 4 stars
          "rgba(234, 179, 8, 1)", // Gold for 5 stars
        ],
        borderColor: [
          "rgba(239, 68, 68, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(234, 179, 8, 1)",
          "rgba(101, 163, 13, 1)",
          "rgba(234, 179, 8, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
};

export default RatingDistributionChart;
