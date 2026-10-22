import { useMemo, useState } from 'react';
import {
  ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, Bell, CalendarDays, CarFront,
  Check, CheckCircle2, ChevronDown, Clock3, Ellipsis, GraduationCap, Heart,
  House, Laptop, MapPin, Menu, MessageCircle, Palette, Search, ShieldCheck,
  Star, Wrench, X,
} from 'lucide-react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { categories, providers } from '../data/providers.js';

const categoryIcons = { House, Laptop, CarFront, GraduationCap, Palette, Ellipsis };

function SiteHeader({ active = '' }) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="market-header">
      <div className="market-header-inner">
        <Link className="market-brand" to="/" aria-label="TrustHub home"><span className="market-brand-icon"><ShieldCheck size={18} /></span><span>Trust<span>Hub</span></span></Link>
        <button className="mobile-menu-button" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`} aria-label="Main navigation">
          <Link className={active === 'home' ? 'nav-active' : ''} to="/">Home</Link>
          <Link className={active === 'services' ? 'nav-active' : ''} to="/services">Services</Link>
          <a href="/#how-it-works">How It Works</a>
          <a href="/#about">About</a>
        </nav>
        <div className="header-actions">
          {user ? <><Link className="header-dashboard-link" to="/dashboard">My bookings</Link><button className="avatar-button" aria-label="Sign out" title="Sign out" onClick={logout}>{user.name?.[0]?.toUpperCase() || 'G'}</button></> : <><Link className="header-login" to="/login">Login</Link><Link className="header-signup" to="/register">Sign Up</Link></>}
        </div>
      </div>
    </header>
  );
}

function SearchBar({ initialQuery = '', initialCategory = '' }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const submit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (category) params.set('category', category);
    navigate(`/services${params.size ? `?${params}` : ''}`);
  };
  return <form className="market-search" onSubmit={submit}>
    <label className="search-query"><Search size={17} /><input aria-label="Service or provider" placeholder="What service do you need?" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
    <label className="search-location"><MapPin size={17} /><input aria-label="Location" defaultValue="Belagavi, Karnataka" /></label>
    <select aria-label="Service category" value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All services</option>{categories.map((item) => <option key={item.name}>{item.name.replace(' Services', '')}</option>)}<option>Laptop Repair</option><option>Computer Services</option><option>Mobile Repair</option><option>Home Cleaning</option><option>Plumbing</option></select>
    <button className="primary-button" type="submit">Find a pro <ArrowRight size={16} /></button>
  </form>;
}

function ProviderCard({ provider, compact = false }) {
  const [saved, setSaved] = useState(false);
  return <article className={`provider-card ${compact ? 'provider-card-compact' : ''}`}>
    <Link className="provider-card-image" to={`/providers/${provider.id}`}><img src={provider.image} alt={`${provider.name} workspace`} loading="lazy" /><span className="verified-float"><BadgeCheck size={14} /> Verified</span></Link>
    <button className={`save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove saved provider' : 'Save provider'} onClick={() => setSaved(!saved)}><Heart size={17} fill={saved ? 'currentColor' : 'none'} /></button>
    <div className="provider-card-body">
      <div className="provider-card-title-row"><div><Link className="provider-card-title" to={`/providers/${provider.id}`}>{provider.name}</Link><p>{provider.description}</p></div></div>
      <div className="provider-rating"><Star size={14} fill="currentColor" /><strong>{provider.rating}</strong><span>({provider.reviews} reviews)</span></div>
      <div className="provider-card-meta"><span><MapPin size={13} />{provider.location.split(',')[0]}</span><span><CheckCircle2 size={13} /> {provider.completed}+ jobs</span></div>
      <div className="provider-card-footer"><span className="price-label">From <strong>₹{provider.price}</strong></span><Link className="small-blue-button" to={`/providers/${provider.id}`}>View profile <ArrowUpRight size={14} /></Link></div>
    </div>
  </article>;
}

function HomePage() {
  const featured = providers.slice(0, 3);
  return <><SiteHeader active="home" /><main>
    <section className="hero-section"><div className="hero-inner"><div className="hero-copy"><p className="hero-eyebrow"><span /> YOUR NEIGHBORHOOD, VERIFIED</p><h1>Find trusted<br /><em>service providers</em><br />near you.</h1><p className="hero-description">Skilled local professionals, clear prices, and real reviews. The help you need is closer than you think.</p><SearchBar /><div className="hero-proof"><span><BadgeCheck size={15} /> Verified providers</span><span><ShieldCheck size={15} /> Secure booking</span><span><Star size={15} /> Genuine reviews</span></div></div><div className="hero-visual"><img src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1200&q=90" alt="Local technician working at a service bench" /><div className="hero-photo-tag"><span className="photo-tag-check"><Check size={15} /></span><span><strong>Good work. Good people.</strong><small>Trusted in your neighborhood</small></span></div><div className="hero-caption">BELAGAVI · KARNATAKA</div></div></div></section>
    <section className="category-section content-width"><div className="section-heading"><div><p className="section-kicker">START WITH A CATEGORY</p><h2>What can we help with?</h2></div><Link className="text-link" to="/services">Browse all services <ArrowRight size={15} /></Link></div><div className="category-grid">{categories.map((item) => { const Icon = categoryIcons[item.icon]; return <Link className={`category-tile tone-${item.tone}`} key={item.name} to={`/services/${encodeURIComponent(item.name.replace(' Services', ''))}`}><span className="category-icon"><Icon size={22} /></span><span>{item.name}</span><ArrowUpRight className="category-arrow" size={15} /></Link>; })}</div></section>
    <section className="featured-section"><div className="content-width"><div className="section-heading"><div><p className="section-kicker">HANDPICKED FOR YOU</p><h2>Local pros people love</h2></div><Link className="text-link" to="/services">See all providers <ArrowRight size={15} /></Link></div><div className="provider-grid">{featured.map((provider) => <ProviderCard key={provider.id} provider={provider} />)}</div></div></section>
    <section className="trust-strip" id="how-it-works"><div className="trust-strip-inner"><div className="trust-strip-heading"><p className="section-kicker">A BETTER WAY TO BOOK</p><h2>Good help.<br />No guesswork.</h2></div><div className="trust-step"><span>01</span><div><strong>Choose with confidence</strong><p>Verified profiles, honest ratings, and clear starting prices.</p></div></div><div className="trust-step"><span>02</span><div><strong>Book in a few taps</strong><p>Pick a time, share what you need, and confirm directly.</p></div></div><div className="trust-step"><span>03</span><div><strong>Support local people</strong><p>Great neighborhood businesses, ready when you are.</p></div></div></div></section>
    <section className="bottom-cta" id="about"><div><p className="section-kicker">MADE FOR YOUR NEIGHBORHOOD</p><h2>Find your next<br />favorite local pro.</h2></div><Link className="primary-button" to="/services">Explore services <ArrowRight size={16} /></Link></section>
  </main><SiteFooter /></>;
}

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: pathCategory } = useParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || pathCategory || '');
  const [minRating, setMinRating] = useState(0);
  const [todayOnly, setTodayOnly] = useState(false);
  const [sort, setSort] = useState('Recommended');
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const result = providers.filter((provider) => {
      const categoryMatch = !category || provider.category.toLowerCase().includes(category.toLowerCase()) || category.toLowerCase().includes(provider.category.toLowerCase());
      const queryMatch = !q || `${provider.name} ${provider.category} ${provider.description} ${provider.location}`.toLowerCase().includes(q);
      return categoryMatch && queryMatch && provider.rating >= minRating && (!todayOnly || provider.availableToday);
    });
    if (sort === 'Top rated') result.sort((a, b) => b.rating - a.rating);
    if (sort === 'Price: low to high') result.sort((a, b) => a.price - b.price);
    return result;
  }, [category, minRating, query, sort, todayOnly]);
  const applySearch = (event) => { event.preventDefault(); const params = new URLSearchParams(); if (query) params.set('q', query); if (category) params.set('category', category); setSearchParams(params); };
  return <><SiteHeader active="services" /><main className="search-page content-width"><div className="search-page-head"><div><p className="section-kicker">LOCAL SERVICES / BELAGAVI</p><h1>Find your service pro</h1><p>Good people, ready to help nearby.</p></div><div className="search-location-chip"><MapPin size={16} /> Belagavi, Karnataka <ChevronDown size={14} /></div></div><form className="results-search" onSubmit={applySearch}><Search size={18} /><input aria-label="Search services" placeholder="Search a service or provider" value={query} onChange={(event) => setQuery(event.target.value)} /><button className="primary-button">Search</button></form><div className="results-layout"><aside className="filter-panel"><div className="filter-panel-top"><h2>Filters</h2><button type="button" onClick={() => { setCategory(''); setMinRating(0); setTodayOnly(false); setQuery(''); }}>Reset</button></div><fieldset><legend>Category</legend>{['Laptop Repair', 'Computer Services', 'Mobile Repair', 'Home Cleaning', 'Plumbing'].map((item) => <label className="check-row" key={item}><input type="checkbox" checked={category === item} onChange={() => setCategory(category === item ? '' : item)} />{item}</label>)}</fieldset><fieldset><legend>Minimum rating</legend>{[4.8, 4.5, 4, 0].map((rating) => <label className="check-row" key={rating}><input type="radio" name="rating" checked={minRating === rating} onChange={() => setMinRating(rating)} />{rating ? `${rating}+ stars` : 'Any rating'}</label>)}</fieldset><fieldset><legend>Availability</legend><label className="check-row"><input type="checkbox" checked={todayOnly} onChange={(event) => setTodayOnly(event.target.checked)} />Available today</label></fieldset><div className="filter-assurance"><ShieldCheck size={16} /><span>Every listed provider is identity verified.</span></div></aside><section className="results-list"><div className="results-toolbar"><div><h2>Service providers <span>{filtered.length}</span></h2><p>Showing the best local matches</p></div><label>Sort by <select value={sort} onChange={(event) => setSort(event.target.value)}><option>Recommended</option><option>Top rated</option><option>Price: low to high</option></select></label></div>{filtered.length ? <div className="provider-grid results-cards">{filtered.map((provider) => <ProviderCard key={provider.id} provider={provider} compact />)}</div> : <div className="no-results"><Search size={26} /><h3>No providers match those filters</h3><p>Try another category or clear some filters.</p><button className="outline-button" onClick={() => { setCategory(''); setMinRating(0); setTodayOnly(false); setQuery(''); }}>Clear filters</button></div>}</section></div></main><SiteFooter /></>;
}

function ProviderProfile() {
  const { providerId } = useParams();
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  const [activeTab, setActiveTab] = useState('Overview');
  const [saved, setSaved] = useState(false);
  return <><SiteHeader active="services" /><main className="profile-page content-width"><div className="profile-breadcrumb"><Link to="/services">Services</Link><span>/</span>{provider.category}<span>/</span>{provider.name}</div><div className="profile-cover"><img src={provider.image} alt={`${provider.name} service workspace`} /><span className="cover-chip"><BadgeCheck size={15} /> Identity verified provider</span></div><div className="profile-layout"><section className="profile-main"><div className="profile-title-row"><img className="provider-avatar" src={provider.avatar} alt="" /><div><h1>{provider.name} <BadgeCheck size={21} /></h1><p>{provider.category} <span>·</span> {provider.location}</p><div className="provider-rating"><Star size={14} fill="currentColor" /><strong>{provider.rating}</strong><span>{provider.reviews} verified reviews</span></div></div><button className={`outline-button profile-save ${saved ? 'is-saved' : ''}`} onClick={() => setSaved(!saved)}><Heart size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save'}</button></div><div className="profile-tabs">{['Overview', 'Services', 'Reviews', 'Gallery', 'Q&A'].map((tab) => <button className={activeTab === tab ? 'tab-active' : ''} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>{activeTab === 'Overview' && <div className="profile-info-grid"><article className="profile-about"><h2>About</h2><p>{provider.about}</p><div className="experience-stats"><span><strong>{provider.years}+</strong><small>Years experience</small></span><span><strong>{provider.completed}+</strong><small>Happy customers</small></span><span><strong>{provider.rating}</strong><small>Average rating</small></span></div><h3>Services offered</h3><div className="service-tags">{provider.services.map((service) => <span key={service}>{service}</span>)}</div></article><article className="quick-info"><h2>Quick info</h2><p><MapPin size={16} /> {provider.location}</p><p><Clock3 size={16} /> Mon – Sat, 9:00 AM – 6:00 PM</p><p><BadgeCheck size={16} /> Identity and contact verified</p><p><Wrench size={16} /> {provider.completed} jobs completed</p></article></div>}{activeTab === 'Services' && <div className="tab-content"><h2>Services & starting prices</h2>{provider.services.map((service, index) => <div className="service-row" key={service}><span>{service}</span><strong>From ₹{provider.price + index * 100}</strong></div>)}</div>}{activeTab === 'Reviews' && <div className="tab-content"><h2>What customers say</h2><div className="review-snippet"><div><Star size={14} fill="currentColor" /> 5.0 <span>· Ananya P. · 2 weeks ago</span></div><p>Clear estimate, friendly service, and my device was ready when promised. Would book again.</p></div><div className="review-snippet"><div><Star size={14} fill="currentColor" /> 5.0 <span>· Kiran M. · 1 month ago</span></div><p>Explained the options before starting and kept the work area tidy.</p></div></div>}{activeTab === 'Gallery' && <div className="gallery-grid"><img src={provider.image} alt="Provider workspace" /><img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=500&q=80" alt="Technician at work" /><img src="https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=500&q=80" alt="Service tools" /></div>}{activeTab === 'Q&A' && <div className="tab-content"><h2>Common questions</h2><details><summary>Do you provide a quote before starting?</summary><p>Yes. The provider confirms the estimate with you before work begins.</p></details><details><summary>Can I request a home visit?</summary><p>Message the provider to confirm availability for your address.</p></details></div>}</section><aside className="booking-card"><div className="booking-score"><span>Trust score</span><strong>92<small>/100</small></strong><div className="score-bar"><span /></div></div><ul><li><CheckCircle2 size={16} /> Identity verified</li><li><CheckCircle2 size={16} /> Contact verified</li><li><CheckCircle2 size={16} /> {provider.completed}+ services completed</li><li><CheckCircle2 size={16} /> Positive review history</li></ul><div className="booking-price">Starting from <strong>₹{provider.price}</strong><small>Final estimate confirmed before service</small></div><Link className="primary-button booking-cta" to={`/book/${provider.id}`}>Book service <ArrowRight size={16} /></Link><Link className="outline-button message-cta" to="/login"><MessageCircle size={16} /> Message provider</Link><p className="secure-booking"><ShieldCheck size={14} /> Secure booking, no hidden fees</p></aside></div></main><SiteFooter /></>;
}

function BookingPage() {
  const { providerId } = useParams();
  const provider = providers.find((item) => item.id === providerId) || providers[0];
  const [step, setStep] = useState(1);
  const [service, setService] = useState(provider.services[0]);
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  const todayString = today.toISOString().slice(0, 10);
  const [date, setDate] = useState(todayString);
  const [time, setTime] = useState('11:00 AM');
  const [details, setDetails] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const finishBooking = () => {
    const saved = JSON.parse(localStorage.getItem('trusthub_bookings') || '[]');
    saved.unshift({ id: `TH-${Date.now().toString().slice(-6)}`, provider: provider.name, service, date, time, status: 'Pending', price: provider.price });
    localStorage.setItem('trusthub_bookings', JSON.stringify(saved));
    setConfirmed(true);
    setStep(4);
  };
  return <><SiteHeader active="services" /><main className="booking-page content-width"><Link to={`/providers/${provider.id}`} className="back-link"><ArrowLeft size={15} /> Back to provider</Link><div className="booking-page-heading"><p className="section-kicker">BOOK A LOCAL SERVICE</p><h1>Make it happen.</h1><p>A few details and you’re all set.</p></div><div className="booking-steps">{['Service details', 'Schedule', 'Confirm', 'Done'].map((label, index) => <div key={label} className={`booking-step ${step >= index + 1 ? 'step-done' : ''} ${step === index + 1 ? 'step-current' : ''}`}><span>{step > index + 1 ? <Check size={13} /> : index + 1}</span><small>{label}</small></div>)}</div><div className="booking-layout"><section className="booking-form-panel">{step === 1 && <><h2>Tell us what you need</h2><label>Service type<select value={service} onChange={(event) => setService(event.target.value)}>{provider.services.map((item) => <option key={item}>{item}</option>)}</select></label><label>Describe the issue<textarea rows="4" placeholder="A few details help your provider prepare..." value={details} onChange={(event) => setDetails(event.target.value)} /></label><label className="upload-box"><span className="upload-symbol">＋</span><strong>Add photos (optional)</strong><small>For this demo, attachments are not uploaded.</small></label><button className="primary-button form-next" onClick={() => setStep(2)}>Next: Schedule <ArrowRight size={16} /></button></>}{step === 2 && <><h2>Choose a time</h2><label>Preferred date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label><label>Preferred time<select value={time} onChange={(event) => setTime(event.target.value)}>{['09:00 AM', '11:00 AM', '01:00 PM', '03:00 PM', '05:00 PM'].map((item) => <option key={item}>{item}</option>)}</select></label><div className="booking-inline-note"><CalendarDays size={18} /><span><strong>Flexible scheduling</strong><small>The provider will confirm your requested time.</small></span></div><div className="booking-form-actions"><button className="outline-button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Back</button><button className="primary-button" onClick={() => setStep(3)}>Review request <ArrowRight size={15} /></button></div></>}{step === 3 && <><h2>Review your request</h2><div className="confirm-summary"><p><span>Service</span><strong>{service}</strong></p><p><span>Date & time</span><strong>{date} · {time}</strong></p><p><span>Provider</span><strong>{provider.name}</strong></p><p><span>Details</span><strong>{details || 'No additional details'}</strong></p></div><p className="demo-notice">This is a UI preview. Booking details will be saved in this browser only.</p><div className="booking-form-actions"><button className="outline-button" onClick={() => setStep(2)}><ArrowLeft size={15} /> Back</button><button className="primary-button" onClick={finishBooking}>Confirm request <Check size={15} /></button></div></>}{step === 4 && confirmed && <div className="booking-success"><span><Check size={28} /></span><p className="section-kicker">REQUEST SAVED</p><h2>You’re on the list.</h2><p>Your service request is saved to this browser’s demo booking list.</p><Link className="primary-button" to="/dashboard">View my bookings <ArrowRight size={15} /></Link></div>}</section><aside className="booking-summary"><p className="section-kicker">YOUR PROVIDER</p><div className="summary-provider"><img src={provider.image} alt="" /><div><strong>{provider.name}</strong><span><Star size={13} fill="currentColor" /> {provider.rating} · Verified</span></div></div><div className="summary-divider" /><div className="summary-price-row"><span>Service estimate</span><strong>₹{provider.price} – ₹{provider.price * 2}</strong></div><p className="summary-fineprint">The final price is agreed with your provider before work starts.</p></aside></div></main><SiteFooter /></>;
}

function CustomerDashboard() {
  const { user, logout } = useAuth();
  const bookings = JSON.parse(localStorage.getItem('trusthub_bookings') || '[]');
  const rows = bookings.length ? bookings : [
    { id: 'TH-2048', provider: 'ABC Computers', service: 'Laptop screen repair', date: 'Aug 12, 2026', status: 'In Progress', price: 1800 },
    { id: 'TH-2042', provider: 'HomeBright Services', service: 'Home cleaning', date: 'Aug 14, 2026', status: 'Scheduled', price: 900 },
    { id: 'TH-2037', provider: 'TechFix Solutions', service: 'Wi-Fi setup', date: 'Aug 02, 2026', status: 'Completed', price: 600 },
  ];
  return <DashboardFrame title="My Dashboard" active="dashboard" user={user} logout={logout}><div className="dashboard-welcome"><div><p className="section-kicker">YOUR NEIGHBORHOOD, AT A GLANCE</p><h1>Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}.</h1><p>Here’s what’s happening with your services.</p></div><Link className="primary-button" to="/services">Find a service <ArrowRight size={15} /></Link></div><div className="dash-stats"><Stat icon={<CalendarDays />} value={String(rows.length)} label="Active bookings" tone="blue" /><Stat icon={<CheckCircle2 />} value="12" label="Completed services" tone="green" /><Stat icon={<Heart />} value="5" label="Saved providers" tone="rose" /><Stat icon={<Star />} value="4.8" label="Average rating" tone="amber" /></div><div className="dashboard-columns"><section className="dashboard-widget"><div className="widget-heading"><div><h2>Recent bookings</h2><p>Your latest service requests</p></div><Link to="/services">Book again <ArrowRight size={14} /></Link></div><div className="booking-list">{rows.map((booking) => <div className="booking-list-row" key={booking.id}><span className="booking-list-icon"><Wrench size={17} /></span><div className="booking-list-info"><strong>{booking.service}</strong><small>{booking.provider} · {booking.date}</small></div><span className={`booking-state state-${booking.status.toLowerCase().replace(' ', '-')}`}>{booking.status}</span><button aria-label={`View ${booking.service}`} className="icon-button row-arrow"><ArrowUpRight size={17} /></button></div>)}</div></section><section className="dashboard-widget suggestions-widget"><div className="widget-heading"><div><h2>Recommended for you</h2><p>Popular near Belagavi</p></div><Link to="/services">See all <ArrowRight size={14} /></Link></div>{providers.slice(0, 3).map((provider) => <Link className="suggestion-row" key={provider.id} to={`/providers/${provider.id}`}><img src={provider.image} alt="" /><span><strong>{provider.name}</strong><small><Star size={12} fill="currentColor" /> {provider.rating} · From ₹{provider.price}</small></span><ArrowUpRight size={15} /></Link>)}</section></div></DashboardFrame>;
}

function Stat({ icon, value, label, tone }) { return <article className="dash-stat"><span className={`dash-stat-icon tone-${tone}`}>{icon}</span><strong>{value}</strong><small>{label}</small></article>; }

function DashboardFrame({ title, active, user, logout, children }) {
  const links = [{ label: 'Dashboard', icon: House, to: '/dashboard' }, { label: 'My Services', icon: Wrench, to: '/provider/dashboard' }, { label: 'Bookings', icon: CalendarDays, to: '/dashboard' }, { label: 'Reviews', icon: Star, to: '/dashboard' }, { label: 'Earnings', icon: ArrowUpRight, to: '/provider/dashboard' }, { label: 'Profile', icon: BadgeCheck, to: '/providers/abc-computers' }];
  return <div className="dashboard-shell"><aside className="dashboard-sidebar"><Link className="market-brand" to="/"><span className="market-brand-icon"><ShieldCheck size={18} /></span><span>Trust<span>Hub</span></span></Link><p className="dash-side-label">MENU</p>{links.map((item) => { const Icon = item.icon; return <Link key={item.label} className={`dash-nav-link ${active === item.label.toLowerCase() ? 'dash-nav-active' : ''}`} to={item.to}><Icon size={16} />{item.label}</Link>; })}<div className="dash-sidebar-foot"><span className="dash-user-avatar">{user?.name?.[0]?.toUpperCase() || 'R'}</span><span><strong>{user?.name || 'Rahul'}</strong><small>{user?.role || 'Customer'}</small></span><button className="icon-button" onClick={logout} title="Sign out" aria-label="Sign out"><ArrowUpRight size={16} /></button></div></aside><main className="dashboard-main"><header className="dashboard-topbar"><span>{title}</span><div><button className="icon-button notification-button" aria-label="Notifications"><Bell size={17} /><i /></button><span className="topbar-user">{user?.name || 'Rahul'} <ChevronDown size={13} /></span></div></header><div className="dashboard-content">{children}</div></main></div>;
}

function ProviderDashboard() {
  const { user, logout } = useAuth();
  return <DashboardFrame title="Provider Dashboard" active="my services" user={user} logout={logout}><div className="dashboard-welcome"><div><p className="section-kicker">PROVIDER OVERVIEW / DEMO</p><h1>Good morning, ABC Computers.</h1><p>Your service business at a glance.</p></div><button className="primary-button">Manage profile <ArrowUpRight size={15} /></button></div><div className="dash-stats"><Stat icon={<CalendarDays />} value="127" label="Total bookings" tone="blue" /><Stat icon={<Clock3 />} value="4" label="Active bookings" tone="green" /><Stat icon={<Star />} value="4.7" label="Average rating" tone="amber" /><Stat icon={<ShieldCheck />} value="92" label="Trust score" tone="rose" /></div><div className="dashboard-columns"><section className="dashboard-widget"><div className="widget-heading"><div><h2>Recent bookings</h2><p>Latest customer requests</p></div><button className="text-button">View all <ArrowRight size={14} /></button></div>{[['Laptop screen replacement','Rahul Patil','Pending','Aug 12'],['Software installation','Sneha Kulkarni','Accepted','Aug 11'],['Data recovery','Vikram Joshi','Completed','Aug 10']].map(([service, customer, status, day]) => <div className="provider-booking-row" key={service}><div><strong>{service}</strong><small>{customer} · {day}</small></div><span className={`booking-state state-${status.toLowerCase()}`}>{status}</span></div>)}</section><section className="dashboard-widget earnings-widget"><div className="widget-heading"><div><h2>Earnings overview</h2><p>This month · demo data</p></div><strong>₹24,500</strong></div><div className="mini-chart">{[34, 48, 41, 58, 52, 72, 64, 88, 77, 100, 85, 94].map((height, index) => <span style={{ height: `${height}%` }} key={index} />)}</div><div className="chart-months"><span>Aug 1</span><span>Aug 15</span><span>Aug 30</span></div></section></div></DashboardFrame>;
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  return <DashboardFrame title="System Overview" active="dashboard" user={user} logout={logout}><div className="dashboard-welcome"><div><p className="section-kicker">ADMINISTRATION / OVERVIEW</p><h1>System overview.</h1><p>Platform activity and provider verification.</p></div><span className="admin-demo-tag">SAMPLE DATA</span></div><div className="dash-stats"><Stat icon={<BadgeCheck />} value="1,248" label="Total users" tone="blue" /><Stat icon={<ShieldCheck />} value="183" label="Verified providers" tone="green" /><Stat icon={<CalendarDays />} value="76" label="Active bookings" tone="amber" /><Stat icon={<Bell />} value="9" label="Flagged activities" tone="rose" /></div><div className="dashboard-columns"><section className="dashboard-widget"><div className="widget-heading"><div><h2>Recent flagged activities</h2><p>Requires administrator review</p></div><button className="text-button">View all <ArrowRight size={14} /></button></div>{[['Unusual review activity','User: john_doe','High'],['Suspicious account signup','IP: 192.168.0.24','High'],['Multiple reviews from same text','Provider: ABC Computers','Medium'],['Failed login attempts','Account: rahul.patil','Low']].map(([title, subtitle, status]) => <div className="flag-row" key={title}><span className={`flag-dot flag-${status.toLowerCase()}`} /><div><strong>{title}</strong><small>{subtitle}</small></div><span className={`booking-state state-${status.toLowerCase()}`}>{status}</span></div>)}</section><section className="dashboard-widget"><div className="widget-heading"><div><h2>User registrations</h2><p>+12% this month · sample</p></div></div><div className="admin-chart"><svg viewBox="0 0 360 150" role="img" aria-label="Sample user registration trend"><path d="M0 124 C25 117 22 100 51 108 S86 75 113 89 S145 62 174 72 S206 47 233 63 S266 28 290 44 S326 17 360 21" fill="none" stroke="#1964df" strokeWidth="3" /><path d="M0 124 C25 117 22 100 51 108 S86 75 113 89 S145 62 174 72 S206 47 233 63 S266 28 290 44 S326 17 360 21 V150 H0Z" fill="url(#area)" /><defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#2875ef" stopOpacity=".18" /><stop offset="1" stopColor="#2875ef" stopOpacity="0" /></linearGradient></defs></svg></div><div className="chart-months"><span>Aug 1</span><span>Aug 10</span><span>Aug 20</span><span>Aug 31</span></div></section></div></DashboardFrame>;
}

function SiteFooter() { return <footer className="market-footer"><Link className="market-brand" to="/"><span className="market-brand-icon"><ShieldCheck size={17} /></span><span>Trust<span>Hub</span></span></Link><p>Trusted people. Stronger communities.</p><small>© 2026 TrustHub · Belagavi, Karnataka</small></footer>; }

export default function Marketplace() {
  const location = useLocation();
  const path = location.pathname;
  if (path.startsWith('/services')) return <SearchPage key={path + location.search} />;
  if (path.startsWith('/providers/')) return <ProviderProfile />;
  if (path.startsWith('/book/')) return <BookingPage />;
  if (path === '/dashboard') return <CustomerDashboard />;
  if (path === '/provider/dashboard') return <ProviderDashboard />;
  if (path === '/admin') return <AdminDashboard />;
  return <HomePage />;
}