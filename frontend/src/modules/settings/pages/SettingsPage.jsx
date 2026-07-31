import { useState } from 'react';
import { Settings, Save, User, Lock, Upload, Key } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import { ROLES } from '@/permissions/roles';

export const SettingsPage = () => {
  const { user, updateProfile } = useAuth();
  const { notifySuccess, notifyError } = useNotification();
  
  const isManagerOrAdmin = user?.role === ROLES.SUPER_ADMIN || user?.role === ROLES.WAREHOUSE_MANAGER;
  
  // Tab state
  const [activeTab, setActiveTab] = useState(isManagerOrAdmin ? 'system' : 'profile');

  // System settings state
  const [warehouseName, setWarehouseName] = useState('StitchNexus Warehouse Alpha');
  const [address, setAddress] = useState('100 Supply Chain Blvd, Suite 400, Dallas TX');
  const [emailAlerts, setEmailAlerts] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveSystemSettings = (e) => {
    e.preventDefault();
    notifySuccess('System settings updated successfully.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      notifyError('Full Name cannot be empty.');
      return;
    }
    updateProfile({ name: fullName.trim() });
    notifySuccess('Profile updated successfully.');
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      notifyError('All password fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      notifyError('New password and confirm password do not match.');
      return;
    }
    notifySuccess('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notifyError('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      updateProfile({ avatar: reader.result });
      notifySuccess('Profile photo uploaded and updated in real-time!');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={activeTab === 'system' ? "System Settings" : "Account Settings"}
        description={activeTab === 'system' ? "Configure warehouse facilities, alert notifications, and integration parameters" : "Manage your personal profile, credentials, and authentication preferences"}
        breadcrumbs={[{ label: 'Administration' }, { label: 'Settings' }]}
      />

      {/* Tabs Menu */}
      {isManagerOrAdmin && (
        <div className="flex border-b border-surface-200 dark:border-surface-800 gap-4">
          <button
            onClick={() => setActiveTab('system')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'system'
                ? 'border-primary text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            System Settings
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'profile'
                ? 'border-primary text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-800'
            }`}
          >
            Profile & Security
          </button>
        </div>
      )}

      {/* SYSTEM SETTINGS TAB */}
      {activeTab === 'system' && isManagerOrAdmin && (
        <div className="card p-6 max-w-3xl space-y-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h3 className="text-base font-bold text-surface-900 border-b border-surface-200 pb-3">
            Facility Configuration
          </h3>

          <form onSubmit={handleSaveSystemSettings} className="space-y-4">
            <FormField label="Primary Facility Name" required>
              <Input value={warehouseName} onChange={(e) => setWarehouseName(e.target.value)} />
            </FormField>

            <FormField label="Physical Facility Address" required>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </FormField>

            <div className="pt-4 border-t border-surface-200">
              <h4 className="text-sm font-semibold text-surface-900 mb-3">
                Notification & Stock Alert Settings
              </h4>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-surface-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                />
                <span className="text-sm text-surface-700">
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
      )}

      {/* PROFILE & SECURITY TAB */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
          {/* Personal Profile Panel */}
          <div className="card p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-surface-900">Personal Profile Settings</h3>
              <p className="text-xs text-slate-500 mt-0.5">Update your visual avatar and public full name.</p>
            </div>

            {/* Avatar Upload Panel */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="relative group shrink-0">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop'}
                  alt={user?.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
                <label className="absolute inset-0 flex items-center justify-center bg-black/45 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Upload className="w-4 h-4 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xs font-bold text-slate-700">Upload Profile Photo</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, or GIF (Max 2MB)</p>
                <label className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 text-[11px] font-bold text-slate-700 rounded-lg shadow-xs hover:bg-slate-50 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" /> Select Image
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <FormField label="Full Name" required>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </FormField>

              <FormField label="Email Address (Login Username)">
                <Input value={email} readOnly disabled className="bg-slate-50 text-slate-500 cursor-not-allowed" />
              </FormField>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" leftIcon={Save}>
                  Save Profile Info
                </Button>
              </div>
            </form>
          </div>

          {/* Security & Password Panel */}
          <div className="card p-6 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-surface-900">Change Password</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage your credentials to secure your account.</p>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <FormField label="Current Password" required>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                />
              </FormField>

              <FormField label="New Password" required>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                />
              </FormField>

              <FormField label="Confirm New Password" required>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  required
                />
              </FormField>

              <div className="flex justify-end pt-2">
                <Button type="submit" variant="primary" leftIcon={Key}>
                  Update Password
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
