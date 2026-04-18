import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Edit, Trash2, Users as UsersIcon } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  departmentId?: string;
}

interface School {
  _id: string;
  name: string;
  code: string;
}

interface Department {
  _id: string;
  name: string;
}

export default function UserManagement() {
  const { currentUser, token } = useAuth();
  const isRegistrar = currentUser?.role === 'Registrar' || currentUser?.role === 'SuperAdmin';
  
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!token || !isRegistrar) return;

    const fetchData = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const [resUsers, resSchools, resDepts] = await Promise.all([
          fetch('/api/users', { headers: auth }),
          fetch('/api/schools'), // Public
          fetch('/api/departments') // Public
        ]);

        if (resUsers.ok) setUsers(await resUsers.json());
        if (resSchools.ok) setSchools(await resSchools.json());
        if (resDepts.ok) setDepartments(await resDepts.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, currentUser]);

  if (!currentUser || !isRegistrar) {
    return <div className="p-8">Access denied</div>;
  }

  const roleColors: Record<string, string> = {
    Registrar: 'bg-purple-100 text-purple-700',
    SuperAdmin: 'bg-purple-100 text-purple-700',
    Dean: 'bg-blue-100 text-blue-700',
    HOD: 'bg-green-100 text-green-700',
    Faculty: 'bg-amber-100 text-amber-700',
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">User Management</h1>
              <p className="text-slate-600">Manage users and access control</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-50 rounded-lg">
                <UsersIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'Registrar' || u.role === 'SuperAdmin').length}
                </div>
                <div className="text-sm text-slate-600">Registrars</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'Dean').length}
                </div>
                <div className="text-sm text-slate-600">Deans</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-50 rounded-lg">
                <UsersIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'HOD').length}
                </div>
                <div className="text-sm text-slate-600">HODs</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 rounded-lg">
                <UsersIcon className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {users.filter(u => u.role === 'Faculty').length}
                </div>
                <div className="text-sm text-slate-600">Faculty</div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                    Scope
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map(user => {
                  const school = user.schoolId ? schools.find(s => s._id === user.schoolId) : null;
                  const dept = user.departmentId
                    ? departments.find(d => d._id === user.departmentId)
                    : null;

                  return (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{user.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-slate-100 text-slate-700'
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {school && <div className="font-medium">{school.code}</div>}
                          {dept && <div className="text-xs text-slate-500">{dept.name}</div>}
                          {!school && !dept && <span className="text-slate-400 italic">Global</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            title="Edit User"
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            title="Delete User"
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Add New User</h2>
              <div className="text-slate-600 mb-6 bg-blue-50 p-3 rounded text-sm">
                Adding users through the admin portal relies on the backend route implementation. Please use the unified Signup page for testing or wire up the POST /api/users endpoint.
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
