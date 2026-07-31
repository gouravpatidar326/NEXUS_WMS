import { useState } from 'react';
import { MOCK_WAREHOUSES } from '@/mock/mockData';

export const WarehousesPage = () => {
  const [warehouses, setWarehouses] = useState(MOCK_WAREHOUSES);
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = warehouses.filter((wh) =>
    wh.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    wh.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface tracking-tight">Warehouse Infrastructure</h2>
          <p className="text-sm text-on-surface-variant mt-1">Real-time status of global logistics hubs and storage capacity.</p>
        </div>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <button className="bg-white border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-surface-container-high transition-all">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-primary-container shadow-sm transition-all">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Warehouse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((wh) => (
          <div key={wh.id} className="bg-white rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group">
            {/* Warehouse Header Image */}
            <div className="h-36 w-full bg-slate-800 relative overflow-hidden">
              <div
                className="w-full h-full bg-cover bg-center opacity-70 group-hover:opacity-95 transition-all duration-500"
                style={{ backgroundImage: `url(${wh.image})` }}
              />
              <div className="absolute top-3 right-3">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-sm ${
                  wh.status === 'Operational'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {wh.status}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/80 text-white px-2 py-0.5 rounded text-[11px] font-mono">
                {wh.id}
              </div>
            </div>

            {/* Warehouse Content */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-on-surface">{wh.name}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {wh.location}
                </p>

                {/* Storage Capacity */}
                <div className="mt-4">
                  <div className="flex justify-between items-end mb-1 text-xs font-semibold">
                    <span className="text-on-surface-variant">Storage Capacity</span>
                    <span className={`font-bold ${wh.capacityPercent > 90 ? 'text-red-600' : 'text-primary'}`}>
                      {wh.capacityPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        wh.capacityPercent > 90 ? 'bg-red-600' : 'bg-primary'
                      }`}
                      style={{ width: `${wh.capacityPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Manager & Staff Footer */}
              <div className="mt-5 grid grid-cols-2 gap-4 border-t border-outline-variant pt-4">
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Manager</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                      {wh.manager.slice(0, 1)}
                    </span>
                    <span className="text-xs font-semibold text-on-surface">{wh.manager}</span>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase">Active Staff</p>
                  <p className="text-xs font-semibold text-on-surface mt-1">{wh.activeStaff}</p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Provision New Hub Card */}
        <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center text-center min-h-[300px] hover:border-primary transition-colors cursor-pointer bg-surface-container-low">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
            <span className="material-symbols-outlined text-2xl">add_location_alt</span>
          </div>
          <h4 className="font-bold text-on-surface text-base">Provision New Hub</h4>
          <p className="text-xs text-on-surface-variant max-w-xs mt-1">
            Configure parameters and assign region manager for new warehouse expansion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WarehousesPage;
