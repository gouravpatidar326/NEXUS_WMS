import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import { useNotification } from '@/contexts/NotificationContext';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export const BatchTrackingPage = () => {
  const { user } = useAuth();
  const { lots, isCoaUnlockedForClient, unlockCoaForClient } = useWmsStore();
  const { notifySuccess } = useNotification();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLotCoa, setSelectedLotCoa] = useState(null);

  const handleUnlockCoa = (lotId) => {
    unlockCoaForClient(lotId, user?.email || 'sam@acmecorp.com');
    notifySuccess(`[Simulated Payment Gateway] $150 Payment Verified! COA Certificate unlocked for Account (${user?.email || 'sam@acmecorp.com'}).`);
  };

  const filteredLots = lots.filter((lot) =>
    lot.lotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.location.toLowerCase().includes(searchTerm.toLowerCase())
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
      </div>

      {/* KPI Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">Active Batches</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-on-surface">{lots.length + 1280}</h3>
            <span className="text-xs text-primary font-bold flex items-center gap-1">+4.2%</span>
          </div>
        </div>

        <div className="bg-white border border-outline-variant p-4 rounded-xl shadow-sm">
          <p className="text-xs text-on-surface-variant font-semibold uppercase tracking-wider">COA Lab Verified</p>
          <div className="flex items-end justify-between mt-2">
            <h3 className="text-2xl font-bold text-emerald-600">
              {lots.filter(l => isCoaUnlockedForClient(l, user?.email)).length + 850}
            </h3>
            <span className="text-xs text-emerald-600 font-bold">100% Passed</span>
          </div>
        </div>

        <div className="md:col-span-2 bg-primary-container/10 border border-primary/20 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs text-primary font-semibold uppercase tracking-wider">Quarantine & Testing Status</p>
            <h3 className="text-2xl font-bold text-primary mt-1">156 Units</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">3rd-Party Lab Results Gated via Payment Verification</p>
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
            placeholder="Search lot ID, product, or location..."
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
                <th className="px-5 py-3 text-right">Qty</th>
                <th className="px-5 py-3">Location</th>
                <th className="px-5 py-3">3rd-Party COA Lab Test Result</th>
                <th className="px-5 py-3 text-right">COA Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant text-sm">
              {filteredLots.map((lot) => {
                const isUnlocked = isCoaUnlockedForClient(lot, user?.email || 'sam@acmecorp.com');
                return (
                  <tr key={lot.lotId} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs text-primary font-bold">{lot.lotId}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">{lot.productName}</span>
                        <span className="text-xs text-on-surface-variant font-mono">{lot.testCertificateId}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant">
                      <div>Rec: {lot.receivedDate}</div>
                      <div className="text-red-600 font-bold">Exp: {lot.expiryDate}</div>
                    </td>
                    <td className="px-5 py-4 text-right font-mono font-bold text-on-surface">{lot.qty}</td>
                    <td className="px-5 py-4 text-xs text-on-surface-variant font-mono">{lot.location}</td>
                    <td className="px-5 py-4">
                      {isUnlocked ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                            COA UNLOCKED (Passed)
                          </span>
                          <span className="text-xs text-slate-500 font-mono">Purity: {lot.purityScore}</span>
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
                    <td className="px-5 py-4 text-right">
                      {isUnlocked ? (
                        <button
                          onClick={() => setSelectedLotCoa(lot)}
                          className="px-3 py-1 bg-primary/10 text-primary rounded text-xs font-bold hover:bg-primary/20 transition-colors cursor-pointer"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnlockCoa(lot.lotId)}
                          className="px-3 py-1 bg-amber-600 text-white rounded text-xs font-bold hover:bg-amber-700 transition-colors shadow-sm cursor-pointer"
                        >
                          Pay $150 to Unlock COA
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

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
                  <p className="text-xs text-emerald-700">{selectedLotCoa.labName} • Certificate #{selectedLotCoa.testCertificateId}</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-full">PASSED</span>
            </div>

            <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Product</span>
                <span className="font-bold text-slate-800">{selectedLotCoa.productName}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg">
                <span className="text-slate-500 block">Assay Purity Score</span>
                <span className="font-bold text-emerald-600">{selectedLotCoa.purityScore} (Grade A)</span>
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
                onClick={() => notifySuccess(`Downloading ${selectedLotCoa.testCertificateId}_Report.pdf...`)}
                className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BatchTrackingPage;
