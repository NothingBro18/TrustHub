import { useEffect, useMemo, useState } from 'react';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { bookingService, reviewService } from '../../services';
import { CUSTOMER_NAV, PROVIDER_NAV } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';

const ReviewsPage = () => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [ratings, setRatings] = useState({});
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [submitting, setSubmitting] = useState(null);
  const isProvider = user?.role === 'provider';

  const load = async () => {
    setLoadError('');
    try {
      const [reviewResult, bookingResult] = await Promise.all([
        reviewService.getMyReviews(),
        isProvider ? Promise.resolve({ data: { bookings: [] } }) : bookingService.getMyBookings({ status: 'completed', limit: 100 }),
      ]);
      setReviews(reviewResult.data.reviews || []);
      setBookings(bookingResult.data.bookings || []);
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [isProvider]);

  const reviewedBookings = useMemo(() => new Set(reviews.map((review) => String(review.bookingId?._id || review.bookingId))), [reviews]);
  const eligibleBookings = bookings.filter((booking) => !reviewedBookings.has(String(booking._id)));

  const submitReview = async (bookingId) => {
    const rating = Number(ratings[bookingId] || 0);
    if (rating < 1 || rating > 5) {
      toast.error('Choose a rating from 1 to 5 stars');
      return;
    }
    setSubmitting(bookingId);
    try {
      await reviewService.createReview({ bookingId, rating, comment: comments[bookingId] || '' });
      toast.success('Review submitted');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit your review');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <DashboardLayout navItems={isProvider ? PROVIDER_NAV : CUSTOMER_NAV}>
      <div className="mx-auto max-w-4xl space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-gray-900">{isProvider ? 'Customer Reviews' : 'My Reviews'}</h1>
          <p className="mt-1 text-sm text-gray-500">{isProvider ? 'Feedback customers have left on completed work.' : 'Review completed bookings and see the feedback you have submitted.'}</p>
        </header>
        {loadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}

        {!loadError && !isProvider && eligibleBookings.length > 0 && (
          <section className="space-y-3">
            <h2 className="font-semibold text-gray-900">Bookings waiting for your review</h2>
            {eligibleBookings.map((booking) => (
              <article key={booking._id} className="space-y-3 rounded-xl border border-gray-100 bg-white p-4">
                <div>
                  <p className="font-semibold text-gray-900">{booking.serviceId?.title || booking.serviceType}</p>
                  <p className="text-sm text-gray-500">{booking.providerId?.businessName || 'Provider'}</p>
                </div>
                <div className="flex items-center gap-1" aria-label="Select rating">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setRatings({ ...ratings, [booking._id]: value })} aria-label={`${value} stars`}>
                      <Star className={`h-6 w-6 ${value <= (ratings[booking._id] || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
                <textarea maxLength={2000} value={comments[booking._id] || ''} onChange={(event) => setComments({ ...comments, [booking._id]: event.target.value })} rows={2} placeholder="Share your experience (optional)" className="w-full rounded-lg border border-gray-200 p-3 text-sm" />
                <button disabled={submitting === booking._id} onClick={() => submitReview(booking._id)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{submitting === booking._id ? 'Submitting…' : 'Submit review'}</button>
              </article>
            ))}
          </section>
        )}

        <section className="space-y-3">
          <h2 className="font-semibold text-gray-900">{isProvider ? 'Received reviews' : 'Submitted reviews'}</h2>
          {loading ? <p className="text-sm text-gray-500">Loading reviews…</p> : loadError ? null : reviews.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">{isProvider ? 'No reviews yet.' : 'You have not submitted any reviews.'}</div>
          ) : reviews.map((review) => (
            <article key={review._id} className="rounded-xl border border-gray-100 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-gray-900">{isProvider ? review.customerId?.name : review.providerId?.businessName}</p>
                <span className="flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="h-4 w-4 fill-current" />{review.rating}/5</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">{review.bookingId?.serviceType || 'Completed service'} · {new Date(review.createdAt).toLocaleDateString()}</p>
              {review.comment && <p className="mt-3 text-sm text-gray-700">{review.comment}</p>}
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default ReviewsPage;
