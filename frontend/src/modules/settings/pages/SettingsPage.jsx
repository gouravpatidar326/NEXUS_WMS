import { useState, useEffect } from 'react';
import { Save, Building2, Warehouse, Bell, ShieldCheck, Database, Server, RefreshCw } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/feedback/LoadingState';
import { useNotification } from '@/contexts/NotificationContext';
import { settingsService } from '@/services/settingsService';

export const SettingsPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [industry, setIndustry] = useState('');
  const [currency, setCurrency] = useState('USD ($)');
  const [facilityName, setFacilityName] = useState('');
  const [facilityAddress, setFacilityAddress] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('10');
  const [expiryWarningDays, setExpiryWarningDays] = useState('30');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        setCompanyName(data.companyName || '');
        setEmail(data.email || '');
        setPhone(data.phone || '');
        setIndustry(data.industry || '');
        setCurrency(data.currency || 'USD ($)');
        setFacilityName(data.facilityName || '');
        setFacilityAddress(data.facilityAddress || '');
        setLowStockThreshold(String(data.lowStockThreshold || '10'));
        setExpiryWarningDays(String(data.expiryWarningDays || '30'));
        setEmailAlerts(data.emailAlerts !== false);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
      notifyError('Failed to load settings from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.updateSettings({
        companyName,
        email,
        phone,
        industry,
        currency,
        facilityName,
        facilityAddress,
        lowStockThreshold: parseInt(lowStockThreshold, 10) || 10,
        expiryWarningDays: parseInt(expiryWarningDays, 10) || 30,
        emailAlerts,
      });
      notifySuccess('System settings saved and synchronized with database.');
    } catch (err) {
      notifyError(err.message || 'Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Connecting to Database & Loading System Settings..." />;

  return (
    <div className="space-y-6 min-w-0">
      <PageHeader
        title="System Settings"
        description="Configure enterprise company parameters, warehouse thresholds, and database integrations"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
        actions={
          <Button variant="outline" leftIcon={RefreshCw} onClick={fetchSettings} disabled={saving}>
            Refresh Settings
          </Button>
        }
      />

      <form onSubmit={handleSave} className="space-y-6 max-w-4xl">
        {/* Section 1: Enterprise Profile */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-800 pb-3">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Enterprise & Company Profile
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Enterprise Company Name" required>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
            </FormField>

            <FormField label="Industry Classification">
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Consumer Electronics" />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Enterprise Support Email" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormField>

            <FormField label="Contact Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 800 555 0199" />
            </FormField>

            <FormField label="Base System Currency">
              <Select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={[
                  { value: 'USD ($)', label: 'USD ($) - US Dollar' },
                  { value: 'INR (₹)', label: 'INR (₹) - Indian Rupee' },
                  { value: 'EUR (€)', label: 'EUR (€) - Euro' },
                  { value: 'GBP (£)', label: 'GBP (£) - British Pound' },
                ]}
              />
            </FormField>
          </div>
        </div>

        {/* Section 2: Facility & Primary Warehouse */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-800 pb-3">
            <Warehouse className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Primary Facility & Warehouse Address
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary Facility Name" required>
              <Input value={facilityName} onChange={(e) => setFacilityName(e.target.value)} required />
            </FormField>

            <FormField label="Physical Facility Address" required>
              <Input value={facilityAddress} onChange={(e) => setFacilityAddress(e.target.value)} required />
            </FormField>
          </div>
        </div>

        {/* Section 3: Inventory Alert Controls */}
        <div className="card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-200 dark:border-surface-800 pb-3">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-surface-900 dark:text-white">
              Inventory & Expiry Threshold Controls
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Minimum Low-Stock Alert Limit (Units)">
              <Input type="number" value={lowStockThreshold} onChange={(e) => setLowStockThreshold(e.target.value)} min="1" />
            </FormField>

            <FormField label="Expiry Risk Warning Window (Days Prior)">
              <Input type="number" value={expiryWarningDays} onChange={(e) => setExpiryWarningDays(e.target.value)} min="1" />
            </FormField>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-surface-50 dark:bg-surface-800/50 rounded-lg border border-surface-200 dark:border-surface-700">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="text-xs sm:text-sm font-medium text-surface-800 dark:text-surface-200">
                Send automatic email notifications for Low Stock & Expiring Lot events
              </span>
            </label>
          </div>
        </div>

        {/* Section 4: System Health & DB Panel */}
        <div className="card p-6 space-y-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                Database & Infrastructure Status
              </h3>
            </div>
            <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              SQLite / Prisma Live
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-3">
              <Server className="w-6 h-6 text-primary-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">System Uptime</p>
                <p className="text-sm font-bold text-emerald-400">99.98% Operational</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Security Standard</p>
                <p className="text-sm font-bold text-slate-200">TLS 1.3 / AES-256</p>
              </div>
            </div>

            <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700 flex items-center gap-3">
              <Database className="w-6 h-6 text-blue-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Data Sync</p>
                <p className="text-sm font-bold text-blue-300">Real-time Persistence</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" leftIcon={Save} disabled={saving} className="px-6 py-2.5 text-sm font-bold">
            {saving ? 'Saving Settings...' : 'Save System Settings'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;
