import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Shield, CheckCircle, Star, Users, Wrench,
  Home, Smartphone, Car, GraduationCap, Palette,
  MoreHorizontal, Lock, MapPin, ArrowRight, Award,
  Clock, ThumbsUp, ShieldCheck, Sparkles, ChevronRight
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const CATEGORIES = [
  { name: 'Home Services', icon: Home, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
  { name: 'Tech Services', icon: Smartphone, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
  { name: 'Vehicle Services', icon: Car, color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300' },
  { name: 'Student Services', icon: GraduationCap, color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' },
  { name: 'Creative Services', icon: Palette, color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300' },
  { name: 'More Services', icon: MoreHorizontal, color: 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300' },
];

const FEATURED_PROVIDERS = [
  {
    id: 'p1',
    name: 'ABC Computers',
    specialty: 'Laptop & Computer Repair Specialist',
    location: 'Belagavi · 2 km away',
    rating: 4.7,
    reviews: 128,
    trustScore: 92,
    startingPrice: 300,
    tags: ['Laptop Repair', 'Software', 'Hardware'],
    avatar: '💻',
  },
  {
    id: 'p2',
    name: 'TechFix Solutions',
    specialty: 'Smartphone & Screen Recovery Expert',
    location: 'Belagavi · 3 km away',
    rating: 4.8,
    reviews: 86,
    trustScore: 88,
    startingPrice: 400,
    tags: ['Mobile Repair', 'Data Recovery', 'OS Installation'],
    avatar: '📱',
  },
  {
    id: 'p3',
    name: 'CoolHome Services',
    specialty: 'AC Installation, Repair & Deep Clean',
    location: 'Belagavi · 1.5 km away',
    rating: 4.9,
    reviews: 210,
    trustScore: 95,
    startingPrice: 500,
    tags: ['AC Repair', 'Gas Refill', 'Maintenance'],
    avatar: '❄️',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Search & Discover',
    description: 'Find top-rated technicians, mechanics, and professionals right in your neighborhood.',
    icon: Search,
  },
  {
    step: '02',
    title: 'Check Trust Score',
    description: 'Review verified credentials, real customer ratings, and transparent trust metrics.',
    icon: ShieldCheck,
  },
  {
    step: '03',
    title: 'Book & Schedule',
    description: 'Describe your issue, pick your preferred date and time, and receive prompt confirmation.',
    icon: Clock,
  },
  {
    step: '04',
    title: 'Enjoy Safe Service',
    description: 'Experience secure completion with fair pricing and verified satisfaction ratings.',
    icon: ThumbsUp,
  },
];

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

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
                  <span className="font-semibold text-slate-800">Safe. Verified. Reliable.</span> Your all-in-one platform for local services with guaranteed digital trust records.
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
                    <p className="text-2xl font-black text-slate-900">1,200+</p>
                    <p className="text-xs text-slate-500 font-medium">Verified Providers</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">5,000+</p>
                    <p className="text-xs text-slate-500 font-medium">Services Done</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-slate-900">4.7/5</p>
                    <p className="text-xs text-slate-500 font-medium">Average Rating</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-blue-600">100%</p>
                    <p className="text-xs text-slate-500 font-medium">Safer Community</p>
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
                          <p className="text-xs font-bold text-slate-900">TrustHub Verified</p>
                          <p className="text-[10px] text-slate-400">Official Standards</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        Top Rated
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

                      <h3 className="text-lg font-bold text-slate-900">Arun Sharma</h3>
                      <p className="text-xs text-blue-600 font-semibold">Master Certified Technician</p>
                      
                      {/* Rating pill */}
                      <div className="flex items-center gap-1.5 mt-2 bg-white px-3 py-1 rounded-full shadow-xs border border-slate-200">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-800">4.9</span>
                        <span className="text-xs text-slate-400">(184 jobs completed)</span>
                      </div>
                    </div>

                    {/* Trust Checklist 4 Points */}
                    <div className="grid grid-cols-2 gap-2.5 pt-2">
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Identity Verified</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <Award className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>Background Checked</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                        <span>Local & On-Time</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-medium text-slate-700">
                        <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                        <span>Escrow Protected</span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Floating Trust Score Badge */}
                <div className="absolute -bottom-6 -left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3 animate-bounce [animation-duration:3s]">
                  <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    94
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Trust Score</p>
                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" /> Highly Trusted
                    </p>
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
                Hand-picked verified specialists ready to serve in your area.
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
            {FEATURED_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="group relative bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl group-hover:scale-105 transition-transform">
                        {provider.avatar}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {provider.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {provider.location}
                        </p>
                      </div>
                    </div>

                    {/* Trust Score Pill */}
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                        Trust {provider.trustScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {provider.specialty}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {provider.tags.map((tag) => (
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
                      ₹{provider.startingPrice}
                    </p>
                  </div>
                  <Link
                    to={`/providers/${provider.id}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS SECTION ── */}
      <section id="how-it-works" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
              Simple & Reliable
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How TrustHub Protects Your Service Experience
            </h2>
            <p className="text-base text-slate-600">
              Four easy steps from booking to completion with verifiable trust at every stage.
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

      {/* ── DIGITAL TRUST SCORE EXPLANATION ── */}
      <section id="trust-score" className="py-16 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
                <Shield className="w-3.5 h-3.5" />
                Digital Trust Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                What is the TrustHub Digital Trust Score?
              </h2>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Unlike traditional marketplaces where ratings can be forged or manipulated, TrustHub assigns every service provider an algorithmic Trust Score between 0 and 100 based on verified real-world factors:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Identity & Credentials (30%)</p>
                  <p className="text-xs text-slate-400 mt-1">Government ID verification, trade licenses, and physical address checks.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Service Completion Rate (25%)</p>
                  <p className="text-xs text-slate-400 mt-1">Consistency of finishing accepted bookings without arbitrary cancellations.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Verified Reviews Only (25%)</p>
                  <p className="text-xs text-slate-400 mt-1">Reviews can strictly only be submitted after an authenticated booking completion.</p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="font-semibold text-white text-sm">Dispute & Flag History (20%)</p>
                  <p className="text-xs text-slate-400 mt-1">Automated deduction if suspicious activity or unresolved disputes occur.</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center space-y-4">
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-blue-500 to-emerald-400 p-1 flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-slate-900 flex flex-col items-center justify-center">
                    <span className="text-3xl font-extrabold text-white">96</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Score</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Exemplary Trust Tier</h3>
                  <p className="text-xs text-slate-300 mt-1">Qualifies for guaranteed bookings and zero-security deposit requests.</p>
                </div>
                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="block w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-500/30"
                  >
                    Build Your Trust Score Today
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
            Grow your client base with customers who respect verified expertise. Build your online reputation, accept bookings effortlessly, and manage your earnings.
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
