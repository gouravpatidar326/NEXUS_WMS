import { Download, FileSpreadsheet, Package, TrendingUp, AlertTriangle, Truck } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useNotification } from '@/contexts/NotificationContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const CATEGORY_DATA = [
  { name: 'Electronics', value: 45 },
  { name: 'Packaging', value: 25 },
  { name: 'Medical', value: 15 },
  { name: 'Automotive', value: 10 },
  { name: 'Food', value: 5 },
];

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6'];

export const ReportsPage = () => {
  const { notifySuccess } = useNotification();
  const { products, lots, purchaseOrders, salesOrders } = useWmsStore();

  const downloadCsv = (filename, rows) => {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (type) => {
    if (type === 'PDF') {
      window.print();
      notifySuccess('Print-ready analytics report opened. Choose Save as PDF to download.');
      return;
    }
    downloadCsv('nexus-wms-inventory-report.csv', [
      ['SKU', 'Product', 'Category', 'Total Stock', 'Available Stock', 'Unit Cost'],
      ...products.map((p) => [p.sku, p.name, p.category, p.totalStock, p.availableStock, p.unitCost]),
    ]);
    notifySuccess('Inventory analytics exported as an Excel-compatible CSV file.');
  };

  const runReport = (type) => {
    const reports = {
      Valuation: [['SKU', 'Product', 'Category', 'Stock', 'Unit Cost', 'Asset Value'], ...products.map((p) => [p.sku, p.name, p.category, p.totalStock, p.unitCost, Number(p.totalStock || 0) * Number(p.unitCost || 0)])],
      Velocity: [['Order', 'Client', 'Status', 'Items'], ...salesOrders.map((o) => [o.orderNumber || o.soNumber, o.client || o.clientName, o.status, o.itemsCount])],
      'Expiry Risk': [['Lot', 'Product', 'Expiry Date', 'Quantity', 'Status'], ...lots.map((l) => [l.lotId, l.productName, l.expiryDate, l.qty, l.status])],
      'Vendor SLA': [['PO', 'Supplier', 'Expected Date', 'Status', 'Value'], ...purchaseOrders.map((po) => [po.poNumber, po.supplier, po.expectedDate, po.status, po.totalAmount])],
    };
    downloadCsv(`nexus-${type.toLowerCase().replaceAll(' ', '-')}-report.csv`, reports[type]);
    notifySuccess(`${type} report generated with current warehouse data.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Supply Chain Analytics"
        description="Comprehensive stock valuation, warehouse velocity, order fulfillment, and financial reports"
        breadcrumbs={[{ label: 'Analytics' }, { label: 'Reports & Analytics' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={FileSpreadsheet} onClick={() => handleExport('Excel')}>
              Export Excel
            </Button>
            <Button variant="primary" leftIcon={Download} onClick={() => handleExport('PDF')}>
              Download PDF Report
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Catalog SKUs', value: products.length, icon: Package, tone: 'bg-primary-50 text-primary-600' },
          { label: 'Units in lots', value: lots.reduce((sum, lot) => sum + Number(lot.qty || 0), 0).toLocaleString(), icon: TrendingUp, tone: 'bg-success-50 text-success-600' },
          { label: 'Open orders', value: salesOrders.filter((order) => !['Shipped', 'Rejected'].includes(order.status)).length, icon: Truck, tone: 'bg-info-50 text-info-600' },
          { label: 'Expiry watch', value: lots.filter((lot) => lot.status !== 'AVAILABLE').length, icon: AlertTriangle, tone: 'bg-warning-50 text-warning-600' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-3 p-4 sm:p-5">
            <Icon className={`h-10 w-10 shrink-0 rounded-xl p-2 ${tone}`} />
            <div><p className="text-xs text-surface-500">{label}</p><p className="text-xl font-bold text-surface-900">{value}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5 space-y-4">
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Stock Valuation by Category
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={CATEGORY_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={86} paddingAngle={3} label={({ name, value }) => `${name} ${value}%`}>
                  {CATEGORY_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5 space-y-4">
          <h3 className="text-base font-bold text-surface-900 dark:text-white">
            Quick Report Generators
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Inventory Valuation Report', desc: 'Summary of unit costs, market prices, and total asset worth', type: 'Valuation' },
              { title: 'Stock Turnover & Velocity', desc: 'Analysis of fast-moving vs deadstock SKUs in Zone A-D', type: 'Velocity' },
              { title: 'FEFO Expiry Risk Audit', desc: 'Complete breakdown of lot expiry dates under 90 days', type: 'Expiry Risk' },
              { title: 'PO Supplier Delivery Accuracy', desc: 'On-time delivery percentages and vendor SLAs', type: 'Vendor SLA' },
            ].map((rep, idx) => (
              <div key={idx} className="flex flex-col gap-3 rounded-xl border border-surface-200/60 bg-surface-50 p-3.5 dark:border-surface-700/40 dark:bg-surface-800/40 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-surface-900 dark:text-white">{rep.title}</h4>
                  <p className="text-xs text-surface-500">{rep.desc}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => runReport(rep.type)}>
                  Run Report
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
