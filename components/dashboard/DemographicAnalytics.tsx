import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

interface DataItem {
  label: string;
  value: number;
  percentage: number;
}

interface DemographicAnalyticsProps {
  genderData: DataItem[];
  ageData: DataItem[];
}

const DemographicAnalytics: React.FC<DemographicAnalyticsProps> = ({ genderData, ageData }) => {
  // Prepare data for gender pie chart
  const genderChartData = {
    labels: genderData.map(item => item.label),
    datasets: [
      {
        data: genderData.map(item => item.value),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for age range bar chart
  const ageChartData = {
    labels: ageData.map(item => item.label),
    datasets: [
      {
        label: 'Number of Users',
        data: ageData.map(item => item.value),
        backgroundColor: 'rgba(153, 102, 255, 0.7)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'User Demographics',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // Custom legend for gender distribution
  const renderGenderLegend = () => (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</h4>
      <div className="grid grid-cols-2 gap-2">
        {genderData.map((item, index) => (
          <div key={index} className="flex items-center text-xs">
            <span 
              className="w-3 h-3 rounded-full mr-2" 
              style={{
                backgroundColor: genderChartData.datasets[0].backgroundColor[index],
                border: `1px solid ${genderChartData.datasets[0].borderColor[index]}`
              }}
            />
            <span>{item.label}: {item.value} ({item.percentage}%)</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">User Demographics</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-4">Gender Distribution</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie 
              data={genderChartData} 
              options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: 'Gender Distribution' },
                },
              }} 
            />
          </div>
          {renderGenderLegend()}
        </div>
        
        <div>
          <h3 className="text-md font-medium text-gray-700 mb-4">Age Range Distribution</h3>
          <div className="h-64">
            <Bar 
              data={ageChartData} 
              options={{
                ...chartOptions,
                indexAxis: 'y' as const,
                plugins: {
                  ...chartOptions.plugins,
                  title: { display: true, text: 'Age Range Distribution' },
                  legend: { display: false },
                },
              }} 
            />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Age Groups</h4>
            <div className="grid grid-cols-2 gap-2">
              {ageData.map((item, index) => (
                <div key={index} className="text-xs">
                  {item.label}: {item.value} ({item.percentage}%)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicAnalytics;
