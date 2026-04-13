import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { programs, getProgramsByDepartment, syllabi, type Program } from '../data/universityData';
import { Plus, Trash2, Save } from 'lucide-react';

export default function SyllabusBuilder() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeSemester, setActiveSemester] = useState(1);
  const [courses, setCourses] = useState<any[]>([]);

  if (!currentUser || currentUser.role !== 'Faculty') {
    return <div className="p-8">Access denied</div>;
  }

  const availablePrograms = currentUser.departmentId
    ? getProgramsByDepartment(currentUser.departmentId)
    : [];

  const handleProgramSelect = (programId: string) => {
    const program = programs.find(p => p.id === programId);
    if (program) {
      setSelectedProgram(program);
      setCourses([]);
      setActiveSemester(1);
    }
  };

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

  const handleSubmit = () => {
    if (!selectedProgram) return;

    const newSyllabus = {
      id: `syl-${Date.now()}`,
      programId: selectedProgram.id,
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
          <p className="text-slate-600">Create and submit course syllabi for review</p>
        </div>

        {/* Program Selection */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Select Program
          </label>
          <select
            onChange={(e) => handleProgramSelect(e.target.value)}
            value={selectedProgram?.id || ''}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">Choose a program...</option>
            {availablePrograms.map(program => (
              <option key={program.id} value={program.id}>
                {program.name} ({program.level}) - {program.duration} months
              </option>
            ))}
          </select>

          {selectedProgram && (
            <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-600">Level:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedProgram.level}</span>
                </div>
                <div>
                  <span className="text-slate-600">Duration:</span>{' '}
                  <span className="font-medium text-slate-900">{selectedProgram.duration} months</span>
                </div>
                <div>
                  <span className="text-slate-600">Total Semesters:</span>{' '}
                  <span className="font-medium text-slate-900">{totalSemesters}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {selectedProgram && (
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
                      <div
                        key={course.id}
                        className="p-4 border border-slate-200 rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-slate-700">
                            Course {index + 1}
                          </span>
                          <button
                            onClick={() => removeCourse(course.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Course Code
                            </label>
                            <input
                              type="text"
                              value={course.code}
                              onChange={(e) => updateCourse(course.id, 'code', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., CS101"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Course Name
                            </label>
                            <input
                              type="text"
                              value={course.name}
                              onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              placeholder="e.g., Programming Fundamentals"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Credits
                            </label>
                            <input
                              type="number"
                              value={course.credits}
                              onChange={(e) =>
                                updateCourse(course.id, 'credits', parseInt(e.target.value))
                              }
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              min="1"
                              max="6"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Type
                            </label>
                            <select
                              value={course.type}
                              onChange={(e) => updateCourse(course.id, 'type', e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              <option value="Core">Core</option>
                              <option value="Elective">Elective</option>
                              <option value="Lab">Lab</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={course.description}
                            onChange={(e) => updateCourse(course.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            rows={2}
                            placeholder="Brief course description"
                          />
                        </div>
                      </div>
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
