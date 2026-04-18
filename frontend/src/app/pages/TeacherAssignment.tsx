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

interface Department {
  _id: string;
  name: string;
}

interface Program {
  _id: string;
  name: string;
  level: string;
  departmentId: any;
}

interface Subject {
  _id: string;
  name: string;
  programId: any;
  yearLabel: string;
  yearOrder: number;
}

interface Assignment {
  _id: string;
  facultyId: any;
  subjectId: any;
}

interface PopsoDoc {
  _id: string;
  type: 'PO' | 'PSO';
  fileName: string;
  uploadedAt: string;
}

interface FacultyUser {
  _id: string;
  name: string;
  email: string;
}

const levelOrder = ['UG', 'PG', 'Ph.D'];
const levelLabels: Record<string, string> = { UG: 'Undergraduate', PG: 'Postgraduate', 'Ph.D': 'Doctorate' };

export default function TeacherAssignment() {
  const { currentUser, token, refreshUser } = useAuth();

  const [dept, setDept] = useState<Department | null>(null); // Only for HOD
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [popsoDocs, setPopsoDocs] = useState<PopsoDoc[]>([]);
  const [facultyUsers, setFacultyUsers] = useState<FacultyUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  const [showAssignModal, setShowAssignModal] = useState<Subject | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  const [schoolDepts, setSchoolDepts] = useState<Department[]>([]);
  const [facultySearchTerm, setFacultySearchTerm] = useState('');

  const poInputRef = useRef<HTMLInputElement>(null);
  const psoInputRef = useRef<HTMLInputElement>(null);

  const isDean = currentUser?.role === 'Dean';
  const isHOD = currentUser?.role === 'HOD';
  const rawDeptId = isDean ? '' : currentUser?.departmentId;
  const activeDeptId = (rawDeptId?._id || rawDeptId)?.toString() || '';

  // If Dean but no schoolId, refresh once
  useEffect(() => {
    if (currentUser?.role === "Dean" && !currentUser.schoolId) {
      refreshUser();
    }
  }, [currentUser?.role, currentUser?.schoolId, refreshUser]);

  // Load departments if Dean
  useEffect(() => {
    if (!token || !isDean || !currentUser?.schoolId) return;
    const fetchDepts = async () => {
      try {
        const res = await fetch('/api/departments', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setSchoolDepts(await res.json());
      } catch (err) { console.error(err); }
    };
    fetchDepts();
  }, [token, isDean, currentUser?.schoolId]);

  useEffect(() => {
    if (!token || !currentUser) return;
    if (!isDean && !currentUser.departmentId) {
       setLoading(false);
       return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const deptParam = activeDeptId ? `?departmentId=${activeDeptId}` : '';
        const userParam = isDean ? '' : `?departmentId=${activeDeptId}`;

        const [resProgs, resSubjs, resAsn, resPopso, resUsers] = await Promise.all([
          fetch(`/api/programs${deptParam}`, { headers: auth }),
          fetch(`/api/subjects${deptParam}`, { headers: auth }),
          fetch(`/api/faculty-assignments${deptParam}`, { headers: auth }),
          fetch(`/api/popso${deptParam}`, { headers: auth }),
          fetch(`/api/users?role=Faculty`, { headers: auth }),
        ]);

        if (resProgs.ok) setPrograms(await resProgs.json());
        if (resSubjs.ok) setSubjects(await resSubjs.json());
        if (resAsn.ok) setAssignments(await resAsn.json());
        if (resPopso.ok) setPopsoDocs(await resPopso.json());
        if (resUsers.ok) setFacultyUsers(await resUsers.json());

        if (activeDeptId) {
          const resDept = await fetch(`/api/departments/${activeDeptId}`, { headers: auth });
          if (resDept.ok) setDept(await resDept.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token, currentUser, activeDeptId, isDean, refresh]);

  const filteredFaculty = facultyUsers.filter(u => 
    u.name.toLowerCase().includes(facultySearchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(facultySearchTerm.toLowerCase())
  );

  const handleAssign = async (subject: Subject) => {
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
    } catch (err) { console.error(err); }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await fetch(`/api/faculty-assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => r + 1);
    } catch (err) { console.error(err); }
  };

  const handleFileUpload = async (type: 'PO' | 'PSO', file: File) => {
    const hodYears = currentUser?.assignedYears || [];
    if (hodYears.length === 0) {
      alert("You lack a specific assigned year to bind this document to.");
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('yearOrder', String(hodYears[0]));

    try {
      await fetch('/api/popso/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      setRefresh(r => r + 1);
    } catch (err) { console.error(err); }
  };

  if (!currentUser || (currentUser.role !== 'HOD' && currentUser.role !== 'Dean')) {
    return <div className="p-8 text-center text-slate-500">Access denied</div>;
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Loading data...</div>;

  const hodYears = isHOD ? (currentUser.assignedYears || []) : [];
  const poDoc = popsoDocs.find(d => d.type === 'PO');
  const psoDoc = popsoDocs.find(d => d.type === 'PSO');

  // Unified Rendering Logic
  const displayDepartments = isDean ? schoolDepts : (dept ? [dept] : []);

  return (
    <div className="p-8 min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Assign Faculty</h1>
          <p className="text-slate-500 text-lg">
            Manage subject-teacher assignments and program outcomes.
          </p>
        </div>

        {displayDepartments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center shadow-sm">
            <BookOpen className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">No Departments Found</h2>
            <p className="text-slate-500">There are no departments in your current scope to manage.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {displayDepartments.map(currentDept => {
              const deptProgs = programs.filter(p => {
                const did = p.departmentId?._id || p.departmentId;
                return did?.toString() === currentDept._id;
              });

              if (isDean && deptProgs.length === 0) return null;

              return (
                <div key={currentDept._id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                  <div className="bg-slate-900 px-8 py-6 text-white flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{currentDept.name}</h2>
                      <p className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-medium">Departmental Overview</p>
                    </div>
                  </div>

                  <div className="p-8">
                    {/* HOD Directives Section */}
                    {isHOD && (
                      <div className="mb-10 p-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                        <h3 className="text-lg font-bold text-indigo-900 mb-4 flex items-center gap-2">
                          <Upload className="w-5 h-5" />
                          HOD Directives: PO/PSO Uploads
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {/* PO Box */}
                           <div className={`p-5 rounded-xl border-2 transition-all ${poDoc ? 'border-emerald-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${poDoc ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <FileCheck className="w-5 h-5" />
                                  </div>
                                  <span className="font-bold text-slate-900">Program Outcomes (PO)</span>
                                </div>
                                {poDoc && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                              </div>
                              {poDoc && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <p className="text-sm font-semibold text-slate-700 truncate">{poDoc.fileName}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Updated {new Date(poDoc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                              )}
                              <button
                                onClick={() => poInputRef.current?.click()}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${poDoc ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                              >
                                {poDoc ? 'Replace Document' : 'Upload Document'}
                              </button>
                               <input type="file" ref={poInputRef} className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload('PO', e.target.files[0])} />
                           </div>
                           
                           {/* PSO Box */}
                           <div className={`p-5 rounded-xl border-2 transition-all ${psoDoc ? 'border-emerald-200 bg-white' : 'border-dashed border-slate-200 bg-slate-50'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${psoDoc ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <FileCheck className="w-5 h-5" />
                                  </div>
                                  <span className="font-bold text-slate-900">Specific Outcomes (PSO)</span>
                                </div>
                                {psoDoc && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                              </div>
                              {psoDoc && (
                                <div className="mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                  <p className="text-sm font-semibold text-slate-700 truncate">{psoDoc.fileName}</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Updated {new Date(psoDoc.uploadedAt).toLocaleDateString()}</p>
                                </div>
                              )}
                              <button
                                onClick={() => psoInputRef.current?.click()}
                                className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm ${psoDoc ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'}`}
                              >
                                {psoDoc ? 'Replace Document' : 'Upload Document'}
                              </button>
                               <input type="file" ref={psoInputRef} className="hidden" onChange={e => e.target.files?.[0] && handleFileUpload('PSO', e.target.files[0])} />
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Levels → Programs → Subjects */}
                    <div className="space-y-12">
                      {levelOrder.map(level => {
                        const levelProgs = deptProgs.filter(p => p.level === level);
                        if (levelProgs.length === 0) return null;

                        return (
                          <div key={level}>
                            <div className="flex items-center gap-3 mb-6">
                               <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                               <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{level} {levelLabels[level]} Programs</h3>
                            </div>
                            
                            <div className="space-y-8">
                              {levelProgs.map(program => {
                                let progSubjs = subjects.filter(s => {
                                  const pid = s.programId?._id || s.programId;
                                  return pid?.toString() === program._id;
                                });
                                if (isHOD && hodYears.length > 0) {
                                  progSubjs = progSubjs.filter(s => hodYears.includes(s.yearOrder));
                                }

                                if (progSubjs.length === 0) return null;

                                return (
                                  <div key={program._id} className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
                                     <div className="bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                           <BookOpen className="w-5 h-5 text-indigo-500" />
                                           <span className="font-bold text-slate-800">{program.name}</span>
                                        </div>
                                     </div>
                                     <div className="overflow-x-auto">
                                        <table className="w-full">
                                           <thead>
                                              <tr className="text-left bg-slate-100/30">
                                                 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Year</th>
                                                 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                                                 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Assigned Faculty</th>
                                                 <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                              </tr>
                                           </thead>
                                           <tbody className="divide-y divide-slate-100">
                                              {progSubjs.sort((a,b) => a.yearOrder - b.yearOrder).map(subject => {
                                                 const asn = assignments.find(a => {
                                                   const sid = a.subjectId?._id || a.subjectId;
                                                   return sid?.toString() === subject._id;
                                                 });
                                                 const faculty = asn ? (typeof asn.facultyId === 'object' ? asn.facultyId : facultyUsers.find(u => u._id === asn.facultyId)) : null;

                                                 return (
                                                    <tr key={subject._id} className="hover:bg-white transition-colors group">
                                                       <td className="px-6 py-4">
                                                          <span className="text-xs font-bold border border-slate-200 px-2 py-1 rounded bg-white text-slate-600">{subject.yearLabel}</span>
                                                       </td>
                                                       <td className="px-6 py-4">
                                                          <div className="flex items-center gap-2">
                                                             <FileText className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                             <span className="text-sm font-semibold text-slate-700">{subject.name}</span>
                                                          </div>
                                                       </td>
                                                       <td className="px-6 py-4">
                                                          {faculty ? (
                                                            <div className="flex items-center gap-3">
                                                               <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-black text-emerald-700">
                                                                  {faculty.name?.split(' ').map((n:any) => n[0]).join('')}
                                                               </div>
                                                               <div>
                                                                  <p className="text-sm font-bold text-slate-900 leading-none">{faculty.name}</p>
                                                                  <p className="text-[10px] text-slate-400 mt-1">{faculty.email}</p>
                                                               </div>
                                                            </div>
                                                          ) : (
                                                            <span className="text-xs font-medium text-slate-300 italic">No faculty assigned</span>
                                                          )}
                                                       </td>
                                                       <td className="px-6 py-4 text-right">
                                                          <div className="flex items-center justify-end gap-2">
                                                             <button 
                                                               onClick={() => { setShowAssignModal(subject); setSelectedFacultyId(''); setFacultySearchTerm(''); }}
                                                               className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm shadow-indigo-50"
                                                             >
                                                               {faculty ? 'Change' : 'Assign'}
                                                             </button>
                                                             {asn && (
                                                               <button 
                                                                 onClick={() => handleRemoveAssignment(asn._id)}
                                                                 className="p-1.5 rounded-lg text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all"
                                                               >
                                                                  <Trash2 className="w-4 h-4" />
                                                               </button>
                                                             )}
                                                          </div>
                                                       </td>
                                                    </tr>
                                                 )
                                              })}
                                           </tbody>
                                        </table>
                                     </div>
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Selection */}
      {showAssignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/60 transition-all">
           <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden scale-in-center">
              <div className="bg-slate-900 p-6 flex items-center justify-between text-white">
                 <div>
                    <h2 className="text-xl font-bold">Faculty Selection</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Assigning teacher for {showAssignModal.name}</p>
                 </div>
                 <button onClick={() => setShowAssignModal(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6">
                 <div className="mb-6">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Search Faculty</label>
                    <div className="relative">
                       <input 
                         type="text" 
                         placeholder="Start typing name or email..." 
                         value={facultySearchTerm}
                         onChange={e => setFacultySearchTerm(e.target.value)}
                         className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium"
                       />
                    </div>
                 </div>
                 
                 <div className="max-h-[300px] overflow-y-auto mb-8 pr-2 space-y-2 custom-scrollbar">
                    {filteredFaculty.length > 0 ? (
                       filteredFaculty.map(u => (
                          <div 
                             key={u._id}
                             onClick={() => setSelectedFacultyId(u._id)}
                             className={`group p-4 rounded-2xl border-2 cursor-pointer flex items-center justify-between transition-all ${selectedFacultyId === u._id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-50 bg-slate-50 hover:border-indigo-200'}`}
                          >
                             <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-[10px] ${selectedFacultyId === u._id ? 'bg-white text-indigo-600' : 'bg-white text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-all'}`}>
                                   {u.name.split(' ').map((n:any) => n[0]).join('')}
                                </div>
                                <div>
                                   <p className={`text-sm font-bold ${selectedFacultyId === u._id ? 'text-white' : 'text-slate-900'}`}>{u.name}</p>
                                   <p className={`text-[10px] ${selectedFacultyId === u._id ? 'text-indigo-100' : 'text-slate-400'}`}>{u.email}</p>
                                </div>
                             </div>
                             {selectedFacultyId === u._id && <CheckCircle className="w-5 h-5 text-white" />}
                          </div>
                       ))
                    ) : (
                       <div className="p-12 text-center">
                          <UserCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                          <p className="text-sm text-slate-400 font-medium">No faculty members matched your search</p>
                       </div>
                    )}
                 </div>

                 <div className="flex gap-4">
                    <button onClick={() => setShowAssignModal(null)} className="flex-1 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancel</button>
                    <button 
                      onClick={() => handleAssign(showAssignModal)}
                      disabled={!selectedFacultyId}
                      className="flex-[2] py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 disabled:opacity-50 transition-all"
                    >
                      Confirm Assignment
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
