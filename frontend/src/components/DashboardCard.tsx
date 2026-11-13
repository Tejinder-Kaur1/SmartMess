import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'amber';
  trend?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color = 'orange',
  trend
}) => {
  const colorMap = {
    blue: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border-blue-200/60 dark:border-blue-800/60',
    green: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60',
    orange: 'bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border-orange-200/70 dark:border-orange-800/60',
    amber: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border-amber-200/70 dark:border-amber-800/60',
    purple: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/60',
    red: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/60',
  };

  return (
    <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-sm hover:shadow-md border border-stone-200/80 dark:border-stone-800 p-5 sm:p-6 flex items-start justify-between gap-4 transition-all duration-200 group">
      <div className="space-y-1.5 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          {title}
        </p>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 dark:text-stone-100 tracking-tight">
            {value}
          </h3>
          {trend && (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200/40 dark:border-emerald-800/40">
              {trend}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs font-normal text-stone-500 dark:text-stone-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center p-3 border shrink-0 transition-transform duration-200 group-hover:scale-105 ${colorMap[color] || colorMap.orange}`}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardCard;
