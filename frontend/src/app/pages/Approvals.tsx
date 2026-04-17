import { useState } from 'react';
import { useNavigate } from 'react-router';
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
  const navigate = useNavigate();
  const [selectedSyllabus, setSelectedSyllabus] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  if (!currentUser || (currentUser.role !== 'HOD' && currentUser.role !== 'Dean' && currentUser.role !== 'SuperAdmin')) {
    return <div className="p-8">Access denied</div>;
  }

  const pendingApprovals = syllabi.filter(s => {
    if (currentUser.role === 'HOD') {
      return s.status === 'Pending HOD Review';
    }
    if (currentUser.role === 'Dean') {
      return s.status === 'Pending Dean Approval';
    }
    if (currentUser.role === 'SuperAdmin') {
      return s.status === 'Pending Admin Approval';
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

                {/* Review Redirect */}
                <div className="bg-white rounded-lg border border-slate-200 p-10 mt-6 flex flex-col items-center justify-center text-center">
                   <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-indigo-600" />
                   </div>
                   <h3 className="font-semibold text-lg text-slate-900 mb-2">Detailed Syllabus Review</h3>
                   <p className="text-slate-500 max-w-md mb-8">
                      Click below to officially review the full Course Details, COs, CLOs, Contents, and the CO-PO Evaluation Matrix.
                   </p>
                   <button
                     onClick={() => navigate(`/syllabus/review/${selectedSyllabus}`)}
                     className="flex items-center justify-center gap-2 px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                   >
                     Review Detailed Syllabus
                   </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
