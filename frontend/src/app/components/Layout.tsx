import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
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
  User,
  Bell,
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const isRegistrar = currentUser?.role === 'Registrar' || currentUser?.role === 'SuperAdmin';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!currentUser) {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-96' : 'w-0'
          } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        <div className="h-16 border-b border-slate-200 flex items-center px-6 shrink-0">
          <Building2 className="w-6 h-6 text-indigo-600 mr-3" />
          <span className="font-semibold text-slate-900">Academic Tree</span>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-auto p-4">
          <div className="min-w-max">
            <AcademicTree />
          </div>
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

              {isRegistrar && (
                <>
                  <Link
                    to="/users"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Users
                  </Link>
                  <Link
                    to="/schools"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Schools
                  </Link>
                </>
              )}

              {currentUser.role === 'Dean' && (
                <>
                  <Link
                    to="/departments"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Building2 className="w-4 h-4" />
                    Assign HOD
                  </Link>
                  <Link
                    to="/teacher-assignment"
                    className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Users className="w-4 h-4" />
                    Assign Faculty
                  </Link>
                </>
              )}

              {currentUser.role === 'HOD' && (
                <Link
                  to="/teacher-assignment"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Users className="w-4 h-4" />
                  Assign Teachers
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

              {(currentUser.role === 'HOD' || currentUser.role === 'Dean' || isRegistrar) && (
                <Link
                  to="/analytics"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Role Badge */}
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              {isRegistrar ? 'Registrar' : currentUser.role}
            </span>

            {/* User Info */}
            <div className="flex items-center gap-3">
              <Link to="/profile" className="text-right block cursor-pointer group">
                <p className="text-sm font-medium text-slate-900 group-hover:text-indigo-600 transition-colors flex items-center justify-end gap-1">
                  {currentUser.name}
                </p>
                <p className="text-xs text-slate-500 group-hover:text-indigo-400 transition-colors">{currentUser.email}</p>
              </Link>
              <div className="h-8 w-px bg-slate-200 mx-1 border-r"></div>
              
              {/* Notification Bell */}
              <Link
                to="/notifications"
                className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-slate-600 relative group"
                title="Notifications"
              >
                <Bell className="w-5 h-5 group-hover:animate-wiggle" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Link>

              <Link
                to="/profile"
                className="p-2 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors text-slate-600"
                title="Profile"
              >
                <User className="w-5 h-5" />
              </Link>
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
