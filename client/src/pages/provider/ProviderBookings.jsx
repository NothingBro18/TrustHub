import { useState, useEffect, useCallback } from 'react';
import {
  CalendarDays, Clock, MapPin, Phone, User,
  Search, RefreshCw, MessageSquare, CheckCircle2,
  Eye, Wrench, Check, X, Play, CheckCheck,
  Image as ImageIcon,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import ChatModal from '../../components/common/ChatModal';
import { bookingService } from '../../services';
import { PROVIDER_NAV } from '../../utils/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { isValidPaymentAmount } from '../../utils/validation';

const STATUS_TABS = [
  { id: 'all', label: 'All Requests' },
  { id: 'pending', label: 'Pending Action' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [providerProfile, setProviderProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [completeModalBooking, setCompleteModalBooking] = useState(null);
  const [finalAmount, setFinalAmount] = useState('');
  const [paymentReceived, setPaymentReceived] = useState(false);
  const [providerNotes, setProviderNotes] = useState('');
  const [paymentAmounts, setPaymentAmounts] = useState({});
  const [updatingId, setUpdatingId] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);

  const fetchBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setLoadError('');
      const res = await bookingService.getProviderBookings({
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
        setProviderProfile(res.data.provider || null);
      }
    } catch (err) {
      console.error('Failed to load provider bookings:', err);
      setLoadError(err.response?.data?.message || 'Failed to load bookings');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchBookings(false);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') fetchBookings(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  // Statistics calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === 'pending').length,
    inProgress: bookings.filter((b) => b.status === 'in_progress').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
  };

  const handleStatusChange = async (bookingId, newStatus, extraData = {}) => {
    setUpdatingId(bookingId);
    try {
      const res = await bookingService.updateStatus(bookingId, {
        status: newStatus,
        ...extraData,
      });

      if (res.data?.success) {
        toast.success(`Booking marked as ${newStatus.replace('_', ' ')}`);
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? res.data.booking || { ...b, status: newStatus } : b))
        );
        if (completeModalBooking?._id === bookingId) {
          setCompleteModalBooking(null);
        }
      }
    } catch (err) {
      console.error('Failed to update booking status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenChat = (booking) => {
    const customer = booking.customerId;
    if (!customer) {
      toast.error('Customer details not found');
      return;
    }

    setChatRecipient(customer);
    setChatBooking(booking);
    setChatOpen(true);
  };

  const handlePaymentReceived = async (booking) => {
    const enteredAmount = paymentAmounts[booking._id] ?? '';
    if (!isValidPaymentAmount(enteredAmount)) {
      toast.error('Enter a positive amount actually collected');
      return;
    }
    const amount = Number(enteredAmount);
    setUpdatingId(booking._id);
    try {
      await bookingService.markPaymentReceived(booking._id, amount);
      setBookings((current) => current.map((item) => item._id === booking._id
        ? { ...item, paymentAmount: amount, paymentStatus: 'paid' }
        : item));
      toast.success('Offline payment recorded as received');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not record payment');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout navItems={PROVIDER_NAV}>
      <div className="space-y-6">
        {providerProfile && (
          <div className={`rounded-xl border p-4 text-sm ${
            providerProfile.isVerified
              ? 'border-green-200 bg-green-50 text-green-800'
              : providerProfile.verificationStatus === 'rejected'
                ? 'border-red-200 bg-red-50 text-red-800'
                : 'border-amber-200 bg-amber-50 text-amber-800'
          }`} role="status">
            {providerProfile.isVerified
              ? 'Your provider profile is approved. New customer booking requests refresh automatically.'
              : providerProfile.verificationStatus === 'rejected'
                ? 'Your provider profile was rejected. Contact an administrator for next steps.'
                : 'Your provider profile is awaiting admin approval. Once approved, active services can receive customer booking requests.'}
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              Service Requests & Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage client appointments, update job statuses, and message customers directly
            </p>
          </div>

          <button
            onClick={() => fetchBookings(false)}
            className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Requests
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Total Requests"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Needs Acceptance"
            value={stats.pending}
          />
          <StatCard
            icon={Wrench}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            label="In Progress"
            value={stats.inProgress}
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Completed Jobs"
            value={stats.completed}
          />
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-xs space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {STATUS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                  {tab.id === 'pending' && stats.pending > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-900 rounded-full text-[10px] font-bold">
                      {stats.pending}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer, service or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-800"
            />
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : loadError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No bookings found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              {activeTab !== 'all'
                ? `You have no bookings currently in "${activeTab}" status.`
                : 'Customer service requests will appear here as soon as they are submitted.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const customer = booking.customerId || {};
              const isUpdating = updatingId === booking._id;
              const dateFormatted = booking.scheduledDate
                ? format(new Date(booking.scheduledDate), 'EEE, dd MMM yyyy')
                : 'Flexible Date';

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 transition-all shadow-xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                >
                  {/* Left: Customer & Service Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Customer Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                        {customer.avatar ? (
                          <img
                            src={customer.avatar}
                            alt={customer.name}
                            className="w-12 h-12 rounded-2xl object-cover"
                          />
                        ) : (
                          customer.name?.charAt(0).toUpperCase() || 'C'
                        )}
                      </div>
                      <span
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full ring-2 ring-white ${
                          customer.isOnline ? 'bg-emerald-500' : 'bg-gray-300'
                        }`}
                        title={customer.isOnline ? 'Online now' : 'Offline'}
                      />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {booking.serviceType}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>

                      {/* Customer Details */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
                        <span className="font-semibold text-gray-900 flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-blue-600" />
                          {customer.name || 'Valued Customer'}
                        </span>
                        {customer.phone && (
                          <a
                            href={`tel:${customer.phone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </a>
                        )}
                        {customer.location?.city && (
                          <span className="text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {customer.location.city}
                          </span>
                        )}
                      </div>

                      {/* Issue Description */}
                      {booking.issueDescription && (
                        <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-2.5 max-w-xl italic line-clamp-2">
                          "{booking.issueDescription}"
                        </p>
                      )}

                      {/* Defect photos */}
                      {booking.images && booking.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Customer Photos ({booking.images.length}):
                          </span>
                          <div className="flex items-center gap-1.5">
                            {booking.images.map((imgUrl, idx) => (
                              <button
                                key={idx}
                                onClick={() => setImagePreviewUrl(imgUrl)}
                                className="w-7 h-7 rounded-lg overflow-hidden border border-gray-200 hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0"
                              >
                                <img src={imgUrl} alt="defect" className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timing, Estimate & Lifecycle Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-shrink-0">
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 lg:justify-end">
                        <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                        <span>{dateFormatted}</span>
                        {booking.scheduledTime && (
                          <span className="text-gray-400 font-normal">({booking.scheduledTime})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-xs text-gray-500">Bill / Payment:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {booking.paymentAmount
                            ? `₹${booking.paymentAmount}`
                            : booking.estimatedPrice
                            ? `₹${booking.estimatedPrice.min || booking.estimatedPrice} - ₹${booking.estimatedPrice.max || ''}`
                            : 'To be quoted'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            booking.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {booking.paymentStatus === 'paid' ? 'Received offline (provider reported)' : 'Unpaid'}
                        </span>
                      </div>
                    </div>

                    {/* Operational Lifecycle Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Message Customer */}
                      <button
                        onClick={() => handleOpenChat(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                        title="Chat with customer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Message
                      </button>

                      {/* View Details */}
                      <button
                        onClick={() => setDetailBooking(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        Details
                      </button>

                      {/* State Transition: Pending -> Accept or Decline */}
                      {booking.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'accepted')}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatusChange(booking._id, 'cancelled')}
                            disabled={isUpdating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" />
                            Decline
                          </button>
                        </>
                      )}

                      {/* State Transition: Accepted -> In Progress */}
                      {booking.status === 'accepted' && (
                        <button
                          onClick={() => handleStatusChange(booking._id, 'in_progress')}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Start Service
                        </button>
                      )}

                      {/* State Transition: In Progress -> Complete */}
                      {booking.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setCompleteModalBooking(booking);
                            setFinalAmount(
                              booking.paymentAmount ||
                              booking.estimatedPrice?.min ||
                              booking.estimatedPrice ||
                              ''
                            );
                            setProviderNotes(booking.notes || '');
                            setPaymentReceived(false);
                          }}
                          disabled={isUpdating}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                          Complete Job
                        </button>
                      )}
                      {booking.status === 'completed' && booking.paymentStatus !== 'paid' && (
                        <div className="flex items-center gap-2">
                          <label className="sr-only" htmlFor={`payment-amount-${booking._id}`}>Amount collected in rupees</label>
                          <input
                            id={`payment-amount-${booking._id}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={paymentAmounts[booking._id] ?? ''}
                            onChange={(event) => setPaymentAmounts((current) => ({ ...current, [booking._id]: event.target.value }))}
                            placeholder="Amount collected (₹)"
                            className="w-40 rounded-lg border border-gray-200 px-2 py-1.5 text-xs"
                          />
                          <button
                            onClick={() => handlePaymentReceived(booking)}
                            disabled={isUpdating}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Record received
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Chat Modal ── */}
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          recipientUser={chatRecipient}
          booking={chatBooking}
        />

        {/* ── Job Completion Modal ── */}
        {completeModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-gray-900 text-base">Complete Service</h3>
                </div>
                <button
                  onClick={() => setCompleteModalBooking(null)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-500">
                  Record the final amount and service notes.                   TrustHub does not process payments; only confirm receipt if the customer paid you directly. Offline receipts are provider-reported and are not independently verified.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Final Amount (₹)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={finalAmount}
                      onChange={(e) => setFinalAmount(e.target.value)}
                      placeholder="e.g. 1800"
                      className="w-full pl-8 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <label className="flex items-start gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={paymentReceived}
                    onChange={(e) => setPaymentReceived(e.target.checked)}
                    className="mt-0.5"
                  />
                  I confirm that I collected this amount directly from the customer.
                </label>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Service Notes / Replaced Parts
                  </label>
                  <textarea
                    rows={3}
                    value={providerNotes}
                    onChange={(e) => setProviderNotes(e.target.value)}
                    placeholder="e.g. Replaced LED screen, calibrated display, tested power input."
                    className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  onClick={() => setCompleteModalBooking(null)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(completeModalBooking._id, 'completed', {
                      paymentAmount: finalAmount === '' ? undefined : Number(finalAmount),
                      paymentReceived,
                      notes: providerNotes,
                    })
                  }
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Confirm & Mark Completed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Booking Details Drawer/Modal ── */}
        {detailBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  Service Request Details
                </h3>
                <button
                  onClick={() => setDetailBooking(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Customer Name:</span>
                  <span className="font-semibold text-gray-900">{detailBooking.customerId?.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Contact Phone:</span>
                  <span className="font-semibold text-blue-600">{detailBooking.customerId?.phone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-semibold text-gray-900">{detailBooking.serviceType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Status:</span>
                  <StatusBadge status={detailBooking.status} />
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Scheduled Date:</span>
                  <span className="font-semibold text-gray-900">
                    {detailBooking.scheduledDate
                      ? format(new Date(detailBooking.scheduledDate), 'PPP')
                      : 'Not set'}{' '}
                    ({detailBooking.scheduledTime || 'Flexible'})
                  </span>
                </div>

                {detailBooking.issueDescription && (
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1">Issue Description:</span>
                    <p className="bg-gray-50 p-3 rounded-xl text-gray-800 italic">
                      {detailBooking.issueDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    const b = detailBooking;
                    setDetailBooking(null);
                    handleOpenChat(b);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message Customer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Image Preview Modal ── */}
        {imagePreviewUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
            onClick={() => setImagePreviewUrl(null)}
          >
            <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
              <img src={imagePreviewUrl} alt="Preview" className="w-full h-full object-contain" />
              <button
                onClick={() => setImagePreviewUrl(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookings;
