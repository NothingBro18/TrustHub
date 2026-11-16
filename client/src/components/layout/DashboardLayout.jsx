import { useEffect, useState } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import { notificationService } from '../../services';

const ROLE_BADGE = {
  customer: 'bg-blue-100 text-blue-700',
  provider: 'bg-green-100 text-green-700',
  admin:    'bg-purple-100 text-purple-700',
};

const DashboardLayout = ({ children, navItems }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    notificationService.getNotifications({ limit: 1 })
      .then(({ data }) => { if (active) setNotifCount(data.unreadCount || 0); })
      .catch((error) => console.error('Failed to load unread notifications:', error));
    return () => { active = false; };
  }, []);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        navItems={navItems}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Spacer on desktop */}
          <div className="hidden lg:block" />

          {/* Right: Notification + User */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <Link to="/notifications" aria-label="View notifications" className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -right-1 -top-1 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold text-white">{notifCount > 99 ? '99+' : notifCount}</span>
              )}
            </Link>

            {/* User pill */}
            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-200">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {user?.avatar
                  ? <img src={user.avatar} alt={user?.name} className="w-8 h-8 object-cover" />
                  : <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${ROLE_BADGE[user?.role] || 'bg-gray-100 text-gray-600'}`}>
                  {user?.role}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 hidden sm:block" />
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
