import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/notifications', { params: { limit: 50 } });
      setNotifications(data.notifications || []);
    } catch (_e) {} finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetch();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    toast.success('All marked as read');
    fetch();
  };

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button onClick={markAllRead} className="btn-secondary">Mark All as Read</button>
      </div>
      <div className="space-y-2">
        {notifications.length === 0 ? <div className="card text-center py-8 text-gray-500">No notifications</div> : notifications.map((n) => (
          <div key={n._id} className={`card !p-4 cursor-pointer ${n.isRead ? 'opacity-60' : 'border-l-4 border-l-indigo-500'}`} onClick={() => { markRead(n._id); if (n.case) navigate(`/cases/${n.case._id || n.case}`); }}>
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">{n.title}</h4>
              <span className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
