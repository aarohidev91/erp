import { useState, useEffect } from 'react';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function CourseManagementPage() {
  const [courses, setCourses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', department: '', duration: '', totalSeats: '', fees: '', eligibility: '', description: '' });
  const [editingId, setEditingId] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try { const { data } = await api.get('/courses'); setCourses(data.courses || []); }
    catch { /* ignore */ } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); api.get('/departments').then(({ data }) => setDepartments(data.departments || [])).catch(() => {}); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, totalSeats: parseInt(form.totalSeats) || 0, availableSeats: parseInt(form.totalSeats) || 0, fees: parseInt(form.fees) || 0 };
      if (editingId) { await api.put(`/courses/${editingId}`, payload); toast.success('Updated'); }
      else { await api.post('/courses', payload); toast.success('Created'); }
      setShowModal(false); setEditingId(null); setForm({ name: '', code: '', department: '', duration: '', totalSeats: '', fees: '', eligibility: '', description: '' }); fetch();
    } catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Course Management</h1>
        <button onClick={() => { setEditingId(null); setForm({ name: '', code: '', department: '', duration: '', totalSeats: '', fees: '', eligibility: '', description: '' }); setShowModal(true); }} className="btn-primary">+ Create Course</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map((c) => (
          <div key={c._id} className="card">
            <h3 className="text-lg font-semibold">{c.name}</h3>
            <p className="text-sm text-gray-500">Code: {c.code} • Duration: {c.duration}</p>
            <p className="text-sm text-gray-500">Dept: {c.department?.name} • Seats: {c.totalSeats} • Fee: ₹{c.fees?.toLocaleString()}</p>
            <button onClick={() => { setEditingId(c._id); setForm({ name: c.name, code: c.code, department: c.department?._id || '', duration: c.duration || '', totalSeats: c.totalSeats || '', fees: c.fees || '', eligibility: c.eligibility || '', description: c.description || '' }); setShowModal(true); }} className="text-indigo-600 hover:underline text-sm mt-2">Edit</button>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Course' : 'Create Course'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Code *</label><input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Department *</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="select-field" required>
                <option value="">Select</option>{departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-medium mb-1">Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Total Seats</label><input type="number" value={form.totalSeats} onChange={(e) => setForm({ ...form, totalSeats: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Fees (₹)</label><input type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} className="input-field" /></div>
          </div>
          <div><label className="block text-sm font-medium mb-1">Eligibility</label><input type="text" value={form.eligibility} onChange={(e) => setForm({ ...form, eligibility: e.target.value })} className="input-field" /></div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editingId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
