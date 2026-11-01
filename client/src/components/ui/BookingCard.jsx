import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

const BookingCard = ({ booking }) => {
  const { _id, serviceType, providerId, status, scheduledDate, createdAt } = booking;
  const providerName = providerId?.businessName || providerId?.name || 'Unknown Provider';
  const dateStr = scheduledDate
    ? format(new Date(scheduledDate), 'dd MMM yyyy')
    : format(new Date(createdAt), 'dd MMM yyyy');

  return (
    <div className="flex items-center justify-between py-3.5 border-b border-gray-50 last:border-0 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Service icon placeholder */}
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <span className="text-base">🔧</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{serviceType}</p>
          <p className="text-xs text-gray-400 truncate">{providerName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <StatusBadge status={status} />
        <span className="text-xs text-gray-400 hidden sm:block">{dateStr}</span>
        <Link
          to={`/my-bookings`}
          className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View
        </Link>
      </div>
    </div>
  );
};

export default BookingCard;
