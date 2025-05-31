import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
  iconBgClass?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  className = '',
  iconBgClass = 'bg-primary',
}) => (
  <div className={`bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 ${className}`}>
    <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center ${iconBgClass} text-white rounded-full`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-neutral-dark font-medium">{title}</p>
      <p className="text-2xl font-semibold text-primary-dark">{value}</p>
    </div>
  </div>
);

export default MetricCard;
