import { Bell, CheckCircle, FileText, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { currentUser } = useAuth();

  // Mock notifications based on role
  const mockNotifications = [
    {
      id: 1,
      type: 'success',
      title: 'Syllabus Approved',
      message: 'Your syllabus for Data Structures (CS201) has been approved by the HOD.',
      time: '2 hours ago',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      unread: true,
    },
    {
      id: 2,
      type: 'info',
      title: 'New Subject Assigned',
      message: 'You have been assigned to teach Web Development (CS305) for the upcoming semester.',
      time: '5 hours ago',
      icon: FileText,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      unread: true,
    },
    {
      id: 3,
      type: 'warning',
      title: 'Syllabus Revision Required',
      message: 'The curriculum for Software Engineering (CS401) needs to be updated with the latest AI trends.',
      time: '1 day ago',
      icon: AlertCircle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      unread: false,
    },
    {
      id: 4,
      type: 'default',
      title: 'System Maintenance',
      message: 'The Syllabus Builder module will be down for maintenance this weekend.',
      time: '2 days ago',
      icon: Clock,
      iconColor: 'text-slate-500',
      bgColor: 'bg-slate-100',
      unread: false,
    }
  ];

  if (!currentUser) return null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Bell className="w-8 h-8 text-indigo-600" />
            Notifications
          </h1>
          <p className="text-slate-600">Stay updated with your latest alerts and tasks.</p>
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition-all">
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {mockNotifications.map((notification) => {
          const Icon = notification.icon;
          return (
            <div 
              key={notification.id} 
              className={`p-6 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors flex gap-4 ${
                notification.unread ? 'bg-indigo-50/30' : ''
              }`}
            >
              <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${notification.bgColor}`}>
                <Icon className={`w-6 h-6 ${notification.iconColor}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className={`text-base font-semibold ${notification.unread ? 'text-slate-900' : 'text-slate-700'}`}>
                      {notification.title}
                    </h3>
                    <p className={`mt-1 text-sm ${notification.unread ? 'text-slate-700' : 'text-slate-500'}`}>
                      {notification.message}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {notification.time}
                  </span>
                </div>
              </div>
              {notification.unread && (
                <div className="shrink-0 flex items-center justify-center w-3 h-3 mt-1.5 bg-indigo-600 rounded-full"></div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
