import { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Package, TrendingUp, AlertTriangle, Truck, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingState from '@/components/feedback/LoadingState';
import { useNotification } from '@/contexts/NotificationContext';
import { useWmsStore } from '@/contexts/WmsStoreContext';
import { reportService } from '@/services/reportService';
import { productService } from '@/services/productService';
import { purchaseOrderService } from '@/services/purchaseOrderService';
import { salesOrderService } from '@/services/salesOrderService';
import { batchService } from '@/services/batchService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export const ReportsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { products, lots, purchaseOrders, salesOrders } = useWmsStore();

  const [valuationData, setValuationData] = useState([]);
  const [velocityData, setVelocityData] = useState([]);
  const [reportProducts, setReportProducts] = useState([]);
  const [reportLots, setReportLots] = useState([]);
  const [reportPos, setReportPos] = useState([]);
  const [reportSos, setReportSos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const [valRes, velRes, prodRes, lotsRes, poRes, soRes] = await Promise.all([
        reportService.getStockValuation(),
        reportService.getInventoryVelocity(),
        productService.getProducts({ pageSize: 500 }),
        batchService.getBatches(),
        purchaseOrderService.fetchPurchaseOrders(),
        salesOrderService.fetchSalesOrders()
      ]);
      setValuationData(Array.isArray(valRes) ? valRes : []);
      setVelocityData(Array.isArray(velRes) ? velRes : []);
      setReportProducts(prodRes?.items || prodRes || []);
      setReportLots(lotsRes?.items || lotsRes || []);
      setReportPos(poRes?.items || poRes || []);
      setReportSos(soRes?.items || soRes || []);
    } catch (err) {
      console.error('Error loading report analytics:', err);
      notifyError('Failed to load supply chain analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

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
      const doc = new jsPDF();
      doc.text('Nexus WMS - Inventory Analytics Report', 14, 15);
      
      const sourceProducts = reportProducts.length > 0 ? reportProducts : products;
      
      const tableData = sourceProducts.map((p) => [
        p.sku,
        p.name,
        p.categoryRef?.name || p.category || 'General',
        p.availableStock || p.totalStock || 0,
        p.availableStock || 0,
        p.unitCost || 0,
        (Number(p.availableStock || 0) * Number(p.unitCost || 0)).toFixed(2),
      ]);

      autoTable(doc, {
        startY: 25,
        head: [['SKU', 'Product Name', 'Category', 'Total Stock', 'Available Stock', 'Unit Cost ($)', 'Asset Value ($)']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] } // Primary color
      });

      doc.save('nexus-wms-inventory-report.pdf');
      notifySuccess('PDF report downloaded successfully.');
      return;
    }
    downloadCsv('nexus-wms-inventory-report.csv', [
      ['SKU', 'Product Name', 'Category', 'Total Stock', 'Available Stock', 'Unit Cost ($)', 'Asset Value ($)'],
      ...products.map((p) => [
        p.sku,
        p.name,
        p.categoryRef?.name || p.category || 'General',
        p.totalStock || p.availableStock || 0,
        p.availableStock || 0,
        p.unitCost || 0,
        (Number(p.availableStock || 0) * Number(p.unitCost || 0)).toFixed(2),
      ]),
    ]);
    notifySuccess('Inventory analytics exported as an Excel-compatible CSV file.');
  };

  const runReport = (type) => {
    const reports = {
      Valuation: [
        ['SKU', 'Product Name', 'Category', 'Available Stock', 'Unit Cost ($)', 'Asset Value ($)'],
        ...products.map((p) => [
          p.sku,
          p.name,
          p.categoryRef?.name || p.category || 'General',
          p.availableStock || 0,
          p.unitCost || 0,
          (Number(p.availableStock || 0) * Number(p.unitCost || 0)).toFixed(2),
        ]),
      ],
      Velocity: [
        ['Movement Type', '30-Day Ledger Count'],
        ...velocityData.map((v) => [v.movementType, v.count]),
      ],
      'Expiry Risk': [
        ['Lot ID', 'Product', 'Expiry Date', 'Status'],
        ...lots.map((l) => [l.lotId || l.id, l.product?.name || l.productName || 'N/A', l.expiryDate || 'N/A', l.status]),
      ],
      'Vendor SLA': [
        ['PO Number', 'Supplier', 'Expected Date', 'Status', 'Total Value ($)'],
        ...purchaseOrders.map((po) => [po.poNumber || po.id, po.supplier || 'N/A', po.expectedDate || 'N/A', po.status, po.totalAmount || 0]),
      ],
    };
    downloadCsv(`nexus-${type.toLowerCase().replaceAll(' ', '-')}-report.csv`, reports[type] || []);
    notifySuccess(`${type} report generated with live database records.`);
  };

  if (loading) return <LoadingState message="Calculating stock valuation & inventory velocity analytics..." />;

  const pieChartData =
    valuationData.length > 0
      ? valuationData.map((d) => ({ name: d.category || 'General', value: d.totalUnits || d.totalValue || 1 }))
      : [{ name: 'Catalog Products', value: products.length || 1 }];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Supply Chain Analytics"
        description="Comprehensive stock valuation, warehouse velocity, order fulfillment, and financial reports from MySQL"
        breadcrumbs={[{ label: 'Analytics' }, { label: 'Reports & Analytics' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={RefreshCw} onClick={fetchReportsData}>
              Refresh
            </Button>
            <Button variant="outline" leftIcon={FileSpreadsheet} onClick={() => handleExport('Excel')}>
              Export Excel
            </Button>
            <Button variant="primary" leftIcon={Download} onClick={() => handleExport('PDF')}>
              Download PDF Report
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Catalog SKUs', value: reportProducts.length, icon: Package, tone: 'bg-primary-50 text-primary-600' },
          { label: 'Total Lot Batches', value: reportLots.length, icon: TrendingUp, tone: 'bg-success-50 text-success-600' },
          { label: 'Sales Orders', value: reportSos.length, icon: Truck, tone: 'bg-info-50 text-info-600' },
          { label: 'Purchase Orders', value: reportPos.length, icon: AlertTriangle, tone: 'bg-warning-50 text-warning-600' },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="card flex items-center gap-3 p-4 sm:p-5 border border-outline-variant bg-white rounded-xl shadow-sm">
            <Icon className={`h-10 w-10 shrink-0 rounded-xl p-2 ${tone}`} />
            <div>
              <p className="text-xs text-slate-500">{label}</p>
              <p className="text-xl font-bold text-slate-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Stock Valuation Chart */}
        <div className="card p-5 space-y-4 border border-outline-variant bg-white rounded-xl shadow-sm">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">
              Stock Valuation by Category (Real DB)
            </h3>
            <Badge variant="primary">{valuationData.length} Categories</Badge>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={86}
                  paddingAngle={3}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Report Generators */}
        <div className="card p-5 space-y-4 border border-outline-variant bg-white rounded-xl shadow-sm">
          <h3 className="text-base font-bold text-slate-900">
            Quick Database Report Generators
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Inventory Valuation Report', desc: 'Summary of unit costs, stock units, and total asset worth', type: 'Valuation' },
              { title: 'Stock Turnover & Ledger Velocity', desc: 'Analysis of 30-day inventory ledger movements in MySQL', type: 'Velocity' },
              { title: 'FEFO Expiry Risk Audit', desc: 'Complete breakdown of lot expiry dates and quarantine holds', type: 'Expiry Risk' },
              { title: 'PO Supplier Delivery Accuracy', desc: 'Supplier Purchase Order statuses and total procurement value', type: 'Vendor SLA' },
            ].map((rep, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3.5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900">{rep.title}</h4>
                  <p className="text-xs text-slate-500">{rep.desc}</p>
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
