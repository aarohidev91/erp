import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function DepartmentManagementPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/departments'); setDepartments(data.departments || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) { await api.put(`/departments/${editingId}`, form); toast.success('Updated'); }
      else { await api.post('/departments', form); toast.success('Created'); }
      setShowModal(false); setEditingId(null); setForm({ name: '', code: '', description: '' }); fetch();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Department Management</h1>
        <button onClick={() => { setEditingId(null); setForm({ name: '', code: '', description: '' }); setShowModal(true); }} className="btn-primary">+ Create Department</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map((d) => (
          <div key={d._id} className="card">
            <h3 className="text-lg font-semibold">{d.name}</h3>
            <p className="text-sm text-gray-500">Code: {d.code}</p>
            {d.hod && <p className="text-sm text-gray-500">HOD: {d.hod.firstName} {d.hod.lastName}</p>}
            <button onClick={() => { setEditingId(d._id); setForm({ name: d.name, code: d.code, description: d.description || '' }); setShowModal(true); }} className="text-indigo-600 hover:underline text-sm mt-2">Edit</button>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Department' : 'Create Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Code *</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows="2" /></div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
