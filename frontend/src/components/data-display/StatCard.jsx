export const StatCard = ({ label, value, subtext, badge }) => {
  return (
    <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-200/80 dark:border-surface-700/60">
      <div className="flex items-center justify-between">
        <span className="text-xs text-surface-500 dark:text-surface-400 font-medium">
          {label}
        </span>
        {badge}
      </div>
      <div className="text-xl font-bold text-surface-900 dark:text-white mt-1">
        {value}
      </div>
      {subtext && (
        <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StatCard;
