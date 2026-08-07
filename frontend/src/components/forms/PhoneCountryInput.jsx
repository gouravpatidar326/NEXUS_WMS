import { useState, useEffect, useRef } from 'react';
import { COUNTRIES, getCountryByDialCode } from '@/utils/countryData';
import { ChevronDown, Search } from 'lucide-react';

export const PhoneCountryInput = ({
  value = '',
  onChange,
  selectedCountryName = '',
  onCountryChange,
  placeholder = 'Enter Contact Number',
  required = false,
  className = '',
  ...props
}) => {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES.find(c => c.code === 'US') || COUNTRIES[0]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  // Sync country selection from external country change if provided
  useEffect(() => {
    if (selectedCountryName) {
      const matched = COUNTRIES.find(
        (c) => c.name.toLowerCase() === selectedCountryName.toLowerCase()
      );
      if (matched && matched.code !== selectedCountry.code) {
        setSelectedCountry(matched);
      }
    }
  }, [selectedCountryName]);

  // Parse incoming full phone value e.g. "+91 9876543210" or "9876543210"
  useEffect(() => {
    if (value) {
      const matchedCountry = COUNTRIES.find((c) => value.startsWith(c.dialCode));
      if (matchedCountry) {
        setSelectedCountry(matchedCountry);
        const numberOnly = value.replace(matchedCountry.dialCode, '').trim();
        setPhoneNumber(numberOnly);
      } else {
        setPhoneNumber(value);
      }
    } else {
      setPhoneNumber('');
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearch('');
    if (onCountryChange) {
      onCountryChange(country.name);
    }
    const fullNumber = `${country.dialCode} ${phoneNumber}`.trim();
    if (onChange) {
      onChange(fullNumber);
    }
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value;
    setPhoneNumber(rawVal);
    const fullNumber = `${selectedCountry.dialCode} ${rawVal}`.trim();
    if (onChange) {
      onChange(fullNumber);
    }
  };

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative flex items-center rounded-lg border border-surface-300 dark:border-surface-700 bg-white dark:bg-surface-800 transition duration-150 focus-within:ring-2 focus-within:ring-primary-500 ${className}`}>
      {/* Country Select Button */}
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-surface-800 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-l-lg border-r border-surface-300 dark:border-surface-700 transition-colors cursor-pointer select-none"
        >
          <span className="text-base leading-none">{selectedCountry.flag}</span>
          <span className="font-mono text-xs font-semibold">{selectedCountry.dialCode}</span>
          <ChevronDown className="w-3.5 h-3.5 text-surface-400" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute top-full left-0 mt-1 w-64 max-h-60 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-surface-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full pl-8 pr-3 py-1 text-xs bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg focus:outline-none focus:border-primary-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 custom-scrollbar">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => handleCountrySelect(c)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-primary-50 dark:hover:bg-primary-950/40 text-left transition-colors cursor-pointer ${
                    c.code === selectedCountry.code
                      ? 'bg-primary-50 text-primary-700 font-bold dark:bg-primary-950/60 dark:text-primary-300'
                      : 'text-surface-700 dark:text-surface-300'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="truncate font-medium">{c.name}</span>
                  </div>
                  <span className="font-mono text-surface-500 dark:text-surface-400 text-[11px] shrink-0 ml-2">
                    {c.dialCode}
                  </span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="p-3 text-center text-xs text-surface-400">No country found</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Phone Input */}
      <input
        type="tel"
        value={phoneNumber}
        onChange={handlePhoneChange}
        placeholder={placeholder}
        required={required}
        className="w-full py-2 px-3 text-sm bg-transparent text-surface-900 dark:text-surface-100 rounded-r-lg focus:outline-none"
        {...props}
      />
    </div>
  );
};

export default PhoneCountryInput;
