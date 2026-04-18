import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router';
import { FileText, Users, Building, Briefcase, BookOpen, Clock, CheckCircle, AlertCircle, Plus, X, Layers } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Syllabus {
  _id: string;
  status: string;
  programId?: {
    name: string;
  };
}

interface Department {
  _id: string;
  name: string;
}

type ProgramLevel = 'UG' | 'PG' | 'Ph.D';

interface DashboardStats {
  totalSchools?: number;
  totalDepartments?: number;
  totalPrograms?: number;
  totalSyllabi?: number;
  pendingApproval?: number;
  publishedSyllabi?: number;
  pendingReview?: number;
  facultyMembers?: number;
  mySyllabi?: number;
  inDraft?: number;
  underReview?: number;
  published?: number;
}

interface Department {
  _id: string;
  name: string;
}

type ProgramLevel = "UG" | "PG" | "Ph.D";

export default function Dashboard() {
  const { currentUser, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSyllabi, setRecentSyllabi] = useState<Syllabus[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);

  // Quick Action States
  const [showAddDept, setShowAddDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  const [showAddProgram, setShowAddProgram] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newProgramDeptId, setNewProgramDeptId] = useState("");
  const [newProgramLevel, setNewProgramLevel] = useState<ProgramLevel>("UG");
  const [newProgramName, setNewProgramName] = useState("");
  const [newProgramYears, setNewProgramYears] = useState(3);
  
  const isDean = currentUser?.role === 'Dean';

  useEffect(() => {
    if (!token || !currentUser) return;
    
    const fetchDashboard = async () => {
      try {
        const auth = { Authorization: `Bearer ${token}` };
        const [resStats, resSyllabi, resDept] = await Promise.all([
          fetch('/api/dashboard/stats', { headers: auth }),
          fetch('/api/syllabi', { headers: auth }),
          currentUser.role === 'Dean' ? fetch('/api/departments', { headers: auth }) : Promise.resolve({ ok: false } as Response)
        ]);
        
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setStats(dataStats);
        }

        if (resDept && resDept.ok) {
          setDepartments(await resDept.json());
        }
        
        if (resSyllabi.ok) {
          const dataSyllabi = await resSyllabi.json();
          let filteredSyllabi = [];
          if (currentUser.role === 'HOD') {
            filteredSyllabi = dataSyllabi.filter((s: Syllabus) => s.status === 'Pending HOD Review');
          } else if (currentUser.role === 'Dean') {
            filteredSyllabi = dataSyllabi.filter((s: Syllabus) => s.status === 'Pending Dean Approval');
          } else if (currentUser.role === 'Faculty') {
            filteredSyllabi = dataSyllabi;
          }
          setRecentSyllabi(filteredSyllabi);
        }

        if (isDean) {
          const resDepts = await fetch('/api/departments', { headers: auth });
          if (resDepts.ok) setDepartments(await resDepts.json());
        }

      } catch(err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboard();
  }, [token, currentUser, refresh]);

  const handleAddDept = async () => {
    if (!newDeptName.trim()) return;
    try {
      await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newDeptName.trim(), schoolId: currentUser?.schoolId }),
      });
      setNewDeptName("");
      setShowAddDept(false);
      setRefresh((r) => r + 1);
    } catch (err) { console.error(err); }
  };

  const handleAddProgram = async () => {
    if (!newProgramName.trim() || !newProgramDeptId) return;
    try {
      await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: newProgramName.trim(),
          level: newProgramLevel,
          duration: newProgramYears * 12,
          departmentId: newProgramDeptId,
          startYear: new Date().getFullYear()
        })
      });
      setNewProgramName("");
      setNewProgramDeptId("");
      setShowAddProgram(false);
      setRefresh(r => r + 1);
    } catch(err) { console.error(err); }
  };

  if (!currentUser) return null;
  if (loading) return <div className="p-8">Loading dashboard...</div>;
  if (!stats) return <div className="p-8">Failed to load dashboard</div>;

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

        {isDean && (
          <div className="flex flex-wrap items-center justify-end gap-4 mb-8">
            <button
              onClick={() => setShowAddDept(true)}
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Department
            </button>
            <button
              onClick={() => setShowAddProgram(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-100 rounded-xl font-semibold shadow-sm hover:border-indigo-200 hover:bg-indigo-50 hover:-translate-y-0.5 transition-all"
            >
              <Layers className="w-5 h-5" />
              Add Program
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {currentUser.role === 'SuperAdmin' && (
            <>
              <StatCard
                icon={<Building className="w-6 h-6" />}
                label="Total Schools"
                value={stats.totalSchools || 0}
                color="indigo"
              />
              <StatCard
                icon={<Briefcase className="w-6 h-6" />}
                label="Departments"
                value={stats.totalDepartments || 0}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Programs"
                value={stats.totalPrograms || 0}
                color="green"
              />
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="Total Syllabi"
                value={stats.totalSyllabi || 0}
                color="purple"
              />
            </>
          )}

          {currentUser.role === 'Dean' && (
            <>
              <StatCard
                icon={<Briefcase className="w-6 h-6" />}
                label="Departments"
                value={stats.totalDepartments || 0}
                color="blue"
              />
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Total Programs"
                value={stats.totalPrograms || 0}
                color="green"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Pending Approval"
                value={stats.pendingApproval || 0}
                color="amber"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Published Syllabi"
                value={stats.publishedSyllabi || 0}
                color="emerald"
              />
            </>
          )}

          {currentUser.role === 'HOD' && (
            <>
              <StatCard
                icon={<BookOpen className="w-6 h-6" />}
                label="Programs"
                value={stats.totalPrograms || 0}
                color="green"
              />
              <StatCard
                icon={<Users className="w-6 h-6" />}
                label="Faculty Members"
                value={stats.facultyMembers || 0}
                color="blue"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Pending Review"
                value={stats.pendingReview || 0}
                color="amber"
              />
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="Total Syllabi"
                value={stats.totalSyllabi || 0}
                color="purple"
              />
            </>
          )}

          {currentUser.role === 'Faculty' && (
            <>
              <StatCard
                icon={<FileText className="w-6 h-6" />}
                label="My Syllabi"
                value={stats.mySyllabi || 0}
                color="indigo"
              />
              <StatCard
                icon={<Clock className="w-6 h-6" />}
                label="In Draft"
                value={stats.inDraft || 0}
                color="amber"
              />
              <StatCard
                icon={<AlertCircle className="w-6 h-6" />}
                label="Under Review"
                value={stats.underReview || 0}
                color="blue"
              />
              <StatCard
                icon={<CheckCircle className="w-6 h-6" />}
                label="Published"
                value={stats.published || 0}
                color="emerald"
              />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Items for HOD / Dean */}
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
                {recentSyllabi.length === 0 ? (
                  <p className="text-sm text-slate-500">No pending approvals</p>
                ) : (
                  recentSyllabi.slice(0, 3).map(syllabus => (
                    <div
                      key={syllabus._id}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-slate-900">{syllabus.programId?.name || 'Program'}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Status: {syllabus.status}
                      </div>
                    </div>
                  ))
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
                {recentSyllabi.length === 0 ? (
                  <p className="text-sm text-slate-500">No syllabi created yet</p>
                ) : (
                  recentSyllabi.slice(0, 3).map(syllabus => (
                    <div
                      key={syllabus._id}
                      className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="font-medium text-sm text-slate-900">{syllabus.programId?.name || 'Program'}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StatusBadge status={syllabus.status} />
                      </div>
                    </div>
                  ))
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
                  action="Syllabus system updated"
                  subject="All programs"
                  time="1 hour ago"
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Department Modal */}
        {showAddDept && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add Department</h2>
                <button onClick={() => setShowAddDept(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-6">
                <div>
                  <label htmlFor="dept-name" className="block text-sm font-semibold text-slate-700 mb-2">Department Name</label>
                  <input
                    id="dept-name"
                    type="text"
                    value={newDeptName}
                    onChange={e => setNewDeptName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="e.g., Computer Science & Engineering"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowAddDept(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddDept} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Program Modal */}
        {showAddProgram && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Add Program</h2>
                <button onClick={() => setShowAddProgram(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select
                    value={newProgramDeptId}
                    onChange={e => setNewProgramDeptId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium appearance-none"
                  >
                    <option value="">Select Department...</option>
                    {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Program Level</label>
                  <select
                    value={newProgramLevel}
                    onChange={e => setNewProgramLevel(e.target.value as ProgramLevel)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Ph.D">Doctorate (Ph.D)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Program Name</label>
                  <input
                    type="text"
                    value={newProgramName}
                    onChange={e => setNewProgramName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="e.g., B.Tech Computer Science"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newProgramYears}
                    onChange={e => setNewProgramYears(parseInt(e.target.value) || 0)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowAddProgram(false)} className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                  <button onClick={handleAddProgram} className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[status as keyof typeof statusColors] || statusColors.Draft}`}>
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
