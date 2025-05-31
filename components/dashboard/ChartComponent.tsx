import React from 'react';
import { 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell,
  TooltipProps,
  PieLabelRenderProps
} from 'recharts';

interface ChartData {
  label: string;
  value: number;
  percentage?: number;
}

interface ChartProps {
  data: ChartData[];
  type: 'pie' | 'bar';
  title: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const renderCustomizedLabel = ({ name, percent }: { name: string; percent: number }) => {
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

export const ChartComponent: React.FC<ChartProps> = ({ data, type, title }) => {
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow h-64 flex items-center justify-center">
        <p className="text-gray-500">No data available for {title}</p>
      </div>
    );
  }

  const formatTooltip = (value: number) => {
    return [`${value} users`, 'Count'] as [string, string];
  };

  const formatLabel = (label: string) => `Range: ${label}`;

  return (
    <div className="bg-white p-6 rounded-lg shadow h-96 flex flex-col">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          {type === 'pie' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="label"
                label={renderCustomizedLabel}
              >
                {data.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip formatter={formatTooltip} />
              <Legend />
            </PieChart>
          ) : (
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip 
                formatter={formatTooltip}
                labelFormatter={formatLabel}
              />
              <Legend />
              <Bar dataKey="value" name="Users" fill="#8884d8" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
