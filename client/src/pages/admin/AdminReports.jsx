import { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';
import { Activity, CalendarDays, Shield, Users } from 'lucide-react';

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    adminService.getStats()
      .then(({ data }) => setReport(data))
      .catch((error) => setLoadError(error.response?.data?.message || 'Could not load platform report'))
      .finally(() => setLoading(false));
  }, []);

  const stats = report?.stats || {};
  const cards = [
    { label: 'Total users', value: stats.totalUsers ?? '—', icon: Users, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { label: 'Approved providers', value: stats.verifiedProviders ?? '—', icon: Shield, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { label: 'Active bookings', value: stats.activeBookings ?? '—', icon: CalendarDays, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { label: 'Online users', value: stats.onlineUsers ?? '—', icon: Activity, iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
  ];

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="mx-auto max-w-6xl space-y-5">
        <header><h1 className="text-2xl font-bold text-gray-900">Platform reports</h1><p className="mt-1 text-sm text-gray-500">Current totals and registrations for the last 30 days.</p></header>
        {loading ? <p className="text-sm text-gray-500">Loading report…</p> : loadError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p> : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map((card) => <StatCard key={card.label} {...card} />)}</div>
            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">User registrations (last 30 days)</h2>
              {(report?.userRegistrations || []).length === 0 ? <p className="mt-4 text-sm text-gray-500">No registrations in this period.</p> : <div className="mt-4 space-y-2">{report.userRegistrations.map((item) => <div key={item._id} className="flex items-center justify-between border-b border-gray-50 py-2 text-sm"><span>{item._id}</span><strong>{item.count}</strong></div>)}</div>}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminReports;
