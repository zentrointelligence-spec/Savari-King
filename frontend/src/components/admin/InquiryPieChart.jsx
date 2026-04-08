import React, { useMemo } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const InquiryPieChart = ({ data }) => {
  const statusColors = useMemo(() => ({
    "Inquiry Pending": "rgb(234, 179, 8)",        // Yellow - En attente
    "Under Review": "rgb(168, 85, 247)",          // Purple - Sous révision
    "Quote Sent": "rgb(59, 130, 246)",            // Blue - Devis envoyé
    "Quote Expired": "rgb(156, 163, 175)",        // Gray - Devis expiré
    "Payment Confirmed": "rgb(34, 197, 94)",      // Green - Paiement confirmé
    "Cancelled": "rgb(239, 68, 68)",              // Red - Annulé
    "Trip Completed": "rgb(16, 185, 129)",        // Emerald - Voyage terminé
  }), []);

  const chartData = useMemo(() => ({
    labels: Object.keys(data || {}),
    datasets: [
      {
        data: Object.values(data || {}),
        backgroundColor: Object.keys(data || {}).map(
          (status) => statusColors[status] || "rgb(156, 163, 175)"
        ),
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  }), [data, statusColors]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 15,
          padding: 20,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.chart.getDatasetMeta(0).total;
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  }), []);

  if (!data || Object.keys(data).length === 0) {
    return <div className="flex items-center justify-center h-72 text-gray-500">No data available</div>;
  }

  return <Pie data={chartData} options={options} />;
};

export default InquiryPieChart;
