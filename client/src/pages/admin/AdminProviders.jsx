import { useCallback, useEffect, useState } from 'react';
import { CheckCircle, ChevronLeft, ChevronRight, RefreshCw, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';

const AdminProviders = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async (silent = false) => {
    setLoadError('');
    if (!silent) setLoading(true);
    try {
      const { data } = await adminService.getProviders({ status, page, limit: 20 });
      setProviders(data.providers || []);
      setTotal(data.total || 0);
      setPages(Math.max(1, data.pages || 1));
      setPage((current) => Math.min(current, Math.max(1, data.pages || 1)));
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load providers');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [status, page]);

  useEffect(() => {
    load();
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') load(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const verify = async (provider, status) => {
    setUpdatingId(provider._id);
    try {
      const { data } = await adminService.verifyProvider(provider._id, { status });
      await load(true);
      toast.success(`Provider ${status}`);
      if (data.warning) toast.error(data.warning);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update verification');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><h1 className="text-2xl font-bold text-gray-900">Provider verification</h1><p className="mt-1 text-sm text-gray-500">Approve providers to make their active services available for booking.</p></div>
          <div className="flex gap-2">
            <select aria-label="Filter providers by verification status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm">
              <option value="pending">Pending review</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All providers</option>
            </select>
            <button type="button" onClick={() => load()} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button>
          </div>
        </header>
        {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}<button onClick={() => load()} className="ml-3 font-semibold underline">Try again</button></div>}
        {loading ? <p className="text-sm text-gray-500">Loading providers…</p> : !loadError && providers.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No {status === 'all' ? '' : `${status} `}provider profiles found.</div> : !loadError && providers.map((provider) => (
          <article key={provider._id} className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="font-semibold text-gray-900">{provider.businessName}</h2><p className="text-sm text-gray-500">{provider.userId?.name} · {provider.category}</p><p className="mt-1 text-xs text-gray-500">{provider.location?.city}{provider.location?.state ? `, ${provider.location.state}` : ''} · {provider.verificationStatus}</p>{provider.description && <p className="mt-2 max-w-2xl text-sm text-gray-600">{provider.description}</p>}</div>
            <div className="flex gap-2">
              <button onClick={() => verify(provider, 'approved')} disabled={updatingId === provider._id || provider.verificationStatus === 'approved'} className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"><CheckCircle size={15} />Approve</button>
              <button onClick={() => verify(provider, 'rejected')} disabled={updatingId === provider._id || provider.verificationStatus === 'rejected'} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 disabled:opacity-50"><XCircle size={15} />Reject</button>
            </div>
          </article>
        ))}
        {!loading && !loadError && total > 0 && <div className="flex items-center justify-between rounded-xl bg-white p-3 text-sm text-gray-600">
          <span>{total} provider{total === 1 ? '' : 's'} · Page {page} of {pages}</span>
          <div className="flex gap-2"><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button aria-label="Next page" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div>
        </div>}
      </div>
    </DashboardLayout>
  );
};

export default AdminProviders;
