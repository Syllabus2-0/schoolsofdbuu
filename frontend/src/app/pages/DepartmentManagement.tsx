import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  departments,
  users,
  getDepartmentsBySchool,
  getSchoolById,
  addDepartment,
  assignHOD,
  removeHOD,
} from '../data/universityData';
import { Plus, Briefcase, Edit, Trash2, UserCheck, X, Calendar } from 'lucide-react';

export default function DepartmentManagement() {
  const { currentUser } = useAuth();
  const [showAddDept, setShowAddDept] = useState(false);
  const [showHODModal, setShowHODModal] = useState<string | null>(null);
  const [newDeptName, setNewDeptName] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [, forceUpdate] = useState(0);

  if (!currentUser || currentUser.role !== 'Dean' || !currentUser.schoolId) {
    return <div className="p-8">Access denied</div>;
  }

  const refresh = () => forceUpdate(n => n + 1);
  const school = getSchoolById(currentUser.schoolId);
  const schoolDepts = getDepartmentsBySchool(currentUser.schoolId);

  const handleAddDept = () => {
    if (!newDeptName.trim()) return;
    addDepartment({
      id: `dept_${Date.now()}`,
      name: newDeptName.trim(),
      schoolId: currentUser.schoolId!,
    });
    setNewDeptName('');
    setShowAddDept(false);
    refresh();
  };

  const handleAssignHOD = (deptId: string) => {
    if (!selectedUserId) return;
    assignHOD(deptId, selectedUserId, selectedYear);
    setShowHODModal(null);
    setSelectedUserId('');
    setSelectedYear(1);
    refresh();
  };

  const handleRemoveHOD = (deptId: string) => {
    removeHOD(deptId);
    refresh();
  };

  // Users eligible to be HOD
  const availableUsers = users.filter(
    u => u.role === 'HOD' || u.role === 'Faculty'
  );

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Department Management</h1>
            <p className="text-slate-600">
              {school?.code} — Manage departments and assign HODs
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
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Assigned Year</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schoolDepts.map(dept => {
                  const hod = dept.hodId ? users.find(u => u.id === dept.hodId) : null;

                  return (
                    <tr key={dept.id} className="hover:bg-slate-50 transition-colors">
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
                                {hod.name.split(' ').map(n => n[0]).join('')}
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
                        {hod && hod.assignedYear ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                            <Calendar className="w-3 h-3" />
                            Year {hod.assignedYear}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setShowHODModal(dept.id); setSelectedUserId(''); setSelectedYear(1); }}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                          >
                            {hod ? <Edit className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                            {hod ? 'Change' : 'Assign'} HOD
                          </button>
                          {hod && (
                            <button
                              onClick={() => handleRemoveHOD(dept.id)}
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

                {schoolDepts.length === 0 && (
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
                <button onClick={() => setShowAddDept(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Department Name</label>
                <input
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
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assign HOD</h2>
                <button onClick={() => setShowHODModal(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">Choose a user...</option>
                    {availableUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role}) — {u.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Year</label>
                  <select
                    value={selectedYear}
                    onChange={e => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    The HOD will manage this year across all programs in the department.
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
                  Assign HOD
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
