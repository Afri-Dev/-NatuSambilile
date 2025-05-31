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

// Gender-specific colors with better contrast
const GENDER_COLORS: Record<string, string> = {
  'male': '#3b82f6',    // blue-500
  'female': '#ec4899',  // pink-500
  'other': '#8b5cf6',   // violet-500
  'not-specified': '#6b7280', // gray-500
  'prefer-not-to-say': '#94a3b8', // slate-400
  'non-binary': '#10b981' // emerald-500
};

// Fallback colors for other cases
const DEFAULT_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
  index,
  payload
}: any) => {
  const RADIAN = Math.PI / 180;
  // Position the label at the edge of the chart
  const radius = outerRadius + 30;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // Only show label if segment is large enough
  if (percent < 0.05) return null;

  // Calculate text anchor based on angle
  const textAnchor = Math.cos(midAngle * RADIAN) >= 0 ? 'start' : 'end';
  const labelX = x + (Math.cos(midAngle * RADIAN) >= 0 ? 5 : -5);

  return (
    <g>
      <text
        x={labelX}
        y={y}
        fill="#4b5563"
        textAnchor={textAnchor}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
      <line
        x1={cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN)}
        y1={cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN)}
        x2={x - (Math.cos(midAngle * RADIAN) >= 0 ? 5 : -5)}
        y2={y}
        stroke="#94a3b8"
        strokeWidth={1}
      />
    </g>
  );
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
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                nameKey="label"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`}
                    fill={GENDER_COLORS[entry.label.toLowerCase()] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string, props: any) => {
                  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return (
                    <div className="bg-white p-2 rounded shadow-lg border border-gray-200">
                      <p className="font-semibold text-gray-800">{props.payload.label}</p>
                      <p className="text-gray-700">{value} users</p>
                      <p className="text-gray-500 text-sm">{percentage}% of total</p>
                    </div>
                  );
                }}
                contentStyle={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  boxShadow: 'none',
                  padding: 0
                }}
              />
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
