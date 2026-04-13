import { useState } from 'react';
import { ChevronRight, ChevronDown, Building, Briefcase, BookOpen, GraduationCap } from 'lucide-react';
import { schools, departments, programs, getDepartmentsBySchool, getProgramsByDepartment } from '../data/universityData';
import { useAuth } from '../context/AuthContext';

export default function AcademicTree() {
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());
  const { currentUser } = useAuth();

  const toggleSchool = (schoolId: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedSchools(newExpanded);
  };

  const toggleDept = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  // Filter based on user role
  const visibleSchools = currentUser?.role === 'SuperAdmin' || currentUser?.role === 'Dean'
    ? currentUser.role === 'Dean' && currentUser.schoolId
      ? schools.filter(s => s.id === currentUser.schoolId)
      : schools
    : currentUser?.schoolId
      ? schools.filter(s => s.id === currentUser.schoolId)
      : schools;

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
        const isExpanded = expandedSchools.has(school.id);

        // Filter departments based on user access
        const visibleDepts = currentUser?.departmentId
          ? schoolDepts.filter(d => d.id === currentUser.departmentId)
          : schoolDepts;

        return (
          <div key={school.id} className="space-y-1">
            <button
              onClick={() => toggleSchool(school.id)}
              className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left group"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
              <Building className="w-4 h-4 text-indigo-600" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{school.code}</div>
                <div className="text-xs text-slate-500 truncate">{visibleDepts.length} dept{visibleDepts.length !== 1 ? 's' : ''}</div>
              </div>
            </button>

            {isExpanded && (
              <div className="ml-6 space-y-1 border-l border-slate-200 pl-2">
                {visibleDepts.map(dept => {
                  const deptPrograms = getProgramsByDepartment(dept.id);
                  const isDeptExpanded = expandedDepts.has(dept.id);

                  return (
                    <div key={dept.id} className="space-y-1">
                      <button
                        onClick={() => toggleDept(dept.id)}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-100 rounded-lg transition-colors text-left"
                      >
                        {isDeptExpanded ? (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate text-xs">{dept.name}</div>
                          <div className="text-xs text-slate-500">{deptPrograms.length} program{deptPrograms.length !== 1 ? 's' : ''}</div>
                        </div>
                      </button>

                      {isDeptExpanded && (
                        <div className="ml-6 space-y-1 border-l border-slate-200 pl-2">
                          {deptPrograms.map(program => (
                            <div
                              key={program.id}
                              className="flex items-center gap-2 px-2 py-2 text-sm hover:bg-slate-50 rounded-lg transition-colors"
                            >
                              <BookOpen className="w-3.5 h-3.5 text-green-600" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-slate-900 truncate">{program.name}</div>
                                <div className="text-xs text-slate-500">
                                  {program.level} • {program.duration}mo
                                </div>
                              </div>
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
  );
}
