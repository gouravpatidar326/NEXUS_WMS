import { useState } from 'react';

export const ClientPortalPage = () => {
  return (
    <div className="min-w-0 flex-1 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Overview</h2>
          <p className="text-xs text-on-surface-variant">Welcome back, Sarah. Your supply chain is currently stable.</p>
        </div>
        <button className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary-container shadow-sm">
          Create New Order
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">package_2</span>
            <span className="text-xs text-green-600 font-bold">+2 since yesterday</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Active Orders</h3>
            <p className="text-2xl font-bold text-on-surface">14</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-slate-700 bg-slate-100 p-2 rounded-lg">payments</span>
            <span className="text-xs text-on-surface-variant font-medium">Month to Date</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Total Spend</h3>
            <p className="text-2xl font-bold text-on-surface">$142,850.00</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg">account_balance_wallet</span>
            <button className="text-primary text-xs font-bold hover:underline">Refill</button>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">Available Credits</h3>
            <p className="text-2xl font-bold text-on-surface">$25,000.00</p>
          </div>
        </div>

        <div className="bg-white border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-start">
            <span className="material-symbols-outlined text-red-600 bg-red-100 p-2 rounded-lg">description</span>
            <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">URGENT</span>
          </div>
          <div className="mt-4">
            <h3 className="text-xs text-on-surface-variant font-medium">COAs Pending Download</h3>
            <p className="text-2xl font-bold text-on-surface">3</p>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Tracking & Recent Orders (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Order Tracker */}
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-base font-bold text-on-surface">Track Most Recent Order</h3>
              <span className="text-xs text-on-surface-variant">Order ID: #NX-99201-B</span>
            </div>
            <div className="responsive-scroll p-4 sm:p-6">
              <div className="relative flex min-w-[560px] items-center justify-between">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-200 -translate-y-1/2 z-0"></div>
                <div className="absolute top-1/2 left-0 w-[66%] h-[2px] bg-primary -translate-y-1/2 z-0"></div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[20px]">check</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">Confirmed</p>
                  <p className="text-[10px] text-on-surface-variant">May 12, 09:00 AM</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow">
                    <span className="material-symbols-outlined text-[20px]">inventory</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">Processing</p>
                  <p className="text-[10px] text-on-surface-variant">May 13, 02:45 PM</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-full border-4 border-primary bg-white text-primary flex items-center justify-center shadow animate-pulse">
                    <span className="material-symbols-outlined text-[24px]">local_shipping</span>
                  </div>
                  <p className="text-xs font-bold text-primary mt-1">In Transit</p>
                  <p className="text-[10px] text-on-surface-variant">Expected May 15</p>
                </div>

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px]">home_work</span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1">Delivered</p>
                  <p className="text-[10px] text-on-surface-variant">Estimated May 16</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50/80 p-3.5 px-4 flex items-center gap-3 border-t border-blue-100">
              <span className="material-symbols-outlined text-primary">info</span>
              <p className="text-xs text-primary font-medium">
                Your shipment has left the East Coast Regional Hub and is currently en route to the final distribution center.
              </p>
            </div>
          </section>

          {/* Recent Orders Table */}
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-base font-bold text-on-surface">Recent Orders</h3>
              <button className="text-primary text-xs font-bold hover:underline">View All Orders</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-xs font-bold text-on-surface-variant">
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-xs">
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3.5 text-primary font-bold">#NX-99201-B</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">May 12, 2024</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800">
                        In Transit
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">$4,250.00</td>
                    <td className="px-4 py-3.5 text-primary font-bold hover:underline cursor-pointer">
                      Track →
                    </td>
                  </tr>
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="px-4 py-3.5 text-primary font-bold">#NX-99185-A</td>
                    <td className="px-4 py-3.5 text-on-surface-variant">May 08, 2024</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full font-bold bg-green-100 text-green-800">
                        Delivered
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold">$12,800.00</td>
                    <td className="px-4 py-3.5 text-primary font-bold hover:underline cursor-pointer">
                      Invoice ↓
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Featured Products (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-base font-bold text-on-surface">New Arrivals</h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Product 1 */}
              <div className="border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all group">
                <div className="h-36 bg-slate-100 overflow-hidden">
                  <img
                    src="/images/wms/product-solvent.jpg"
                    alt="Iso-Propyl Solvent A1"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-on-surface text-sm">Iso-Propyl Solvent A1</h4>
                    <span className="text-xs font-bold text-primary">$285.00</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">High-purity industrial grade cleaning agent. 20L Drum.</p>
                  <button className="w-full py-2 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Quick Order
                  </button>
                </div>
              </div>

              {/* Product 2 */}
              <div className="border border-outline-variant rounded-xl overflow-hidden hover:border-primary transition-all group">
                <div className="h-36 bg-slate-100 overflow-hidden">
                  <img
                    src="/images/wms/product-components.jpg"
                    alt="Gasket Set (Modular)"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3.5">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-on-surface text-sm">Gasket Set (Modular)</h4>
                    <span className="text-xs font-bold text-primary">$45.00</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">Compatible with all Series-7 picking lines. 10pk.</p>
                  <button className="w-full py-2 bg-secondary-container text-on-secondary-container rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all">
                    Quick Order
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ClientPortalPage;
