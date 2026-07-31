export const ActivityCard = ({ title, timestamp, description, user, badge }) => {
  return (
    <div className="p-3.5 rounded-xl bg-surface-50 dark:bg-surface-800/40 border border-surface-200/60 dark:border-surface-700/40 flex items-start justify-between gap-3">
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-surface-900 dark:text-surface-100 truncate">
            {title}
          </span>
          {badge}
        </div>
        <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2">
          {description}
        </p>
        {user && (
          <p className="text-[11px] text-surface-400 dark:text-surface-500">
            Performed by <strong className="text-surface-700 dark:text-surface-300">{user}</strong>
          </p>
        )}
      </div>
      <span className="text-[11px] text-surface-400 whitespace-nowrap shrink-0">
        {timestamp}
      </span>
    </div>
  );
};

export default ActivityCard;
