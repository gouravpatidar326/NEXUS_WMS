import { useState } from 'react';
import { Barcode, Printer, QrCode, ScanLine, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import BarcodeInput from '@/components/forms/BarcodeInput';
import Button from '@/components/ui/Button';

export const BarcodePage = () => {
  const { user } = useAuth();
  const { moveBarcodeLocation, movements } = useWmsStore();
  const { notifySuccess } = useNotification();

  const [activeCode, setActiveCode] = useState('8901234567890');
  const [scannedBin, setScannedBin] = useState('B1-A4-02');

  const handleScan = (code) => {
    setActiveCode(code);
    moveBarcodeLocation(code, scannedBin, user);
    notifySuccess(`Barcode ${code} scanned! Warehouse location assigned to Bin ${scannedBin}.`);
  };

  const handleUpdateBinLocation = () => {
    moveBarcodeLocation(activeCode, scannedBin, user);
    notifySuccess(`Bin Location for SKU ${activeCode} updated to ${scannedBin}!`);
  };

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Barcode Scanning & Location Movement"
        description="Scan product/lot barcodes, assign warehouse rack/bin locations, and log movement history in real-time"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Barcode Management' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Scanner Simulation Card */}
        <div className="card flex flex-col space-y-4 p-4 sm:space-y-6 sm:p-6 lg:col-span-1">
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Live Barcode Reader</h3>
              <p className="text-xs text-on-surface-variant">Simulate hardware handheld scanner</p>
            </div>
          </div>

          <BarcodeInput onScan={handleScan} />

          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-low p-3 text-center sm:p-6">
            <div className="inline-block p-4 bg-white rounded-xl shadow-md border border-outline-variant">
              {/* Visual Barcode Graphic */}
              <div className="mx-auto mb-2 h-16 w-full max-w-64 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)]"></div>
              <span className="font-mono text-sm font-bold tracking-widest text-on-surface">
                {activeCode}
              </span>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <p className="font-bold text-on-surface">Scanned Target Code</p>
              <p className="font-mono text-primary font-bold">Active Bin: {scannedBin}</p>
            </div>

            <div className="p-3 bg-white border border-outline-variant rounded-lg text-left space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase block">Assign Target Warehouse Bin Location</label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={scannedBin}
                  onChange={(e) => setScannedBin(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-surface-container-low border border-outline-variant rounded text-xs font-mono font-bold"
                  placeholder="e.g. Bin B1-A4-02"
                />
                <button
                  onClick={handleUpdateBinLocation}
                  className="px-3 py-1.5 bg-primary text-white rounded text-xs font-bold hover:bg-primary-container transition-colors cursor-pointer"
                >
                  Confirm Move
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                leftIcon={Printer}
                onClick={() => notifySuccess('Sent Zebra 4x6 Thermal Label Print Job to Dock 2 Printer...')}
              >
                Print Label
              </Button>
              <Button
                variant="primary"
                leftIcon={QrCode}
                onClick={() => notifySuccess('Generated 2D QR Matrix Code with Barcode Payload.')}
              >
                QR Code
              </Button>
            </div>
          </div>
        </div>

        {/* Scan Movement History Table */}
        <div className="card flex min-w-0 flex-col space-y-4 p-4 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-3 border-b border-outline-variant pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-on-surface">Location Movement Audit Ledger</h3>
                <p className="text-xs text-on-surface-variant">Real-time scan logs updating warehouse bin allocations</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Barcode Reader Online
            </span>
          </div>

          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[650px]">
              <thead className="bg-surface-container text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-3">Movement Ref</th>
                  <th className="px-4 py-3">Target SKU / Code</th>
                  <th className="px-4 py-3">Action Description</th>
                  <th className="px-4 py-3">Source ➔ Target Bin</th>
                  <th className="px-4 py-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-xs">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-primary">{mov.id}</td>
                    <td className="px-4 py-3 font-semibold text-on-surface">{mov.sku}</td>
                    <td className="px-4 py-3 font-medium text-slate-700">{mov.reason}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {mov.sourceLocation} ➔ {mov.destLocation}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-500">{mov.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarcodePage;
