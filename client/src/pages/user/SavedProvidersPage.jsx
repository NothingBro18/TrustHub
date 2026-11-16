import { useEffect, useState } from 'react';
import { Heart, Star, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { userService } from '../../services';
import { CUSTOMER_NAV } from '../../utils/constants';

const SavedProvidersPage = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    setLoadError('');
    try {
      const { data } = await userService.getMe();
      setProviders(data.user?.savedProviders || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load saved providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (providerId) => {
    try {
      await userService.toggleSavedProvider(providerId);
      setProviders((items) => items.filter((provider) => provider._id !== providerId));
      toast.success('Provider removed from saved list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not remove provider');
    }
  };

  return (
    <DashboardLayout navItems={CUSTOMER_NAV}>
      <div className="mx-auto max-w-5xl space-y-5">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">Saved Providers</h1>
          <p className="mt-1 text-sm text-gray-500">Your bookmarked providers in one place.</p>
        </header>
        {loading ? <p className="text-sm text-gray-500">Loading saved providers…</p> : loadError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p> : providers.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <Heart className="mx-auto mb-3 text-gray-400" />
            <p className="font-medium text-gray-800">No saved providers</p>
            <Link to="/services" className="mt-2 inline-block text-sm font-semibold text-blue-600">Browse services</Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {providers.map((provider) => (
              <article key={provider._id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/providers/${provider._id}`} className="font-semibold text-gray-900 hover:text-blue-600">{provider.businessName}</Link>
                  <p className="mt-1 text-sm text-gray-500">{provider.category}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-amber-600"><Star size={14} className="fill-current" />{Number(provider.averageRating || 0).toFixed(1)}</p>
                </div>
                <button onClick={() => remove(provider._id)} aria-label="Remove saved provider" className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={17} /></button>
              </article>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SavedProvidersPage;
