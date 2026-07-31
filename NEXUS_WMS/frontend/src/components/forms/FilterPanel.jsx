import { Filter, X, RotateCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export const FilterPanel = ({
  filters = [],
  values = {},
  onChange,
  onReset,
  isOpen,
  onToggle,
}) => {
  const activeCount = Object.values(values).filter((v) => v !== '' && v !== null && v !== undefined).length;

  return (
    <div className="relative">
      <Button
        variant="outline"
        leftIcon={Filter}
        onClick={onToggle}
        className="relative"
      >
        <span>Filters</span>
        {activeCount > 0 && (
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary-600 text-white rounded-full">
            {activeCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-900 rounded-xl shadow-xl border border-surface-200 dark:border-surface-800 p-4 z-40 animate-slide-up space-y-4">
          <div className="flex items-center justify-between border-b border-surface-100 dark:border-surface-800 pb-2">
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white flex items-center gap-2">
              <Filter className="h-4 w-4 text-primary-600" /> Filter Records
            </h4>
            <button
              onClick={onToggle}
              className="text-surface-400 hover:text-surface-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {filters.map((f) => (
              <div key={f.key} className="space-y-1">
                <label className="block text-xs font-medium text-surface-700 dark:text-surface-300">
                  {f.label}
                </label>
                {f.type === 'select' ? (
                  <select
                    value={values[f.key] || ''}
                    onChange={(e) => onChange(f.key, e.target.value)}
                    className="w-full py-1.5 px-2.5 text-xs bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border border-surface-300 dark:border-surface-700"
                  >
                    <option value="">All {f.label}s</option>
                    {f.options.map((opt) => {
                      const val = typeof opt === 'object' ? opt.value : opt;
                      const lbl = typeof opt === 'object' ? opt.label : opt;
                      return (
                        <option key={val} value={val}>
                          {lbl}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={values[f.key] || ''}
                    onChange={(e) => onChange(f.key, e.target.value)}
                    placeholder={f.placeholder || `Filter by ${f.label}`}
                    className="w-full py-1.5 px-2.5 text-xs bg-surface-50 dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border border-surface-300 dark:border-surface-700"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-100 dark:border-surface-800">
            <button
              onClick={onReset}
              className="text-xs text-surface-500 hover:text-surface-800 dark:hover:text-surface-200 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" /> Reset all
            </button>
            <Button size="sm" onClick={onToggle}>
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
