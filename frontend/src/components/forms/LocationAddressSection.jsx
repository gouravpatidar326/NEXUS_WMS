import { COUNTRIES, getCountryByName } from '@/utils/countryData';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComboboxInput from '@/components/forms/ComboboxInput';

export const LocationAddressSection = ({
  country = 'United States',
  onCountryChange,
  state = '',
  onStateChange,
  city = '',
  onCityChange,
  zipCode = '',
  onZipCodeChange,
  address = '',
  onAddressChange,
  required = true,
}) => {
  const currentCountryObj = getCountryByName(country);
  const availableStates = currentCountryObj?.states || [];

  const currentStateObj = availableStates.find(
    (s) => s.name.toLowerCase() === (state || '').toLowerCase()
  );
  const availableCities = currentStateObj?.cities || [];

  // When Country changes, update country and clear state/city/zip (or suggest first)
  const handleCountrySelect = (newCountryName) => {
    onCountryChange(newCountryName);
    onStateChange('');
    onCityChange('');
    onZipCodeChange('');
  };

  // When State changes
  const handleStateChange = (newStateName) => {
    onStateChange(newStateName);
    // If state changed to something else, clear city & zip if it doesn't match
    const matchedState = availableStates.find(
      (s) => s.name.toLowerCase() === newStateName.toLowerCase()
    );
    if (!matchedState) {
      // Custom state typed by user
    }
  };

  // When City changes
  const handleCityChange = (newCityName) => {
    onCityChange(newCityName);
    const matchedCity = availableCities.find(
      (c) => c.name.toLowerCase() === newCityName.toLowerCase()
    );
    if (matchedCity && matchedCity.zipCode) {
      onZipCodeChange(matchedCity.zipCode);
    }
  };

  return (
    <div className="space-y-4">
      {/* Street Address */}
      <FormField label="Street Address" required={required}>
        <Input
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          placeholder="e.g. 123 Logistics Way, Industrial Hub"
          required={required}
        />
      </FormField>

      {/* Country, State, City, Zip Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Country (Combobox: Suggestion Dropdown + Custom Typeable) */}
        <FormField label="Country" required={required}>
          <ComboboxInput
            value={country}
            onChange={handleCountrySelect}
            suggestions={COUNTRIES}
            placeholder="Select or type Country"
            required={required}
          />
        </FormField>

        {/* State / Region (Combobox: Suggestion Dropdown + Custom Typeable) */}
        <FormField label="State / Region" required={required}>
          <ComboboxInput
            value={state}
            onChange={handleStateChange}
            suggestions={availableStates}
            placeholder="Select or type State"
            required={required}
          />
        </FormField>

        {/* City (Combobox: Suggestion Dropdown + Custom Typeable) */}
        <FormField label="City" required={required}>
          <ComboboxInput
            value={city}
            onChange={handleCityChange}
            suggestions={availableCities}
            onSelectSuggestion={(cityObj) => {
              if (cityObj?.zipCode) onZipCodeChange(cityObj.zipCode);
            }}
            placeholder="Select or type City"
            required={required}
          />
        </FormField>

        {/* Zip / PIN Code */}
        <FormField label="Zip / PIN Code" required={required}>
          <Input
            value={zipCode}
            onChange={(e) => onZipCodeChange(e.target.value)}
            placeholder="Enter Zip / PIN Code"
            required={required}
          />
        </FormField>
      </div>
    </div>
  );
};

export default LocationAddressSection;
