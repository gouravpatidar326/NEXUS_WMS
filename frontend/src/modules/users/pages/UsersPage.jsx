import { useEffect, useState } from 'react';
import { UserPlus, UserCheck, UserX, Trash2 } from 'lucide-react';
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
import LoadingState from '@/components/feedback/LoadingState';
import { userService } from '@/services/userService';
import { companyService } from '@/services/companyService';

export const UsersPage = () => {
  const { notifySuccess, notifyError } = useNotification();

  const [usersList, setUsersList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('nexus123');
  const [role, setRole] = useState(ROLES.INVENTORY_CLERK);
  const [companyId, setCompanyId] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, companiesData] = await Promise.all([
        userService.getUsers(),
        companyService.getCompanies(),
      ]);
      setUsersList(Array.isArray(usersData) ? usersData : []);
      setCompanies(Array.isArray(companiesData) ? companiesData : []);
      if (companiesData && companiesData.length > 0) setCompanyId(companiesData[0].id);
    } catch {
      notifyError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInviteUser = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      notifyError('Name and Email are required');
      return;
    }

    try {
      await userService.inviteUser({
        name,
        email,
        password,
        role,
        companyId: role === ROLES.SUPER_ADMIN ? null : companyId,
      });
      notifySuccess(`User ${name} created with role ${ROLE_LABELS[role]}.`);
      setIsModalOpen(false);
      setName('');
      setEmail('');
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to create user');
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await userService.updateUser(user.id, { status: newStatus });
      notifySuccess(`Account status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user "${user.name}"?`)) return;
    try {
      await userService.deleteUser(user.id);
      notifySuccess(`User ${user.name} deleted.`);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = usersList.filter((item) =>
    `${item.name} ${item.email} ${item.company?.name || ''} ${ROLE_LABELS[item.role] || ''}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const columns = [
    {
      header: 'Full Name',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center text-xs">
            {(row.name || 'U').charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs text-surface-400">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Company / Tenant',
      accessor: 'company',
      cell: (row) => row.company?.name || 'Global Platform Admin',
    },
    {
      header: 'Assigned RBAC Role',
      accessor: 'role',
      cell: (row) => <Badge variant={ROLE_COLORS[row.role]}>{ROLE_LABELS[row.role] || row.role}</Badge>,
    },
    {
      header: 'Account Status',
      accessor: 'status',
      cell: (row) => <Badge variant={row.status === 'Active' ? 'success' : 'warning'} dot>{row.status || 'Active'}</Badge>,
    },
    {
      header: 'Actions',
      accessor: 'action',
      cell: (row) => (
        <PermissionGuard permission={PERMISSIONS.USERS_EDIT}>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" leftIcon={row.status === 'Active' ? UserX : UserCheck} onClick={() => toggleUserStatus(row)}>
              {row.status === 'Active' ? 'Suspend' : 'Activate'}
            </Button>
            <button onClick={() => handleDeleteUser(row)} className="p-1.5 text-slate-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  if (loading) return <LoadingState message="Loading Users & RBAC Roles from database..." />;

  return (
    <section className="space-y-6 flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-hidden">
      <PageHeader
        title="Role-Based User Management"
        description="Provision accounts, assign multi-tenant company access, and manage RBAC security roles"
        breadcrumbs={[{ label: 'Administration' }, { label: 'Users' }]}
        actions={
          <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
            <Button variant="primary" leftIcon={UserPlus} onClick={() => setIsModalOpen(true)}>
              Provision User Account
            </Button>
          </PermissionGuard>
        }
      />

      <div className="flex-1">
        <DataTable columns={columns} data={filteredUsers} />
      </div>

      {/* Provision User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Provision Enterprise User Account"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleInviteUser}>Save & Create User</Button>
          </>
        }
      >
        <form onSubmit={handleInviteUser} className="space-y-4">
          <FormField label="Full Name" required>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Sarah Jenkins" required />
          </FormField>
          <FormField label="Email Address" required>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sarah@company.com" required />
          </FormField>
          <FormField label="Initial Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="nexus123" />
          </FormField>
          <FormField label="Assign RBAC Role" required>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
                { value: ROLES.WAREHOUSE_MANAGER, label: 'Warehouse Manager' },
                { value: ROLES.INVENTORY_CLERK, label: 'Inventory Clerk' },
                { value: ROLES.CLIENT, label: 'Client User' },
              ]}
            />
          </FormField>
          {role !== ROLES.SUPER_ADMIN && (
            <FormField label="Assign Client Company">
              <Select
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
              />
            </FormField>
          )}
        </form>
      </Modal>
    </section>
  );
};

export default UsersPage;
