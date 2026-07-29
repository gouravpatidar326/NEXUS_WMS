import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';
import { batchService } from '@/services/batchService';
<<<<<<< HEAD
import { productService } from '@/services/productService';
import Modal from '@/components/ui/Modal';
=======
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import LoadingState from '@/components/feedback/LoadingState';
import { QrCode, Lock, CheckCircle2, ShieldAlert } from 'lucide-react';

export const BatchTrackingPage = () => {
  const { user } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [lots, setLots] = useState([]);
<<<<<<< HEAD
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
=======
  const [loading, setLoading] = useState(true);
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
  const [selectedLotCoa, setSelectedLotCoa] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

<<<<<<< HEAD
  // Form State
  const [formData, setFormData] = useState({
    lotId: '',
    productId: '',
    mfgDate: '',
    expiryDate: ''
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [batchesRes, productsRes] = await Promise.all([
        batchService.getBatches(),
        productService.getProducts({ pageSize: 100 })
      ]);
      setLots(batchesRes);
      setProducts(productsRes.items || productsRes); // Fix: use items property
    } catch (error) {
      console.error(error);
      notifyError('Failed to load batches');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      await batchService.createBatch(formData);
      notifySuccess('Batch added successfully!');
      setIsAddModalOpen(false);
      setFormData({ lotId: '', productId: '', mfgDate: '', expiryDate: '' });
      fetchData();
    } catch (error) {
      console.error(error);
      notifyError('Failed to add batch');
    }
  };

  const handleUnlockCoa = async (lotId) => {
    try {
      await batchService.unlockCoa(lotId, 'dummy-token');
      notifySuccess(`[Simulated Payment Gateway] $150 Payment Verified! COA Certificate unlocked for Account (${user?.email}).`);
      fetchData();
    } catch (error) {
      notifyError('Failed to unlock COA');
    }
  };

  const handleToggleQuarantine = async (lotId, currentStatus) => {
    try {
      await batchService.updateBatch(lotId, { quarantine: !currentStatus });
      notifySuccess(`Batch ${!currentStatus ? 'quarantined' : 'released from quarantine'}`);
      fetchData();
    } catch (error) {
      notifyError('Failed to update quarantine status');
    }
  };

  const filteredLots = lots.filter((lot) =>
    lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lot.product?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative flex min-h-0 min-w-0 flex-1 flex-col space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant text-xs mb-1">
            <span>Inventory</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary font-semibold">Lot & Batch Tracking</span>
          </nav>
          <h2 className="text-3xl font-bold text-on-surface tracking-tight">Master Lot & COA Quality Tracking</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Manage product lot lifecycles, manufacture dates, and 3rd-party lab test results (COA).
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
          + Add New Batch
        </Button>
      </div>

      {/* KPI Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Active Batches</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-on-surface">{lots.length}</h3>
            <span className="text-xs text-primary font-bold flex items-center gap-1">LIVE</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">COA Lab Verified</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-emerald-600">
              {lots.filter(l => !l.coaLocked).length}
            </h3>
            <span className="text-xs text-emerald-600 font-bold">Passed</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-primary-container/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Quarantine Status</p>
            <h3 className="text-2xl font-bold text-primary mt-1">{lots.filter(l => l.quarantine).length} Units Quarantined</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">These batches cannot be shipped</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col gap-3 rounded-xl border border-outline-variant bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search lot ID or product..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs focus:outline-none focus:border-primary"
          />
        </div>
        <div className="text-xs text-on-surface-variant font-semibold">
          Showing {filteredLots.length} lot records
        </div>
      </div>

      {/* Main Data Table */}
      <div className="flex-1 bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead className="bg-surface-container">
              <tr className="border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="px-5 py-3">Lot ID</th>
                <th className="px-5 py-3">Product Name</th>
                <th className="px-5 py-3">Received / Expiry</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">3rd-Party COA Lab Test Result</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {isLoading ? (
                <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant">Loading batches...</td></tr>
              ) : filteredLots.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-on-surface-variant">No batches found. Create one to get started!</td></tr>
              ) : filteredLots.map((lot) => {
                const isUnlocked = !lot.coaLocked;
                return (
                  <tr key={lot.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-primary font-bold">{lot.lotId}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{lot.product?.name || 'Unknown Product'}</span>
                        <span className="text-xs text-on-surface-variant font-mono">{lot.product?.sku}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">
                      <div>Rec: {lot.mfgDate ? new Date(lot.mfgDate).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-red-600 font-bold">Exp: {lot.expiryDate ? new Date(lot.expiryDate).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-5 py-4">
                      {lot.quarantine ? (
                         <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">QUARANTINED</span>
                      ) : (
                         <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-green-100 text-green-800">ACTIVE</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {isUnlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            COA UNLOCKED (Passed)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">lock</span>
                            COA LOCKED (Payment Required)
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 flex flex-col gap-2 justify-end items-end">
                      {isUnlocked ? (
                        <button
                          onClick={() => setSelectedLotCoa(lot)}
                          className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer w-full max-w-[160px]"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockCoa(lot.id)}
                          className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer w-full max-w-[160px]"
                        >
                          Pay $150 to Unlock COA
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleQuarantine(lot.id, lot.quarantine)}
                        className={`px-3 py-1 border rounded text-xs font-bold transition-colors cursor-pointer w-full max-w-[160px] ${lot.quarantine ? 'border-green-600 text-green-600 hover:bg-green-50' : 'border-red-600 text-red-600 hover:bg-red-50'}`}
                      >
                        {lot.quarantine ? 'Remove Quarantine' : 'Quarantine'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Batch Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Batch"
      >
        <form onSubmit={handleAddBatch} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Lot / Batch ID *</label>
            <input
              required
              type="text"
              value={formData.lotId}
              onChange={e => setFormData({...formData, lotId: e.target.value})}
              className="w-full p-2 border border-outline-variant rounded-md focus:outline-none focus:border-primary"
              placeholder="e.g. LOT-89302"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">Product *</label>
            <select
              required
              value={formData.productId}
              onChange={e => setFormData({...formData, productId: e.target.value})}
              className="w-full p-2 border border-outline-variant rounded-md focus:outline-none focus:border-primary"
            >
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Mfg Date</label>
              <input
                type="date"
                value={formData.mfgDate}
                onChange={e => setFormData({...formData, mfgDate: e.target.value})}
                className="w-full p-2 border border-outline-variant rounded-md focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full p-2 border border-outline-variant rounded-md focus:outline-none focus:border-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary">Create Batch</Button>
          </div>
        </form>
      </Modal>

      {/* COA Certificate Details Modal */}
      {selectedLotCoa && (
        <Modal
          isOpen={!!selectedLotCoa}
          onClose={() => setSelectedLotCoa(null)}
          title={`Official COA Lab Test Result — Lot ${selectedLotCoa.lotId}`}
          size="md"
          footer={
            <Button variant="primary" onClick={() => setSelectedLotCoa(null)}>
              Close Lab Certificate
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-600 text-3xl">verified</span>
                <div>
                  <h4 className="font-bold text-sm text-emerald-900">Certificate of Analysis (Verified)</h4>
                  <p className="text-xs text-emerald-700">LabCorp Inc. • Certificate #COA-{selectedLotCoa.lotId}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full">PASSED</span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Product</span>
                <span className="font-bold text-slate-800">{selectedLotCoa.product?.name}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Assay Purity Score</span>
                <span className="font-bold text-emerald-600">99.8% (Grade A)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Heavy Metals Test</span>
                <span className="font-bold text-slate-800">Below Detection Limit (&lt;0.01 ppm)</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Microbiological Screen</span>
                <span className="font-bold text-slate-800">Negative / Clean</span>
              </div>
            </div>

            <div className="p-3 border border-outline-variant rounded-lg flex justify-between items-center bg-white">
              <span className="text-xs font-semibold text-slate-700">Official Signed PDF Document</span>
              <button
                onClick={() => notifySuccess(`Downloading COA_${selectedLotCoa.lotId}_Report.pdf...`)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
=======
  const fetchLots = async () => {
    try {
      setLoading(true);
      const data = await batchService.getBatches();
      setLots(data || []);
    } catch {
      notifyError('Failed to fetch lot & batch tracking data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLots();
  }, []);

  const handleUnlockCoa = async (lot) => {
    try {
      await batchService.updateLotStatus(lot.id, 'RELEASED');
      notifySuccess(`Payment Verified! 3rd-Party Lab COA Certificate unlocked for Lot ${lot.lotNumber || lot.lotId}.`);
      fetchLots();
    } catch (err) {
      notifyError('Failed to unlock COA certificate');
    }
  };

  const columns = [
    {
      header: 'Lot / Batch Number',
      accessor: 'lotNumber',
      cell: (row) => (
        <span className="font-mono font-bold text-primary flex items-center gap-1">
          <QrCode className="w-3.5 h-3.5" />
          {row.lotNumber || row.lotId}
        </span>
      ),
    },
    {
      header: 'Product Name & SKU',
      accessor: 'product',
      cell: (row) => (
        <div>
          <span className="font-semibold block">{row.product?.name || 'Inbound Product'}</span>
          <span className="text-[11px] font-mono text-slate-500">{row.product?.sku || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Mfg & Expiry Date',
      accessor: 'expiryDate',
      cell: (row) => (
        <div className="text-xs font-mono">
          <div>Mfg: {row.mfgDate ? new Date(row.mfgDate).toLocaleDateString() : 'N/A'}</div>
          <div className="text-red-600 font-bold">Exp: {row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : 'N/A'}</div>
        </div>
      ),
    },
    {
      header: 'Accepted Quantity',
      accessor: 'acceptedQty',
      cell: (row) => <span className="font-bold text-primary">{row.acceptedQty || 0} Units</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (row) => (
        <Badge variant={row.status === 'RELEASED' ? 'success' : row.status === 'QUARANTINE' ? 'warning' : 'danger'} dot>
          {row.status}
        </Badge>
      ),
    },
    {
      header: '3rd-Party COA Lab Test',
      accessor: 'coaLocked',
      cell: (row) => (
        <div>
          {!row.coaLocked || row.status === 'RELEASED' ? (
            <Button size="sm" variant="success" onClick={() => setSelectedLotCoa(row)}>
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> View COA Certificate
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={() => handleUnlockCoa(row)}>
              <Lock className="w-3.5 h-3.5 mr-1 text-amber-600" /> Unlock COA ($150)
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading Master Lot & COA Quality Tracking Data..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Master Lot & COA Quality Tracking"
        description="Manage product lot lifecycles, manufacture dates, and 3rd-party lab test results (COA)"
        breadcrumbs={[{ label: 'Inventory' }, { label: 'Lot & Batch Tracking' }]}
      />

      <div className="flex-1">
        <DataTable columns={columns} data={lots} />
      </div>

      {/* COA Certificate Viewer Modal */}
      <Modal
        isOpen={!!selectedLotCoa}
        onClose={() => setSelectedLotCoa(null)}
        title={`COA Test Result Certificate - Lot ${selectedLotCoa?.lotNumber || selectedLotCoa?.lotId}`}
        size="md"
        footer={
          <Button variant="primary" onClick={() => setSelectedLotCoa(null)}>Close</Button>
        }
      >
        {selectedLotCoa && (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
              <div>
                <h4 className="font-bold text-green-900 text-sm">3rd-Party ISO/IEC 17025 Accredited Laboratory Verification</h4>
                <p className="text-xs text-green-700">Certificate Status: VERIFIED & PASSED</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Certificate ID:</span>
                <span className="font-bold text-slate-800">{selectedLotCoa.testCertificateId || `COA-${selectedLotCoa.id?.substring(0, 8)}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Purity Assay Grade:</span>
                <span className="font-bold text-green-600">99.85% (HPLC Tested)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heavy Metals Screening:</span>
                <span className="font-bold text-green-600">PASSED (&lt;0.01 ppm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Microbial Contamination:</span>
                <span className="font-bold text-green-600">NEGATIVE (Zero Colony Units)</span>
              </div>
>>>>>>> 7511d25f4dcd52580c3fa16211aba1fcfc509b36
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
};

export default BatchTrackingPage;
