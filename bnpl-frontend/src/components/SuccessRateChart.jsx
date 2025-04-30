import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function SuccessRateChart({ successRate }) {
  const paid   = successRate;
  const unpaid = 100 - successRate;

  const data = {
    labels: ['Paid %', 'Unpaid %'],
    datasets: [
      {
        data: [paid, unpaid],
        backgroundColor: ['#3182CE', '#E2E8F0'],
        hoverBackgroundColor: ['#2C5282', '#A0AEC0'],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: { size: 14 },
          color: '#4A5568',
        },
      },
      tooltip: {
        backgroundColor: '#1A202C',
        titleColor: '#F7FAFC',
        bodyColor: '#EDF2F7',
        callbacks: {
          label: ctx => `${ctx.label}: ${ctx.parsed}%`,
        },
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
    <div style={{ height: '240px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
}
