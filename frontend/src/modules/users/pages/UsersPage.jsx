import { useEffect, useState } from 'react';
import { UserPlus, UserCheck, UserX, Trash2, Edit2, Eye, EyeOff, Users, ShieldCheck, Briefcase, ClipboardList, Building } from 'lucide-react';
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '@/permissions/roles';
import { useNotification } from '@/contexts/NotificationContext';
import { useAuth } from '@/contexts/AuthContext';
import PageHeader from '@/components/navigation/PageHeader';
import DataTable from '@/components/data-display/DataTable';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import FormField from '@/components/ui/FormField';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LoadingState from '@/components/feedback/LoadingState';
import PhoneCountryInput from '@/components/forms/PhoneCountryInput';
import { userService } from '@/services/userService';
import { clientService } from '@/services/clientService';
import { companyService } from '@/services/companyService';
import DataScopeTabs from '@/components/navigation/DataScopeTabs';
import { warehouseService } from '@/services/warehouseService';

export const UsersPage = () => {
  const { notifySuccess, notifyError } = useNotification();
  const { user: currentUser } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserState, setDeleteUserState] = useState({ isOpen: false, user: null });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState(ROLES.WAREHOUSE_MANAGER);
  const [companyId, setCompanyId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [roleFilter, setRoleFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('OWN');
  const [search, setSearch] = useState('');

  const [errors, setErrors] = useState({});

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, warehousesData] = await Promise.all([
        userService.getUsers(),
        warehouseService.getWarehouses().catch(() => [])
      ]);
      setUsersList(Array.isArray(usersData) ? usersData : []);
      setWarehouses(Array.isArray(warehousesData) ? warehousesData : []);

      if (currentUser?.role === ROLES.SUPER_ADMIN) {
        try {
          const companiesData = await companyService.getCompanies();
          setCompanies(Array.isArray(companiesData) ? companiesData : []);
          if (companiesData && companiesData.length > 0) setCompanyId(companiesData[0].id);
        } catch (companyErr) {
          console.error('Failed to load companies:', companyErr);
        }
      }
    } catch {
      notifyError('Failed to load users from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRole(ROLES.WAREHOUSE_MANAGER);
    setCompanyId(companies.length > 0 ? companies[0].id : '');
    setWarehouseId('');
    setPhone('');
    setJobTitle('');
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setName(u.name || '');
    setEmail(u.email || '');
    setPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRole(u.role || ROLES.WAREHOUSE_MANAGER);
    setCompanyId(u.companyId || '');
    setWarehouseId(u.warehouseId || '');
    setPhone(u.phone || '');
    setJobTitle(u.jobTitle || '');
    setErrors({});
    setIsModalOpen(true);
  };

  const validateUserForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim()) newErrors.name = 'Full Name is required';
    if (!jobTitle.trim()) newErrors.jobTitle = 'Job Title / Designation is required';

    if (!email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Valid email is required (e.g. name@domain.com)';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Contact Phone is required';
    }

    if (!editingUser) {
      if (!password) {
        newErrors.password = 'Initial Password is required';
      } else if (password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm Password is required';
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (password && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();

    if (!validateUserForm()) {
      notifyError('Please fix all required fields highlighted in red.');
      return;
    }

    try {
      const payload = {
        name,
        email,
        role,
        phone,
        jobTitle,
        warehouseId,
        companyId: role === ROLES.SUPER_ADMIN ? null : companyId,
      };

      if (password) {
        payload.password = password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        notifySuccess(`User ${name} updated successfully.`);
      } else {
        await userService.inviteUser(payload);
        notifySuccess(`User ${name} created with role ${ROLE_LABELS[role]}.`);
      }

      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to save user');
    }
  };

  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
    try {
      if (user.role === 'CLIENT') {
        await clientService.updateClient(user.id, { status: newStatus });
      } else {
        await userService.updateUser(user.id, { status: newStatus });
      }
      notifySuccess(`Account status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to update account status');
    }
  };

  const handleDeleteUser = (user) => {
    setDeleteUserState({ isOpen: true, user });
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserState.user) return;
    try {
      if (deleteUserState.user.role === 'CLIENT') {
        await clientService.deleteClient(deleteUserState.user.id);
      } else {
        await userService.deleteUser(deleteUserState.user.id);
      }
      notifySuccess(`User ${deleteUserState.user.name} deleted.`);
      setDeleteUserState({ isOpen: false, user: null });
      fetchData();
    } catch (err) {
      notifyError(err.message || 'Failed to delete user');
    }
  };

  const scopedUsersList = usersList.filter(u => {
    if (activeTab === 'OWN') return u.companyId === currentUser?.companyId;
    return u.companyId !== currentUser?.companyId;
  });

  const filteredUsers = scopedUsersList.filter(u => {
    const matchesSearch = `${u.name} ${u.email} ${u.company?.name || ''} ${ROLE_LABELS[u.role] || ''}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const columns = [
    {
      header: 'Full Name & Title',
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary-600 text-white font-semibold flex items-center justify-center text-xs">
            {(row.name || 'U').charAt(0)}
          </div>
          <div>
            <span className="font-semibold text-surface-900 dark:text-surface-100 block">{row.name}</span>
            <span className="text-xs text-surface-400">{row.jobTitle || 'No Title'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Contact Info',
      accessor: 'email',
      cell: (row) => (
        <div className="text-sm">
          <div className="text-surface-700 dark:text-surface-300">{row.email}</div>
          {row.phone && <div className="text-surface-500 dark:text-surface-400 text-xs">{row.phone}</div>}
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
        [ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_MANAGER].includes(currentUser?.role) ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditModal(row)}
              className="p-1.5 text-slate-400 hover:text-primary transition"
              title="Edit User Profile"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <Button size="sm" variant="ghost" leftIcon={row.status === 'Active' ? UserX : UserCheck} onClick={() => toggleUserStatus(row)}>
              {row.status === 'Active' ? 'Suspend' : 'Activate'}
            </Button>
            <button
              onClick={() => handleDeleteUser(row)}
              className="p-1.5 text-slate-400 hover:text-red-600 transition"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : null
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
          [ROLES.SUPER_ADMIN, ROLES.WAREHOUSE_MANAGER].includes(currentUser?.role) && (
            <Button variant="primary" leftIcon={UserPlus} onClick={openAddModal}>
              Provision User Account
            </Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <DataScopeTabs activeTab={activeTab} onChange={setActiveTab} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Total Users Card */}
        <div 
          onClick={() => setRoleFilter('ALL')}
          className={`cursor-pointer bg-white dark:bg-surface-900 border ${roleFilter === 'ALL' ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-surface-200 dark:border-surface-800'} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-surface-100 dark:bg-surface-800 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
            <div>
              <p className="text-xs sm:text-sm text-surface-500 font-medium mb-0.5 sm:mb-1">Total Users</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">{scopedUsersList.length}</p>
            </div>
            <div className="p-2 sm:p-2.5 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-600 dark:text-surface-300 group-hover:bg-surface-200 dark:group-hover:bg-surface-700 transition-colors">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Super Admins Card */}
        <div 
          onClick={() => setRoleFilter(ROLES.SUPER_ADMIN)}
          className={`cursor-pointer bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/30 dark:to-surface-900 border ${roleFilter === ROLES.SUPER_ADMIN ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-rose-100 dark:border-rose-900/50'} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:shadow-rose-100 dark:hover:shadow-rose-900/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-rose-100/50 dark:bg-rose-900/20 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
            <div>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400 font-medium mb-0.5 sm:mb-1">Super Admins</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
                {scopedUsersList.filter(u => u.role === ROLES.SUPER_ADMIN).length}
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-rose-100 dark:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-900/70 transition-colors">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Managers Card */}
        <div 
          onClick={() => setRoleFilter(ROLES.WAREHOUSE_MANAGER)}
          className={`cursor-pointer bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-surface-900 border ${roleFilter === ROLES.WAREHOUSE_MANAGER ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-emerald-100 dark:border-emerald-900/50'} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:shadow-emerald-100 dark:hover:shadow-emerald-900/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
            <div>
              <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-0.5 sm:mb-1">Managers</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
                {scopedUsersList.filter(u => u.role === ROLES.WAREHOUSE_MANAGER).length}
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/70 transition-colors">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Clerks Card */}
        <div 
          onClick={() => setRoleFilter(ROLES.INVENTORY_CLERK)}
          className={`cursor-pointer bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/30 dark:to-surface-900 border ${roleFilter === ROLES.INVENTORY_CLERK ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-blue-100 dark:border-blue-900/50'} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-100/50 dark:bg-blue-900/20 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
            <div>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium mb-0.5 sm:mb-1">Clerks</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
                {scopedUsersList.filter(u => u.role === ROLES.INVENTORY_CLERK).length}
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70 transition-colors">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Clients Card */}
        <div 
          onClick={() => setRoleFilter(ROLES.CLIENT)}
          className={`cursor-pointer bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/30 dark:to-surface-900 border ${roleFilter === ROLES.CLIENT ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-purple-100 dark:border-purple-900/50'} rounded-xl p-3 sm:p-5 shadow-sm hover:shadow-md hover:shadow-purple-100 dark:hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden`}
        >
          <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-purple-100/50 dark:bg-purple-900/20 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
          <div className="flex justify-between items-start mb-2 sm:mb-4 relative z-10">
            <div>
              <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 font-medium mb-0.5 sm:mb-1">Clients</p>
              <p className="text-2xl sm:text-3xl font-bold text-surface-900 dark:text-surface-100">
                {scopedUsersList.filter(u => u.role === ROLES.CLIENT).length}
              </p>
            </div>
            <div className="p-2 sm:p-2.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/70 transition-colors">
              <Building className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <DataTable columns={columns} data={filteredUsers} />
      </div>

      {/* Provision / Edit User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit ${editingUser.name}` : 'Provision Enterprise User Account'}
        size="md"
        footer={
          <div className="flex justify-end gap-3 p-6 border-t bg-slate-50">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSaveUser}
              disabled={currentUser?.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN && companies.length === 0}
            >
              {editingUser ? 'Save User Changes' : 'Save & Create User'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Full Name" required error={errors.name}>
              <Input
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}); }}
                placeholder="e.g. Sarah Jenkins"
                error={errors.name}
                required
              />
            </FormField>
            <FormField label="Job Title / Designation" required error={errors.jobTitle}>
              <Input
                value={jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); setErrors({...errors, jobTitle: ''}); }}
                placeholder="e.g. Warehouse Manager"
                error={errors.jobTitle}
                required
              />
            </FormField>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Email Address" required error={errors.email}>
              <Input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }}
                placeholder="e.g. sarah@gmail.com"
                error={errors.email}
                required
              />
            </FormField>
            <FormField label="Contact Phone" required error={errors.phone}>
              <PhoneCountryInput
                value={phone}
                onChange={(val) => { setPhone(val); setErrors({...errors, phone: ''}); }}
                placeholder="Enter phone number"
                error={errors.phone}
                required
              />
            </FormField>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField label={editingUser ? "New Password (Leave blank to keep unchanged)" : "Initial Password"} required={!editingUser} error={errors.password}>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors({...errors, password: ''}); }}
                placeholder={editingUser ? "Leave blank to keep current" : "Enter initial password"}
                required={!editingUser}
                error={errors.password}
                autoComplete="new-password"
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
              />
            </FormField>
            <FormField label={editingUser ? "Confirm New Password" : "Confirm Password"} required={!editingUser} error={errors.confirmPassword}>
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrors({...errors, confirmPassword: ''}); }}
                placeholder={editingUser ? "Leave blank to keep current" : "Confirm initial password"}
                required={!editingUser}
                error={errors.confirmPassword}
                autoComplete="new-password"
                rightIcon={showConfirmPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </FormField>
          </div>
          
          <FormField label="Assign RBAC Role" required>
            <Select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={
                currentUser?.role === ROLES.SUPER_ADMIN
                  ? [
                      { value: ROLES.SUPER_ADMIN, label: 'Super Admin' },
                      { value: ROLES.WAREHOUSE_MANAGER, label: 'Warehouse Manager' },
                      { value: ROLES.INVENTORY_CLERK, label: 'Inventory Clerk' },
                    ]
                  : [
                      { value: ROLES.INVENTORY_CLERK, label: 'Inventory Clerk' },
                    ]
              }
            />
          </FormField>
          {currentUser?.role === ROLES.SUPER_ADMIN && role !== ROLES.SUPER_ADMIN && (
            <FormField label="Assign Client Company">
              {companies.length === 0 ? (
                <div>
                  <Select
                    value=""
                    disabled
                    options={[{ value: '', label: 'No companies available' }]}
                  />
                  <p className="text-xs text-red-500 mt-1">Please create a company first.</p>
                </div>
              ) : (
                <Select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  options={[{value: '', label: 'Select Company'}, ...companies.map((c) => ({ value: c.id, label: c.name }))]}
                />
              )}
            </FormField>
          )}
          {role === ROLES.INVENTORY_CLERK && warehouses.length > 0 && (
            <FormField label="Assign Warehouse (Optional)">
              <Select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                options={[{value: '', label: 'All Warehouses'}, ...warehouses.map((w) => ({ value: w.id, label: w.name }))]}
              />
            </FormField>
          )}
        </form>
      </Modal>
      {/* Delete User Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteUserState.isOpen}
        onClose={() => setDeleteUserState({ isOpen: false, user: null })}
        onConfirm={confirmDeleteUser}
        title="Delete User Account"
        message={`Are you sure you want to delete user account "${deleteUserState.user?.name}" (${deleteUserState.user?.email})? This action cannot be undone.`}
        confirmText="Yes, Delete User"
        variant="danger"
      />
    </section>
  );
};

export default UsersPage;
