import { useState } from 'react';
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
import {
  schools,
  getDepartmentsBySchool,
  getProgramsByDepartmentGrouped,
  getSubjectsByProgramGroupedByYear,
  getSubjectsByProgramForYear,
  type ProgramLevel,
} from '../data/universityData';
import { useAuth } from '../context/AuthContext';

const levelMeta: Record<ProgramLevel, { color: string; label: string }> = {
  UG:    { color: 'text-emerald-600', label: 'Undergraduate' },
  PG:    { color: 'text-violet-600',  label: 'Postgraduate' },
  'Ph.D': { color: 'text-rose-600',  label: 'Doctorate' },
};
const levelOrder: ProgramLevel[] = ['UG', 'PG', 'Ph.D'];

export default function AdminAcademicTree() {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();

  const toggle = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const isOpen = (id: string) => expanded.has(id);

  // ── Role-based visibility ─────────────────
  const visibleSchools =
    currentUser?.role === 'SuperAdmin'
      ? schools
      : currentUser?.role === 'Dean' && currentUser.schoolId
        ? schools.filter(s => s.id === currentUser.schoolId)
        : currentUser?.schoolId
          ? schools.filter(s => s.id === currentUser.schoolId)
          : schools;

  const isHOD = currentUser?.role === 'HOD';
  const hodYear = currentUser?.assignedYear;

  // ──────────────────────────────────────────
  // HOD View — Department → UG/PG/PhD → Programs → ONLY assigned Year → Subjects
  // ──────────────────────────────────────────
  if (isHOD && currentUser?.departmentId) {
    const deptId = currentUser.departmentId;
    const groupedPrograms = getProgramsByDepartmentGrouped(deptId);
    const dept = (() => {
      const allDepts = visibleSchools.flatMap(s => getDepartmentsBySchool(s.id));
      return allDepts.find(d => d.id === deptId);
    })();

    if (!dept) return null;

    return (
      <div className="space-y-1">
        {/* Header */}
        <div className="mb-4 px-2">
          <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Department View</span>
          </div>
          <p className="text-xs text-slate-500">
            HOD — {dept.name}{hodYear ? ` • Year ${hodYear}` : ''}
          </p>
        </div>

        {/* Department root */}
        <div className="flex items-center gap-2 px-2 py-2 text-sm bg-indigo-50 rounded-lg">
          <Briefcase className="w-4 h-4 text-indigo-600" />
          <div className="font-medium text-indigo-900 truncate">{dept.name}</div>
        </div>

        {/* Level groups */}
        <div className="ml-4 space-y-1 border-l-2 border-indigo-200 pl-3">
          {levelOrder
            .filter(level => {
              const progs = groupedPrograms[level];
              if (!progs?.length) return false;
              // Only show levels that have programs with subjects at the assigned year
              if (hodYear) {
                return progs.some(p => getSubjectsByProgramForYear(p.id, hodYear).length > 0);
              }
              return true;
            })
            .map(level => {
              const levelKey = `hod-${level}`;
              const progs = groupedPrograms[level]!;
              const { color, label } = levelMeta[level];

              // Filter programs that have subjects at the HOD's assigned year
              const visibleProgs = hodYear
                ? progs.filter(p => getSubjectsByProgramForYear(p.id, hodYear).length > 0)
                : progs;

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
                      <div className="text-xs text-slate-500">{label} • {visibleProgs.length} program{visibleProgs.length !== 1 ? 's' : ''}</div>
                    </div>
                  </button>

                  {isOpen(levelKey) && (
                    <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                      {visibleProgs.map(program => {
                        const progKey = `hod-${program.id}`;
                        const yearGroups = hodYear
                          ? getSubjectsByProgramForYear(program.id, hodYear)
                          : getSubjectsByProgramGroupedByYear(program.id);

                        return (
                          <div key={program.id} className="space-y-1">
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
                                  <YearNode key={`${program.id}-${yg.yearLabel}`} programId={program.id} yearGroup={yg} isOpen={isOpen} toggle={toggle} />
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
  // SuperAdmin / Dean View — Schools → Departments → UG/PG/PhD → Programs → Years → Subjects
  // ──────────────────────────────────────────
  return (
    <div className="space-y-1">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          <span>University Hierarchy</span>
        </div>
        <p className="text-xs text-slate-500">
          {visibleSchools.length} school{visibleSchools.length !== 1 ? 's' : ''}
        </p>
      </div>

      {visibleSchools.map(school => {
        const schoolDepts = getDepartmentsBySchool(school.id);
        const schoolKey = `sch-${school.id}`;

        return (
          <div key={school.id} className="space-y-1">
            {/* School */}
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
                  const deptKey = `dept-${dept.id}`;
                  const groupedPrograms = getProgramsByDepartmentGrouped(dept.id);

                  return (
                    <div key={dept.id} className="space-y-1">
                      {/* Department */}
                      <button
                        onClick={() => toggle(deptKey)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                      >
                        <ChevronIcon open={isOpen(deptKey)} />
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate text-xs">{dept.name}</div>
                          <div className="text-xs text-slate-500">{Object.keys(groupedPrograms).length} level{Object.keys(groupedPrograms).length !== 1 ? 's' : ''}</div>
                        </div>
                      </button>

                      {isOpen(deptKey) && (
                        <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                          {levelOrder
                            .filter(level => groupedPrograms[level]?.length)
                            .map(level => {
                              const lvlKey = `${dept.id}-${level}`;
                              const progs = groupedPrograms[level]!;
                              const { color, label } = levelMeta[level];

                              return (
                                <div key={lvlKey} className="space-y-1">
                                  {/* Level (UG/PG/Ph.D) */}
                                  <button
                                    onClick={() => toggle(lvlKey)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                                  >
                                    <ChevronIcon open={isOpen(lvlKey)} size={3.5} />
                                    <Layers className={`w-3.5 h-3.5 ${color}`} />
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-slate-900 text-xs">{level}</div>
                                      <div className="text-xs text-slate-500">{label} • {progs.length} program{progs.length !== 1 ? 's' : ''}</div>
                                    </div>
                                  </button>

                                  {isOpen(lvlKey) && (
                                    <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                                      {progs.map(program => {
                                        const progKey = `prog-${program.id}`;
                                        const yearGroups = getSubjectsByProgramGroupedByYear(program.id);

                                        return (
                                          <div key={program.id} className="space-y-1">
                                            {/* Program */}
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
                                                  <YearNode key={`${program.id}-${yg.yearLabel}`} programId={program.id} yearGroup={yg} isOpen={isOpen} toggle={toggle} />
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

// ────────────────────────────────────────────
// Reusable sub-components
// ────────────────────────────────────────────

function ChevronIcon({ open, size = 4 }: { open: boolean; size?: number }) {
  const cls = `w-${size} h-${size} text-slate-400 shrink-0`;
  return open ? <ChevronDown className={cls} /> : <ChevronRight className={cls} />;
}

interface YearNodeProps {
  programId: string;
  yearGroup: { yearLabel: string; yearOrder: number; subjects: { id: string; name: string }[] };
  isOpen: (id: string) => boolean;
  toggle: (id: string) => void;
}

function YearNode({ programId, yearGroup, isOpen, toggle }: YearNodeProps) {
  const yearKey = `year-${programId}-${yearGroup.yearLabel}`;

  return (
    <div className="space-y-0.5">
      {/* Year */}
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
          <span className="font-medium text-slate-800">{yearGroup.yearLabel}</span>
          <span className="text-slate-400 ml-1">({yearGroup.subjects.length})</span>
        </div>
      </button>

      {/* Subjects */}
      {isOpen(yearKey) && (
        <div className="ml-4 space-y-0.5 border-l border-slate-100 pl-2">
          {yearGroup.subjects.map(subject => (
            <div
              key={subject.id}
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
