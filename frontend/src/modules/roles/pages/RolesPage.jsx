import { useState } from 'react';
import { Check, Lock, Pencil, Save } from 'lucide-react';
import PageHeader from '@/components/navigation/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '@/permissions/roles';
import { ROLE_PERMISSIONS } from '@/permissions/rolePermissions';
import { PERMISSIONS } from '@/permissions/permissions';
import { useNotification } from '@/contexts/NotificationContext';

export const RolesPage = () => {
  const [selectedRole, setSelectedRole] = useState(ROLES.SUPER_ADMIN);
  const { notifySuccess } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [permissionState, setPermissionState] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('wms_role_permissions') || 'null');
      if (saved) Object.keys(saved).forEach((role) => { ROLE_PERMISSIONS[role] = saved[role]; });
    } catch { /* use defaults */ }
    return Object.fromEntries(Object.entries(ROLE_PERMISSIONS).map(([role, grants]) => [role, [...grants]]));
  });

  const permissionCategories = [
    { title: 'Products & Inventory', perms: [PERMISSIONS.PRODUCTS_VIEW, PERMISSIONS.PRODUCTS_CREATE, PERMISSIONS.PRODUCTS_EDIT, PERMISSIONS.PRODUCTS_DELETE, PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_ADJUST] },
    { title: 'Order Operations', perms: [PERMISSIONS.PO_VIEW, PERMISSIONS.PO_CREATE, PERMISSIONS.PO_APPROVE, PERMISSIONS.TO_VIEW, PERMISSIONS.TO_EXECUTE, PERMISSIONS.SO_VIEW, PERMISSIONS.SO_PICK] },
    { title: 'System Administration', perms: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_CREATE, PERMISSIONS.ROLES_VIEW, PERMISSIONS.ROLES_MANAGE, PERMISSIONS.AUDIT_VIEW, PERMISSIONS.SETTINGS_MANAGE] },
  ];

  const activeGrants = permissionState[selectedRole] || [];
  const togglePermission = (permission) => {
    if (!isEditing || selectedRole === ROLES.SUPER_ADMIN) return;
    setPermissionState((current) => ({
      ...current,
      [selectedRole]: current[selectedRole].includes(permission)
        ? current[selectedRole].filter((item) => item !== permission)
        : [...current[selectedRole], permission],
    }));
  };
  const savePermissions = () => {
    Object.keys(permissionState).forEach((role) => { ROLE_PERMISSIONS[role] = [...permissionState[role]]; });
    localStorage.setItem('wms_role_permissions', JSON.stringify(permissionState));
    setIsEditing(false);
    notifySuccess(`${ROLE_LABELS[selectedRole]} permissions saved and applied.`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Permission Matrix (RBAC)"
        description="Configure granular permission assignments for each system role"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Roles & Permissions' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Role Selector List */}
        <div className="card p-3 space-y-2">
          <h3 className="px-3 text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
            Select Role to Inspect
          </h3>
          {Object.keys(ROLE_LABELS).map((roleKey) => (
            <button
              key={roleKey}
              onClick={() => setSelectedRole(roleKey)}
              className={`w-full p-3 rounded-xl text-left transition flex items-center justify-between ${
                selectedRole === roleKey
                  ? 'bg-primary-50 dark:bg-primary-950/40 border border-primary-300 dark:border-primary-800'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-800'
              }`}
            >
              <div>
                <span className="block text-sm font-bold text-surface-900 dark:text-white">
                  {ROLE_LABELS[roleKey]}
                </span>
                <span className="text-[11px] text-surface-500">
                  {permissionState[roleKey].length} Active Grants
                </span>
              </div>
              <Badge variant={ROLE_COLORS[roleKey]}>RBAC</Badge>
            </button>
          ))}
        </div>

        {/* Matrix Grid */}
        <div className="card space-y-4 p-4 sm:space-y-6 sm:p-6 md:col-span-3">
          <div className="flex flex-col gap-3 border-b border-surface-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                Permission Grants for: {ROLE_LABELS[selectedRole]}
              </h3>
              <p className="text-xs text-surface-500">
                Green checkmarks represent granted permissions for this role context.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={ROLE_COLORS[selectedRole]}>{activeGrants.length} grants</Badge>
              {selectedRole !== ROLES.SUPER_ADMIN && (isEditing ? <Button size="sm" leftIcon={Save} onClick={savePermissions}>Save changes</Button> : <Button size="sm" variant="outline" leftIcon={Pencil} onClick={() => setIsEditing(true)}>Edit permissions</Button>)}
            </div>
          </div>

          <div className="space-y-6">
            {permissionCategories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  {cat.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.perms.map((pKey) => {
                    const isGranted = activeGrants.includes(pKey);
                    return (
                      <button
                        type="button"
                        key={pKey}
                        onClick={() => togglePermission(pKey)}
                        className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                          isGranted
                            ? 'bg-success-50/50 dark:bg-success-950/20 border-success-200 dark:border-success-800 text-surface-900 dark:text-surface-100 font-medium'
                            : 'bg-surface-50 dark:bg-surface-800/30 border-surface-200 dark:border-surface-700 text-surface-400 opacity-60'
                        } ${isEditing && selectedRole !== ROLES.SUPER_ADMIN ? 'cursor-pointer hover:border-primary-400 hover:shadow-sm' : 'cursor-default'}`}
                      >
                        <span className="font-mono">{pKey}</span>
                        {isGranted ? (
                          <Check className="h-4 w-4 text-success-600 shrink-0" />
                        ) : (
                          <Lock className="h-3.5 w-3.5 text-surface-400 shrink-0" />
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
