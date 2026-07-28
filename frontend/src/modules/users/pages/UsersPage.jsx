import { useEffect, useMemo, useState } from 'react';
import { Users, UserPlus, Search, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import { PERMISSIONS } from '@/permissions/permissions';
import PermissionGuard from '@/guards/PermissionGuard';

import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

export const UsersPage = () => {
  const { notifySuccess } = useNotification();
  const [usersList, setUsersList] = useState(() => JSON.parse(localStorage.getItem('wms_users') || 'null') || [
    { id: 'usr_001', name: 'Alex Morgan', email: 'alex@stitchnexus.com', role: ROLES.SUPER_ADMIN, department: 'Management', status: 'Active' },
    { id: 'usr_002', name: 'Jordan Lee', email: 'jordan@stitchnexus.com', role: ROLES.WAREHOUSE_MANAGER, department: 'Warehouse Ops', status: 'Active' },
    { id: 'usr_003', name: 'Casey Rivera', email: 'casey@stitchnexus.com', role: ROLES.INVENTORY_CLERK, department: 'Stock Inventory', status: 'Active' },
    { id: 'usr_004', name: 'Sam Wilson', email: 'sam@acmecorp.com', role: ROLES.CLIENT, department: 'Client Accounts', status: 'Active' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(ROLES.INVENTORY_CLERK);
  const [department, setDepartment] = useState('Warehouse Ops');
  const [search, setSearch] = useState('');

  useEffect(() => localStorage.setItem('wms_users', JSON.stringify(usersList)), [usersList]);

  const filteredUsers = useMemo(() => usersList.filter((item) =>
    `${item.name} ${item.email} ${item.department} ${ROLE_LABELS[item.role]}`.toLowerCase().includes(search.toLowerCase())
  ), [search, usersList]);

  const handleAddUser = (e) => {
    e.preventDefault();
    const newUser = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      department,
      status: 'Active',
    };
    setUsersList([...usersList, newUser]);
    notifySuccess(`User ${name} invited with role ${ROLE_LABELS[role]}.`);
    setIsModalOpen(false);
    setName('');
    setEmail('');
  };

  const toggleUserStatus = (id) => {
    setUsersList((current) => current.map((item) => item.id === id ? { ...item, status: item.status === 'Active' ? 'Suspended' : 'Active' } : item));
    notifySuccess('Account status updated successfully.');
  };

  const columns = [
    {
      header: 'Full Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center text-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs text-surface-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    { header: 'Department', accessor: 'department' },
    {
      header: 'Assigned RBAC Role',
      accessor: 'role',
      cell: (row) => <Badge variant={ROLE_COLORS[row.role]}>{ROLE_LABELS[row.role]}</Badge>,
    },
    {
      header: 'Account Status',
      accessor: 'status',
      cell: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'} dot>{row.status}</Badge>,
    },
    {
      header: 'Action', accessor: 'action',
      cell: (row) => (
        <PermissionGuard permission={PERMISSIONS.USERS_EDIT}>
          <Button size="sm" variant="ghost" leftIcon={row.status === 'Active' ? UserX : UserCheck} onClick={() => toggleUserStatus(row.id)}>
            {row.status === 'Active' ? 'Suspend' : 'Activate'}
          </Button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access & Provisioning"
        description="Manage internal staff users, assign RBAC roles, and control account permissions"
        breadcrumbs={[{ label: 'Administration' }, { label: 'User Management' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
            <Button variant="primary" leftIcon={UserPlus} onClick={() => setIsModalOpen(true)}>
              Invite New User
            </Button>
          </PermissionGuard>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="card flex items-center gap-3 p-4"><Users className="h-10 w-10 rounded-xl bg-primary-50 p-2 text-primary-600" /><div><p className="text-xs text-surface-500">Total accounts</p><p className="text-xl font-bold">{usersList.length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><UserCheck className="h-10 w-10 rounded-xl bg-success-50 p-2 text-success-600" /><div><p className="text-xs text-surface-500">Active users</p><p className="text-xl font-bold">{usersList.filter((item) => item.status === 'Active').length}</p></div></div>
        <div className="card flex items-center gap-3 p-4"><ShieldCheck className="h-10 w-10 rounded-xl bg-info-50 p-2 text-info-600" /><div><p className="text-xs text-surface-500">Security roles</p><p className="text-xl font-bold">{Object.keys(ROLE_LABELS).length}</p></div></div>
      </div>

      <div className="card p-4">
        <div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users, email, role or department..." className="pl-9" /></div>
      </div>

      <DataTable columns={columns} data={filteredUsers} emptyTitle="No matching users" emptyDescription="Try another name, email, role, or department." />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Invite New System User"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddUser}>
              Send Invite & Assign Role
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <FormField label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Taylor Reed" required />
          </FormField>

          <FormField label="Work Email Address" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="taylor@stitchnexus.com" required />
          </FormField>

          <FormField label="Assigned RBAC Role" required>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={Object.keys(ROLE_LABELS).map((key) => ({
                value: key,
                label: ROLE_LABELS[key],
              }))}
            />
          </FormField>

          <FormField label="Department" required>
            <Input value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="e.g. Warehouse Operations" required />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default UsersPage;
