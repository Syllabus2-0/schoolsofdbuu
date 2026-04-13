import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  syllabi,
  updateSyllabus,
  addComment,
  programs,
  users,
  type SyllabusStatus,
} from '../data/universityData';
import { CheckCircle, XCircle, MessageSquare, FileText } from 'lucide-react';

export default function Approvals() {
  const { currentUser } = useAuth();
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  if (!currentUser || (currentUser.role !== 'HOD' && currentUser.role !== 'Dean')) {
    return <div className="p-8">Access denied</div>;
  }

  const pendingApprovals = syllabi.filter(s => {
    if (currentUser.role === 'HOD') {
      return s.status === 'Pending HOD Review';
    }
    if (currentUser.role === 'Dean') {
      return s.status === 'Pending Dean Approval';
    }
    return false;
  });

  const selectedSyllabusData = syllabi.find(s => s.id === selectedSyllabus);
  const selectedProgram = selectedSyllabusData
    ? programs.find(p => p.id === selectedSyllabusData.programId)
    : null;
  const faculty = selectedSyllabusData
    ? users.find(u => u.id === selectedSyllabusData.facultyId)
    : null;

  const handleApprove = () => {
    if (!selectedSyllabus || !currentUser) return;

    const syllabus = syllabi.find(s => s.id === selectedSyllabus);
    if (!syllabus) return;

    let newStatus: SyllabusStatus;
    const updates: any = {};

    if (currentUser.role === 'HOD') {
      newStatus = 'Pending Dean Approval';
      updates.hodSignature = currentUser.name;
      updates.status = newStatus;
    } else if (currentUser.role === 'Dean') {
      newStatus = 'Published';
      updates.deanSignature = currentUser.name;
      updates.status = newStatus;
    }

    updateSyllabus(selectedSyllabus, updates);
    setSelectedSyllabus(null);
  };

  const handleReject = () => {
    if (!selectedSyllabus || !commentText) return;

    updateSyllabus(selectedSyllabus, { status: 'Draft' });
    addComment(selectedSyllabus, {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: `Rejected: ${commentText}`,
      timestamp: new Date().toISOString(),
    });

    setCommentText('');
    setSelectedSyllabus(null);
  };

  const handleComment = () => {
    if (!selectedSyllabus || !commentText) return;

    addComment(selectedSyllabus, {
      id: `comment-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      text: commentText,
      timestamp: new Date().toISOString(),
    });

    setCommentText('');
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Approval Queue</h1>
          <p className="text-slate-600">Review and approve submitted syllabi</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900">
                  Pending Approvals ({pendingApprovals.length})
                </h2>
              </div>

              <div className="divide-y divide-slate-200">
                {pendingApprovals.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No pending approvals
                  </div>
                ) : (
                  pendingApprovals.map(syllabus => {
                    const program = programs.find(p => p.id === syllabus.programId);
                    const facultyUser = users.find(u => u.id === syllabus.facultyId);

                    return (
                      <button
                        key={syllabus.id}
                        onClick={() => setSelectedSyllabus(syllabus.id)}
                        className={`w-full p-4 text-left hover:bg-slate-50 transition-colors ${selectedSyllabus === syllabus.id ? 'bg-indigo-50' : ''
                          }`}
                      >
                        <div className="font-medium text-sm text-slate-900 mb-1">
                          {program?.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          By {facultyUser?.name}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(syllabus.updatedAt).toLocaleDateString()}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-2">
            {!selectedSyllabusData ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">Select a syllabus to review</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">
                    {selectedProgram?.name}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>Submitted by {faculty?.name}</span>
                    <span>•</span>
                    <span>{selectedProgram?.level} Program</span>
                    <span>•</span>
                    <span>{selectedProgram?.duration} months</span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">HOD Signature:</span>{' '}
                        <span className="font-medium text-slate-900">
                          {selectedSyllabusData.hodSignature || 'Pending'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Dean Signature:</span>{' '}
                        <span className="font-medium text-slate-900">
                          {selectedSyllabusData.deanSignature || 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Course Details</h3>

                  {selectedSyllabusData.semesters.map(semester => (
                    <div key={semester.semesterNumber} className="mb-6">
                      <h4 className="text-sm font-medium text-slate-700 mb-3">
                        Semester {semester.semesterNumber}
                      </h4>

                      <div className="space-y-3">
                        {semester.courses.map(course => (
                          <div
                            key={course.id}
                            className="p-4 border border-slate-200 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-slate-900">
                                  {course.code} - {course.name}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                  {course.description}
                                </div>
                              </div>
                              <div className="ml-4 flex gap-2">
                                <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                                  {course.credits} credits
                                </span>
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                                  {course.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comments */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Comments</h3>

                  <div className="space-y-3 mb-4">
                    {selectedSyllabusData.comments.length === 0 ? (
                      <p className="text-sm text-slate-500">No comments yet</p>
                    ) : (
                      selectedSyllabusData.comments.map(comment => (
                        <div key={comment.id} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between mb-1">
                            <span className="font-medium text-sm text-slate-900">
                              {comment.userName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(comment.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-700">{comment.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      onClick={handleComment}
                      className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comment
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                  <h3 className="font-semibold text-slate-900 mb-4">Review Actions</h3>

                  <div className="flex gap-4">
                    <button
                      onClick={handleApprove}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={!commentText}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Add a comment before rejecting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
