import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../data/universityData';
import AcademicTree from './AcademicTree';
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  BarChart3,
  Building2,
  LogOut,
  ChevronDown,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const { currentUser, simulateRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (role: UserRole) => {
    simulateRole(role);
    setRoleMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <>{children}</>;
  }

  const roleColors = {
    SuperAdmin: 'bg-purple-100 text-purple-700',
    Dean: 'bg-blue-100 text-blue-700',
    HOD: 'bg-green-100 text-green-700',
    Faculty: 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-80' : 'w-0'
          } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="h-16 border-b border-slate-200 flex items-center px-6">
          <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
          <span className="font-semibold text-slate-900">Academic Tree</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <AcademicTree />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>

              {currentUser.role === 'SuperAdmin' && (
                <Link
                  to="/users"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Users
                </Link>
              )}

              {currentUser.role === 'Faculty' && (
                <Link
                  to="/syllabus/new"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Syllabus Builder
                </Link>
              )}

              {(currentUser.role === 'HOD' || currentUser.role === 'Dean') && (
                <Link
                  to="/approvals"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Approvals
                </Link>
              )}

              <Link
                to="/analytics"
                className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 ${roleColors[currentUser.role]
                  }`}
              >
                Simulate: {currentUser.role}
                <ChevronDown className="w-4 h-4" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <button
                    onClick={() => handleRoleChange('SuperAdmin')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">Super Administrator</span>
                    <p className="text-xs text-slate-500">Global access and control</p>
                  </button>
                  <button
                    onClick={() => handleRoleChange('Dean')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">Dean</span>
                    <p className="text-xs text-slate-500">School-level management</p>
                  </button>
                  <button
                    onClick={() => handleRoleChange('HOD')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">Head of Department</span>
                    <p className="text-xs text-slate-500">Department oversight</p>
                  </button>
                  <button
                    onClick={() => handleRoleChange('Faculty')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium">Faculty Member</span>
                    <p className="text-xs text-slate-500">Course and syllabus management</p>
                  </button>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
