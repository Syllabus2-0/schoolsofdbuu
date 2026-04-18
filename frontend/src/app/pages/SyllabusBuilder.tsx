import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Plus, Trash2, Save, Upload, FileCheck, CheckCircle } from 'lucide-react';

interface CourseEntry {
  id: string; // Used as key in frontend only
  code: string;
  name: string;
  credits: number;
  type: 'Core' | 'Elective' | 'Lab';
  description: string;
  coDocumentUrl?: string;
  cloDocumentUrl?: string;
}

export default function SyllabusBuilder() {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();

  const [assignedSubjects, setAssignedSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [activeSemester, setActiveSemester] = useState(1);
  const [courses, setCourses] = useState<CourseEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || currentUser?.role !== 'Faculty') return;

    const fetchAssignments = async () => {
      try {
        // Fetch real faculty assignments
        const res = await fetch('/api/faculty-assignments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // The backend returns an array of assignment objects with populated subjectId and departmentId
          setAssignedSubjects(data.filter((a: any) => a.userId?._id === currentUser._id || a.userId === currentUser._id));
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [token, currentUser]);

  if (!currentUser || currentUser.role !== 'Faculty') {
    return <div className="p-8">Access denied</div>;
  }

  const selectedAssignment = assignedSubjects.find(a => a.subjectId?._id === selectedSubjectId || a.subjectId === selectedSubjectId);
  const selectedSubject = selectedAssignment?.subjectId;
  const selectedProgram = selectedSubject?.programId;
  // Fallback duration calculation if not provided by backend
  const totalSemesters = selectedProgram?.duration ? Math.ceil(selectedProgram.duration / 6) : 8;

  const handleSubjectSelect = (id: string) => {
    setSelectedSubjectId(id);
    setCourses([]);
    setActiveSemester(1);
  };

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

  const handleFileUpload = async (courseId: string, type: 'co' | 'clo', file: File) => {
    // In a real production app, we would upload to S3/Cloudinary.
    // For now, we simulate a successful "upload" and store the "url"
    // Since we don't have a specific file upload endpoint yet, we'll just mock it.
    const mockUrl = `/uploads/${Date.now()}_${file.name}`;
    setCourses(courses.map(c => {
      if (c.id !== courseId) return c;
      return type === 'co' ? { ...c, coDocumentUrl: mockUrl } : { ...c, cloDocumentUrl: mockUrl };
    }));
  };

  const handleSubmit = async () => {
    if (!selectedSubject) return;

    try {
      const response = await fetch('/api/syllabi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          programId: selectedSubject.programId?._id || selectedSubject.programId,
          subjectId: selectedSubject._id,
          semesters: [
            {
              semesterNumber: activeSemester,
              courses: courses.map(({ id, ...rest }) => rest), // Remove frontend-only ID
            },
          ],
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  if (loading) return <div className="p-8">Loading assignments...</div>;

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
            value={selectedSubjectId}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Choose a subject...</option>
            {assignedSubjects.map((asn) => (
              <option key={asn._id} value={asn.subjectId?._id}>
                {asn.subjectId?.name || 'Unknown'} — {asn.programId?.name || ''} ({asn.programId?.level || ''})
              </option>
            ))}
          </select>

          {assignedSubjects.length === 0 && (
            <p className="text-sm text-slate-500 mt-2">
              No subjects assigned to you yet. Contact your HOD for subject assignments.
            </p>
          )}

          {selectedSubject && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Subject:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedSubject.name}</span>
                </div>
                <div>
                  <span className="text-slate-600">Program:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedSubject.programId?.name || 'Unknown'}</span>
                </div>
                <div>
                  <span className="text-slate-600">Level:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedSubject.programId?.level || ''}</span>
                </div>
                <div>
                  <span className="text-slate-600">Year:</span>{' '}
                  <span className="font-medium text-slate-900">Year {selectedSubject.yearOrder || 1}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedSubject && (
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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">CO (Course Outcomes)</span>
            {course.coDocumentUrl && <CheckCircle className="w-3 h-3 text-emerald-600" />}
          </div>
          <input ref={coRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFileUpload(course.id, 'co', f); }}
          />
          <button
            onClick={() => coRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {course.coDocumentUrl ? 'Replace CO' : 'Upload CO'}
          </button>
        </div>

        <div>
           <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-slate-700">CLO (Learning Outcomes)</span>
            {course.cloDocumentUrl && <CheckCircle className="w-3 h-3 text-emerald-600" />}
          </div>
          <input ref={cloRef} type="file" className="hidden" accept=".pdf,.doc,.docx"
            onChange={e => { const f = e.target.files?.[0]; if (f) onFileUpload(course.id, 'clo', f); }}
          />
          <button
            onClick={() => cloRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Upload className="w-3 h-3" />
            {course.cloDocumentUrl ? 'Replace CLO' : 'Upload CLO'}
          </button>
        </div>
      </div>
    </div>
  );
}
