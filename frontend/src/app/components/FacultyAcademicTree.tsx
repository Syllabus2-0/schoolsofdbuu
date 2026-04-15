import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Briefcase,
  FileText,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
} from 'lucide-react';
import {
  getFacultyAssignments,
  getDepartmentById,
  getSubjectById,
  getProgramById,
  type ProgramLevel,
  type Subject,
} from '../data/universityData';
import { useAuth } from '../context/AuthContext';

const levelMeta: Record<ProgramLevel, { color: string; label: string }> = {
  UG:     { color: 'text-emerald-600', label: 'Undergraduate' },
  PG:     { color: 'text-violet-600',  label: 'Postgraduate' },
  'Ph.D': { color: 'text-rose-600',   label: 'Doctorate' },
};

const levelOrder: ProgramLevel[] = ['UG', 'PG', 'Ph.D'];

/**
 * FacultyAcademicTree
 *
 * Assignment-based tree: Department → Level → Program → Year → Subject (only assigned)
 */
export default function FacultyAcademicTree() {
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

  if (!currentUser) return null;

  const assignments = getFacultyAssignments(currentUser.id);

  // Build structured grouping: Department → Level → Program → Year → Subject
  type YearGroup = { yearLabel: string; yearOrder: number; subjects: Subject[] };
  type ProgramGroup = { programId: string; programName: string; years: Map<string, YearGroup> };
  type LevelGroup = { level: ProgramLevel; programs: Map<string, ProgramGroup> };
  type DeptGroup = { deptId: string; deptName: string; levels: Map<ProgramLevel, LevelGroup> };

  const deptMap = new Map<string, DeptGroup>();

  for (const asn of assignments) {
    const subject = getSubjectById(asn.subjectId);
    const dept = getDepartmentById(asn.departmentId);
    if (!subject || !dept) continue;

    const program = getProgramById(subject.programId);
    if (!program) continue;

    // Ensure dept
    if (!deptMap.has(asn.departmentId)) {
      deptMap.set(asn.departmentId, {
        deptId: asn.departmentId,
        deptName: dept.name,
        levels: new Map(),
      });
    }
    const deptGroup = deptMap.get(asn.departmentId)!;

    // Ensure level
    if (!deptGroup.levels.has(program.level)) {
      deptGroup.levels.set(program.level, {
        level: program.level,
        programs: new Map(),
      });
    }
    const lvlGroup = deptGroup.levels.get(program.level)!;

    // Ensure program
    if (!lvlGroup.programs.has(program.id)) {
      lvlGroup.programs.set(program.id, {
        programId: program.id,
        programName: program.name,
        years: new Map(),
      });
    }
    const progGroup = lvlGroup.programs.get(program.id)!;

    // Ensure year
    if (!progGroup.years.has(subject.yearLabel)) {
      progGroup.years.set(subject.yearLabel, {
        yearLabel: subject.yearLabel,
        yearOrder: subject.yearOrder,
        subjects: [],
      });
    }
    progGroup.years.get(subject.yearLabel)!.subjects.push(subject);
  }

  const deptEntries = Array.from(deptMap.values());
  const totalSubjects = assignments.length;

  return (
    <div className="space-y-1">
      <div className="mb-4 px-2">
        <div className="flex items-center gap-2 text-slate-900 font-semibold mb-1">
          <GraduationCap className="w-5 h-5 text-amber-600" />
          <span>My Assignments</span>
        </div>
        <p className="text-xs text-slate-500">
          {totalSubjects} subject{totalSubjects !== 1 ? 's' : ''} across{' '}
          {deptEntries.length} department{deptEntries.length !== 1 ? 's' : ''}
        </p>
      </div>

      {deptEntries.length === 0 && (
        <div className="px-3 py-4 text-center">
          <p className="text-xs text-slate-400">No assignments found.</p>
        </div>
      )}

      {deptEntries.map(deptGroup => {
        const deptKey = `fac-dept-${deptGroup.deptId}`;

        return (
          <div key={deptGroup.deptId} className="space-y-1">
            {/* Department */}
            <button
              onClick={() => toggle(deptKey)}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left group"
            >
              {isOpen(deptKey) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
              <Briefcase className="w-4 h-4 text-amber-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{deptGroup.deptName}</div>
              </div>
            </button>

            {isOpen(deptKey) && (
              <div className="ml-5 space-y-1 border-l border-amber-200 pl-2">
                {levelOrder
                  .filter(l => deptGroup.levels.has(l))
                  .map(level => {
                    const lvlGroup = deptGroup.levels.get(level)!;
                    const lvlKey = `fac-lvl-${deptGroup.deptId}-${level}`;
                    const { color, label } = levelMeta[level];
                    const progEntries = Array.from(lvlGroup.programs.values());

                    return (
                      <div key={lvlKey} className="space-y-1">
                        {/* Level */}
                        <button
                          onClick={() => toggle(lvlKey)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                        >
                          {isOpen(lvlKey) ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                          <Layers className={`w-3.5 h-3.5 ${color}`} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-slate-900 text-xs">{level}</div>
                            <div className="text-xs text-slate-500">{label}</div>
                          </div>
                        </button>

                        {isOpen(lvlKey) && (
                          <div className="ml-5 space-y-1 border-l border-slate-200 pl-2">
                            {progEntries.map(progGroup => {
                              const progKey = `fac-prog-${progGroup.programId}`;
                              const yearEntries = Array.from(progGroup.years.values()).sort((a, b) => a.yearOrder - b.yearOrder);

                              return (
                                <div key={progGroup.programId} className="space-y-1">
                                  {/* Program */}
                                  <button
                                    onClick={() => toggle(progKey)}
                                    className="w-full flex items-center gap-2 px-2 py-1 text-sm hover:bg-slate-50 rounded-lg transition-colors text-left"
                                  >
                                    {isOpen(progKey) ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                    <BookOpen className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-medium text-slate-900 truncate">{progGroup.programName}</span>
                                  </button>

                                  {isOpen(progKey) && (
                                    <div className="ml-4 space-y-0.5 border-l border-slate-200 pl-2">
                                      {yearEntries.map(yg => {
                                        const yearKey = `fac-year-${progGroup.programId}-${yg.yearLabel}`;

                                        return (
                                          <div key={yearKey} className="space-y-0.5">
                                            {/* Year */}
                                            <button
                                              onClick={() => toggle(yearKey)}
                                              className="w-full flex items-center gap-2 px-2 py-1 text-xs hover:bg-slate-50 rounded-lg transition-colors text-left"
                                            >
                                              {isOpen(yearKey) ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                                              <Calendar className="w-3 h-3 text-orange-500" />
                                              <span className="font-medium text-slate-800">{yg.yearLabel}</span>
                                              <span className="text-slate-400">({yg.subjects.length})</span>
                                            </button>

                                            {/* Subjects */}
                                            {isOpen(yearKey) && (
                                              <div className="ml-4 space-y-0.5 border-l border-slate-100 pl-2">
                                                {yg.subjects.map(subject => (
                                                  <div
                                                    key={subject.id}
                                                    className="flex items-center gap-2 px-2 py-1 text-xs hover:bg-amber-50 rounded-lg transition-colors"
                                                  >
                                                    <FileText className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                                                    <span className="text-slate-600 truncate">{subject.name}</span>
                                                  </div>
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
