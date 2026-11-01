import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Shield, CheckCircle, Star, MapPin, Phone, Mail, Clock,
  Calendar, MessageSquare, ArrowRight, Award, ThumbsUp,
  Wrench, CheckCircle2, ChevronRight, Share2, Heart,
  Sparkles, AlertCircle, HelpCircle, Image as ImageIcon
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { providerService, userService } from '../../services';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// Default mock provider data matching Mockup 3
const DEFAULT_PROVIDER_DATA = {
  _id: '66d01234abc0000000000001',
  businessName: 'ABC Computers',
  tagline: 'Laptop & Computer Repair Specialist',
  category: 'Tech Services',
  description:
    'Professional laptop and computer repair services with 5+ years of experience. We provide quality service with genuine parts, chip-level micro-soldering, rapid screen replacements, and complete data security.',
  location: {
    address: 'Shop 14, City Center Complex, College Road',
    city: 'Belagavi',
    state: 'Karnataka',
    distanceKm: 2,
  },
  phone: '+91 98765 43210',
  email: 'abccomputers@gmail.com',
  businessHours: 'Mon - Sat: 9:00 AM - 8:00 PM',
  statusText: 'Open now · Closes at 8:00 PM',
  experience: '5+ Years',
  happyCustomers: 500,
  averageRating: 4.7,
  totalReviews: 128,
  trustScore: 92,
  isVerified: true,
  verificationDetails: {
    identityVerified: true,
    contactVerified: true,
    servicesCompleted: 127,
    positiveReviewHistory: true,
  },
  services: [
    {
      _id: 's1',
      title: 'Laptop Screen Replacement',
      price: 1800,
      duration: '2 - 3 Hours',
      description: 'Original IPS & LED screens replacement with 6 months replacement warranty.',
    },
    {
      _id: 's2',
      title: 'Motherboard Chip-level Diagnostics & Repair',
      price: 1200,
      duration: '24 - 48 Hours',
      description: 'Specialized micro-soldering, power IC replacement, and liquid damage recovery.',
    },
    {
      _id: 's3',
      title: 'OS Installation & Optimization',
      price: 400,
      duration: '1 Hour',
      description: 'Genuine Windows/Linux installation, antivirus setup, thermal cleanup, and speed tuning.',
    },
    {
      _id: 's4',
      title: 'SSD & RAM Performance Upgrade',
      price: 600,
      duration: '45 Mins',
      description: 'High-speed NVMe/SATA SSD installation with full data cloning from old hard drive.',
    },
  ],
  gallery: [
    'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
  ],
  reviews: [
    {
      _id: 'r1',
      author: 'Rohit Kulkarni',
      avatar: '👨‍💼',
      rating: 5,
      date: '2 days ago',
      service: 'Laptop Screen Replacement',
      comment:
        'Replaced my Dell Inspiron broken display within 2 hours! Very transparent pricing and genuine parts used. Highly recommended in Belagavi.',
    },
    {
      _id: 'r2',
      author: 'Priya Desai',
      avatar: '👩‍🏫',
      rating: 5,
      date: '1 week ago',
      service: 'SSD & RAM Upgrade',
      comment:
        'My old HP laptop feels like brand new after the SSD upgrade. Very courteous staff and clear explanation of all charges.',
    },
    {
      _id: 'r3',
      author: 'Vikas Patil',
      avatar: '👨‍💻',
      rating: 4.5,
      date: '2 weeks ago',
      service: 'Motherboard Repair',
      comment:
        'Fixed the water damage issue that two other shops refused to touch. Trust score definitely reflects their honesty!',
    },
  ],
  faqs: [
    {
      q: 'Do you provide a warranty on repairs and replacements?',
      a: 'Yes, all screen replacements and internal hardware parts carry a 3 to 6-month warranty. Service repairs carry a 30-day warranty.',
    },
    {
      q: 'Can I get my device picked up from home?',
      a: 'Yes, we offer doorstep pickup and drop within a 10 km radius in Belagavi for a nominal fee of ₹50.',
    },
    {
      q: 'Is my personal data safe during the repair?',
      a: 'Absolutely. We strictly adhere to TrustHub privacy protocols. Storage is detached or encrypted prior to hardware repair.',
    },
  ],
};

const ProviderProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [provider, setProvider] = useState(DEFAULT_PROVIDER_DATA);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'services', 'reviews', 'gallery', 'faq'
  const [isSaved, setIsSaved] = useState(false);

  // Fetch provider data
  useEffect(() => {
    const fetchProvider = async () => {
      if (!id || id === 'p1' || id === '66d01234abc0000000000001') {
        setProvider(DEFAULT_PROVIDER_DATA);
        return;
      }
      setLoading(true);
      try {
        const res = await providerService.getProvider(id);
        if (res.data?.provider) {
          setProvider({
            ...DEFAULT_PROVIDER_DATA,
            ...res.data.provider,
            reviews: res.data.reviews || DEFAULT_PROVIDER_DATA.reviews,
          });
        }
      } catch {
        setProvider(DEFAULT_PROVIDER_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id]);

  // Handle Save Provider
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save providers');
      navigate('/login');
      return;
    }
    try {
      await userService.toggleSavedProvider(provider._id);
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Removed from saved providers' : 'Saved to your providers ❤️');
    } catch {
      setIsSaved(!isSaved);
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
                    Verified Provider
                  </span>
                </div>

                <p className="text-sm font-semibold text-blue-600">
                  {provider.tagline || 'Laptop & Computer Repair Specialist'}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {provider.location?.city || 'Belagavi'} · {provider.location?.distanceKm || 2} km away
                  </span>
                  <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                    <Clock className="w-4 h-4" />
                    {provider.statusText || 'Open now · Closes at 8:00 PM'}
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

                  <a
                    href={`tel:${provider.phone}`}
                    className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-500" />
                    <span>Message</span>
                  </a>

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

            {/* Right: Digital Trust Score Card */}
            <div className="w-full lg:w-80 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl border border-blue-100 p-5 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trust Score
                </span>
                <span className="text-xs font-bold text-blue-600 bg-blue-100/70 px-2 py-0.5 rounded-full">
                  Tier 1 Certified
                </span>
              </div>

              {/* Big Score Gauge */}
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {provider.trustScore}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${provider.trustScore}%` }}
                />
              </div>

              {/* Checklist */}
              <div className="space-y-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Identity Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Contact Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>{provider.verificationDetails?.servicesCompleted || 127}+ Services Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Positive Review History</span>
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
            { id: 'services', label: `Services (${provider.services?.length || 4})` },
            { id: 'reviews', label: `Reviews (${provider.totalReviews || 128})` },
            { id: 'gallery', label: 'Gallery' },
            { id: 'faq', label: 'Q&A' },
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
                    {provider.description}
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
                            ⏱ {svc.duration}
                          </span>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">Price</span>
                            <p className="text-base font-bold text-slate-900">₹{svc.price}</p>
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
                  </div>
                </div>

                {/* Recent Reviews Preview */}
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">Verified Reviews</h2>
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
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-sm flex items-center justify-center">
                              {rev.avatar}
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
                          <span>⏱ Estimated Time: {svc.duration}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">✓ Genuine Parts</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold">Standard Price</span>
                          <p className="text-xl font-bold text-slate-900">₹{svc.price}</p>
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
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === 'reviews' && (
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-6 animate-in fade-in duration-150">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Customer Feedback</h2>
                    <p className="text-xs text-slate-500">Only verified customers who finished a booking can review.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-2xl font-black text-slate-900">
                      <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
                      <span>{provider.averageRating}</span>
                    </div>
                    <span className="text-xs text-slate-400">({provider.totalReviews} ratings)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {provider.reviews?.map((rev) => (
                    <div key={rev._id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-base flex items-center justify-center">
                            {rev.avatar}
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
                    <a href={`tel:${provider.phone}`} className="text-blue-600 hover:underline mt-0.5 block">
                      {provider.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Email</p>
                    <a href={`mailto:${provider.email}`} className="text-blue-600 hover:underline mt-0.5 block">
                      {provider.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900">Business Hours</p>
                    <p className="text-slate-500 mt-0.5">{provider.businessHours}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* TrustHub Safety Guarantees */}
            <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>TrustHub Guarantees</span>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>100% Genuine Spare Parts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>30-Day Service Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Verified Identity & Background</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Protected Escrow Payments</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProviderProfilePage;
