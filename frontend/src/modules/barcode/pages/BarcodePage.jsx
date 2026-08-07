import { useState, useEffect } from 'react';
import { Printer, QrCode, ScanLine } from 'lucide-react';
import { api } from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';
import PageHeader from '@/components/navigation/PageHeader';
import BarcodeInput from '@/components/forms/BarcodeInput';
import Button from '@/components/ui/Button';
import DataTable from '@/components/data-display/DataTable';
import LoadingState from '@/components/feedback/LoadingState';

export const BarcodePage = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCode, setActiveCode] = useState('');
  const [scannedResult, setScannedResult] = useState(null);

  const fetchBarcodes = async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/barcodes');
      const items = res.data || (Array.isArray(res) ? res : []);
      setBarcodes(items);
      if (items.length > 0) {
        setActiveCode(items[0].code);
        setScannedResult(items[0]);
      }
    } catch {
      notifyError('Failed to load barcode registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBarcodes();
  }, []);

  const handleScan = async (code) => {
    setActiveCode(code);
    try {
      const res = await api.post('/v1/barcodes/scan', { code });
      setScannedResult(res.data);
      notifySuccess(`Barcode ${code} scanned successfully! Found SKU / Lot mapping.`);
      fetchBarcodes();
    } catch (err) {
      notifyError(err.message || `Barcode ${code} not found in system.`);
    }
  };

  const columns = [
    {
      header: '128-Bit Barcode Code',
      accessor: 'code',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-primary flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5" />
          {row.code}
        </span>
      ),
    },
    {
      header: 'Associated Product',
      accessor: 'product',
      cell: (row) => (
        <div>
          <span className="font-semibold block">{row.product?.name || 'Inbound Goods'}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.product?.sku || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Associated Lot',
      accessor: 'batch',
      cell: (row) => (
        <span className="font-mono text-xs font-bold text-slate-700">
          {row.batch?.lotNumber || row.batch?.lotId || row.batchId || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Barcode Format',
      accessor: 'format',
      cell: (row) => <span className="font-mono text-xs uppercase">{row.format || 'CODE128'}</span>,
    },
    {
      header: 'Tracking Status',
      accessor: 'trackingStatus',
      cell: (row) => (
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
          row.trackingStatus === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' :
          row.trackingStatus === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
          'bg-slate-100 text-slate-800'
        }`}>
          {row.trackingStatus || 'GENERATED'}
        </span>
      ),
    },
    {
      header: 'Date Generated',
      accessor: 'createdAt',
      cell: (row) => (row.createdAt ? new Date(row.createdAt).toLocaleString() : 'N/A'),
    },
  ];

  if (loading) return <LoadingState message="Loading Master Barcode Scanning Registry..." />;

  return (
    <div className="space-y-6 min-h-[calc(100vh-4rem)] flex flex-col">
      <PageHeader
        title="Barcode Scanning & Location Movement"
        description="Scan product/lot barcodes, assign warehouse rack/bin locations, and log movement history in real-time"
        breadcrumbs={[{ label: 'Operations & Logistics' }, { label: 'Barcode Management' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scanner Simulation Card */}
        <div className="card flex flex-col space-y-4 p-4 sm:space-y-6 sm:p-6 lg:col-span-1 border border-outline-variant bg-white rounded-xl shadow-sm">
          <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Live Barcode Reader</h3>
              <p className="text-xs text-on-surface-variant">Hardware handheld scanner simulator</p>
            </div>
          </div>

          <BarcodeInput onScan={handleScan} />

          <div className="space-y-4 rounded-xl border border-outline-variant bg-surface-container-low p-4 text-center">
            <div className="inline-block p-4 bg-white rounded-xl shadow-md border border-outline-variant">
              <div className="mx-auto mb-2 h-16 w-full max-w-64 bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_4px)]"></div>
              <span className="font-mono text-sm font-bold tracking-widest text-on-surface">
                {activeCode || 'SCAN_BARCODE'}
              </span>
            </div>

            {scannedResult && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-left space-y-2 text-xs mt-3">
                <p className="font-bold text-green-900 pb-1 border-b border-green-200">Scanned Item Result:</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Product</p>
                    <p className="text-slate-800 font-semibold">{scannedResult.product?.name || 'Mapped SKU'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-[10px] uppercase">Lot Ref</p>
                    <p className="text-slate-800 font-semibold">{scannedResult.batch?.lotNumber || scannedResult.batchId || 'N/A'}</p>
                  </div>
                </div>
                {scannedResult.shipStation && (
                  <div className="pt-2 mt-2 border-t border-green-200 bg-white p-2 rounded border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="material-symbols-outlined text-blue-600 text-[14px]">local_shipping</span>
                      <p className="font-bold text-slate-800 text-xs">ShipStation Tracking API</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <p className="text-slate-500">Carrier:</p>
                      <p className="font-medium text-slate-800">{scannedResult.shipStation.carrier}</p>
                      <p className="text-slate-500">Tracking #:</p>
                      <p className="font-mono font-bold text-slate-800">{scannedResult.shipStation.trackingNumber}</p>
                      <p className="text-slate-500">Status:</p>
                      <p className="font-bold text-blue-700">{scannedResult.shipStation.status}</p>
                      <p className="text-slate-500">ETA:</p>
                      <p className="font-medium text-slate-800">{scannedResult.shipStation.estimatedDelivery}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-center gap-2 pt-2">
              <Button
                variant="outline"
                leftIcon={Printer}
                onClick={() => notifySuccess(`Sent Zebra Thermal 4x6 Label Print job for ${activeCode} to Dock Printer.`)}
              >
                Print Label
              </Button>
              <Button
                variant="primary"
                leftIcon={QrCode}
                onClick={() => notifySuccess(`Generated 2D DataMatrix Payload for ${activeCode}.`)}
              >
                QR Code
              </Button>
            </div>
          </div>
        </div>

        {/* Master Barcode Table */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-base font-bold text-surface-900">Master Barcode Registry ({barcodes.length})</h3>
          <DataTable columns={columns} data={barcodes} />
        </div>
      </div>
    </div>
  );
};

export default BarcodePage;
