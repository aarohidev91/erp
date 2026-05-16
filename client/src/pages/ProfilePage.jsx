import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-indigo-600">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
            <p className="text-gray-500">{user?.role?.name}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">Username:</span> <span className="font-medium">{user?.username}</span></div>
          <div><span className="text-gray-500">Email:</span> <span className="font-medium">{user?.email}</span></div>
          <div><span className="text-gray-500">Role:</span> <span className="font-medium">{user?.role?.name}</span></div>
          <div><span className="text-gray-500">Department:</span> <span className="font-medium">{user?.department?.name || '-'}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{user?.phone || '-'}</span></div>
          <div><span className="text-gray-500">Last Login:</span> <span className="font-medium">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : '-'}</span></div>
        </div>
      </div>
    </div>
  );
}
