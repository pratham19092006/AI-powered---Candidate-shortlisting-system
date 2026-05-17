import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Bar chart that highlights how each candidate scored against the current role.
export default function MatchChart({ labels = [], data = [] }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Match Score',
        data,
        borderRadius: 12,
        backgroundColor: data.map((value) => {
          if (value >= 80) return 'rgba(20, 184, 166, 0.9)';
          if (value >= 50) return 'rgba(245, 158, 11, 0.9)';
          return 'rgba(248, 113, 113, 0.9)';
        }),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: '#cbd5e1',
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.08)',
        },
      },
    },
  };

  return (
    <div className="glass-panel h-[340px] p-4 sm:p-6">
      <Bar data={chartData} options={options} />
    </div>
  );
}
