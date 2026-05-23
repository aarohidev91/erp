import { useState, useEffect } from 'react';
import api from '../../services/api';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [form, setForm] = useState({ username: '', email: '', firstName: '', lastName: '', role: '', department: '', phone: '', password: '' });
  const [editingId, setEditingId] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users', { params: { page, limit: 20, search: search || undefined } });
      setUsers(data.users); setTotal(data.total); setTotalPages(data.totalPages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    api.get('/roles').then(({ data }) => setRoles(data.roles || [])).catch(() => {});
    api.get('/departments').then(({ data }) => setDepartments(data.departments || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
        toast.success('User updated');
      } else {
        const { data } = await api.post('/users', form);
        toast.success(`User created. Temp password: ${data.temporaryPassword}`);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ username: '', email: '', firstName: '', lastName: '', role: '', department: '', phone: '', password: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed');
    }
  };

  const handleEdit = (user) => {
    setEditingId(user._id);
    setForm({ username: user.username, email: user.email, firstName: user.firstName, lastName: user.lastName || '', role: user.role?._id || '', department: user.department?._id || '', phone: user.phone || '', password: '' });
    setShowModal(true);
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Reset password for this user?')) return;
    try {
      const { data } = await api.post(`/users/${userId}/reset-password`);
      toast.success(`Password reset. New temp password: ${data.temporaryPassword}`);
    } catch {
      toast.error('Failed to reset password');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(user.isActive ? 'User disabled' : 'User enabled');
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const columns = [
    { key: 'username', label: 'Username' },
    { key: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName || ''}` },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role', render: (r) => r.role?.name || '-' },
    { key: 'department', label: 'Department', render: (r) => r.department?.name || '-' },
    { key: 'isActive', label: 'Status', render: (r) => (
      <span className={`badge ${r.isActive ? 'badge-green' : 'badge-red'}`}>{r.isActive ? 'Active' : 'Disabled'}</span>
    )},
    { key: 'lastLogin', label: 'Last Login', render: (r) => r.lastLogin ? new Date(r.lastLogin).toLocaleDateString() : 'Never' },
    { key: 'actions', label: 'Actions', render: (r) => (
      <div className="flex gap-1">
        <button onClick={() => handleEdit(r)} className="text-indigo-600 hover:underline text-xs">Edit</button>
        <button onClick={() => handleResetPassword(r._id)} className="text-orange-600 hover:underline text-xs">Reset PW</button>
        <button onClick={() => handleToggleActive(r)} className={`text-xs hover:underline ${r.isActive ? 'text-red-600' : 'text-green-600'}`}>
          {r.isActive ? 'Disable' : 'Enable'}
        </button>
      </div>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-500 mt-1">{total} users</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ username: '', email: '', firstName: '', lastName: '', role: '', department: '', phone: '', password: '' }); setShowModal(true); }} className="btn-primary">+ Create User</button>
      </div>
      <div className="mb-4">
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-sm" />
      </div>
      <DataTable columns={columns} data={users} page={page} totalPages={totalPages} onPageChange={setPage} loading={loading} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit User' : 'Create User'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Username *</label><input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input-field" required disabled={!!editingId} /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">First Name *</label><input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Last Name</label><input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Role *</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="select-field" required>
                <option value="">Select Role</option>
                {roles.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="select-field">
                <option value="">Select Department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
            {!editingId && <div><label className="block text-sm font-medium mb-1">Password</label><input type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Auto-generate if empty" /></div>}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
