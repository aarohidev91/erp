import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [settings, setSettings] = useState([]);
  const [customPurposes, setCustomPurposes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/settings').then(({ data }) => setSettings(data.settings || [])),
      api.get('/settings/custom-purposes').then(({ data }) => setCustomPurposes(data.categories || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const approveCustomPurpose = async (id) => {
    try {
      await api.put(`/settings/custom-purposes/${id}/approve`);
      toast.success('Approved');
      const { data } = await api.get('/settings/custom-purposes');
      setCustomPurposes(data.categories || []);
    } catch (_e) { toast.error('Failed'); }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">System Settings</h3>
        {settings.length === 0 ? <p className="text-gray-500">No settings configured</p> : (
          <div className="space-y-2">
            {settings.map((s) => (
              <div key={s._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div><span className="font-medium">{s.key}</span><span className="text-gray-500 ml-2">{s.description}</span></div>
                <span className="text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Custom Purpose Categories</h3>
        {customPurposes.length === 0 ? <p className="text-gray-500">No custom categories</p> : (
          <div className="space-y-2">
            {customPurposes.map((cp) => (
              <div key={cp._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{cp.title}</p>
                  <p className="text-sm text-gray-500">{cp.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  {cp.isApproved ? <span className="badge-green">Approved</span> : (
                    <button onClick={() => approveCustomPurpose(cp._id)} className="btn-primary !py-1 !px-3 !text-xs">Approve</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
