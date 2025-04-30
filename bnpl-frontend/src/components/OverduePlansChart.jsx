import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OverduePlansChart({ overduePlans, totalPlans }) {
  const onTime = totalPlans - overduePlans;

  const data = {
    labels: ["Overdue", "On-Time"],
    datasets: [
      {
        data: [overduePlans, onTime],
        backgroundColor: ["#F56565", "#48BB78"],
        hoverBackgroundColor: ["#C53030", "#2F855A"],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    cutout: "60%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          boxWidth: 12,
          padding: 20,
          font: { size: 14 },
          color: "#4A5568",
        },
      },
      tooltip: {
        backgroundColor: "#1A202C",
        titleColor: "#F7FAFC",
        bodyColor: "#EDF2F7",
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: "240px" }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
