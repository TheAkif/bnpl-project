import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function TotalRevenueChart({ totalRevenue }) {
  const data = {
    labels: ['Total Revenue'],
    datasets: [
      {
        label: 'Revenue (SAR)',
        data: [totalRevenue],
        backgroundColor: context => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top
          );
          gradient.addColorStop(0, '#6B46C1');
          gradient.addColorStop(1, '#9F7AEA');
          return gradient;
        },
        borderRadius: 8,
        barThickness: 24,
      },
    ],
  };

  const options = {
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: '#E2E8F0' },
      },
      y: {
        grid: { display: false },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A202C',
        titleColor: '#F7FAFC',
        bodyColor: '#EDF2F7',
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutCubic',
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '240px' }}>
      <Bar data={data} options={options} />
    </div>
  );
}
