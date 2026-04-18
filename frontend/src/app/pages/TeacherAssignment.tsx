import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  users,
  getDepartmentById,
  getProgramsByDepartmentGrouped,
  getSubjectsByProgramForYear,
  getSubjectsByProgramGroupedByYear,
  getTeacherForSubject,
  getUserById,
  assignTeacher,
  removeTeacherAssignment,
  uploadPOPSO,
  getPOPSODocuments,
  getDepartmentsBySchool,
  type ProgramLevel,
  type Subject,
  type FacultyAssignment,
} from '../data/universityData';
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

const levelOrder: ProgramLevel[] = ['UG', 'PG', 'Ph.D'];
const levelLabels: Record<ProgramLevel, string> = { UG: 'Undergraduate', PG: 'Postgraduate', 'Ph.D': 'Doctorate' };

export default function TeacherAssignment() {
  const { currentUser } = useAuth();
  const [showAssignModal, setShowAssignModal] = useState<Subject | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [facultySearch, setFacultySearch] = useState('');
  const [, forceUpdate] = useState(0);
  const poInputRef = useRef<HTMLInputElement>(null);
  const psoInputRef = useRef<HTMLInputElement>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('');

  if (!currentUser || (currentUser.role !== 'HOD' && currentUser.role !== 'Dean')) {
    return <div className="p-8">Access denied</div>;
  }

  const refresh = () => forceUpdate(n => n + 1);
  const isDean = currentUser.role === 'Dean';
  const activeDeptId = isDean ? selectedDeptId : currentUser.departmentId;
  const dept = activeDeptId ? getDepartmentById(activeDeptId) : null;
  const hodYear = !isDean ? currentUser.assignedYear : undefined;
  
  const schoolDepts = isDean && currentUser.schoolId ? getDepartmentsBySchool(currentUser.schoolId) : [];

  const groupedPrograms = activeDeptId ? getProgramsByDepartmentGrouped(activeDeptId) : {};
  const poposDocs = hodYear && activeDeptId ? getPOPSODocuments(activeDeptId, hodYear) : [];
  const poDoc = poposDocs.find(d => d.type === 'PO');
  const psoDoc = poposDocs.find(d => d.type === 'PSO');

  // Faculty members eligible for assignment
  const facultyUsers = users.filter(u => u.role === 'Faculty');

  const handleAssign = (subject: Subject) => {
    if (!selectedFacultyId) return;
    const assignment: FacultyAssignment = {
      id: `fa_${Date.now()}`,
      facultyId: selectedFacultyId,
      subjectId: subject.id,
      departmentId: subject.departmentId,
      schoolId: dept.schoolId,
    };
    assignTeacher(assignment);
    setShowAssignModal(null);
    setSelectedFacultyId('');
    setFacultySearch('');
    refresh();
  };

  const handleRemoveAssignment = (subjectId: string) => {
    const asn = getTeacherForSubject(subjectId);
    if (asn) {
      removeTeacherAssignment(asn.id);
      refresh();
    }
  };

  const handleFileUpload = (type: 'PO' | 'PSO', file: File) => {
    if (!hodYear) return;
    uploadPOPSO({
      id: `popso_${Date.now()}`,
      type,
      fileName: file.name,
      uploadedBy: currentUser.id,
      departmentId: activeDeptId!,
      yearOrder: hodYear,
      uploadedAt: new Date().toISOString(),
    });
    refresh();
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Assign Faculty</h1>
          <p className="text-slate-600">
            {dept ? `${dept.name} ` : 'Select a department to assign teachers.'}
            {hodYear ? `— Year ${hodYear} ` : dept ? '— All Years ' : ''}
          </p>
        </div>

        {isDean && (
          <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Select Department</h2>
            <select
              value={selectedDeptId}
              onChange={e => setSelectedDeptId(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="">Choose a department...</option>
              {schoolDepts.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}

        {!activeDeptId ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Please select a department to proceed</p>
          </div>
        ) : (
          <>
        {/* PO/PSO Upload Section */}
        {!isDean && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Program Outcomes Documents
          </h2>
          <p className="text-sm text-slate-500 mb-4">
            Upload PO and PSO documents. These will be shared with all teachers under your department for Year {hodYear || '—'}.
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
                className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  poDoc
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
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
                className={`mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  psoDoc
                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                {psoDoc ? 'Replace PSO' : 'Upload PSO'}
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Subject-Teacher Assignment Table */}
        {levelOrder
          .filter(level => {
            const progs = groupedPrograms[level];
            if (!progs?.length) return false;
            if (hodYear) {
              return progs.some(p => getSubjectsByProgramForYear(p.id, hodYear).length > 0);
            }
            return true;
          })
          .map(level => {
            const progs = groupedPrograms[level]!;
            const visibleProgs = hodYear
              ? progs.filter(p => getSubjectsByProgramForYear(p.id, hodYear).length > 0)
              : progs;

            return (
              <div key={level} className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold text-slate-900">{level} — {levelLabels[level]}</h2>
                </div>

                {visibleProgs.map(program => {
                  const yearGroups = hodYear
                    ? getSubjectsByProgramForYear(program.id, hodYear)
                    : getSubjectsByProgramGroupedByYear(program.id);

                  return (
                    <div key={program.id} className="bg-white rounded-lg border border-slate-200 mb-4">
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
                            {yearGroups.map(yg =>
                              yg.subjects.map(subject => {
                                const asn = getTeacherForSubject(subject.id);
                                const teacher = asn ? getUserById(asn.facultyId) : null;

                                return (
                                  <tr key={subject.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-3">
                                      <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                                        <Calendar className="w-3 h-3" />
                                        {yg.yearLabel}
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
                                              {teacher.name.split(' ').map(n => n[0]).join('')}
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
                                          onClick={() => { 
                                            setShowAssignModal(subject); 
                                            setSelectedFacultyId(''); 
                                            setFacultySearch('');
                                          }}
                                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                                        >
                                          <UserCheck className="w-3 h-3" />
                                          {teacher ? 'Change' : 'Assign'}
                                        </button>
                                        {teacher && (
                                          <button
                                            onClick={() => handleRemoveAssignment(subject.id)}
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
          </>
        )}

        {/* Assign Teacher Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900">Assign Teacher</h2>
                <button onClick={() => { setShowAssignModal(null); setFacultySearch(''); }} className="p-1 hover:bg-slate-100 rounded">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="mb-2 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600">Subject</p>
                <p className="font-medium text-slate-900">{showAssignModal.name}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Faculty</label>
                <div className="relative mb-2">
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={facultySearch}
                    onChange={e => setFacultySearch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm"
                  />
                </div>
                <div className="border border-slate-200 rounded-lg bg-white overflow-y-auto" style={{ maxHeight: '200px' }}>
                  {facultyUsers.filter(u => 
                    u.name.toLowerCase().includes(facultySearch.toLowerCase()) || 
                    u.email.toLowerCase().includes(facultySearch.toLowerCase())
                  ).length === 0 ? (
                    <div className="p-3 text-sm text-center text-slate-500">No faculty found</div>
                  ) : (
                    facultyUsers.filter(u => 
                      u.name.toLowerCase().includes(facultySearch.toLowerCase()) || 
                      u.email.toLowerCase().includes(facultySearch.toLowerCase())
                    ).map(u => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedFacultyId(u.id)}
                        className={`w-full text-left px-3 py-2 text-sm border-b border-slate-100 transition-colors last:border-0 ${
                          selectedFacultyId === u.id 
                            ? 'bg-indigo-50 border-l-4 border-l-indigo-600 text-indigo-900' 
                            : 'hover:bg-slate-50 text-slate-700 border-l-4 border-l-transparent'
                        }`}
                      >
                        <div className="font-medium truncate">{u.name}</div>
                        <div className={`text-xs truncate ${selectedFacultyId === u.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                          {u.email}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => { setShowAssignModal(null); setFacultySearch(''); }} className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
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
