import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle, Star, MapPin, Phone, Mail, Clock,
  MessageSquare, ArrowRight, Share2, Heart,
  HelpCircle
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ChatModal from '../../components/common/ChatModal';
import { providerService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const EMPTY_PROVIDER_DATA = { services: [], reviews: [], gallery: [], faqs: [] };

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [provider, setProvider] = useState(EMPTY_PROVIDER_DATA);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'services', 'reviews', 'gallery', 'faq'
  const [isSaved, setIsSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  // Fetch provider data
  useEffect(() => {
    const fetchProvider = async () => {
      if (!id) {
        setLoadError('Provider not found.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setLoadError('');
      try {
        const res = await providerService.getProvider(id);
        if (res.data?.provider) {
          setProvider({
            ...EMPTY_PROVIDER_DATA,
            ...res.data.provider,
            services: res.data.services || [],
            reviews: (res.data.reviews || []).map((review) => ({
              ...review,
              author: review.customerId?.name || 'Customer',
              avatar: review.customerId?.avatar,
              service: review.bookingId?.serviceId?.title || 'Completed service',
              date: new Date(review.createdAt).toLocaleDateString(),
            })),
          });
        } else {
          setLoadError('Provider not found.');
        }
      } catch (error) {
        setLoadError(error.response?.data?.message || 'Could not load this provider.');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    userService.getMe()
      .then(({ data }) => setIsSaved(
        (data.user?.savedProviders || []).some((savedProvider) => String(savedProvider._id) === String(id))
      ))
      .catch((error) => toast.error(error.response?.data?.message || 'Could not load saved providers'));
  }, [id, isAuthenticated]);

  // Handle Save Provider
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save providers');
      navigate('/login');
      return;
    }
    try {
      await userService.toggleSavedProvider(provider._id);
      toast.success(isSaved ? 'Removed from saved providers' : 'Saved to your providers ❤️');
      setIsSaved(!isSaved);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not update saved providers');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: provider.businessName,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50"><Navbar /><p className="p-12 text-center text-sm text-slate-500">Loading provider profile…</p></div>;
  }

  if (loadError) {
    return <div className="min-h-screen bg-slate-50"><Navbar /><main className="mx-auto max-w-xl px-4 py-16 text-center"><h1 className="text-xl font-bold text-slate-900">Provider unavailable</h1><p className="mt-2 text-sm text-slate-600">{loadError}</p><Link to="/services" className="mt-5 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">Browse services</Link></main><Footer /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* ── COVER BANNER ── */}
      <div className="relative h-48 sm:h-64 lg:h-72 w-full bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-950 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80"
          alt="Workshop Banner"
          className="w-full h-full object-cover opacity-25 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
      </div>

      {/* ── PROFILE HEADER CARD ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-24 sm:-mt-28 relative z-10 mb-8">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
            
            {/* Left: Avatar + Details */}
            <div className="flex flex-col sm:flex-row items-start gap-6 flex-1">
              {/* Circular Avatar */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-extrabold text-2xl sm:text-3xl flex items-center justify-center shadow-lg border-4 border-white flex-shrink-0">
                  {provider.businessName?.split(' ')[0] || 'ABC'}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-xs">
                  <CheckCircle className="w-4 h-4" />
                </div>
              </div>

              {/* Title, Badges & Location */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {provider.businessName}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approved Provider
                  </span>
                </div>

                <p className="text-sm font-semibold text-blue-600">{provider.category}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {[provider.location?.city, provider.location?.state].filter(Boolean).join(', ') || 'Location not provided'}
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Clock className="w-4 h-4" />
                    {provider.businessHours || 'Business hours not provided'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    to={`/book/${provider._id}`}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-2"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.error('Please login to message this provider');
                        navigate('/login');
                        return;
                      }
                      setChatOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Message</span>
                  </button>

                  <button
                    onClick={handleToggleSave}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                    title="Save Provider"
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500' : ''}`} />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    title="Share Profile"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>

            {/* Right: Provider profile information */}
            <div className="w-full lg:w-80 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Provider information
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Approved
                </span>
              </div>

              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Provider account reviewed by TrustHub</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{provider.totalServicesCompleted || 0} completed bookings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span>{Number(provider.averageRating || 0).toFixed(1)} average rating from {provider.totalReviews || 0} reviews</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mb-8">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'services', label: `Services (${provider.services?.length || 0})` },
            { id: 'reviews', label: `Reviews (${provider.totalReviews || 0})` },
            { id: 'gallery', label: 'Gallery' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TAB CONTENT & SIDEBAR ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-16 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-150">
                
                {/* About Section */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-5">
                  <h2 className="text-lg font-bold text-slate-900">About</h2>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {provider.description || 'This provider has not added a description.'}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xl font-extrabold text-slate-900">{provider.experience}</p>
                      <p className="text-xs text-slate-500 font-medium">Experience</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <p className="text-xl font-extrabold text-slate-900">{provider.happyCustomers}+</p>
                      <p className="text-xs text-slate-500 font-medium">Happy Customers</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-xl font-extrabold text-slate-900">{provider.averageRating}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">Average Rating</p>
                    </div>
                  </div>
                </div>

                {/* Popular Services Quick Preview */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Services Offered</h2>
                    <button
                      onClick={() => setActiveTab('services')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {provider.services?.slice(0, 3).map((svc) => (
                      <div
                        key={svc._id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-200 transition-all gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <h3 className="font-bold text-sm text-slate-900">{svc.title}</h3>
                          <p className="text-xs text-slate-500">{svc.description}</p>
                          <span className="inline-block text-[11px] font-medium text-slate-400">
                            {svc.category}
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
                            <p className="text-base font-bold text-slate-900">₹{svc.priceRange?.min}–₹{svc.priceRange?.max}</p>
                          </div>
                          <Link
                            to={`/book/${provider._id}?serviceId=${svc._id}`}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                          >
                            Book
                          </Link>
                        </div>
                      </div>
                    ))}
                    {provider.services?.length === 0 && <p className="text-sm text-slate-500">No active services are listed.</p>}
                  </div>
                </div>

                {/* Recent Reviews Preview */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Booking-linked Reviews</h2>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Read All Reviews ({provider.totalReviews})
                    </button>
                  </div>

                  <div className="space-y-3">
                    {provider.reviews?.slice(0, 2).map((rev) => (
                      <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-sm flex items-center justify-center overflow-hidden">
                              {rev.avatar ? <img src={rev.avatar} alt="" className="h-full w-full object-cover" /> : rev.author?.charAt(0)}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-900">{rev.author}</p>
                              <p className="text-[10px] text-slate-400">{rev.service} · {rev.date}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{rev.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* SERVICES TAB */}
            {activeTab === 'services' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-in fade-in duration-150">
                <h2 className="text-lg font-bold text-slate-900 mb-2">All Services</h2>
                <div className="space-y-4">
                  {provider.services?.map((svc) => (
                    <div
                      key={svc._id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-base text-slate-900">{svc.title}</h3>
                        <p className="text-xs text-slate-600">{svc.description}</p>
                        <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
                          <span>{svc.category}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Price</span>
                          <p className="text-xl font-bold text-slate-900">₹{svc.priceRange?.min}–₹{svc.priceRange?.max}</p>
                        </div>
                        <Link
                          to={`/book/${provider._id}?serviceId=${svc._id}`}
                          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                  {provider.services?.length === 0 && <p className="text-sm text-slate-500">No active services are listed.</p>}
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Customer Feedback</h2>
                    <p className="text-xs text-slate-500">Only customers with a completed booking can review.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-2xl font-black text-slate-900">
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                      <span>{Number(provider.averageRating || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-slate-400">({provider.totalReviews} ratings)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {provider.reviews?.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-base flex items-center justify-center overflow-hidden">
                            {rev.avatar ? <img src={rev.avatar} alt="" className="h-full w-full object-cover" /> : rev.author?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{rev.author}</p>
                            <p className="text-xs text-slate-400">{rev.service} · {rev.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{rev.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed pt-1">{rev.comment}</p>
                    </div>
                  ))}
                  {provider.reviews?.length === 0 && <p className="text-sm text-slate-500">No reviews yet.</p>}
                </div>
              </div>
            )}

            {/* GALLERY TAB */}
            {activeTab === 'gallery' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-in fade-in duration-150">
                <h2 className="text-lg font-bold text-slate-900">Workshop & Repair Gallery</h2>
                <div className="grid grid-cols-2 gap-4">
                  {provider.gallery?.map((img, index) => (
                    <div key={index} className="rounded-xl overflow-hidden h-48 bg-slate-100 border border-slate-200">
                      <img src={img} alt={`Gallery ${index}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  ))}
                  {provider.gallery?.length === 0 && <p className="col-span-2 text-sm text-slate-500">No gallery images have been added.</p>}
                </div>
              </div>
            )}

            {/* FAQ TAB */}
            {activeTab === 'faq' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 animate-in fade-in duration-150">
                <h2 className="text-lg font-bold text-slate-900">Frequently Asked Questions</h2>
                <div className="space-y-3">
                  {provider.faqs?.map((faq, index) => (
                    <div key={index} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5">
                      <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span>{faq.q}</span>
                      </h3>
                      <p className="text-xs text-slate-600 pl-6 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar: Quick Info & Guarantees (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-24">
            
            {/* Quick Info Box matching Mockup 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
                Quick Info
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start gap-3 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Location</p>
                    <p className="text-slate-500 mt-0.5">{provider.location?.address}, {provider.location?.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Phone</p>
                    {provider.phone ? <a href={`tel:${provider.phone}`} className="text-blue-600 hover:underline mt-0.5 block">{provider.phone}</a> : <p className="mt-0.5 text-slate-500">Not provided</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    {provider.email ? <a href={`mailto:${provider.email}`} className="text-blue-600 hover:underline mt-0.5 block">{provider.email}</a> : <p className="mt-0.5 text-slate-500">Not provided</p>}
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Business Hours</p>
                    <p className="text-slate-500 mt-0.5">{provider.businessHours || 'Not provided'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TrustHub service information */}
            <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>TrustHub Information</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Provider profile is managed by its account owner</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Booking and message history stays in your account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>This provider has been approved by TrustHub</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Payment is arranged directly with the provider</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <ChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        recipientUser={
          provider.userId?._id
            ? provider.userId
            : {
                _id: typeof provider.userId === 'string' ? provider.userId : provider._id,
                name: provider.businessName,
                phone: provider.phone,
              }
        }
        providerInfo={provider}
      />

      <Footer />
    </div>
  );
};

export default ProviderProfilePage;
