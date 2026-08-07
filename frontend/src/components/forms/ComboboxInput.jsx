import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const ComboboxInput = ({
  value = '',
  onChange,
  suggestions = [],
  onSelectSuggestion,
  placeholder = 'Select or type...',
  required = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState(value);
  const containerRef = useRef(null);

  useEffect(() => {
    setFilterText(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setFilterText(val);
    setIsOpen(true);
    if (onChange) onChange(val);
  };

  const handleSelect = (item) => {
    const itemName = typeof item === 'object' ? item.name || item.label || '' : item;
    setFilterText(itemName);
    setIsOpen(false);
    if (onChange) onChange(itemName);
    if (onSelectSuggestion) onSelectSuggestion(item);
  };

  const filteredSuggestions = suggestions.filter((item) => {
    const name = typeof item === 'object' ? item.name || item.label || '' : item;
    return name.toLowerCase().includes((filterText || '').toLowerCase());
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          value={filterText}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          required={required}
          className="w-full py-2 pl-3 pr-8 text-sm bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100 rounded-lg border border-surface-300 dark:border-surface-700 transition duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500"
          {...props}
        />
        {suggestions.length > 0 && (
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-2 text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 cursor-pointer p-1"
            tabIndex={-1}
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-full max-h-48 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50 overflow-y-auto custom-scrollbar">
          {filteredSuggestions.map((item, idx) => {
            const itemName = typeof item === 'object' ? item.name || item.label || '' : item;
            const flag = typeof item === 'object' && item.flag ? item.flag + ' ' : '';
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelect(item)}
                className="w-full text-left px-3 py-2 text-xs text-surface-800 dark:text-surface-200 hover:bg-primary-50 dark:hover:bg-primary-950/50 hover:text-primary-700 dark:hover:text-primary-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>{flag}{itemName}</span>
              </button>
            );
          })}
          {filteredSuggestions.length === 0 && (
            <div className="px-3 py-2 text-xs text-surface-400 italic">
              Type custom name...
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ComboboxInput;
