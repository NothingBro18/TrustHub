import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays, Clock, MapPin, Shield,
  Search, RefreshCw, MessageSquare, AlertCircle,
  CheckCircle2, XCircle, Eye, Wrench,
  ArrowRight, Ban, Image as ImageIcon, X,
} from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/ui/StatusBadge';
import StatCard from '../../components/ui/StatCard';
import ChatModal from '../../components/common/ChatModal';
import { bookingService } from '../../services';
import { CUSTOMER_NAV } from '../../utils/constants';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_TABS = [
  { id: 'all', label: 'All Bookings' },
  { id: 'pending', label: 'Pending' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelModalBooking, setCancelModalBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);

  // Chat modal state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState(null);
  const [chatProvider, setChatProvider] = useState(null);
  const [chatBooking, setChatBooking] = useState(null);

  const fetchBookings = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setLoadError('');
      const res = await bookingService.getMyBookings({
        status: activeTab !== 'all' ? activeTab : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setLoadError(err.response?.data?.message || 'Failed to load your bookings');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchBookings(false);
  }, [fetchBookings]);

  // Statistics calculation
  const stats = {
    total: bookings.length,
    active: bookings.filter((b) => ['pending', 'accepted', 'in_progress'].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  const handleOpenChat = (booking) => {
    const providerUser = booking.providerId?.userId;
    if (!providerUser) {
      toast.error('Provider contact details not available yet');
      return;
    }

    setChatRecipient(providerUser);
    setChatProvider(booking.providerId);
    setChatBooking(booking);
    setChatOpen(true);
  };

  const handleCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      const res = await bookingService.updateStatus(cancelModalBooking._id, 'cancelled');
      if (res.data?.success) {
        toast.success('Booking cancelled successfully');
        setBookings((prev) =>
          prev.map((b) => (b._id === cancelModalBooking._id ? { ...b, status: 'cancelled' } : b))
        );
        setCancelModalBooking(null);
        if (selectedBooking?._id === cancelModalBooking._id) {
          setSelectedBooking((prev) => ({ ...prev, status: 'cancelled' }));
        }
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      toast.error(err.response?.data?.message || 'Could not cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <DashboardLayout navItems={CUSTOMER_NAV}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-blue-600" />
              My Bookings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Track, manage, and communicate with your service providers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchBookings(false)}
              className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              to="/services"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              Book New Service
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Total Bookings"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            label="Active / Scheduled"
            value={stats.active}
          />
          <StatCard
            icon={CheckCircle2}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            label="Completed Jobs"
            value={stats.completed}
          />
          <StatCard
            icon={XCircle}
            iconBg="bg-red-50"
            iconColor="text-red-600"
            label="Cancelled"
            value={stats.cancelled}
          />
        </div>

        {/* Filters & Search Bar */}
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
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72 flex-shrink-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by service or provider..."
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
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-5">
              {activeTab !== 'all'
                ? `You don't have any bookings with status "${activeTab}".`
                : "You haven't booked a service yet. Browse the available service listings."}
            </p>
            <Link
              to="/services"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Explore Services <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const provider = booking.providerId || {};
              const dateFormatted = booking.scheduledDate
                ? format(new Date(booking.scheduledDate), 'EEE, dd MMM yyyy')
                : 'Date not set';
              const canCancel = ['pending', 'accepted'].includes(booking.status);

              return (
                <div
                  key={booking._id}
                  className="bg-white rounded-2xl border border-gray-200/90 hover:border-blue-300 transition-all shadow-xs p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
                >
                  {/* Left: Service & Provider Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      🔧
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-gray-900 truncate">
                          {booking.serviceType}
                        </h3>
                        <StatusBadge status={booking.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                        <Link
                          to={provider._id ? `/providers/${provider._id}` : '#'}
                          className="font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Shield className="w-3.5 h-3.5 text-blue-600" />
                          {provider.businessName || 'Service Provider'}
                        </Link>
                        {provider.location?.city && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {provider.location.city}
                          </span>
                        )}
                      </div>

                      {/* Issue snippet */}
                      {booking.issueDescription && (
                        <p className="text-xs text-gray-600 bg-gray-50 rounded-xl p-2.5 max-w-xl italic line-clamp-2">
                          "{booking.issueDescription}"
                        </p>
                      )}

                      {/* Defect images preview icons */}
                      {booking.images && booking.images.length > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-[11px] text-gray-400 flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" /> Photos ({booking.images.length}):
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

                  {/* Right: Schedule, Price & Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-100 flex-shrink-0">
                    <div className="text-left sm:text-right space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-900 lg:justify-end">
                        <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                        <span>{dateFormatted}</span>
                        {booking.scheduledTime && (
                          <span className="text-gray-400 font-normal">at {booking.scheduledTime}</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 lg:justify-end">
                        <span className="text-xs text-gray-500">Est. Price:</span>
                        <span className="text-sm font-bold text-gray-900">
                          {booking.paymentAmount
                            ? `₹${booking.paymentAmount}`
                            : booking.estimatedPrice
                            ? `₹${booking.estimatedPrice.min || booking.estimatedPrice} - ₹${booking.estimatedPrice.max || ''}`
                            : 'On Inspection'}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                            booking.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {booking.paymentStatus === 'paid' ? 'Received offline (provider reported)' : 'Not recorded as received'}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Message Provider */}
                      <button
                        onClick={() => handleOpenChat(booking)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
                        title="Chat with provider"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Message
                      </button>

                      {/* View Details Modal */}
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setDetailModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold transition-colors shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-gray-500" />
                        Details
                      </button>

                      {/* Cancel Booking (if pending/accepted) */}
                      {canCancel && (
                        <button
                          onClick={() => setCancelModalBooking(booking)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          Cancel
                        </button>
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
          providerInfo={chatProvider}
          booking={chatBooking}
        />

        {/* ── Booking Details Modal ── */}
        {detailModalOpen && selectedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-base">Booking Summary</h3>
                </div>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-semibold text-gray-900">{selectedBooking.serviceType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Provider:</span>
                  <span className="font-semibold text-blue-600">
                    {selectedBooking.providerId?.businessName}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Status:</span>
                  <StatusBadge status={selectedBooking.status} />
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Scheduled Date:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.scheduledDate
                      ? format(new Date(selectedBooking.scheduledDate), 'PPP')
                      : 'Not set'}{' '}
                    ({selectedBooking.scheduledTime || 'Flexible'})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-400">Payment Status:</span>
                  <span className="font-semibold text-gray-900">
                    {selectedBooking.paymentStatus === 'paid' ? 'Received offline (provider reported)' : 'Not recorded as received'}
                  </span>
                </div>

                {selectedBooking.issueDescription && (
                  <div className="pt-2">
                    <span className="text-gray-400 block mb-1">Issue Description:</span>
                    <p className="bg-gray-50 p-3 rounded-xl text-gray-800 italic">
                      {selectedBooking.issueDescription}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => {
                    setDetailModalOpen(false);
                    handleOpenChat(selectedBooking);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message Provider
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Cancel Confirmation Modal ── */}
        {cancelModalBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-gray-900 text-base">Cancel Booking?</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Are you sure you want to cancel your booking for{' '}
                  <span className="font-semibold text-gray-700">{cancelModalBooking.serviceType}</span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setCancelModalBooking(null)}
                  className="flex-1 py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50"
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
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

export default MyBookings;
