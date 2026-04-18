import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  User as UserIcon,
  Mail,
  Building,
  Briefcase,
  Calendar,
  BookOpen,
  Shield,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface School {
  _id: string;
  name: string;
  code: string;
}

interface Department {
  _id: string;
  name: string;
}

interface Assignment {
  _id: string;
  subjectId?: {
    name: string;
    yearOrder: number;
  };
  departmentId?: {
    name: string;
  };
  userId?: string | {
    _id: string;
  };
}

interface PopsoDoc {
  _id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
}

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  schoolId?: string;
  departmentId?: string;
  assignedYears?: number[];
}

const roleLabels: Record<string, string> = {
  Registrar: 'Registrar',
  SuperAdmin: 'Super Administrator',
  Dean: 'Dean',
  HOD: 'Head of Department',
  Faculty: 'Faculty Member',
};

const roleColors: Record<string, { bg: string; text: string; border: string }> = {
  Registrar: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  SuperAdmin: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Dean: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  HOD: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  Faculty: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

export default function Profile() {
  const { currentUser, token } = useAuth();
  
  const [school, setSchool] = useState<School | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [popso, setPopso] = useState<PopsoDoc[]>([]);

  useEffect(() => {
    if (!currentUser || !token) return;

    const fetchDetails = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };

        if (currentUser.schoolId) {
          fetch(`/api/schools/${currentUser.schoolId}`, { headers: auth })
            .then(r => r.ok && r.json()).then(setSchool).catch(console.error);
        }

        if (currentUser.departmentId) {
          fetch(`/api/departments/${currentUser.departmentId}`, { headers: auth })
            .then(r => r.ok && r.json()).then(setDepartment).catch(console.error);
        }

        if (currentUser.role === 'Faculty') {
          fetch(`/api/faculty-assignments`, { headers: auth })
            .then(r => r.ok && r.json() as Promise<Assignment[]>)
            .then(data => {
              if (data) {
                setAssignments(data.filter((a: Assignment) => {
                  const uid = typeof a.userId === 'object' ? a.userId?._id : a.userId;
                  return uid === currentUser._id;
                }));
              }
            })
            .catch(console.error);
        }

        if (currentUser.role === 'HOD') {
          fetch(`/api/popso`, { headers: auth })
            .then(r => r.ok && r.json())
            .then(setPopso)
            .catch(console.error);
        }

      } catch (err) {
        console.error("Profile fetch error", err);
      }
    };

    fetchDetails();
  }, [currentUser, token]);


  if (!currentUser) return null;

  const colors = roleColors[currentUser.role] || roleColors.Faculty;

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">My Profile</h1>
          <p className="text-slate-600">View your account details and assignments</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="px-8 pb-8">
            {/* Avatar + Name */}
            <div className="flex items-end gap-6 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                <span className="text-2xl font-bold text-indigo-700">
                  {currentUser.name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="pb-1">
                <h2 className="text-2xl font-bold text-slate-900">{currentUser.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mt-1 ${colors.bg} ${colors.text} border ${colors.border}`}>
                  <Shield className="w-3 h-3" />
                  {roleLabels[currentUser.role]}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoRow icon={<Mail className="w-4 h-4 text-slate-500" />} label="Email" value={currentUser.email} />
              <InfoRow icon={<UserIcon className="w-4 h-4 text-slate-500" />} label="Database ID" value={currentUser._id} />
              {school && (
                <InfoRow icon={<Building className="w-4 h-4 text-slate-500" />} label="School" value={`${school.code} — ${school.name}`} />
              )}
              {department && (
                <InfoRow icon={<Briefcase className="w-4 h-4 text-slate-500" />} label="Department" value={department.name} />
              )}
              {currentUser.assignedYears && currentUser.assignedYears.length > 0 && (
                <InfoRow 
                  icon={<Calendar className="w-4 h-4 text-slate-500" />} 
                  label="Assigned Years" 
                  value={`Years: ${currentUser.assignedYears.join(', ')}`} 
                />
              )}
            </div>
          </div>
        </div>

        {/* Role-specific sections */}
        {(currentUser.role === 'SuperAdmin' || currentUser.role === 'Registrar') && <AdminProfileSection />}
        {currentUser.role === 'Dean' && school && <DeanProfileSection school={school} />}
        {currentUser.role === 'HOD' && department && <HODProfileSection user={currentUser as UserProfile} dept={department} popso={popso} />}
        {currentUser.role === 'Faculty' && <FacultyProfileSection assignments={assignments} />}
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase">{label}</p>
        <p className="text-sm font-medium text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function AdminProfileSection() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <Shield className="w-5 h-5 text-purple-600" />
        Administrator Privileges
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          'Manage all schools',
          'Assign/remove deans',
          'View full university tree',
          'Manage all users',
          'Access all analytics',
          'System configuration',
        ].map(priv => (
          <div key={priv} className="flex items-center gap-2 text-sm text-slate-700 bg-purple-50 px-3 py-2 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
            {priv}
          </div>
        ))}
      </div>
    </div>
  );
}

function DeanProfileSection({ school }: { school: School }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
        <GraduationCap className="w-5 h-5 text-blue-600" />
        Dean Responsibilities
      </h3>
      <p className="text-sm text-slate-600 mb-4">
        You manage <strong>{school?.name}</strong> ({school?.code})
      </p>
      <div className="grid grid-cols-2 gap-3">
        {[
          'Create departments',
          'Assign HODs (year-wise)',
          'Review & approve syllabi',
          'School-level analytics',
        ].map(resp => (
          <div key={resp} className="flex items-center gap-2 text-sm text-slate-700 bg-blue-50 px-3 py-2 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            {resp}
          </div>
        ))}
      </div>
    </div>
  );
}

function HODProfileSection({ user, dept, popso }: { user: UserProfile, dept: Department, popso: PopsoDoc[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-green-600" />
          HOD Responsibilities
        </h3>
        <p className="text-sm text-slate-600 mb-4">
          You manage <strong>{dept?.name}</strong> — Years: {user.assignedYears?.length ? user.assignedYears.join(', ') : 'All'}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            'Assign teachers to subjects',
            'Upload PO & PSO documents',
            'Review syllabus submissions',
            'Department analytics',
          ].map(resp => (
            <div key={resp} className="flex items-center gap-2 text-sm text-slate-700 bg-green-50 px-3 py-2 rounded-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {resp}
            </div>
          ))}
        </div>
      </div>

      {popso.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Uploaded Documents</h3>
          <div className="space-y-2">
            {popso.map(doc => (
              <div key={doc._id} className="flex items-center gap-3 text-sm bg-slate-50 px-3 py-2 rounded-lg">
                <FileText className="w-4 h-4 text-green-600" />
                <span className="font-medium text-slate-700">{doc.documentType}</span>
                <span className="text-slate-500">— {doc.fileName || doc.fileUrl}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function FacultyProfileSection({ assignments }: { assignments: Assignment[] }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-amber-600" />
        My Teaching Assignments ({assignments.length})
      </h3>

      {assignments.length === 0 ? (
        <p className="text-sm text-slate-500">No subjects assigned yet.</p>
      ) : (
        <div className="space-y-2">
          {assignments.map(asn => (
            <div key={asn._id} className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
              <FileText className="w-4 h-4 text-amber-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900">{asn.subjectId?.name || 'Unknown Subject'}</p>
                <p className="text-xs text-slate-500">
                  {asn.departmentId?.name || 'Department'}
                  {' '}- Year {asn.subjectId?.yearOrder || 0}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
