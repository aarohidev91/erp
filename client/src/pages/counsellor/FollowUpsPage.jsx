import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/common/StatusBadge';

export default function FollowUpsPage() {
  const navigate = useNavigate();
  const [overdue, setOverdue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/follow-ups')
      .then(({ data }) => { setOverdue(data.overdue || []); setUpcoming(data.upcoming || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center py-24"><div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" /></div>;

  const renderList = (items, title, color) => (
    <div className="card mb-6">
      <h3 className={`text-lg font-semibold mb-4 ${color}`}>{title} ({items.length})</h3>
      {items.length === 0 ? <p className="text-gray-500 text-center py-4">None</p> : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <button onClick={() => navigate(`/cases/${item.case?._id}`)} className="text-indigo-600 hover:underline font-medium text-sm">{item.case?.caseId}</button>
                <span className="text-sm text-gray-700 ml-2">{item.case?.visitorName} • {item.case?.mobile}</span>
                <p className="text-xs text-gray-500 mt-1">{item.text?.substring(0, 100)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{new Date(item.followUpDate).toLocaleDateString()}</p>
                <StatusBadge status={item.case?.currentStatus} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Follow-ups</h1>
      {renderList(overdue, 'Overdue Follow-ups', 'text-red-600')}
      {renderList(upcoming, 'Upcoming Follow-ups', 'text-blue-600')}
    </div>
  );
}
