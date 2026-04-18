import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Briefcase, Edit, Trash2, UserCheck, X, Calendar } from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  departmentId?: string;
  assignedYears?: number[];
}

interface Department {
  _id: string;
  name: string;
  hodId?: User;
}

export default function DepartmentManagement() {
  const { currentUser, token, refreshUser } = useAuth();
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [showAddDept, setShowAddDept] = useState(false);
  const [showHODModal, setShowHODModal] = useState<string | null>(null);
  
  const [newDeptName, setNewDeptName] = useState('');
  
  // HOD Assignment state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedYears, setSelectedYears] = useState<number[]>([]);

  // If Dean but no schoolId, maybe it was just assigned. Try refresh once.
  useEffect(() => {
    if (currentUser?.role === 'Dean' && !currentUser.schoolId) {
      refreshUser();
    }
  }, [currentUser?.role, currentUser?.schoolId, refreshUser]);

  useEffect(() => {
    if (!token || currentUser?.role !== 'Dean') return;

    const loadData = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const [resDept, resUsers] = await Promise.all([
          fetch(`/api/departments`, { headers: auth }),
          fetch(`/api/users`, { headers: auth }),
        ]);

        if (resDept.ok) setDepartments(await resDept.json());
        if (resUsers.ok) setUsers(await resUsers.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, currentUser, refresh]);

  if (!currentUser || currentUser.role !== 'Dean' || !currentUser.schoolId) {
    return <div className="p-8">Access denied</div>;
  }

  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newDeptName.trim(), schoolId: currentUser.schoolId })
      });
      setNewDeptName('');
      setShowAddDept(false);
      setRefresh(r => r+1);
    } catch(err) {
      console.error(err);
    }
  };

  const handleAssignHOD = async (deptId: string) => {
    if (!selectedUserId) return;
    try {
      await fetch(`/api/departments/${deptId}/hod`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: selectedUserId, assignedYears: selectedYears })
      });
      setShowHODModal(null);
      setSelectedUserId('');
      setSelectedYears([]);
      setRefresh(r => r+1);
    } catch(err) {
      console.error(err);
    }
  };

  const handleRemoveHOD = async (deptId: string) => {
    try {
      await fetch(`/api/departments/${deptId}/hod`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => r+1);
    } catch(err) {
      console.error(err);
    }
  };

  const toggleYear = (year: number) => {
    setSelectedYears(prev => 
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const availableUsers = users.filter(u => u.role === 'HOD' || u.role === 'Faculty');

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Department Management</h1>
            <p className="text-slate-600">
              Manage departments and assign HODs
            </p>
          </div>
          <button
            onClick={() => setShowAddDept(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Department
          </button>
        </div>

        {/* Departments Table */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Department</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">HOD</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Assigned Years</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {departments.map(dept => {
                  const hod = dept.hodId;

                  return (
                    <tr key={dept._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 rounded-lg">
                            <Briefcase className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="font-medium text-slate-900">{dept.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {hod ? (
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-green-700">
                                {hod.name.split(' ').map((n: string) => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{hod.name}</p>
                              <p className="text-xs text-slate-500">{hod.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400 italic">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hod && hod.assignedYears && hod.assignedYears.length > 0 ? (
                          <div className="flex gap-1 flex-wrap">
                            {hod.assignedYears.map((y:number) => (
                              <span key={y} className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                <Calendar className="w-3 h-3" />
                                Year {y}
                              </span>
                            ))}
                          </div>
                        ) : hod && (!hod.assignedYears || hod.assignedYears.length === 0) ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Calendar className="w-3 h-3" />
                            All Years
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { 
                              setShowHODModal(dept._id); 
                              setSelectedUserId(hod?._id || ''); 
                              setSelectedYears(hod?.assignedYears || []); 
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            {hod ? <Edit className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {hod ? 'Edit' : 'Assign'} HOD
                          </button>
                          {hod && (
                            <button
                              onClick={() => handleRemoveHOD(dept._id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Remove HOD"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {departments.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                      No departments yet. Click "Add Department" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Department Modal */}
        {showAddDept && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Add New Department</h2>
                <button 
                  title="Close modal"
                  onClick={() => setShowAddDept(false)} 
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-6">
                <label htmlFor="dept-name" className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input
                  id="dept-name"
                  type="text"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Electronics Engineering"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAddDept(false)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button onClick={handleAddDept} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Department
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assign HOD Modal */}
        {showHODModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 text-left">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assign/Edit HOD</h2>
                <button 
                  title="Close modal"
                  onClick={() => setShowHODModal(null)} 
                  className="p-1 hover:bg-slate-100 rounded"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                  <select
                    id="user-select"
                    title="Select a user to assign as HOD"
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(u => (
                      <option key={u._id} value={u._id}>
                        {u.name} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Years</label>
                  <div className="flex flex-wrap gap-3">
                    {[1, 2, 3, 4, 5].map(year => (
                      <label key={year} className="flex items-center gap-2 cursor-pointer bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                          checked={selectedYears.includes(year)}
                          onChange={() => toggleYear(year)}
                        />
                        <span className="text-sm font-medium text-slate-700">Year {year}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    The HOD will manage subjects spanning these years. Leave all blank to allow management across ALL years.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowHODModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleAssignHOD(showHODModal)}
                  disabled={!selectedUserId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  Save HOD Scope
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
