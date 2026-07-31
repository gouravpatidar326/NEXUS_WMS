import { useState } from 'react';
import { QrCode, Camera, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export const QRScannerPlaceholder = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);

  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockCode = `WMS-LOC-${Math.floor(1000 + Math.random() * 9000)}`;
      setScannedCode(mockCode);
      setIsScanning(false);
      if (onScanComplete) onScanComplete(mockCode);
    }, 1500);
  };

  return (
    <div className="card p-6 text-center space-y-4 max-w-sm mx-auto">
      <div className="relative h-48 w-full bg-surface-900 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-primary-500 overflow-hidden">
        {isScanning ? (
          <div className="space-y-3">
            <div className="absolute inset-x-0 top-0 h-1 bg-primary-500 shadow-[0_0_15px_#6366f1] animate-[bounce_2s_infinite]"></div>
            <Camera className="h-10 w-10 text-primary-400 animate-pulse mx-auto" />
            <p className="text-xs text-surface-300 font-mono">Scanning camera feed...</p>
          </div>
        ) : scannedCode ? (
          <div className="space-y-2 text-success-400">
            <CheckCircle2 className="h-10 w-10 mx-auto" />
            <p className="text-xs font-mono font-bold">{scannedCode}</p>
            <p className="text-[10px] text-surface-400">Scan Successful</p>
          </div>
        ) : (
          <div className="space-y-2 text-surface-400">
            <QrCode className="h-12 w-12 mx-auto text-surface-500" />
            <p className="text-xs">Camera Viewport Simulation</p>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={simulateScan}
        isLoading={isScanning}
      >
        {scannedCode ? 'Scan Another Code' : 'Activate Camera Scanner'}
      </Button>
    </div>
  );
};

export default QRScannerPlaceholder;
