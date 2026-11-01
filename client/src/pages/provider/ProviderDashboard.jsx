import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wrench, CalendarCheck, Star, Shield, ArrowRight,
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

/* ── Mock data ─────────────────────────────────────────────────────── */
const MOCK_STATS = {
  servicesCompleted: 127,
  activeBookings: 4,
  averageRating: 4.7,
  trustScore: 92,
  totalEarnings: 24500,
};

const MOCK_BOOKINGS = [
  { _id: 'b1', serviceId: { title: 'Laptop Screen Replacement' }, customerId: { name: 'Rahul Patil' },    status: 'pending',     scheduledDate: '2026-08-12' },
  { _id: 'b2', serviceId: { title: 'Software Installation' },     customerId: { name: 'Sneha Kulkarni' }, status: 'accepted',    scheduledDate: '2026-08-11' },
  { _id: 'b3', serviceId: { title: 'Data Recovery' },             customerId: { name: 'Vikram Joshi' },   status: 'completed',   scheduledDate: '2026-08-09' },
  { _id: 'b4', serviceId: { title: 'Virus Removal' },             customerId: { name: 'Anjali Mehta' },   status: 'in_progress', scheduledDate: '2026-08-10' },
];

const MOCK_EARNINGS = [
  { date: 'Aug 1',  earnings: 2000 },
  { date: 'Aug 5',  earnings: 3500 },
  { date: 'Aug 10', earnings: 2800 },
  { date: 'Aug 15', earnings: 4200 },
  { date: 'Aug 20', earnings: 3100 },
  { date: 'Aug 25', earnings: 5400 },
  { date: 'Aug 31', earnings: 3500 },
];

/* ── Skeleton ────────────────────────────────────────────────────────*/
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

/* ── Trust Score Ring ───────────────────────────────────────────────*/
const TrustScoreRing = ({ score }) => {
  const pct  = (score / 100) * 100;
  const dash = 2 * Math.PI * 38;
  const offset = dash * (1 - score / 100);

  return (
    <div className="relative w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="38" fill="none" stroke="#e5e7eb" strokeWidth="10" />
        <circle
          cx="50" cy="50" r="38" fill="none"
          stroke="#2563eb" strokeWidth="10"
          strokeDasharray={`${dash}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{score}</span>
        <span className="text-[10px] text-gray-400">/100</span>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────────*/
const ProviderDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await providerService.getDashboard();
        setStats(res.data.stats);
        setBookings(res.data.recentBookings || []);
      } catch {
        setStats(MOCK_STATS);
        setBookings(MOCK_BOOKINGS);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

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
      label: 'Total Earnings',
      value: `₹${(stats?.totalEarnings || 0).toLocaleString('en-IN')}`,
    },
  ];

  return (
    <DashboardLayout navItems={PROVIDER_NAV} notifCount={2}>
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
            This Month
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

          {/* Trust Score card — 1/3 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
            {/* Trust Score */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">Trust Score</h2>
                <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-1 rounded-full">Verified</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                {loading
                  ? <Skeleton className="w-24 h-24 rounded-full" />
                  : <TrustScoreRing score={stats?.trustScore ?? 92} />
                }
                <p className="text-xs text-gray-500 text-center">Your trust score is based on reviews, completed services & verification</p>
              </div>
            </div>

            {/* Verification checklist */}
            <div className="space-y-2 border-t border-gray-50 pt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verification</p>
              {[
                { label: 'Identity Verified',         done: true },
                { label: 'Contact Verified',          done: true },
                { label: '127 Services Completed',    done: true },
                { label: 'Positive Review History',   done: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-xs text-gray-600">{item.label}</span>
                </div>
              ))}
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
              <h2 className="text-base font-bold text-gray-900">Earnings Overview</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Total this month:{' '}
                <span className="text-emerald-600 font-bold text-sm">
                  ₹{(stats?.totalEarnings || 24500).toLocaleString('en-IN')}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm" />
              Earnings (₹)
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_EARNINGS} barSize={28}>
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
          </ResponsiveContainer>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
