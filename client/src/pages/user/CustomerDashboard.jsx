import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, CheckCircle, Heart, Star,
  ArrowRight, MapPin, Shield,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import BookingCard from '../../components/ui/BookingCard';
import { userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import { CUSTOMER_NAV } from '../../utils/constants';

/* ── Mock fallback data ────────────────────────────────────────────── */
const MOCK_BOOKINGS = [
  { _id: '1', serviceType: 'Laptop Repair',  providerId: { businessName: 'ABC Computers' },    status: 'in_progress', scheduledDate: '2026-08-12', createdAt: new Date() },
  { _id: '2', serviceType: 'AC Service',     providerId: { businessName: 'CoolHome Services' }, status: 'scheduled',   scheduledDate: '2026-08-14', createdAt: new Date() },
  { _id: '3', serviceType: 'Bike Servicing', providerId: { businessName: 'AutoCare' },          status: 'completed',   scheduledDate: '2026-08-02', createdAt: new Date() },
];

const MOCK_PROVIDERS = [
  { _id: 'p1', businessName: 'Mobile Screen Repair', averageRating: 4.6, category: 'Tech Services',  priceFrom: 400, emoji: '📱' },
  { _id: 'p2', businessName: 'Home Cleaning',        averageRating: 4.5, category: 'Home Services',  priceFrom: 500, emoji: '🏠' },
  { _id: 'p3', businessName: 'Data Recovery',        averageRating: 4.8, category: 'Tech Services',  priceFrom: 300, emoji: '💾' },
];

const MOCK_ACTIVITY = [
  { date: 'Aug 1',  bookings: 1 },
  { date: 'Aug 5',  bookings: 2 },
  { date: 'Aug 10', bookings: 1 },
  { date: 'Aug 15', bookings: 3 },
  { date: 'Aug 20', bookings: 2 },
  { date: 'Aug 25', bookings: 4 },
  { date: 'Aug 31', bookings: 2 },
];

/* ── Skeleton loader ───────────────────────────────────────────────── */
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-xl ${className}`} />
);

/* ── Provider recommendation card ─────────────────────────────────── */
const RecommendedCard = ({ provider }) => (
  <Link
    to={`/providers/${provider._id}`}
    className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
  >
    <div className="w-11 h-11 bg-blue-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-blue-200 transition-colors">
      {provider.emoji || '🏢'}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-gray-900 truncate">{provider.businessName}</p>
      <div className="flex items-center gap-1 mt-0.5">
        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
        <span className="text-xs text-gray-500">{provider.averageRating?.toFixed(1)}</span>
      </div>
    </div>
    <div className="text-right flex-shrink-0">
      <p className="text-xs text-gray-400">From</p>
      <p className="text-sm font-bold text-blue-600">₹{provider.priceFrom || '—'}</p>
    </div>
  </Link>
);

/* ── Main Component ────────────────────────────────────────────────── */
const CustomerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading]   = useState(true);
  const [stats, setStats]       = useState(null);
  const [bookings, setBookings] = useState([]);
  const [saved, setSaved]       = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await userService.getDashboard();
        setStats(res.data.stats);
        setBookings(res.data.recentBookings || []);
        setSaved(res.data.savedProviders || []);
      } catch {
        // Use mock data on API failure (development / no backend yet)
        setStats({ activeBookings: 2, completedServices: 12, savedProviders: 5 });
        setBookings(MOCK_BOOKINGS);
        setSaved([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  const statCards = [
    {
      icon: CalendarDays,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      label: 'Active Bookings',
      value: stats?.activeBookings ?? '—',
    },
    {
      icon: CheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      label: 'Completed Services',
      value: stats?.completedServices ?? '—',
    },
    {
      icon: Heart,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-500',
      label: 'Saved Providers',
      value: stats?.savedProviders ?? '—',
    },
    {
      icon: Star,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-500',
      label: 'Average Rating',
      value: '4.7',
    },
  ];

  return (
    <DashboardLayout navItems={CUSTOMER_NAV} notifCount={3}>
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {firstName}! 👋
            </h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening today.</p>
          </div>
          <Link
            to="/services"
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
          >
            Find Services
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
            : statCards.map((card) => <StatCard key={card.label} {...card} />)
          }
        </div>

        {/* ── Main content grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Bookings — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Recent Bookings</h2>
              <Link
                to="/my-bookings"
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="px-5 py-2">
              {loading ? (
                <div className="space-y-3 py-3">
                  {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-14" />)}
                </div>
              ) : bookings.length > 0 ? (
                bookings.slice(0, 5).map((b) => <BookingCard key={b._id} booking={b} />)
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-500">No bookings yet</p>
                  <Link to="/services" className="text-sm text-blue-600 font-semibold mt-1 inline-block hover:text-blue-700">
                    Find a service →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recommended Providers — 1/3 width */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900">Recommended For You</h2>
              <Link
                to="/services"
                className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
              >
                See All
              </Link>
            </div>

            <div className="p-3 space-y-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)
              ) : (
                MOCK_PROVIDERS.map((p) => <RecommendedCard key={p._id} provider={p} />)
              )}
            </div>
          </div>
        </div>

        {/* ── Activity chart ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-gray-900">Booking Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              Bookings
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={MOCK_ACTIVITY} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={24}
              />
              <Tooltip
                contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: 12 }}
                cursor={{ fill: '#eff6ff' }}
              />
              <Bar dataKey="bookings" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Saved Providers ── */}
        {saved.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Heart className="w-4 h-4 text-orange-500 fill-orange-400" />
                Saved Providers
              </h2>
              <Link to="/saved-providers" className="text-sm text-blue-600 font-semibold hover:text-blue-700">
                View All
              </Link>
            </div>
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {saved.slice(0, 3).map((p) => (
                <Link
                  key={p._id}
                  to={`/providers/${p._id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.businessName}</p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-400">
                      <MapPin className="w-3 h-3" />
                      <span>{p.location?.city || 'Nearby'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default CustomerDashboard;
