import { useState, useEffect } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building,
  Briefcase,
  BookOpen,
  GraduationCap,
  FileText,
  Layers,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const levelMeta: Record<string, { color: string; label: string }> = {
  UG:    { color: 'text-emerald-600', label: 'Undergraduate' },
  PG:    { color: 'text-violet-600',  label: 'Postgraduate' },
  'Ph.D': { color: 'text-rose-600',  label: 'Doctorate' },
};
const levelOrder = ['UG', 'PG', 'Ph.D'];

export default function AdminAcademicTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { currentUser, token } = useAuth();

  const [schools, setSchools] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const [resS, resD, resP, resSub] = await Promise.all([
          fetch('/api/schools', { headers: auth }),
          fetch('/api/departments', { headers: auth }),
          fetch('/api/programs', { headers: auth }),
          fetch('/api/subjects', { headers: auth }),
        ]);

        if (resS.ok) setSchools(await resS.json());
        if (resD.ok) setDepartments(await resD.json());
        if (resP.ok) setPrograms(await resP.json());
        if (resSub.ok) setSubjects(await resSub.json());
      } catch (err) {
        console.error("Tree data fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => expanded.has(id);

  if (loading) return <div className="p-4 text-xs text-slate-500">Loading hierarchy...</div>;
  if (!currentUser) return null;

  const isHOD = currentUser.role === 'HOD';
  const assignedYears = currentUser.assignedYears || (currentUser.assignedYear ? [currentUser.assignedYear] : []);

  // ── Role-based visibility ─────────────────
  const visibleSchools = schools; // Scoping is mostly handled by backend, but we can refine here if needed

  // ──────────────────────────────────────────
  // HOD View — Department → UG/PG/PhD → Programs → Assigned Years → Subjects
  // ──────────────────────────────────────────
  if (isHOD && currentUser.departmentId) {
    const dept = departments.find(d => d._id === currentUser.departmentId || d.id === currentUser.departmentId);
    if (!dept) return <div className="p-4 text-xs text-slate-500">Department not found.</div>;

    const deptPrograms = programs.filter(p => p.departmentId?._id === dept._id || p.departmentId === dept._id);

    return (
      <div className="space-y-1">
        <div className="mb-4 px-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Department View</span>
          </div>
          <p className="text-xs text-slate-500">
            HOD — {dept.name} {assignedYears.length > 0 ? ` • Years ${assignedYears.join(', ')}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2 px-2 py-2 text-sm bg-indigo-50 rounded-lg">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <div className="font-medium text-indigo-900 truncate">{dept.name}</div>
        </div>

        <div className="ml-4 space-y-1 border-l-2 border-indigo-200 pl-3">
          {levelOrder
            .filter(level => deptPrograms.some(p => p.level === level))
            .map(level => {
              const levelKey = `hod-${level}`;
              const progs = deptPrograms.filter(p => p.level === level);
              const { color, label } = levelMeta[level] || { color: 'text-slate-600', label: level };

              return (
                <div key={levelKey} className="space-y-1">
                  <button
                    onClick={() => toggle(levelKey)}
                    className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                  >
                    <ChevronIcon open={isOpen(levelKey)} />
                    <Layers className={`w-4 h-4 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-slate-900 text-xs">{level}</div>
                      <div className="text-xs text-slate-500">{label} • {progs.length} program{progs.length !== 1 ? 's' : ''}</div>
                    </div>
                  </button>

                  {isOpen(levelKey) && (
                    <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                      {progs.map(program => {
                        const progKey = `hod-${program._id}`;
                        const progSubjects = subjects.filter(s => s.programId?._id === program._id || s.programId === program._id);
                        
                        // Group by year
                        const yearMap = new Map();
                        progSubjects.forEach(s => {
                          const yl = s.yearLabel || `Year ${s.yearOrder}`;
                          if (!yearMap.has(yl)) yearMap.set(yl, { label: yl, order: s.yearOrder, subjects: [] });
                          yearMap.get(yl).subjects.push(s);
                        });
                        const yearGroups = Array.from(yearMap.values()).sort((a,b) => a.order - b.order);

                        return (
                          <div key={program._id} className="space-y-1">
                            <button
                              onClick={() => toggle(progKey)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 rounded-lg transition-colors text-left"
                            >
                              <ChevronIcon open={isOpen(progKey)} size={3.5} />
                              <BookOpen className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-xs font-medium text-slate-900 truncate">{program.name}</span>
                            </button>

                            {isOpen(progKey) && (
                              <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                                {yearGroups.map(yg => (
                                  <YearNode key={`${program._id}-${yg.label}`} programId={program._id} yearGroup={yg} isOpen={isOpen} toggle={toggle} />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────
  // SuperAdmin / Dean View
  // ──────────────────────────────────────────
  return (
    <div className="space-y-1">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <span>University Hierarchy</span>
        </div>
        <p className="text-xs text-slate-500">
          {visibleSchools.length} school{visibleSchools.length !== 1 ? 's' : ''} across organization
        </p>
      </div>

      {visibleSchools.map(school => {
        const schoolDepts = departments.filter(d => (d.schoolId?._id || d.schoolId) === (school._id || school.id));
        const schoolKey = `sch-${school._id || school.id}`;

        return (
          <div key={school._id || school.id} className="space-y-1">
            <button
              onClick={() => toggle(schoolKey)}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left group"
            >
              <ChevronIcon open={isOpen(schoolKey)} />
              <Building className="w-4 h-4 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{school.code}</div>
                <div className="text-xs text-slate-500 truncate">{schoolDepts.length} dept{schoolDepts.length !== 1 ? 's' : ''}</div>
              </div>
            </button>

            {isOpen(schoolKey) && (
              <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                {schoolDepts.map(dept => {
                  const deptKey = `dept-${dept._id}`;
                  const deptPrograms = programs.filter(p => (p.departmentId?._id || p.departmentId) === dept._id);

                  return (
                    <div key={dept._id} className="space-y-1">
                      <button
                        onClick={() => toggle(deptKey)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                      >
                        <ChevronIcon open={isOpen(deptKey)} />
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate text-xs">{dept.name}</div>
                          <div className="text-xs text-slate-500">{deptPrograms.length} program{deptPrograms.length !== 1 ? 's' : ''}</div>
                        </div>
                      </button>

                      {isOpen(deptKey) && (
                        <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                          {levelOrder
                            .filter(level => deptPrograms.some(p => p.level === level))
                            .map(level => {
                              const lvlKey = `${dept._id}-${level}`;
                              const progs = deptPrograms.filter(p => p.level === level);
                              const { color, label } = levelMeta[level] || { color: 'text-slate-600', label: level };

                              return (
                                <div key={lvlKey} className="space-y-1">
                                  <button
                                    onClick={() => toggle(lvlKey)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                                  >
                                    <ChevronIcon open={isOpen(lvlKey)} size={3.5} />
                                    <Layers className={`w-3.5 h-3.5 ${color}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-slate-900 text-xs">{level}</div>
                                      <div className="text-xs text-slate-500">{label}</div>
                                    </div>
                                  </button>

                                  {isOpen(lvlKey) && (
                                    <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                                      {progs.map(program => {
                                        const progKey = `prog-${program._id}`;
                                        const progSubjects = subjects.filter(s => (s.programId?._id || s.programId) === program._id);
                                        
                                        const yearMap = new Map();
                                        progSubjects.forEach(s => {
                                          const yl = s.yearLabel || `Year ${s.yearOrder}`;
                                          if (!yearMap.has(yl)) yearMap.set(yl, { label: yl, order: s.yearOrder, subjects: [] });
                                          yearMap.get(yl).subjects.push(s);
                                        });
                                        const yearGroups = Array.from(yearMap.values()).sort((a,b) => a.order - b.order);

                                        return (
                                          <div key={program._id} className="space-y-1">
                                            <button
                                              onClick={() => toggle(progKey)}
                                              className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-50 rounded-lg transition-colors text-left"
                                            >
                                              <ChevronIcon open={isOpen(progKey)} size={3} />
                                              <BookOpen className="w-3 h-3 text-green-600" />
                                              <span className="text-xs font-medium text-slate-900 truncate">{program.name}</span>
                                            </button>

                                            {isOpen(progKey) && (
                                              <div className="ml-4 space-y-1 border-l border-slate-200 pl-2">
                                                {yearGroups.map(yg => (
                                                  <YearNode key={`${program._id}-${yg.label}`} programId={program._id} yearGroup={yg} isOpen={isOpen} toggle={toggle} />
                                                ))}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ open, size = 4 }: { open: boolean; size?: number }) {
  const cls = `w-${size} h-${size} text-slate-400 shrink-0`;
  return open ? <ChevronDown className={cls} /> : <ChevronRight className={cls} />;
}

function YearNode({ programId, yearGroup, isOpen, toggle }: any) {
  const yearKey = `year-${programId}-${yearGroup.label}`;

  return (
    <div className="space-y-0.5">
      <button
        onClick={() => toggle(yearKey)}
        className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-50 rounded-lg transition-colors text-left"
      >
        {isOpen(yearKey) ? (
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
        )}
        <Calendar className="w-3 h-3 text-orange-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-slate-800">{yearGroup.label}</span>
          <span className="text-slate-400 ml-1">({yearGroup.subjects.length})</span>
        </div>
      </button>

      {isOpen(yearKey) && (
        <div className="ml-4 space-y-0.5 border-l border-slate-100 pl-2">
          {yearGroup.subjects.map((subject: any) => (
            <div
              key={subject._id || subject.id}
              className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-50 rounded-lg transition-colors"
            >
              <FileText className="w-2.5 h-2.5 text-amber-500 shrink-0" />
              <span className="text-slate-600 truncate">{subject.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
