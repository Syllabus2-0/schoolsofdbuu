import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  schools,
  users,
  addSchool,
  assignDean,
  removeDean,
  getUsersByRole,
  getDepartmentsBySchool,
} from '../data/universityData';
import { Plus, Building, Edit, Trash2, UserCheck, X } from 'lucide-react';

export default function SchoolManagement() {
  const { currentUser } = useAuth();
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [showDeanModal, setShowDeanModal] = useState<string | null>(null);
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolCode, setNewSchoolCode] = useState('');
  const [selectedDeanId, setSelectedDeanId] = useState('');
  const [, forceUpdate] = useState(0);

  if (!currentUser || currentUser.role !== 'SuperAdmin') {
    return <div className="p-8">Access denied</div>;
  }

  const refresh = () => forceUpdate(n => n + 1);

  const handleAddSchool = () => {
    if (!newSchoolName.trim() || !newSchoolCode.trim()) return;
    addSchool({
      id: `sch_${Date.now()}`,
      name: newSchoolName.trim(),
      code: newSchoolCode.trim().toUpperCase(),
    });
    setNewSchoolName('');
    setNewSchoolCode('');
    setShowAddSchool(false);
    refresh();
  };

  const handleAssignDean = (schoolId: string) => {
    if (!selectedDeanId) return;
    assignDean(schoolId, selectedDeanId);
    setShowDeanModal(null);
    setSelectedDeanId('');
    refresh();
  };

  const handleRemoveDean = (schoolId: string) => {
    removeDean(schoolId);
    refresh();
  };

  // Get users who could be deans (Deans without school or all users)
  const availableDeans = users.filter(
    u => u.role === 'Dean' || u.role === 'Faculty' || u.role === 'SuperAdmin'
  );

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
            const dean = school.deanId ? users.find(u => u.id === school.deanId) : null;
            const deptCount = getDepartmentsBySchool(school.id).length;

            return (
              <div key={school.id} className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Building className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{school.code}</h3>
                      <p className="text-xs text-slate-500 max-w-[180px] truncate">{school.name}</p>
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
                            {dean.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{dean.name}</p>
                          <p className="text-xs text-slate-500">{dean.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setShowDeanModal(school.id); setSelectedDeanId(''); }}
                          className="p-1.5 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                          title="Change Dean"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveDean(school.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove Dean"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setShowDeanModal(school.id); setSelectedDeanId(''); }}
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
                <button onClick={() => setShowAddSchool(false)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Name</label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={e => setNewSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., School of Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">School Code</label>
                  <input
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
                <button onClick={() => setShowDeanModal(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select
                  value={selectedDeanId}
                  onChange={e => setSelectedDeanId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Choose a user...</option>
                  {availableDeans.map(u => (
                    <option key={u.id} value={u.id}>
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
