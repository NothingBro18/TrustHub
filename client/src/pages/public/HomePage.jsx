import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Shield, CheckCircle, Star,
  Home, Smartphone, Car, GraduationCap, Palette,
  MoreHorizontal, Lock, MapPin, ArrowRight, Award,
  Clock, ThumbsUp, ShieldCheck, Sparkles
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { providerService } from '../../services';

const CATEGORIES = [
  { name: 'Home Services', icon: Home, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
  { name: 'Tech Services', icon: Smartphone, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
  { name: 'Vehicle Services', icon: Car, color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300' },
  { name: 'Student Services', icon: GraduationCap, color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' },
  { name: 'Creative Services', icon: Palette, color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300' },
  { name: 'More Services', icon: MoreHorizontal, color: 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300' },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Discover',
    description: 'Explore service listings across home, technology, vehicle, education, and creative categories.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Review provider details',
    description: 'Compare approved provider profiles, active service listings, and customer reviews.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Book & Schedule',
    description: 'Describe your issue and request a preferred date and time for the provider to confirm.',
    icon: Clock,
  },
  {
    step: '04',
    title: 'Follow service progress',
    description: 'Track booking status and communicate directly with your provider.',
    icon: ThumbsUp,
  },
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredProviders, setFeaturedProviders] = useState([]);
  const [featuredError, setFeaturedError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    providerService.getProviders({ limit: 3, sort: 'rating' })
      .then(({ data }) => setFeaturedProviders(data.providers || []))
      .catch((error) => setFeaturedError(error.response?.data?.message || 'Could not load providers'));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'More Services') {
      navigate('/services');
    } else {
      navigate(`/services?category=${encodeURIComponent(categoryName)}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 pt-10 pb-16 lg:pt-16 lg:pb-24">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 -translate-y-12 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-300/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-8">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-700 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Digital Trust & Verification</span>
              </div>

              {/* Title & Tagline */}
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Find <span className="text-blue-600 underline decoration-blue-300 decoration-wavy decoration-2">Trusted</span> Service Providers Near You
                </h1>
                <p className="text-base sm:text-lg text-slate-600 max-w-xl font-normal leading-relaxed">
                  <span className="font-semibold text-slate-800">Local services, clearly organized.</span> Compare provider profiles, request bookings, and review service history in one place.
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-xl">
                <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white p-2 rounded-2xl shadow-lg shadow-blue-500/5 border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
                  <div className="flex-1 flex items-center px-3 gap-2.5">
                    <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search for a service (e.g. Laptop repair, Plumber...)"
                      className="w-full py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-md shadow-blue-600/20 active:scale-95"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Category Quick Pills */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Popular Categories
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-w-xl">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.name}
                        onClick={() => handleCategoryClick(cat.name)}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${cat.color} hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0`}
                      >
                        <div className="w-7 h-7 rounded-lg bg-white/80 shadow-2xs flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold truncate text-slate-800">
                          {cat.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="pt-4 border-t border-slate-200/80 max-w-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Approved</p>
                    <p className="text-xs text-slate-500 font-medium">Provider profiles</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Bookings</p>
                    <p className="text-xs text-slate-500 font-medium">Managed in one place</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">Reviews</p>
                    <p className="text-xs text-slate-500 font-medium">From completed bookings</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">Messages</p>
                    <p className="text-xs text-slate-500 font-medium">Contact providers directly</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Graphic Column */}
            <div className="lg:col-span-5 relative flex justify-center">
              
              {/* Outer decorative card frame */}
              <div className="relative w-full max-w-md">
                
                {/* Provider Card Mockup Frame */}
                <div className="relative rounded-3xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20">
                  <div className="rounded-[22px] bg-white overflow-hidden p-6 relative">
                    
                    {/* Badge top */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                          <Shield className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">TrustHub Marketplace</p>
                          <p className="text-[10px] text-slate-400">Provider profiles and bookings</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {featuredProviders[0] ? 'Approved listing' : 'Browse services'}
                      </span>
                    </div>

                    {/* Image Area with Speech Sticker */}
                    <div className="relative my-4 rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/50 p-6 flex flex-col items-center text-center">
                      
                      {/* Floating Speech Bubble Sticker */}
                      <div className="absolute -top-3 right-3 bg-amber-400 text-slate-900 text-[11px] font-extrabold px-3 py-1.5 rounded-xl shadow-md rotate-3 border-2 border-white">
                        “Skilled People, Stronger Communities”
                      </div>

                      {/* Provider Avatar Illustration */}
                      <div className="relative w-32 h-32 rounded-full bg-blue-600 border-4 border-white shadow-xl flex items-center justify-center text-5xl mb-3 overflow-hidden">
                        <span role="img" aria-label="technician">👨‍🔧</span>
                        <div className="absolute bottom-0 inset-x-0 bg-blue-900/80 text-[10px] text-white py-0.5 font-bold uppercase tracking-wider">
                          TrustHub
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900">{featuredProviders[0]?.businessName || 'Find a provider'}</h3>
                      <p className="text-xs text-blue-600 font-semibold">{featuredProviders[0]?.category || 'Search local services'}</p>
                      
                      {/* Rating pill */}
                      <div className="flex items-center gap-1.5 mt-2 bg-white px-3 py-1 rounded-full shadow-xs border border-slate-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-800">{Number(featuredProviders[0]?.averageRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-slate-400">({featuredProviders[0]?.totalReviews || 0} reviews)</span>
                      </div>
                    </div>

                    {/* Trust Checklist 4 Points */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Approved provider profiles</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>Service listings</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>Booking management</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Direct provider messaging</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FEATURED VERIFIED PROVIDERS ── */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                Featured Partners
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Top Rated Local Providers
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Provider profiles currently approved on TrustHub.
              </p>
            </div>
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 group"
            >
              Browse All Providers
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredProviders.map((provider) => (
              <div
                key={provider._id}
                className="group relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        {provider.businessName?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {provider.businessName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {[provider.location?.city, provider.location?.state].filter(Boolean).join(', ') || 'Location not provided'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Approved
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {provider.description || provider.category}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(provider.tags || []).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Starting from</span>
                    <p className="text-base font-bold text-slate-900">
                      {provider.priceFrom != null ? `₹${provider.priceFrom}` : 'Price on request'}
                    </p>
                  </div>
                  <Link
                    to={`/providers/${provider._id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {featuredError && <p role="alert" className="mt-4 text-sm text-red-600">{featuredError}</p>}
          {!featuredError && featuredProviders.length === 0 && <p className="mt-4 text-center text-sm text-slate-500">No approved providers are available yet.</p>}

        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Four booking steps
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How Booking Works
            </h2>
            <p className="text-base text-slate-600">
              Follow each request from provider discovery through service completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-3xl font-black text-slate-200">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── PROVIDER TRUST INFORMATION ── */}
      <section id="provider-information" className="py-16 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Provider information
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Make informed service decisions
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Review the information available on each provider profile. Administrators approve provider listings, reviews are linked to completed bookings, and booking status is visible to the people involved. Approval does not certify identity or service quality.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Provider verification</p>
                  <p className="text-xs text-slate-400 mt-1">Administrators approve provider listings before they appear in search.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Service details</p>
                  <p className="text-xs text-slate-400 mt-1">Compare active services and their provider-listed price ranges.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Booking-linked reviews</p>
                  <p className="text-xs text-slate-400 mt-1">Customers can review a provider after a completed booking.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Booking status</p>
                  <p className="text-xs text-slate-400 mt-1">Customers and providers can follow each request through its status.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-emerald-300" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Clear platform records</h3>
                  <p className="text-xs text-slate-300 mt-1">Review provider information and agree on service and payment details directly.</p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="block w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/30"
                  >
                    Create Your Provider Profile
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CALL TO ACTION BANNER ── */}
      <section className="py-16 bg-blue-50 border-t border-blue-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            Are You a Local Service Professional?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base">
            Create a provider profile, submit service listings for approval, and manage incoming booking requests.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/signup"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-blue-500/20 transition-all hover:scale-105 active:scale-100"
            >
              List Your Services on TrustHub
            </Link>
            <Link
              to="/services"
              className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-sm border border-slate-200 transition-colors"
            >
              Explore Available Services
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
