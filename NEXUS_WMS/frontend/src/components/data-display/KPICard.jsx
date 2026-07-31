import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const KPICard = ({
  title,
  value,
  change,
  changeType = 'neutral', // positive, negative, neutral
  period = 'vs last month',
  icon: Icon,
  iconBg = 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400',
}) => {
  return (
    <div className="card p-5 relative overflow-hidden transition-all duration-200 hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider">
            {title}
          </span>
          <div className="text-2xl font-extrabold text-surface-900 dark:text-white tracking-tight">
            {value}
          </div>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${iconBg} shadow-sm`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded ${
              changeType === 'positive'
                ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-400'
                : changeType === 'negative'
                ? 'bg-danger-100 text-danger-700 dark:bg-danger-900/40 dark:text-danger-400'
                : 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300'
            }`}
          >
            {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
            {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
            {changeType === 'neutral' && <Minus className="h-3 w-3" />}
            {change}
          </span>
          <span className="text-surface-500 dark:text-surface-400">{period}</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
