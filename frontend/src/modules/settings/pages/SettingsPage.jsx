import { useState } from 'react';
import { Settings, Save, Bell, Shield, Database } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useNotification } from '@/contexts/NotificationContext';

export const SettingsPage = () => {
  const { notifySuccess } = useNotification();
  const [warehouseName, setWarehouseName] = useState('StitchNexus Warehouse Alpha');
  const [address, setAddress] = useState('100 Supply Chain Blvd, Suite 400, Dallas TX');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    notifySuccess('System settings updated successfully.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure warehouse facilities, alert notifications, and integration parameters"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
      />

      <div className="card p-6 max-w-3xl space-y-6">
        <h3 className="text-base font-bold text-surface-900 dark:text-white border-b border-surface-200 dark:border-surface-800 pb-3">
          Facility Configuration
        </h3>

        <form onSubmit={handleSave} className="space-y-4">
          <FormField label="Primary Facility Name" required>
            <Input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} />
          </FormField>

          <FormField label="Physical Facility Address" required>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>

          <div className="pt-4 border-t border-surface-200 dark:border-surface-800">
            <h4 className="text-sm font-semibold text-surface-900 dark:text-white mb-3">
              Notification & Stock Alert Settings
            </h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
              />
              <span className="text-sm text-surface-700 dark:text-surface-300">
                Send automatic email alerts for Low Stock and Expiring Lot events
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" variant="primary" leftIcon={Save}>
              Save System Settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
