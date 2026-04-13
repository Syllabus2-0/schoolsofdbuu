import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../data/universityData';
import { users } from '../data/universityData';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('Faculty');
  const navigate = useNavigate();
  const { setCurrentUser } = useAuth();

  const handleLogin = () => {
    const user = users.find(u => u.role === selectedRole);
    if (user) {
      setCurrentUser(user);
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">University CMS</h1>
          <p className="text-slate-600">Academic Curriculum Management System</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Your Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-slate-900"
            >
              <option value="SuperAdmin">Super Administrator</option>
              <option value="Dean">Dean</option>
              <option value="HOD">Head of Department</option>
              <option value="Faculty">Faculty Member</option>
            </select>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>

          <div className="text-center text-sm text-slate-500">
            <p>Demo Mode: Select a role to explore the system</p>
          </div>
        </div>
      </div>
    </div>
  );
}
