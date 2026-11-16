import { useEffect, useState } from 'react';
import { Pencil, Plus, Power, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { serviceService } from '../../services';
import { PROVIDER_NAV, SERVICE_CATEGORIES } from '../../utils/constants';
import { isValidPriceRange } from '../../utils/validation';

const EMPTY_FORM = {
  title: '',
  category: 'Other',
  description: '',
  minPrice: '',
  maxPrice: '',
  tags: '',
};

const ProviderServicesPage = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadServices = async () => {
    setLoadError('');
    try {
      const { data } = await serviceService.getMyServices();
      setServices(data.services || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load your services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.title.trim() || !isValidPriceRange(form.minPrice, form.maxPrice)) {
      toast.error('Enter a title and a valid price range');
      return;
    }

    setSaving(true);
    try {
      const min = Number(form.minPrice);
      const max = Number(form.maxPrice);
      const payload = {
        title: form.title.trim(),
        category: form.category,
        description: form.description.trim(),
        priceRange: { min, max },
        tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      };
      if (editingId) await serviceService.updateService(editingId, payload);
      else await serviceService.createService(payload);
      toast.success(editingId ? 'Service updated' : 'Service created');
      resetForm();
      await loadServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save this service');
    } finally {
      setSaving(false);
    }
  };

  const edit = (service) => {
    setEditingId(service._id);
    setForm({
      title: service.title || '',
      category: service.category || 'Other',
      description: service.description || '',
      minPrice: service.priceRange?.min ?? '',
      maxPrice: service.priceRange?.max ?? '',
      tags: (service.tags || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deactivate = async (service) => {
    if (!window.confirm(`Deactivate "${service.title}"? It will no longer appear in public search.`)) return;
    try {
      await serviceService.deactivateService(service._id);
      toast.success('Service deactivated');
      await loadServices();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not deactivate this service');
    }
  };

  return (
    <DashboardLayout navItems={PROVIDER_NAV}>
      <div className="mx-auto max-w-5xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">My Services</h1>
          <p className="mt-1 text-sm text-gray-500">Manage the services customers can book from your profile.</p>
        </header>

        <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:grid-cols-2">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900 sm:col-span-2">
            {editingId ? <Pencil size={18} /> : <Plus size={18} />}
            {editingId ? 'Edit service' : 'Add a service'}
          </h2>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Title
            <input required maxLength={100} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Category
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2">
              {SERVICE_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
            Description
            <textarea maxLength={2000} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Minimum price (INR)
            <input required type="number" min="0" step="1" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700">
            Maximum price (INR)
            <input required type="number" min="0" step="1" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm font-medium text-gray-700 sm:col-span-2">
            Tags (comma-separated)
            <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full rounded-lg border border-gray-200 px-3 py-2" />
          </label>
          <div className="flex gap-2 sm:col-span-2">
            <button disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add service'}</button>
            {editingId && <button type="button" onClick={resetForm} className="rounded-lg border border-gray-200 px-4 py-2">Cancel</button>}
          </div>
        </form>

        <section className="space-y-3">
          {loading ? <p className="text-sm text-gray-500">Loading services…</p> : loadError ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p> : services.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
              <Wrench className="mx-auto mb-3 text-gray-400" />
              <p className="font-semibold text-gray-800">No services added yet</p>
              <p className="mt-1 text-sm text-gray-500">Add your first service above to let customers book you.</p>
            </div>
          ) : services.map((service) => (
            <article key={service._id} className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{service.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${service.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{service.isActive ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="mt-1 text-sm text-gray-500">{service.category} · ₹{service.priceRange?.min}–₹{service.priceRange?.max}</p>
                {service.description && <p className="mt-1 text-sm text-gray-600">{service.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => edit(service)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"><Pencil size={15} /> Edit</button>
                {service.isActive && <button onClick={() => deactivate(service)} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-red-600"><Power size={15} /> Deactivate</button>}
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ProviderServicesPage;
