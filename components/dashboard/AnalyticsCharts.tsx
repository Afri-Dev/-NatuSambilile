import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { CSVLink } from 'react-csv';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ProgressData {
  label: string;
  value: number;
}

interface AnalyticsChartsProps {
  progressDistribution: ProgressData[];
  exportData: any[];
  totalQuizAttempts: number;
  averageQuizScore: string;
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  progressDistribution,
  exportData,
  totalQuizAttempts,
  averageQuizScore,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-primary-dark">User Progress Distribution</h3>
          <CSVLink
            data={exportData}
            filename={`user-data-${format(new Date(), 'yyyy-MM-dd')}.csv`}
            className="text-sm text-primary hover:text-primary-dark transition-colors"
          >
            <button className="flex items-center space-x-1">
              <span>Export Data</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            </button>
          </CSVLink>
        </div>
        <Bar
          data={{
            labels: progressDistribution.map((item) => item.label),
            datasets: [
              {
                label: 'Users',
                data: progressDistribution.map((item) => item.value),
                backgroundColor: [
                  'rgba(59, 130, 246, 0.7)',
                  'rgba(107, 194, 255, 0.7)',
                  'rgba(165, 213, 255, 0.7)',
                  'rgba(214, 234, 255, 0.7)',
                ],
                borderColor: 'rgb(59, 130, 246)',
                borderWidth: 1,
              },
            ],
          }}
          options={{
            responsive: true,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
            },
          }}
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold text-primary-dark mb-6">Quiz Analytics</h3>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-500 mb-1">Total Quiz Attempts</h4>
            <p className="text-2xl font-bold text-primary">{totalQuizAttempts}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-500 mb-1">Average Quiz Score</h4>
            <p className="text-2xl font-bold text-primary">{averageQuizScore}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-500 mb-1">User Distribution</h4>
            <div className="mt-2 space-y-2">
              {progressDistribution.map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-neutral-600">{item.label}</span>
                  <span className="text-sm font-medium">{item.value} users</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsCharts;
