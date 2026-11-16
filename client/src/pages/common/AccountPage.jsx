import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { providerService, userService } from '../../services';
import { ADMIN_NAV, CUSTOMER_NAV, PROVIDER_NAV } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const AccountPage = ({ earnings = false }) => {
  const { user, setUser } = useAuth();
  const isProvider = user?.role === 'provider';
  const navItems = user?.role === 'admin' ? ADMIN_NAV : isProvider ? PROVIDER_NAV : CUSTOMER_NAV;
  const [form, setForm] = useState({
    name: '', phone: '', city: '', state: '', businessName: '', category: 'Other',
    description: '', email: '', businessHours: '', experience: '',
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileResponse, providerResponse] = await Promise.all([
          userService.getMe(),
          isProvider ? providerService.getDashboard() : Promise.resolve(null),
        ]);
        const profile = profileResponse.data.user;
        setUser(profile);
        setForm((current) => ({
          ...current,
          name: profile.name || '',
          phone: profile.phone || '',
          city: profile.location?.city || '',
          state: profile.location?.state || '',
        }));
        if (isProvider) {
          const provider = providerResponse.data.provider || {};
          if (earnings) setStats(providerResponse.data.stats);
          setForm((current) => ({
            ...current,
            businessName: provider.businessName || '',
            category: provider.category || 'Other',
            description: provider.description || '',
            email: provider.email || '',
            businessHours: provider.businessHours || '',
            experience: provider.experience || '',
          }));
        }
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Could not load your account. Try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [earnings, isProvider, setUser]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const { data } = await userService.updateMe({
        name: form.name.trim(),
        phone: form.phone.trim(),
        location: { city: form.city.trim(), state: form.state.trim() },
      });
      setUser(data.user);
      if (isProvider) {
        await providerService.updateProfile({
          businessName: form.businessName.trim(),
          category: form.category,
          description: form.description.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          businessHours: form.businessHours.trim(),
          experience: form.experience.trim(),
          location: { city: form.city.trim(), state: form.state.trim() },
        });
      }
      toast.success('Account updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save your account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{earnings ? 'Earnings' : 'Profile and settings'}</h1>
          <p className="mt-1 text-sm text-gray-500">{earnings ? 'Completed booking totals recorded in TrustHub.' : 'Keep your contact and account details up to date.'}</p>
        </header>
        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}
        {earnings && !loadError && (
          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-white p-5"><p className="text-sm text-gray-500">Reported offline receipts</p><p className="mt-2 text-2xl font-bold text-gray-900">₹{Number(stats?.totalEarnings || 0).toLocaleString('en-IN')}</p><p className="mt-1 text-xs text-gray-500">Sum of provider-reported amounts; TrustHub does not process or independently verify offline payments.</p></div>
            <div className="rounded-xl border border-gray-100 bg-white p-5"><p className="text-sm text-gray-500">Completed services</p><p className="mt-2 text-2xl font-bold text-gray-900">{stats?.servicesCompleted ?? '—'}</p><p className="mt-1 text-xs text-gray-500">Total completed bookings</p></div>
          </section>
        )}
        {loading ? <p className="text-sm text-gray-500">Loading account…</p> : !loadError && !earnings && (
          <form onSubmit={save} className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-gray-700">Name<input required maxLength={50} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium text-gray-700">Phone<input maxLength={30} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium text-gray-700">City<input maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
            <label className="space-y-1 text-sm font-medium text-gray-700">State<input maxLength={80} value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
            {isProvider && (
              <>
                <h2 className="border-t border-gray-100 pt-4 font-semibold text-gray-900 sm:col-span-2">Provider profile</h2>
                <label className="space-y-1 text-sm font-medium text-gray-700">Business name<input required maxLength={100} value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
                <label className="space-y-1 text-sm font-medium text-gray-700">Category<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2">{['Home Services', 'Tech Services', 'Vehicle Services', 'Student Services', 'Creative Services', 'Other'].map((value) => <option key={value}>{value}</option>)}</select></label>
                <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">Description<textarea maxLength={3000} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
                <label className="space-y-1 text-sm font-medium text-gray-700">Business email<input type="email" maxLength={254} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
                <label className="space-y-1 text-sm font-medium text-gray-700">Business hours<input maxLength={120} value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
                <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">Experience<input maxLength={100} value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" /></label>
              </>
            )}
            <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60 sm:col-span-2">{saving ? 'Saving…' : 'Save changes'}</button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AccountPage;
