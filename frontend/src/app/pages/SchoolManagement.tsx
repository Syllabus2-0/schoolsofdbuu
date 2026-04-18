import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Building, Edit, Trash2, UserCheck, X } from 'lucide-react';

interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: string;
}

interface School {
  _id: string;
  name: string;
  code: string;
  deanId?: User;
}

interface Department {
  _id: string;
  name: string;
  schoolId?: string | { _id: string };
}

export default function SchoolManagement() {
  const { currentUser, token } = useAuth();
  const [schools, setSchools] = useState<School[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showDeanModal, setShowDeanModal] = useState<string | null>(null);
  
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [selectedDeanId, setSelectedDeanId] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    if (!token || currentUser?.role !== 'SuperAdmin') return;

    const fetchData = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const [resSchools, resDepts, resUsers] = await Promise.all([
          fetch('/api/schools', { headers: auth }),
          fetch('/api/departments', { headers: auth }),
          fetch('/api/users', { headers: auth }),
        ]);

        if (resSchools.ok) setSchools(await resSchools.json());
        if (resDepts.ok) setDepartments(await resDepts.json());
        if (resUsers.ok) setUsers(await resUsers.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, currentUser, refresh]);

  if (!currentUser || currentUser.role !== 'SuperAdmin') {
    return <div className="p-8">Access denied</div>;
  }

  const handleAddSchool = async () => {
    if (!newSchoolName.trim() || !newSchoolCode.trim()) return;
    try {
      await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newSchoolName.trim(), code: newSchoolCode.trim().toUpperCase() })
      });
      setNewSchoolName('');
      setNewSchoolCode('');
      setShowAddSchool(false);
      setRefresh(r => r + 1);
    } catch(err) {
      console.error(err);
    }
  };

  const handleAssignDean = async (schoolId: string) => {
    if (!selectedDeanId) return;
    try {
      await fetch(`/api/schools/${schoolId}/dean`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedDeanId })
      });
      setShowDeanModal(null);
      setSelectedDeanId('');
      setRefresh(r => r + 1);
    } catch(err) {
      console.error(err);
    }
  };

  const handleRemoveDean = async (schoolId: string) => {
    try {
      await fetch(`/api/schools/${schoolId}/dean`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => r + 1);
    } catch(err) {
      console.error(err);
    }
  };

  // Get users who could be deans (Deans without school or all users)
  const availableDeans = users.filter(
    u => u.role === 'Dean' || u.role === 'Faculty' || u.role === 'SuperAdmin'
  );

  if (loading) return <div className="p-8">Loading schools...</div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">School Management</h1>
            <p className="text-slate-600">Manage schools and assign deans</p>
          </div>
          <button
            onClick={() => setShowAddSchool(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add School
          </button>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map(school => {
            const dean = school.deanId;
            const deptCount = departments.filter(d => {
              const sid = typeof d.schoolId === 'object' ? d.schoolId?._id : d.schoolId;
              return sid === school._id;
            }).length;

            return (
              <div key={school._id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{school.code}</h3>
                      <p className="text-xs text-slate-500 max-w-[180px] hover:whitespace-normal truncate" title={school.name}>{school.name}</p>
                    </div>
                  </div>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                    {deptCount} dept{deptCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Dean Section */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="text-xs font-medium text-slate-500 uppercase mb-2">Dean</div>
                  {dean ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-700">
                            {dean.name?.split(' ').map((n: string) => n[0]).join('') || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{dean.name}</p>
                          <p className="text-xs text-slate-500">{dean.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setShowDeanModal(school._id); setSelectedDeanId(''); }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                          title="Change Dean"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveDean(school._id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove Dean"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowDeanModal(school._id); setSelectedDeanId(''); }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 text-slate-500 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors text-sm"
                    >
                      <UserCheck className="w-4 h-4" />
                      Assign Dean
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add School Modal */}
        {showAddSchool && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Add New School</h2>
                <button 
                  title="Close modal"
                  onClick={() => setShowAddSchool(false)} 
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="school-name" className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                  <input
                    id="school-name"
                    type="text"
                    value={newSchoolName}
                    onChange={e => setNewSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., School of Computer Science"
                  />
                </div>
                <div>
                  <label htmlFor="school-code" className="block text-sm font-medium text-slate-700 mb-1">School Code</label>
                  <input
                    id="school-code"
                    type="text"
                    value={newSchoolCode}
                    onChange={e => setNewSchoolCode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., SOCS"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAddSchool(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddSchool} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Add School
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign Dean Modal */}
        {showDeanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assign Dean</h2>
                <button 
                  title="Close modal"
                  onClick={() => setShowDeanModal(null)} 
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-6">
                <label htmlFor="dean-select" className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select
                  id="dean-select"
                  title="Select a user to assign as Dean"
                  value={selectedDeanId}
                  onChange={e => setSelectedDeanId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Choose a user...</option>
                  {availableDeans.map(u => (
                    <option key={u.id || u._id} value={u.id || u._id}>
                      {u.name} ({u.role}) — {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowDeanModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignDean(showDeanModal)}
                  disabled={!selectedDeanId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Assign Dean
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
