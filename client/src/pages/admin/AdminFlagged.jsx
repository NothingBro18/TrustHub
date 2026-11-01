import { useState, useEffect, useCallback } from 'react';
import {
  Flag, AlertTriangle, ShieldAlert, CheckCircle2,
  Search, Filter, RefreshCw, Trash2,
  PlusCircle, User, Calendar, Clock, AlertCircle,
  X, Check, RotateCcw,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import { adminService } from '../../services';
import { ADMIN_NAV } from '../../utils/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

/* ── Fallback mock data ── */
const MOCK_FLAGGED = [
  {
    _id: 'f1',
    type: 'unusual_review',
    description: 'Rapid 5-star review burst submitted from identical IP within 3 minutes.',
    userId: { name: 'FastFix Spammer', email: 'spammer99@fakemail.com', role: 'customer' },
    severity: 'high',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'f2',
    type: 'suspicious_account',
    description: 'Account registered with disposable email domain and high frequency booking requests.',
    userId: { name: 'FastFix Spammer', email: 'spammer99@fakemail.com', role: 'customer' },
    severity: 'high',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'f3',
    type: 'multiple_reviews',
    description: 'Duplicate review text detected across 2 separate provider listings.',
    userId: { name: 'Rahul Patil', email: 'customer@trusthub.com', role: 'customer' },
    severity: 'medium',
    resolved: false,
    createdAt: new Date().toISOString(),
  },
];

const SEVERITY_CONFIG = {
  high: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    label: 'High Risk',
  },
  medium: {
    bg: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Medium Risk',
  },
  low: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Low Risk',
  },
};

const TYPE_CONFIG = {
  unusual_review: { label: 'Unusual Review Burst', icon: AlertTriangle },
  suspicious_account: { label: 'Suspicious Account', icon: ShieldAlert },
  multiple_reviews: { label: 'Duplicate Review Text', icon: AlertCircle },
  failed_login: { label: 'Repeated Login Failure', icon: Clock },
  other: { label: 'Security Anomaly', icon: Flag },
};

const AdminFlagged = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, unresolved, resolved
  const [severityFilter, setSeverityFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals & Action states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // New activity form
  const [newFormData, setNewFormData] = useState({
    type: 'suspicious_account',
    severity: 'high',
    description: '',
  });

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter === 'unresolved') params.resolved = 'false';
      if (statusFilter === 'resolved') params.resolved = 'true';
      if (severityFilter !== 'all') params.severity = severityFilter;
      if (typeFilter !== 'all') params.type = typeFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await adminService.getFlaggedActivities(params);
      if (res.data && res.data.activities) {
        setActivities(res.data.activities);
        setTotalCount(res.data.total);
      }
    } catch {
      toast.error('Failed to load live flagged records. Showing cached items.');
      setActivities(MOCK_FLAGGED);
      setTotalCount(MOCK_FLAGGED.length);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, severityFilter, typeFilter, searchTerm]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Toggle resolve / reopen
  const handleToggleResolve = async (activity) => {
    setActionLoadingId(activity._id);
    const targetStatus = !activity.resolved;
    try {
      const res = await adminService.resolveFlaggedActivity(activity._id, {
        resolved: targetStatus,
      });
      setActivities((prev) =>
        prev.map((a) => (a._id === activity._id ? { ...a, ...res.data.activity } : a))
      );
      toast.success(
        targetStatus ? 'Activity marked as resolved' : 'Activity reopened for investigation'
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update activity status');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete activity
  const handleDeleteActivity = async () => {
    if (!deleteConfirmItem) return;
    setActionLoadingId(deleteConfirmItem._id);
    try {
      await adminService.deleteFlaggedActivity(deleteConfirmItem._id);
      setActivities((prev) => prev.filter((a) => a._id !== deleteConfirmItem._id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      toast.success('Flagged incident deleted');
      setDeleteConfirmItem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete activity');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Create manual flagged activity
  const handleCreateActivity = async (e) => {
    e.preventDefault();
    if (!newFormData.description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    setActionLoadingId('create');
    try {
      await adminService.createFlaggedActivity(newFormData);
      toast.success('Flagged incident logged successfully');
      setIsNewModalOpen(false);
      setNewFormData({
        type: 'suspicious_account',
        severity: 'high',
        description: '',
      });
      fetchActivities();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create flagged record');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSeverityFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  // Quick stats
  const pendingCount = activities.filter((a) => !a.resolved).length;
  const highRiskCount = activities.filter((a) => a.severity === 'high').length;
  const resolvedCount = activities.filter((a) => a.resolved).length;

  return (
    <DashboardLayout navItems={ADMIN_NAV}>
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Flag className="w-6 h-6 text-red-600" />
              Flagged Activities & Security
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Automated risk triggers, fraudulent pattern detections, and manual flags.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchActivities}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 text-gray-500 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Log Flagged Incident
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Flag}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Total Incidents"
            value={totalCount.toString()}
            sub="Logged triggers"
          />
          <StatCard
            icon={AlertTriangle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            label="Pending Action"
            value={pendingCount.toString()}
            sub="Requires review"
          />
          <StatCard
            icon={ShieldAlert}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="High Severity"
            value={highRiskCount.toString()}
            sub="Critical priority"
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Resolved"
            value={resolvedCount.toString()}
            sub="Closed incidents"
          />
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search description or incident notes..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All</option>
                <option value="unresolved">Pending (Unresolved)</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600">
              <span>Severity:</span>
              <select
                value={severityFilter}
                onChange={(e) => {
                  setSeverityFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="high">High Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="low">Low Risk</option>
              </select>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-gray-600">
              <span>Type:</span>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-transparent border-none text-xs font-bold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="unusual_review">Review Burst</option>
                <option value="suspicious_account">Suspicious Account</option>
                <option value="multiple_reviews">Duplicate Reviews</option>
                <option value="failed_login">Failed Logins</option>
                <option value="other">Other</option>
              </select>
            </div>

            {(searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || typeFilter !== 'all') && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* ── Flagged Activities List ── */}
        <div className="space-y-3">
          {loading ? (
            Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-32 h-5 bg-gray-200 rounded-full" />
                    <div className="w-20 h-4 bg-gray-200 rounded" />
                  </div>
                  <div className="w-3/4 h-4 bg-gray-100 rounded" />
                  <div className="w-48 h-3 bg-gray-100 rounded" />
                </div>
              ))
          ) : activities.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-base font-bold text-gray-900">No flagged activities found</p>
              <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                Platform security checks are clean or match no existing filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            activities.map((item) => {
              const sev = SEVERITY_CONFIG[item.severity] || SEVERITY_CONFIG.medium;
              const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.other;
              const TypeIcon = typeMeta.icon;
              const isOperating = actionLoadingId === item._id;

              return (
                <div
                  key={item._id}
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
                    item.resolved
                      ? 'border-gray-100 opacity-80 bg-gray-50/40'
                      : 'border-red-100/80 hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Indicator & Content */}
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          item.resolved
                            ? 'bg-gray-100 text-gray-500'
                            : item.severity === 'high'
                            ? 'bg-red-100 text-red-600'
                            : item.severity === 'medium'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>

                      {/* Content */}
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${sev.bg}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                            {sev.label}
                          </span>

                          <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                            {typeMeta.label}
                          </span>

                          {item.resolved ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Resolved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full">
                              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                              Pending Investigation
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-900 leading-relaxed">
                          {item.description}
                        </p>

                        {/* Associated User & Metadata */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 pt-1">
                          {item.userId && (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span>
                                User:{' '}
                                <strong className="text-gray-800 font-semibold">
                                  {item.userId.name || 'Anonymous User'}
                                </strong>{' '}
                                {item.userId.email && `(${item.userId.email})`}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>
                              Detected:{' '}
                              {item.createdAt
                                ? format(new Date(item.createdAt), 'MMM dd, yyyy • hh:mm a')
                                : 'Recent'}
                            </span>
                          </div>

                          {item.resolved && item.resolvedAt && (
                            <div className="flex items-center gap-1 text-emerald-600">
                              <Check className="w-3.5 h-3.5" />
                              <span>
                                Closed on {format(new Date(item.resolvedAt), 'MMM dd, yyyy')}
                                {item.resolvedBy?.name && ` by ${item.resolvedBy.name}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 self-end md:self-start flex-shrink-0 pt-2 md:pt-0">
                      <button
                        onClick={() => handleToggleResolve(item)}
                        disabled={isOperating}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          item.resolved
                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        }`}
                      >
                        {item.resolved ? (
                          <>
                            <RotateCcw className="w-3.5 h-3.5" />
                            Reopen
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Mark Resolved
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setDeleteConfirmItem(item)}
                        disabled={isOperating}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete incident"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ── New Activity Modal ── */}
        {isNewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Flag className="w-4 h-4 text-red-600" />
                  Log Flagged Activity
                </h3>
                <button
                  onClick={() => setIsNewModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateActivity} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <select
                    value={newFormData.type}
                    onChange={(e) => setNewFormData({ ...newFormData, type: e.target.value })}
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="suspicious_account">Suspicious Account</option>
                    <option value="unusual_review">Unusual Review Activity</option>
                    <option value="multiple_reviews">Duplicate Review Content</option>
                    <option value="failed_login">Failed Login Pattern</option>
                    <option value="other">Other Security Anomaly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Risk Severity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map((sev) => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setNewFormData({ ...newFormData, severity: sev })}
                        className={`py-2 text-xs font-bold rounded-xl border capitalize cursor-pointer transition-all ${
                          newFormData.severity === sev
                            ? sev === 'high'
                              ? 'bg-red-500 text-white border-red-500'
                              : sev === 'medium'
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-emerald-500 text-white border-emerald-500'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Incident Description & Notes
                  </label>
                  <textarea
                    rows="4"
                    required
                    placeholder="Describe the suspicious behavior, offending IP, or evidence..."
                    value={newFormData.description}
                    onChange={(e) =>
                      setNewFormData({ ...newFormData, description: e.target.value })
                    }
                    className="w-full px-3.5 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsNewModalOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoadingId === 'create'}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoadingId === 'create' ? 'Saving...' : 'Log Flagged Incident'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── Delete Confirmation Modal ── */}
        {deleteConfirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Flagged Incident?</h3>
              <p className="text-xs text-gray-500 mt-2">
                This will remove the flagged log permanently from platform moderation records.
              </p>
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmItem(null)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex-1 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteActivity}
                  disabled={actionLoadingId === deleteConfirmItem._id}
                  className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition-colors flex-1 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoadingId === deleteConfirmItem._id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default AdminFlagged;
