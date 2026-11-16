import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck, Star, ArrowRight,
  TrendingUp, IndianRupee, CheckCircle2, Clock,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import StatusBadge from '../../components/ui/StatusBadge';
import { providerService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { PROVIDER_NAV } from '../../utils/constants';
import { format } from 'date-fns';

/* ── Skeleton ────────────────────────────────────────────────────────*/
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

/* ── Main Component ─────────────────────────────────────────────────*/
const ProviderDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [bookings, setBookings] = useState([]);
  const [earningsHistory, setEarningsHistory] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loadError, setLoadError] = useState('');

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setLoadError('');
    try {
      const res = await providerService.getDashboard();
      setStats(res.data.stats);
      setBookings(res.data.recentBookings || []);
      setEarningsHistory(res.data.earningsHistory || []);
      setProviderProfile(res.data.provider);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load your provider dashboard.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchDashboard(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const businessName = user?.name || 'Provider';

  const statCards = [
    {
      icon: CheckCircle2,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      label: 'Services Completed',
      value: stats?.servicesCompleted ?? '—',
    },
    {
      icon: Clock,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Active Bookings',
      value: stats?.activeBookings ?? '—',
    },
    {
      icon: Star,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      label: 'Average Rating',
      value: stats?.averageRating?.toFixed(1) ?? '—',
    },
    {
      icon: IndianRupee,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      label: 'Reported Collections',
      value: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`,
    },
  ];

  return (
    <DashboardLayout navItems={PROVIDER_NAV}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome, {businessName}! 🏢
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's your service overview.</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm">
            <TrendingUp className="w-4 h-4 text-green-500" />
            Provider workspace
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            : statCards.map((c) => <StatCard key={c.label} {...c} />)
          }
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Bookings — 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
              <Link to="/provider/bookings" className="text-sm text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="px-5 py-2">
              {loading ? (
                <div className="space-y-3 py-3">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : bookings.length > 0 ? (
                bookings.map((b) => {
                  const title    = b.serviceId?.title || b.serviceType || 'Service';
                  const customer = b.customerId?.name || 'Customer';
                  const dateStr  = b.scheduledDate
                    ? format(new Date(b.scheduledDate), 'dd MMM')
                    : '';
                  return (
                    <div key={b._id} className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 text-base">🔧</div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                          <p className="text-xs text-gray-400 truncate">{customer}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <StatusBadge status={b.status} />
                        <span className="text-xs text-gray-400 hidden sm:block">{dateStr}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12">
                  <CalendarCheck className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No bookings yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Profile status — 1/3 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Profile status</h2>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${providerProfile?.isVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{providerProfile?.isVerified ? 'Verified' : 'Verification pending'}</span>
              </div>
              <p className="text-xs text-gray-500">
                {providerProfile?.isVerified
                  ? 'Your active services can appear in customer search and accept new booking requests.'
                  : 'This status refreshes automatically. Your active services become bookable after approval.'}
              </p>
              <div className="space-y-2 border-t border-gray-50 pt-4 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Completed bookings</span>
                  <span className="font-semibold text-gray-900">{stats?.servicesCompleted ?? '—'}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-gray-500">Customer rating</span>
                  <span className="font-semibold text-gray-900">
                    {stats?.averageRating?.toFixed(1) ?? '—'} ({providerProfile?.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>

            <Link
              to="/provider/profile"
              className="w-full py-2.5 border border-blue-200 text-blue-600 text-sm font-semibold rounded-xl text-center hover:bg-blue-50 transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* ── Earnings Chart ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Provider-Reported Collections</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total recorded earnings:{' '}
                <span className="text-emerald-600 font-bold text-sm">
                  ₹{Number(stats?.totalEarnings || 0).toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              Earnings (₹)
            </div>
          </div>
          {earningsHistory.length ? <ResponsiveContainer width="100%" height={180}>
            <BarChart data={earningsHistory} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `₹${v/1000}k`} />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                formatter={(v) => [`₹${v.toLocaleString('en-IN')}`, 'Earnings']}
                cursor={{ fill: '#f0fdf4' }}
              />
              <Bar dataKey="earnings" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer> : <p className="py-12 text-center text-sm text-gray-500">No completed bookings in the last 30 days.</p>}
        </div>

        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
