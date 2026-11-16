import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Shield, CalendarDays, Flag,
  ArrowRight, TrendingUp, AlertTriangle, CheckCircle2, Activity, Wrench,
} from 'lucide-react';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, AreaChart, Area,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';
import { format } from 'date-fns';

/* ── Severity badge ─────────────────────────────────────────────────*/
const SeverityBadge = ({ severity }) => {
  const styles = {
    high:   'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low:    'bg-green-100 text-green-700 border-green-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${styles[severity] || styles.medium}`}>
      {severity}
    </span>
  );
};

/* ── Skeleton ───────────────────────────────────────────────────────*/
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

/* ── Main Component ─────────────────────────────────────────────────*/
const AdminDashboard = () => {
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [flagged, setFlagged]   = useState([]);
  const [regData, setRegData]   = useState([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getStats();
        setStats(res.data.stats);
        setRegData(res.data.userRegistrations || []);

        const flagRes = await adminService.getFlaggedActivities({ resolved: false });
        setFlagged(flagRes.data.activities || []);
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Could not load admin dashboard.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const statCards = [
    {
      icon: Users,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Total Users',
      value: stats?.totalUsers?.toLocaleString() ?? '—',
    },
    {
      icon: Activity,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      label: 'Active Now (Online)',
      value: stats?.onlineUsers ?? '0',
    },
    {
      icon: Shield,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      label: 'Approved Providers',
      value: stats?.verifiedProviders ?? '—',
    },
    {
      icon: CalendarDays,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      label: 'Active Bookings',
      value: stats?.activeBookings ?? '—',
    },
    {
      icon: Flag,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-500',
      label: 'Flagged Activities',
      value: stats?.flaggedActivities ?? '—',
    },
  ];

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="max-w-6xl mx-auto space-y-6">
        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Overview</h1>
            <p className="text-gray-500 text-sm mt-1">Monitor platform health and activity</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            This Month
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            : statCards.map((c) => <StatCard key={c.label} {...c} />)
          }
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Flagged Activities — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Recent Flagged Activities
              </h2>
              <Link to="/admin/flagged" className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="px-5 py-2">
              {loading ? (
                <div className="space-y-3 py-3">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
                </div>
              ) : flagged.length > 0 ? (
                flagged.slice(0, 5).map((item) => {
                  const timeStr = item.createdAt
                    ? format(new Date(item.createdAt), 'dd MMM, hh:mm a')
                    : '';
                  return (
                    <div key={item._id} className="flex items-start justify-between py-3.5 border-b border-gray-50 last:border-0 gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          item.severity === 'high' ? 'bg-red-500' :
                          item.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-500'
                        }`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{item.description}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            User: <span className="font-medium text-gray-600">{item.userId?.name || 'Unknown'}</span>
                            {timeStr && <span> · {timeStr}</span>}
                          </p>
                        </div>
                      </div>
                      <SeverityBadge severity={item.severity} />
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-10 h-10 text-green-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No flagged activities 🎉</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick actions — 1/3 */}
          <div className="space-y-4">
            {/* Quick links */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                {[
                  { label: 'Manage Users',       to: '/admin/users',     icon: Users,       color: 'text-blue-600',   bg: 'bg-blue-50'   },
                  { label: 'Verify Providers',   to: '/admin/providers', icon: Shield,      color: 'text-green-600',  bg: 'bg-green-50'  },
                  { label: 'Moderate Services',   to: '/admin/services',  icon: Wrench,      color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Flagged Activities', to: '/admin/flagged',   icon: Flag,        color: 'text-red-500',    bg: 'bg-red-50'    },
                  { label: 'View Reports',       to: '/admin/reports',   icon: TrendingUp,  color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map(({ label, to, icon: Icon, color, bg }) => (
                  <Link
                    key={to}
                    to={to}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${bg}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 flex-1">{label}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── User Registrations Chart ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">User Registrations</h2>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-green-500" />
                Registrations by day
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              New Users
            </div>
          </div>
          {regData.length ? <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={regData}>
              <defs>
                <linearGradient id="regGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="_id" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={30} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4' }}
              />
              <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#regGrad)" dot={{ fill: '#3b82f6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer> : <p className="py-12 text-center text-sm text-gray-500">No registrations in the last 30 days.</p>}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
