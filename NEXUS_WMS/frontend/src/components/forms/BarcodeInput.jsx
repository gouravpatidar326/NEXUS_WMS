import { useState } from 'react';
import { Barcode, ScanLine } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export const BarcodeInput = ({ onScan, placeholder = 'Scan or type barcode/SKU...' }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && onScan) {
      onScan(value.trim());
      setValue('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        leftIcon={Barcode}
        className="font-mono text-sm tracking-wider"
      />
      <Button type="submit" leftIcon={ScanLine} variant="primary">
        Scan
      </Button>
    </form>
  );
};

export default BarcodeInput;
