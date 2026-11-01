import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search, Filter, Star, Shield, MapPin, CheckCircle,
  SlidersHorizontal, X, ArrowUpDown, ChevronDown, Check
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { providerService } from '../../services';

// Standard service categories with sub-categories
const FILTER_CATEGORIES = [
  'Laptop Repair',
  'Mobile Repair',
  'Computer Services',
  'Software Support',
  'AC Repair & Service',
  'Home Cleaning',
  'Electrical & Plumbing',
  'Vehicle Servicing',
];

// Rich fallback provider records matching mockup 2
const DEFAULT_PROVIDERS = [
  {
    _id: '66d01234abc0000000000001',
    businessName: 'ABC Computers',
    category: 'Laptop Repair',
    description: 'Expert laptop and desktop servicing, chip-level motherboard repair, SSD upgrade and screen replacements.',
    location: { city: 'Belagavi', address: 'College Road, Belagavi', distanceKm: 2 },
    averageRating: 4.7,
    totalReviews: 128,
    trustScore: 90,
    priceFrom: 300,
    isVerified: true,
    availableToday: true,
    tags: ['Laptop Repair', 'Software', 'Hardware'],
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80',
    experience: '8+ Years',
  },
  {
    _id: '66d01234abc0000000000002',
    businessName: 'TechFix Solutions',
    category: 'Laptop Repair',
    description: 'Specialized in urgent data recovery, broken hinges, liquid damage revival, and clean OS installations.',
    location: { city: 'Belagavi', address: 'Khade Bazar, Belagavi', distanceKm: 3 },
    averageRating: 4.5,
    totalReviews: 86,
    trustScore: 86,
    priceFrom: 400,
    isVerified: true,
    availableToday: true,
    tags: ['Laptop Repair', 'Data Recovery', 'OS Installation'],
    image: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?w=500&auto=format&fit=crop&q=80',
    experience: '5+ Years',
  },
  {
    _id: '66d01234abc0000000000003',
    businessName: 'Laptop Care Center',
    category: 'Laptop Repair',
    description: 'Original spare parts, certified technicians, rapid turnaround time, and warranty on all screen repairs.',
    location: { city: 'Belagavi', address: 'Tilakwadi, Belagavi', distanceKm: 3 },
    averageRating: 4.3,
    totalReviews: 64,
    trustScore: 86,
    priceFrom: 350,
    isVerified: true,
    availableToday: false,
    tags: ['Laptop Repair', 'Screen Replacement', 'AMC'],
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=80',
    experience: '6+ Years',
  },
  {
    _id: '66d01234abc0000000000004',
    businessName: 'QuickFix Mobile & Laptop',
    category: 'Mobile Repair',
    description: 'Same day screen repair, battery health replacement, and water damage treatment for all top brands.',
    location: { city: 'Belagavi', address: 'Camp Area, Belagavi', distanceKm: 1.5 },
    averageRating: 4.8,
    totalReviews: 142,
    trustScore: 94,
    priceFrom: 250,
    isVerified: true,
    availableToday: true,
    tags: ['Mobile Repair', 'Screen Replacement', 'Battery'],
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?w=500&auto=format&fit=crop&q=80',
    experience: '7+ Years',
  },
  {
    _id: '66d01234abc0000000000005',
    businessName: 'CoolHome HVAC Services',
    category: 'AC Repair & Service',
    description: 'Complete split & window AC diagnostics, deep foam jet cleaning, gas filling and copper pipe repair.',
    location: { city: 'Belagavi', address: 'Rani Chennamma Circle, Belagavi', distanceKm: 2.5 },
    averageRating: 4.9,
    totalReviews: 210,
    trustScore: 96,
    priceFrom: 499,
    isVerified: true,
    availableToday: true,
    tags: ['AC Repair & Service', 'Gas Refill', 'Maintenance'],
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=500&auto=format&fit=crop&q=80',
    experience: '10+ Years',
  },
  {
    _id: '66d01234abc0000000000006',
    businessName: 'Elite Home Sparkle',
    category: 'Home Cleaning',
    description: 'Eco-friendly deep sanitization, bathroom scrubbing, kitchen de-greasing and full apartment handover cleaning.',
    location: { city: 'Belagavi', address: 'Udyambag, Belagavi', distanceKm: 4 },
    averageRating: 4.6,
    totalReviews: 95,
    trustScore: 89,
    priceFrom: 599,
    isVerified: true,
    availableToday: false,
    tags: ['Home Cleaning', 'Sanitization', 'Deep Clean'],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500&auto=format&fit=crop&q=80',
    experience: '4+ Years',
  },
];

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [keyword, setKeyword] = useState(initialSearch);
  const [selectedCategories, setSelectedCategories] = useState(
    initialCategory ? [initialCategory] : ['Laptop Repair']
  );
  const [maxPrice, setMaxPrice] = useState(2000);
  const [minRating, setMinRating] = useState('any'); // 'any', '3', '4'
  const [availableTodayOnly, setAvailableTodayOnly] = useState(false);
  const [sortBy, setSortBy] = useState('best_match'); // 'best_match', 'trust_score', 'rating', 'price_asc'
  
  const [providers, setProviders] = useState(DEFAULT_PROVIDERS);
  const [loading, setLoading] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Sync with URL params
  useEffect(() => {
    if (initialSearch) {
      setKeyword(initialSearch);
    }
    if (initialCategory && !selectedCategories.includes(initialCategory)) {
      setSelectedCategories([initialCategory]);
    }
  }, [initialSearch, initialCategory]);

  // Attempt backend API fetch with fallback to client data
  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        const res = await providerService.getProviders({
          search: keyword || undefined,
          sort: sortBy === 'rating' ? 'rating' : 'trustScore',
        });
        if (res.data?.providers && res.data.providers.length > 0) {
          setProviders(res.data.providers);
        } else {
          setProviders(DEFAULT_PROVIDERS);
        }
      } catch {
        setProviders(DEFAULT_PROVIDERS);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, [keyword, sortBy]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (keyword.trim()) {
        next.set('search', keyword.trim());
      } else {
        next.delete('search');
      }
      return next;
    });
  };

  // Toggle Category selection
  const handleCategoryToggle = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setMaxPrice(2000);
    setMinRating('any');
    setAvailableTodayOnly(false);
  };

  // Filter & Sort Logic
  const filteredProviders = useMemo(() => {
    let result = [...providers];

    // Keyword Filter
    if (keyword.trim()) {
      const q = keyword.toLowerCase();
      result = result.filter(
        (p) =>
          p.businessName.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q))) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Category Filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (sc) =>
            p.category.toLowerCase() === sc.toLowerCase() ||
            (p.tags && p.tags.some((t) => t.toLowerCase() === sc.toLowerCase()))
        )
      );
    }

    // Max Price Filter
    result = result.filter((p) => (p.priceFrom || 0) <= maxPrice);

    // Rating Filter
    if (minRating === '4') {
      result = result.filter((p) => p.averageRating >= 4.0);
    } else if (minRating === '3') {
      result = result.filter((p) => p.averageRating >= 3.0);
    }

    // Availability Filter
    if (availableTodayOnly) {
      result = result.filter((p) => p.availableToday);
    }

    // Sorting
    if (sortBy === 'trust_score') {
      result.sort((a, b) => b.trustScore - a.trustScore);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.averageRating - a.averageRating);
    } else if (sortBy === 'price_asc') {
      result.sort((a, b) => (a.priceFrom || 0) - (b.priceFrom || 0));
    }

    return result;
  }, [providers, keyword, selectedCategories, maxPrice, minRating, availableTodayOnly, sortBy]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Navbar />

      {/* ── TOP SEARCH BANNER ── */}
      <section className="bg-white border-b border-slate-200/80 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl shadow-xs focus-within:bg-white focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100 transition-all">
              <div className="flex-1 flex items-center px-3 gap-3">
                <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder="e.g. Laptop repair, Screen replacement, Plumber..."
                  className="w-full py-2.5 text-sm sm:text-base text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => {
                      setKeyword('');
                      setSearchParams({});
                    }}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* ── MAIN SEARCH CONTENT (FILTERS + RESULTS) ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Results Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
              Search Results
              <span className="text-sm font-normal text-slate-500">
                ({filteredProviders.length} {filteredProviders.length === 1 ? 'provider' : 'providers'} found)
              </span>
            </h1>
            {keyword && (
              <p className="text-xs text-slate-500 mt-0.5">
                Showing results for <span className="font-semibold text-blue-600">"{keyword}"</span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span>Filters</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-sm bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs">
              <span className="text-slate-400 text-xs font-medium">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 text-xs sm:text-sm outline-none cursor-pointer"
              >
                <option value="best_match">Best Match</option>
                <option value="trust_score">Highest Trust Score</option>
                <option value="rating">Top Rated</option>
                <option value="price_asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── LEFT DESKTOP FILTERS SIDEBAR (3 Cols) ── */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-6 sticky top-24">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <Filter className="w-4 h-4 text-blue-600" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Category
              </h3>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {FILTER_CATEGORIES.map((cat) => {
                  const isChecked = selectedCategories.includes(cat);
                  return (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCategoryToggle(cat)}
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 rounded-xs"
                      />
                      <span>{cat}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Price Range
                </h3>
                <span className="text-xs font-semibold text-blue-600">
                  ₹0 – ₹{maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="2000"
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>₹100</span>
                <span>₹2,000</span>
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rating
              </h3>
              <div className="space-y-2">
                {[
                  { value: '4', label: '★ 4 & above' },
                  { value: '3', label: '★ 3 & above' },
                  { value: 'any', label: 'Any rating' },
                ].map((r) => (
                  <label
                    key={r.value}
                    className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none"
                  >
                    <input
                      type="radio"
                      name="ratingFilter"
                      checked={minRating === r.value}
                      onChange={() => setMinRating(r.value)}
                      className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                    />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Availability
              </h3>
              <label className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900 select-none">
                <input
                  type="checkbox"
                  checked={availableTodayOnly}
                  onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 rounded-xs"
                />
                <span>Available Today</span>
              </label>
            </div>

          </aside>

          {/* ── RIGHT PROVIDER CARDS COLUMN (9 Cols) ── */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-4">
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white p-5 rounded-2xl border border-slate-200 h-44" />
                ))}
              </div>
            ) : filteredProviders.length > 0 ? (
              filteredProviders.map((provider) => (
                <div
                  key={provider._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-start gap-4 flex-1">
                    
                    {/* Thumbnail Image */}
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200/70 shadow-2xs relative">
                      <img
                        src={provider.image || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&auto=format&fit=crop&q=80'}
                        alt={provider.businessName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {provider.availableToday && (
                        <div className="absolute top-1 left-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                          Today
                        </div>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      
                      {/* Name and Rating */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/providers/${provider._id}`}
                          className="font-bold text-base sm:text-lg text-slate-900 hover:text-blue-600 transition-colors truncate"
                        >
                          {provider.businessName}
                        </Link>
                        
                        <div className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/70">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{provider.averageRating?.toFixed(1) || '4.5'}</span>
                          <span className="text-slate-400 font-normal">
                            ({provider.totalReviews || 0} reviews)
                          </span>
                        </div>
                      </div>

                      {/* Distance / Location */}
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>Belagavi · {provider.location?.distanceKm || 2} km</span>
                      </p>

                      {/* Badges: Verified & Trust Score */}
                      <div className="flex flex-wrap items-center gap-2 pt-0.5">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                          Verified
                        </span>

                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                          <Shield className="w-3 h-3 text-blue-600" />
                          {provider.trustScore || 85} Trust Score
                        </span>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {provider.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                    </div>
                  </div>

                  {/* Right: Pricing & CTA Button */}
                  <div className="sm:border-l sm:border-slate-100 sm:pl-6 w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">From</span>
                      <p className="text-xl font-extrabold text-slate-900">
                        ₹ {provider.priceFrom || 300}
                      </p>
                    </div>

                    <Link
                      to={`/providers/${provider._id}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-all active:scale-95 text-center"
                    >
                      View Profile
                    </Link>
                  </div>

                </div>
              ))
            ) : (
              /* Empty state */
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  No service providers found
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  We couldn't find any verified providers matching your exact criteria. Try broadening your filters or clearing search terms.
                </p>
                <div>
                  <button
                    onClick={handleClearFilters}
                    className="px-5 py-2.5 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ── MOBILE FILTERS DRAWER / MODAL ── */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-xs bg-white h-full ml-auto p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                  <Filter className="w-5 h-5 text-blue-600" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Category
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {FILTER_CATEGORIES.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-xs text-slate-700">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryToggle(cat)}
                        className="rounded text-blue-600"
                      />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex justify-between text-xs font-bold text-slate-800">
                  <span>PRICE UP TO</span>
                  <span className="text-blue-600">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="2000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Rating</h4>
                {['4', '3', 'any'].map((val) => (
                  <label key={val} className="flex items-center gap-2 text-xs text-slate-700">
                    <input
                      type="radio"
                      name="mobileRating"
                      checked={minRating === val}
                      onChange={() => setMinRating(val)}
                      className="text-blue-600"
                    />
                    <span>{val === 'any' ? 'Any Rating' : `★ ${val} & above`}</span>
                  </label>
                ))}
              </div>

              {/* Availability */}
              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={availableTodayOnly}
                    onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>Available Today</span>
                </label>
              </div>

            </div>

            <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={handleClearFilters}
                className="py-2.5 text-xs font-semibold border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50"
              >
                Clear All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="py-2.5 text-xs font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default SearchPage;
