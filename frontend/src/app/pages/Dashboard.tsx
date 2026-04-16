import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import {
  schools,
  departments,
  programs,
  syllabi,
  getDepartmentsBySchool,
  getProgramsByDepartment,
} from '../data/universityData';
import { FileText, Users, Building, Briefcase, BookOpen, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const pendingApprovals = syllabi.filter(s => {
    if (currentUser.role === 'HOD') {
      return s.status === 'Pending HOD Review';
    }
    if (currentUser.role === 'Dean') {
      return s.status === 'Pending Dean Approval';
    }
    return false;
  });

  const userSyllabi = syllabi.filter(s => s.facultyId === currentUser.id);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, {currentUser.name}
          </h1>
          <p className="text-slate-600">
            {currentUser.role} Dashboard
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentUser.role === 'SuperAdmin' && (
            <>
              <StatCard
                icon={<Building className="w-6 h-6" />}
                label="Total Schools"
                value={schools.length}
                color="indigo"
              />
              <StatCard
                icon={<Briefcase className="w-6 h-6" />}
                label="Departments"
                value={departments.length}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Programs"
                value={programs.length}
                color="green"
              />
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="Total Syllabi"
                value={syllabi.length}
                color="purple"
              />
            </>
          )}

          {currentUser.role === 'Dean' && currentUser.schoolId && (
            <>
              <StatCard
                icon={<Briefcase className="w-6 h-6" />}
                label="Departments"
                value={getDepartmentsBySchool(currentUser.schoolId).length}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Total Programs"
                value={
                  getDepartmentsBySchool(currentUser.schoolId)
                    .map(d => getProgramsByDepartment(d.id).length)
                    .reduce((a, b) => a + b, 0)
                }
                color="green"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Pending Approval"
                value={pendingApprovals.length}
                color="amber"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Published Syllabi"
                value={syllabi.filter(s => s.status === 'Published').length}
                color="emerald"
              />
            </>
          )}

          {currentUser.role === 'HOD' && currentUser.departmentId && (
            <>
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Programs"
                value={getProgramsByDepartment(currentUser.departmentId).length}
                color="green"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Faculty Members"
                value={5}
                color="blue"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Pending Review"
                value={pendingApprovals.length}
                color="amber"
              />
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="Total Syllabi"
                value={syllabi.length}
                color="purple"
              />
            </>
          )}

          {currentUser.role === 'Faculty' && (
            <>
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="My Syllabi"
                value={userSyllabi.length}
                color="indigo"
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                label="In Draft"
                value={userSyllabi.filter(s => s.status === 'Draft').length}
                color="amber"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Under Review"
                value={userSyllabi.filter(s => s.status.includes('Pending')).length}
                color="blue"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Published"
                value={userSyllabi.filter(s => s.status === 'Published').length}
                color="emerald"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Items */}
          {(currentUser.role === 'HOD' || currentUser.role === 'Dean') && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Pending Approvals</h2>
                <Link
                  to="/approvals"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-3">
                {pendingApprovals.length === 0 ? (
                  <p className="text-sm text-slate-500">No pending approvals</p>
                ) : (
                  pendingApprovals.slice(0, 3).map(syllabus => {
                    const program = programs.find(p => p.id === syllabus.programId);
                    return (
                      <div
                        key={syllabus.id}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-sm text-slate-900">{program?.name}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          Status: {syllabus.status}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Faculty Syllabi */}
          {currentUser.role === 'Faculty' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">My Syllabi</h2>
                <Link
                  to="/syllabus/new"
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Create New
                </Link>
              </div>

              <div className="space-y-3">
                {userSyllabi.length === 0 ? (
                  <p className="text-sm text-slate-500">No syllabi created yet</p>
                ) : (
                  userSyllabi.map(syllabus => {
                    const program = programs.find(p => p.id === syllabus.programId);
                    return (
                      <div
                        key={syllabus.id}
                        className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      >
                        <div className="font-medium text-sm text-slate-900">{program?.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={syllabus.status} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {currentUser.role !== 'Faculty' && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <ActivityItem
                  action="Syllabus submitted"
                  subject="B.Tech CSE"
                  time="2 hours ago"
                />
                <ActivityItem
                  action="Dean approved"
                  subject="M.Tech CSE"
                  time="5 hours ago"
                />
                <ActivityItem
                  action="New program added"
                  subject="MBA"
                  time="1 day ago"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className="text-sm text-slate-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusColors = {
    Draft: 'bg-slate-100 text-slate-700',
    'Pending HOD Review': 'bg-amber-100 text-amber-700',
    'Pending Dean Approval': 'bg-blue-100 text-blue-700',
    Published: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status as keyof typeof statusColors]}`}>
      {status}
    </span>
  );
}

function ActivityItem({ action, subject, time }: { action: string; subject: string; time: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5" />
      <div className="flex-1">
        <p className="text-slate-900">
          <span className="font-medium">{action}</span> • {subject}
        </p>
        <p className="text-slate-500 text-xs">{time}</p>
      </div>
    </div>
  );
}
