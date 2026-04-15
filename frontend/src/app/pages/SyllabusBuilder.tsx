import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  getFacultyAssignments,
  getSubjectById,
  getProgramById,
  getDepartmentById,
  syllabi,
  type Subject,
  type DocumentFile,
} from '../data/universityData';
import { Plus, Trash2, Save, Upload, FileCheck, CheckCircle } from 'lucide-react';

interface CourseEntry {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Lab';
  description: string;
  coDocument?: DocumentFile;
  cloDocument?: DocumentFile;
}

export default function SyllabusBuilder() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [activeSemester, setActiveSemester] = useState(1);
  const [courses, setCourses] = useState<CourseEntry[]>([]);

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
    const found = assignedSubjects.find(x => x.subject?.id === subjectId);
    if (found?.subject) {
      setSelectedSubject(found.subject);
      setCourses([]);
      setActiveSemester(1);
    }
  };

  const selectedProgram = selectedSubject ? getProgramById(selectedSubject.programId) : null;
  const totalSemesters = selectedProgram ? Math.ceil(selectedProgram.duration / 6) : 0;

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        id: `course-${Date.now()}`,
        code: '',
        name: '',
        credits: 3,
        type: 'Core',
        description: '',
      },
    ]);
  };

  const removeCourse = (id: string) => {
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: string, value: any) => {
    setCourses(courses.map(c => (c.id === id ? { ...c, [field]: value } : c)));
  };

  const handleFileUpload = (courseId: string, type: 'co' | 'clo', file: File) => {
    const doc: DocumentFile = {
      id: `doc_${Date.now()}`,
      fileName: file.name,
      uploadedBy: currentUser.id,
      uploadedAt: new Date().toISOString(),
    };
    setCourses(courses.map(c => {
      if (c.id !== courseId) return c;
      return type === 'co' ? { ...c, coDocument: doc } : { ...c, cloDocument: doc };
    }));
  };

  const handleSubmit = () => {
    if (!selectedSubject || !selectedProgram) return;

    const newSyllabus = {
      id: `syl-${Date.now()}`,
      programId: selectedProgram.id,
      subjectId: selectedSubject.id,
      facultyId: currentUser.id,
      status: 'Pending HOD Review' as const,
      semesters: [
        {
          semesterNumber: activeSemester,
          courses: courses,
        },
      ],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    syllabi.push(newSyllabus);
    navigate('/');
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Syllabus Builder</h1>
          <p className="text-slate-600">Create and submit course syllabi for your assigned subjects</p>
        </div>

        {/* Subject Selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Your Assigned Subject
          </label>
          <select
            onChange={(e) => handleSubjectSelect(e.target.value)}
            value={selectedSubject?.id || ''}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Choose a subject...</option>
            {assignedSubjects.map(({ subject, program, dept }) => (
              <option key={subject!.id} value={subject!.id}>
                {subject!.name} — {program!.name} ({program!.level}) — {dept?.name || ''}
              </option>
            ))}
          </select>

          {assignedSubjects.length === 0 && (
            <p className="text-sm text-slate-500 mt-2">
              No subjects assigned to you yet. Contact your HOD for subject assignments.
            </p>
          )}

          {selectedSubject && selectedProgram && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Subject:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedSubject.name}</span>
                </div>
                <div>
                  <span className="text-slate-600">Program:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedProgram.name}</span>
                </div>
                <div>
                  <span className="text-slate-600">Level:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedProgram.level}</span>
                </div>
                <div>
                  <span className="text-slate-600">Year:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedSubject.yearLabel}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedSubject && selectedProgram && (
          <>
            {/* Semester Tabs */}
            <div className="bg-white rounded-lg border border-slate-200 mb-6">
              <div className="border-b border-slate-200 px-6 pt-4">
                <div className="flex gap-2 overflow-x-auto">
                  {Array.from({ length: totalSemesters }, (_, i) => i + 1).map(sem => (
                    <button
                      key={sem}
                      onClick={() => setActiveSemester(sem)}
                      className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${activeSemester === sem
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                      Semester {sem}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Semester {activeSemester} Courses
                  </h2>
                  <button
                    onClick={addCourse}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Course
                  </button>
                </div>

                {courses.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No courses added yet. Click "Add Course" to begin.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {courses.map((course, index) => (
                      <CourseCard
                        key={course.id}
                        course={course}
                        index={index}
                        onUpdate={updateCourse}
                        onRemove={removeCourse}
                        onFileUpload={handleFileUpload}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            {courses.length > 0 && (
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  Submit for Review
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Course Card with CO/CLO Upload ─────────────────────────

function CourseCard({
  course,
  index,
  onUpdate,
  onRemove,
  onFileUpload,
}: {
  course: CourseEntry;
  index: number;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
  onFileUpload: (courseId: string, type: 'co' | 'clo', file: File) => void;
}) {
  const coRef = useRef<HTMLInputElement>(null);
  const cloRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-4 border border-slate-200 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Course {index + 1}</span>
        <button onClick={() => onRemove(course.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course Code</label>
          <input
            type="text"
            value={course.code}
            onChange={(e) => onUpdate(course.id, 'code', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., CS101"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Course Name</label>
          <input
            type="text"
            value={course.name}
            onChange={(e) => onUpdate(course.id, 'name', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g., Programming Fundamentals"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Credits</label>
          <input
            type="number"
            value={course.credits}
            onChange={(e) => onUpdate(course.id, 'credits', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            min="1" max="6"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
          <select
            value={course.type}
            onChange={(e) => onUpdate(course.id, 'type', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
            <option value="Lab">Lab</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <textarea
          value={course.description}
          onChange={(e) => onUpdate(course.id, 'description', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          rows={2}
          placeholder="Brief course description"
        />
      </div>

      {/* CO & CLO Upload */}
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
        {/* CO Upload */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className={`w-3.5 h-3.5 ${course.coDocument ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700">CO (Course Outcomes)</span>
            {course.coDocument && <CheckCircle className="w-3 h-3 text-emerald-600" />}
          </div>
          {course.coDocument ? (
            <p className="text-xs text-emerald-600 mb-1 truncate">{course.coDocument.fileName}</p>
          ) : (
            <p className="text-xs text-slate-400 mb-1">Not uploaded</p>
          )}
          <input ref={coRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFileUpload(course.id, 'co', f); }}
          />
          <button
            onClick={() => coRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {course.coDocument ? 'Replace CO' : 'Upload CO'}
          </button>
        </div>

        {/* CLO Upload */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className={`w-3.5 h-3.5 ${course.cloDocument ? 'text-emerald-600' : 'text-slate-400'}`} />
            <span className="text-sm font-medium text-slate-700">CLO (Learning Outcomes)</span>
            {course.cloDocument && <CheckCircle className="w-3 h-3 text-emerald-600" />}
          </div>
          {course.cloDocument ? (
            <p className="text-xs text-emerald-600 mb-1 truncate">{course.cloDocument.fileName}</p>
          ) : (
            <p className="text-xs text-slate-400 mb-1">Not uploaded</p>
          )}
          <input ref={cloRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFileUpload(course.id, 'clo', f); }}
          />
          <button
            onClick={() => cloRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {course.cloDocument ? 'Replace CLO' : 'Upload CLO'}
          </button>
        </div>
      </div>
    </div>
  );
}
