import { useState, useEffect } from 'react';
import { Check, Lock, Pencil, Save, Shield } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/feedback/LoadingState';
import { roleService } from '@/services/roleService';
import { PERMISSIONS } from '@/permissions/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { useNotification } from '@/contexts/NotificationContext';

export const RolesPage = () => {
  const { syncPermissionsFromApi } = useAuth();
  const { notifySuccess, notifyError } = useNotification();

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoleKey, setSelectedRoleKey] = useState('SUPER_ADMIN');
  const [isEditing, setIsEditing] = useState(false);
  const [activePermissions, setActivePermissions] = useState([]);

  const permissionCategories = [
    {
      title: 'Products & Inventory',
      perms: [
        PERMISSIONS.PRODUCTS_VIEW,
        PERMISSIONS.PRODUCTS_CREATE,
        PERMISSIONS.PRODUCTS_EDIT,
        PERMISSIONS.PRODUCTS_DELETE,
        PERMISSIONS.INVENTORY_VIEW,
        PERMISSIONS.INVENTORY_ADJUST,
        PERMISSIONS.BATCH_VIEW,
        PERMISSIONS.EXPIRY_VIEW,
      ],
    },
    {
      title: 'Order Operations & Logistics',
      perms: [
        PERMISSIONS.PO_VIEW,
        PERMISSIONS.PO_CREATE,
        PERMISSIONS.PO_APPROVE,
        PERMISSIONS.TO_VIEW,
        PERMISSIONS.TO_EXECUTE,
        PERMISSIONS.SO_VIEW,
        PERMISSIONS.SO_PICK,
      ],
    },
    {
      title: 'Physical Warehouse Operations',
      perms: [
        PERMISSIONS.WAREHOUSE_VIEW,
        PERMISSIONS.BARCODE_VIEW,
        PERMISSIONS.SHIPPING_VIEW,
        PERMISSIONS.CLIENT_PORTAL_VIEW,
        PERMISSIONS.REPORTS_VIEW,
      ],
    },
    {
      title: 'System Administration & RBAC',
      perms: [
        PERMISSIONS.USERS_VIEW,
        PERMISSIONS.USERS_CREATE,
        PERMISSIONS.ROLES_VIEW,
        PERMISSIONS.ROLES_MANAGE,
        PERMISSIONS.AUDIT_VIEW,
        PERMISSIONS.SETTINGS_MANAGE,
      ],
    },
  ];

  const fetchRolesData = async () => {
    try {
      setLoading(true);
      const data = await roleService.getRoles();
      const rolesList = Array.isArray(data) ? data : [];
      setRoles(rolesList);

      const activeRole = rolesList.find((r) => r.key === selectedRoleKey) || rolesList[0];
      if (activeRole) {
        setSelectedRoleKey(activeRole.key);
        setActivePermissions(activeRole.permissions || []);
      }
    } catch {
      notifyError('Failed to fetch role permissions matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  const handleSelectRole = (roleItem) => {
    setSelectedRoleKey(roleItem.key);
    setActivePermissions(roleItem.permissions || []);
    setIsEditing(false);
  };

  const togglePermission = (permKey) => {
    if (!isEditing || selectedRoleKey === 'SUPER_ADMIN') return;
    setActivePermissions((current) =>
      current.includes(permKey) ? current.filter((p) => p !== permKey) : [...current, permKey]
    );
  };

  const savePermissions = async () => {
    try {
      await roleService.updateRolePermissions(selectedRoleKey, activePermissions);
      if (syncPermissionsFromApi) await syncPermissionsFromApi();
      notifySuccess(`Permissions for ${selectedRoleKey} saved to database.`);
      setIsEditing(false);
      fetchRolesData();
    } catch (err) {
      notifyError(err.message || 'Failed to save permissions');
    }
  };

  if (loading) return <LoadingState message="Loading RBAC Roles & Permission Matrix from backend..." />;

  const currentRoleObj = roles.find((r) => r.key === selectedRoleKey) || { label: selectedRoleKey, color: 'primary' };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permission Matrix (RBAC)"
        description="Configure granular permission assignments for each system role connected to backend database"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Roles & Permissions' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Role Selector List */}
        <div className="card p-4 space-y-3 bg-white border border-outline-variant rounded-xl shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Select System Role
          </h3>
          {roles.map((roleItem) => (
            <button
              key={roleItem.key}
              onClick={() => handleSelectRole(roleItem)}
              className={`w-full p-3 rounded-xl text-left transition flex items-center justify-between border ${
                selectedRoleKey === roleItem.key
                  ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                  : 'bg-surface-container-low border-transparent hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div>
                <span className="block text-sm font-bold">{roleItem.label}</span>
                <span className="text-[11px] text-slate-500">
                  {roleItem.permissions?.length || 0} Active Grants
                </span>
              </div>
              <Badge variant={roleItem.color || 'primary'}>RBAC</Badge>
            </button>
          ))}
        </div>

        {/* Matrix Grid */}
        <div className="card space-y-6 p-6 md:col-span-3 bg-white border border-outline-variant rounded-xl shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Permission Grants for: {currentRoleObj.label}
              </h3>
              <p className="text-xs text-slate-500">
                Green checkmarks represent granted permissions for this role context.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={currentRoleObj.color || 'primary'}>{activePermissions.length} Active Grants</Badge>
              {selectedRoleKey !== 'SUPER_ADMIN' && (
                isEditing ? (
                  <Button size="sm" variant="primary" leftIcon={Save} onClick={savePermissions}>
                    Save Changes
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" leftIcon={Pencil} onClick={() => setIsEditing(true)}>
                    Edit Permissions
                  </Button>
                )
              )}
            </div>
          </div>

          <div className="space-y-6">
            {permissionCategories.map((cat) => (
              <div key={cat.title} className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{cat.title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.perms.map((permKey) => {
                    const isGranted = activePermissions.includes(permKey);
                    return (
                      <button
                        key={permKey}
                        type="button"
                        onClick={() => togglePermission(permKey)}
                        disabled={!isEditing || selectedRoleKey === 'SUPER_ADMIN'}
                        className={`p-3 rounded-lg border text-left text-xs font-semibold flex items-center justify-between transition ${
                          isGranted
                            ? 'bg-green-50 border-green-300 text-green-900'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        } ${isEditing && selectedRoleKey !== 'SUPER_ADMIN' ? 'cursor-pointer hover:border-green-500' : 'cursor-default'}`}
                      >
                        <span className="font-mono">{permKey}</span>
                        {isGranted ? (
                          <Check className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RolesPage;
