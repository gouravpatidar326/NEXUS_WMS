import { Search, X } from 'lucide-react';

export const SearchBar = ({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search records...',
  className = '',
}) => {
  return (
    <div className={`relative w-full flex-1 sm:max-w-md ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border border-surface-300 dark:border-surface-700 focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
      />
      {value && (
        <button
          onClick={() => {
            if (onClear) onClear();
            else if (onChange) onChange('');
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-surface-400 hover:text-surface-600 rounded-md"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
