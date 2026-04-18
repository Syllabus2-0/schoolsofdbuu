import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Trash2,
  Upload,
  FileCheck,
  BookOpen,
  Layers,
  Calendar,
  FileText,
  CheckCircle,
  X,
} from 'lucide-react';

const levelOrder = ['UG', 'PG', 'Ph.D'];
const levelLabels: Record<string, string> = { UG: 'Undergraduate', PG: 'Postgraduate', 'Ph.D': 'Doctorate' };

export default function TeacherAssignment() {
  const { currentUser, token } = useAuth();
  
  const [dept, setDept] = useState<any>(null);
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [popsoDocs, setPopsoDocs] = useState<any[]>([]);
  const [facultyUsers, setFacultyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [showAssignModal, setShowAssignModal] = useState<any | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  
  const poInputRef = useRef<HTMLInputElement>(null);
  const psoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token || !currentUser || currentUser.role !== 'HOD' || !currentUser.departmentId) return;

    const loadData = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        
        const [resDept, resProgs, resSubjs, resAsn, resPopso, resUsers] = await Promise.all([
          fetch(`/api/departments/${currentUser.departmentId}`, { headers: auth }),
          fetch(`/api/programs?departmentId=${currentUser.departmentId}`, { headers: auth }),
          fetch(`/api/subjects?departmentId=${currentUser.departmentId}`, { headers: auth }),
          fetch(`/api/faculty-assignments?departmentId=${currentUser.departmentId}`, { headers: auth }),
          fetch(`/api/popso?departmentId=${currentUser.departmentId}`, { headers: auth }),
          fetch(`/api/users?role=Faculty`, { headers: auth }),
        ]);

        if (resDept.ok) setDept(await resDept.json());
        if (resProgs.ok) setPrograms(await resProgs.json());
        if (resSubjs.ok) setSubjects(await resSubjs.json());
        if (resAsn.ok) setAssignments(await resAsn.json());
        if (resPopso.ok) setPopsoDocs(await resPopso.json());
        if (resUsers.ok) setFacultyUsers(await resUsers.json());

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, currentUser, refresh]);

  if (!currentUser || currentUser.role !== 'HOD' || !currentUser.departmentId) {
    return <div className="p-8">Access denied</div>;
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (!dept) return <div className="p-8">Department not found</div>;

  const hodYears = currentUser.assignedYears || [];
  const displayYearsString = hodYears.length > 0 ? `Years: ${hodYears.join(', ')}` : 'All Years';

  const poDoc = popsoDocs.find(d => d.type === 'PO');
  const psoDoc = popsoDocs.find(d => d.type === 'PSO');

  const handleAssign = async (subject: any) => {
    if (!selectedFacultyId) return;
    try {
      await fetch('/api/faculty-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ facultyId: selectedFacultyId, subjectId: subject._id })
      });
      setShowAssignModal(null);
      setSelectedFacultyId('');
      setRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await fetch(`/api/faculty-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (type: 'PO' | 'PSO', file: File) => {
    if (hodYears.length === 0) {
      alert("You lack a specific assigned year to bind this document to.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    // Bind to the primary assigned year
    formData.append('yearOrder', String(hodYears[0]));
    
    try {
      await fetch('/api/popso/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      setRefresh(r => r + 1);
    } catch (err) {
      console.error(err);
    }
  };

  // Group programs by Level
  const groupedPrograms: Record<string, any[]> = {};
  programs.forEach(p => {
    if (!groupedPrograms[p.level]) groupedPrograms[p.level] = [];
    groupedPrograms[p.level].push(p);
  });

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Teacher Assignment</h1>
          <p className="text-slate-600">
            {dept.name} — {displayYearsString} — Assign teachers to subjects
          </p>
        </div>

        {/* PO/PSO Upload Section */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Program Outcomes Documents
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Upload PO and PSO documents. These will be shared with all teachers under your department for {displayYearsString}.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PO Upload */}
            <div className={`p-4 rounded-lg border-2 ${poDoc ? 'border-emerald-200 bg-emerald-50' : 'border-dashed border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className={`w-5 h-5 ${poDoc ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-900">PO (Program Outcomes)</span>
                </div>
                {poDoc && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
              {poDoc ? (
                <div className="text-sm">
                  <p className="text-emerald-700 font-medium">{poDoc.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded {new Date(poDoc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Not uploaded yet</p>
              )}
              <input
                ref={poInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('PO', file);
                }}
              />
              <button
                onClick={() => poInputRef.current?.click()}
                disabled={hodYears.length === 0}
                className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  poDoc
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                <Upload className="w-4 h-4" />
                {poDoc ? 'Replace PO' : 'Upload PO'}
              </button>
            </div>

            {/* PSO Upload */}
            <div className={`p-4 rounded-lg border-2 ${psoDoc ? 'border-emerald-200 bg-emerald-50' : 'border-dashed border-slate-300'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FileCheck className={`w-5 h-5 ${psoDoc ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="font-medium text-slate-900">PSO (Program Specific Outcomes)</span>
                </div>
                {psoDoc && <CheckCircle className="w-4 h-4 text-emerald-600" />}
              </div>
              {psoDoc ? (
                <div className="text-sm">
                  <p className="text-emerald-700 font-medium">{psoDoc.fileName}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Uploaded {new Date(psoDoc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-500">Not uploaded yet</p>
              )}
              <input
                ref={psoInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('PSO', file);
                }}
              />
              <button
                onClick={() => psoInputRef.current?.click()}
                disabled={hodYears.length === 0}
                className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  psoDoc
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                } disabled:opacity-50`}
              >
                <Upload className="w-4 h-4" />
                {psoDoc ? 'Replace PSO' : 'Upload PSO'}
              </button>
            </div>
          </div>
        </div>

        {/* Subject-Teacher Assignment Table */}
        {levelOrder.map(level => {
          const levelProgs = groupedPrograms[level];
          if (!levelProgs?.length) return null;

          return (
            <div key={level} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-900">{level} — {levelLabels[level]}</h2>
              </div>

              {levelProgs.map(program => {
                // Filter subjects by program, then by assigned years (if Hod is restrictive)
                let progSubjects = subjects.filter(s => s.programId === program._id);
                if (hodYears.length > 0) {
                  progSubjects = progSubjects.filter(s => hodYears.includes(s.yearOrder));
                }

                if (progSubjects.length === 0) return null;

                // Group by Year Label
                const yearMap = new Map<string, any[]>();
                progSubjects.forEach(s => {
                  if (!yearMap.has(s.yearLabel)) yearMap.set(s.yearLabel, []);
                  yearMap.get(s.yearLabel)!.push(s);
                });
                
                const sortedYearGroups = Array.from(yearMap.entries()).sort((a,b) => a[1][0].yearOrder - b[1][0].yearOrder);

                return (
                  <div key={program._id} className="bg-white rounded-lg border border-slate-200 mb-4">
                    <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-slate-900">{program.name}</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Year</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Subject</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Assigned Teacher</th>
                            <th className="text-left px-6 py-3 text-xs font-semibold text-slate-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {sortedYearGroups.map(([yearLabel, yearSubjects]) =>
                            yearSubjects.map(subject => {
                              const asn = assignments.find(a => a.subjectId?._id === subject._id || a.subjectId === subject._id);
                              
                              let teacher = null;
                              if (asn) {
                                teacher = facultyUsers.find(u => u._id === (asn.facultyId?._id || asn.facultyId));
                              }

                              return (
                                <tr key={subject._id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-3">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                                      <Calendar className="w-3 h-3" />
                                      {yearLabel}
                                    </span>
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                                      <span className="text-sm font-medium text-slate-900">{subject.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-3">
                                    {teacher ? (
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                          <span className="text-xs font-medium text-green-700">
                                            {teacher.name.split(' ').map((n:any) => n[0]).join('')}
                                          </span>
                                        </div>
                                        <span className="text-sm text-slate-700">{teacher.name}</span>
                                      </div>
                                    ) : (
                                      <span className="text-xs text-slate-400 italic">Not assigned</span>
                                    )}
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => { setShowAssignModal(subject); setSelectedFacultyId(''); }}
                                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                      >
                                        <UserCheck className="w-3 h-3" />
                                        {teacher ? 'Change' : 'Assign'}
                                      </button>
                                      {teacher && asn && (
                                        <button
                                          onClick={() => handleRemoveAssignment(asn._id)}
                                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                          title="Remove teacher"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Assign Teacher Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assign Teacher</h2>
                <button onClick={() => setShowAssignModal(null)} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Subject</p>
                <p className="font-medium text-slate-900">{showAssignModal.name}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Faculty</label>
                <select
                  value={selectedFacultyId}
                  onChange={e => setSelectedFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Choose a faculty member...</option>
                  {facultyUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} — {u.email}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAssignModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleAssign(showAssignModal)}
                  disabled={!selectedFacultyId}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  Assign Teacher
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
