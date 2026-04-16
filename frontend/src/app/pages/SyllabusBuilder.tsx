import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  getFacultyAssignments,
  getSubjectById,
  getProgramById,
  getDepartmentById,
} from '../data/universityData';
import { FileText } from 'lucide-react';

export default function SyllabusBuilder() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!currentUser || currentUser.role !== 'Faculty') {
    return <div className="p-8">Access denied</div>;
  }

  // Get only subjects assigned to this faculty
  const assignments = getFacultyAssignments(currentUser.id);
  const assignedSubjects = assignments
    .map(a => {
      const subject = getSubjectById(a.subjectId);
      const program = subject ? getProgramById(subject.programId) : null;
      const dept = subject ? getDepartmentById(subject.departmentId) : null;
      return { assignment: a, subject, program, dept };
    })
    .filter(x => x.subject && x.program);

  const handleSubjectSelect = (subjectId: string) => {
    if (subjectId) {
      navigate(`/syllabus/edit/${subjectId}`);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Syllabus Builder</h1>
          <p className="text-slate-600">Select an assigned subject to create or update its syllabus</p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-6 bg-slate-50 border-b border-slate-200 flex items-center gap-3">
             <FileText className="w-5 h-5 text-indigo-600" />
             <h2 className="font-semibold text-slate-900">Select Your Assigned Subject</h2>
          </div>
          <div className="p-6">
            <select
              onChange={(e) => handleSubjectSelect(e.target.value)}
              defaultValue=""
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              <option value="" disabled>Choose a subject...</option>
              {assignedSubjects.map(({ subject, program, dept }) => (
                <option key={subject!.id} value={subject!.id}>
                  {subject!.name} — {program!.name} ({program!.level}) — {dept?.name || ''}
                </option>
              ))}
            </select>

            {assignedSubjects.length === 0 && (
              <p className="text-sm text-slate-500 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                No subjects assigned to you yet. Contact your HOD for subject assignments.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
