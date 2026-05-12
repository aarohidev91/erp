import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function RoleManagementPage() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', permissions: [] });
  const [editingId, setEditingId] = useState(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/roles');
      setRoles(data.roles || []);
    } catch (_e) {} finally { setLoading(false); }
  };

  useEffect(() => {
    fetchRoles();
    api.get('/permissions').then(({ data }) => setAllPermissions(data.permissions || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/roles/${editingId}`, form);
        toast.success('Role updated');
      } else {
        await api.post('/roles', form);
        toast.success('Role created');
      }
      setShowModal(false); setEditingId(null);
      setForm({ name: '', slug: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const togglePermission = (perm) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(perm) ? prev.permissions.filter(p => p !== perm) : [...prev.permissions, perm],
    }));
  };

  const handleEdit = (role) => {
    setEditingId(role._id);
    setForm({ name: role.name, slug: role.slug, description: role.description || '', permissions: role.permissions || [] });
    setShowModal(true);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Role Management</h1>
        <button onClick={() => { setEditingId(null); setForm({ name: '', slug: '', description: '', permissions: [] }); setShowModal(true); }} className="btn-primary">+ Create Role</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role._id} className="card">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{role.name}</h3>
              {role.isSystem && <span className="badge-blue">System</span>}
            </div>
            <p className="text-sm text-gray-500 mb-2">{role.slug}</p>
            <p className="text-xs text-gray-500 mb-3">{role.permissions?.length || 0} permissions</p>
            {!role.isSystem && (
              <button onClick={() => handleEdit(role)} className="text-indigo-600 hover:underline text-sm">Edit</button>
            )}
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Role' : 'Create Role'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Slug *</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input-field" required /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows="2" /></div>
          <div>
            <label className="block text-sm font-medium mb-2">Permissions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {allPermissions.map(p => (
                <label key={p} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.permissions.includes(p)} onChange={() => togglePermission(p)} className="rounded" />
                  {p.replace(/_/g, ' ')}
                </label>
              ))}
            </div>
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
