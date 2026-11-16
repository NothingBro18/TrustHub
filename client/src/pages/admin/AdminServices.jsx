import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Power, RefreshCw, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const { data } = await adminService.getServices({ page, limit: 20 });
      setServices(data.services || []);
      setTotal(data.total || 0);
      setPages(Math.max(1, data.pages || 1));
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load services');
    } finally {
      setLoading(false);
    }
  }, [page]);
  useEffect(() => { load(); }, [load]);

  const toggle = async (service) => {
    try {
      const { data } = await adminService.updateService(service._id, { isActive: !service.isActive });
      setServices((items) => items.map((item) => item._id === service._id ? data.service : item));
      toast.success(data.service.isActive ? 'Service enabled' : 'Service disabled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update service');
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex items-end justify-between gap-3"><div><h1 className="text-2xl font-bold text-gray-900">Service moderation</h1><p className="mt-1 text-sm text-gray-500">Review listings and hide or restore services.</p></div><button type="button" onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm disabled:opacity-60"><RefreshCw size={15} className={loading ? 'animate-spin' : ''} />Refresh</button></header>
        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}<button onClick={load} className="ml-3 font-semibold underline">Try again</button></p>}
        {loading ? <p className="text-sm text-gray-500">Loading services…</p> : loadError ? null : services.length === 0 ? <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center"><Wrench className="mx-auto mb-3 text-gray-400" /><p className="text-sm text-gray-600">No services found.</p></div> : (
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="p-3">Service</th><th className="p-3">Provider</th><th className="p-3">Price range</th><th className="p-3">Visibility</th><th className="p-3">Action</th></tr></thead>
              <tbody>{services.map((service) => <tr key={service._id} className="border-t border-gray-100">
                <td className="p-3"><p className="font-semibold text-gray-900">{service.title}</p><p className="text-xs text-gray-500">{service.category}</p></td>
                <td className="p-3">{service.providerId?.businessName || 'Provider'}</td>
                <td className="p-3">₹{service.priceRange?.min}–₹{service.priceRange?.max}</td>
                <td className="p-3">{service.isActive ? 'Active' : 'Hidden'}</td>
                <td className="p-3"><button onClick={() => toggle(service)} className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 ${service.isActive ? 'text-red-600' : 'text-green-700'}`}><Power size={14} />{service.isActive ? 'Hide' : 'Restore'}</button></td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
        {!loading && !loadError && total > 0 && <div className="flex items-center justify-between rounded-xl bg-white p-3 text-sm text-gray-600">
          <span>{total} service{total === 1 ? '' : 's'} · Page {page} of {pages}</span>
          <div className="flex gap-2"><button aria-label="Previous page" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronLeft size={16} /></button><button aria-label="Next page" disabled={page >= pages} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-gray-200 p-2 disabled:opacity-40"><ChevronRight size={16} /></button></div>
        </div>}
      </div>
    </DashboardLayout>
  );
};

export default AdminServices;
