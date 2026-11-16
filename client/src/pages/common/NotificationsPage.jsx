import { useEffect, useState } from 'react';
import { Bell, Check, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { notificationService } from '../../services';
import { ADMIN_NAV, CUSTOMER_NAV, PROVIDER_NAV } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const NotificationsPage = () => {
  const { user } = useAuth();
  const navItems = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'provider' ? PROVIDER_NAV : CUSTOMER_NAV;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    setLoadError('');
    try {
      const { data } = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const markAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update notifications');
    }
  };

  const markRead = async (notification) => {
    if (notification.isRead) return;
    try {
      await notificationService.markRead(notification._id);
      setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, isRead: true } : item));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update notification');
    }
  };

  const remove = async (id) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((items) => items.filter((item) => item._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not delete notification');
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mx-auto max-w-4xl space-y-5">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
            <p className="mt-1 text-sm text-gray-500">Updates about bookings, messages, and reviews.</p>
          </div>
          <button onClick={markAllRead} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"><Check size={16} /> Mark all read</button>
        </header>
        {loading ? <p className="text-sm text-gray-500">Loading notifications…</p> : loadError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p> : notifications.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <Bell className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">You’re all caught up</p>
            <p className="mt-1 text-sm text-gray-500">New account activity will appear here.</p>
          </div>
        ) : notifications.map((notification) => (
          <article key={notification._id} className={`flex items-start gap-3 rounded-xl border bg-white p-4 ${notification.isRead ? 'border-gray-100' : 'border-blue-200 bg-blue-50/40'}`}>
            <div className="min-w-0 flex-1">
              {notification.link ? <Link to={notification.link} onClick={() => markRead(notification)} className="font-medium text-gray-900 hover:text-blue-700">{notification.message}</Link> : <p className="font-medium text-gray-900">{notification.message}</p>}
              <p className="mt-1 text-xs text-gray-500">{notification.type} · {new Date(notification.createdAt).toLocaleString()}</p>
            </div>
            <button onClick={() => remove(notification._id)} aria-label="Delete notification" className="rounded p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button>
          </article>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default NotificationsPage;
