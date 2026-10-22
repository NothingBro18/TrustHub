import { useEffect, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  FileCheck2,
  LogOut,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { fetchTrusts, updateVerificationStatus } from '../services/trustService.js';

const filters = ['All statuses', 'Pending', 'Verified', 'Rejected'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [trusts, setTrusts] = useState([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All statuses');
  const [selectedTrust, setSelectedTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchTrusts()
      .then((response) => {
        if (active) setTrusts(response.trusts || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || 'Could not load trusts. Please retry.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const pendingCount = trusts.filter((trust) => trust.verificationStatus === 'Pending').length;
  const verifiedCount = trusts.filter((trust) => trust.verificationStatus === 'Verified').length;
  const filteredTrusts = trusts.filter((trust) => {
    const matchesStatus = statusFilter === 'All statuses' || trust.verificationStatus === statusFilter;
    const searchText = `${trust.trustName} ${trust.trusteeName} ${trust.contactEmail}`.toLowerCase();
    return matchesStatus && searchText.includes(query.trim().toLowerCase());
  });

  const reviewTrust = async (verificationStatus) => {
    if (!selectedTrust) return;
    setSubmitting(true);
    setError('');
    try {
      const response = await updateVerificationStatus(selectedTrust._id, verificationStatus);
      setTrusts((current) => current.map((trust) => (
        trust._id === response.trust._id ? response.trust : trust
      )));
      setSelectedTrust(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not update verification status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="workspace-shell">
      <aside className="sidebar">
        <a className="brand" href="/dashboard" aria-label="TrustHub home">
          <span className="brand-mark"><ShieldCheck size={20} /></span>
          <span>trust<span className="brand-light">hub</span></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <a className="side-link side-link-active" href="/dashboard"><FileCheck2 size={17} /> Trust registry</a>
        <div className="sidebar-bottom">
          <div className="profile-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</div>
          <div className="profile-copy"><strong>{user?.name}</strong><span>{user?.role}</span></div>
          <button className="icon-button logout-button" type="button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={17} /></button>
        </div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">Trust registry <span>/</span> Overview</div>
          <div className="topbar-date"><span className="online-dot" /> Workspace active</div>
        </header>

        <div className="page-content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">REGISTRY / OVERVIEW</p>
              <h1>Trusts</h1>
              <p className="heading-copy">A live view of your trust records and verification progress.</p>
            </div>
            <div className="heading-period">CURRENT PORTFOLIO <ChevronDown size={14} /></div>
          </div>

          <div className="stat-grid" aria-label="Trust summary">
            <article className="stat-panel stat-total">
              <div className="stat-topline"><span>Total trusts</span><span className="stat-icon"><FileCheck2 size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : trusts.length}</div>
              <div className="stat-caption">Records in your workspace</div>
              <div className="stat-trend trend-neutral"><ArrowUpRight size={14} /> Portfolio overview</div>
            </article>
            <article className="stat-panel">
              <div className="stat-topline"><span>Pending review</span><span className="stat-icon icon-pending"><Clock3 size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : pendingCount}</div>
              <div className="stat-caption">Awaiting a decision</div>
              <div className="stat-trend trend-pending"><Clock3 size={14} /> Requires attention</div>
            </article>
            <article className="stat-panel">
              <div className="stat-topline"><span>Verified</span><span className="stat-icon icon-verified"><Check size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : verifiedCount}</div>
              <div className="stat-caption">Approved trust records</div>
              <div className="stat-trend trend-verified"><ArrowUpRight size={14} /> In good standing</div>
            </article>
            <article className="stat-panel stat-rejected">
              <div className="stat-topline"><span>Rejected</span><span className="stat-icon icon-rejected"><X size={17} /></span></div>
              <div className="stat-value">{loading ? '—' : trusts.length - pendingCount - verifiedCount}</div>
              <div className="stat-caption">Not approved</div>
              <div className="stat-trend trend-rejected"><ArrowDownRight size={14} /> Review history</div>
            </article>
          </div>

          <section className="registry-section" aria-labelledby="registry-title">
            <div className="registry-heading">
              <div><h2 id="registry-title">Trust records</h2><p>Review details and current verification status.</p></div>
              <span className="record-count">{filteredTrusts.length} RECORDS</span>
            </div>
            <div className="table-toolbar">
              <label className="search-field">
                <Search size={17} />
                <input type="search" placeholder="Search trusts or trustees" value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search trusts or trustees" />
                <kbd>/</kbd>
              </label>
              <label className="filter-field">
                <span>STATUS</span>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter by status">
                  {filters.map((filter) => <option key={filter}>{filter}</option>)}
                </select>
              </label>
            </div>

            {error && <div className="inline-error" role="alert">{error}</div>}
            <div className="table-scroll">
              <table className="trust-table">
                <thead><tr><th>TRUST / TRUSTEE</th><th>CONTACT</th><th>TRUST TYPE</th><th>STATUS</th><th>CREATED</th>{user?.role === 'Admin' && <th><span className="sr-only">Actions</span></th>}</tr></thead>
                <tbody>
                  {loading && <tr><td className="table-message" colSpan={user?.role === 'Admin' ? 6 : 5}>Loading trust records...</td></tr>}
                  {!loading && filteredTrusts.map((trust) => (
                    <tr key={trust._id}>
                      <td><div className="trust-name">{trust.trustName}</div><div className="trust-subtitle">{trust.trusteeName}</div></td>
                      <td><a className="contact-link" href={`mailto:${trust.contactEmail}`}>{trust.contactEmail}</a><div className="trust-subtitle">{trust.contactPhone}</div></td>
                      <td><span className="type-label">{trust.trustType}</span></td>
                      <td><span className={`status-badge status-${trust.verificationStatus.toLowerCase()}`}><span />{trust.verificationStatus}</span></td>
                      <td className="date-cell">{new Date(trust.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      {user?.role === 'Admin' && <td><button className="review-button" type="button" onClick={() => setSelectedTrust(trust)}>Review <ArrowUpRight size={14} /></button></td>}
                    </tr>
                  ))}
                  {!loading && filteredTrusts.length === 0 && <tr><td className="table-message" colSpan={user?.role === 'Admin' ? 6 : 5}>{error ? 'Trust records could not be loaded.' : 'No trust records match this view.'}</td></tr>}
                </tbody>
              </table>
            </div>
            <div className="table-footer"><span>Showing {filteredTrusts.length} of {trusts.length} trusts</span><span>Updated just now</span></div>
          </section>
          <footer className="page-footer"><span>TRUSTHUB REGISTRY</span><span>Secure trust administration</span></footer>
        </div>
      </section>

      {selectedTrust && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !submitting) setSelectedTrust(null); }}>
          <section className="review-modal" role="dialog" aria-modal="true" aria-labelledby="review-title">
            <button className="icon-button modal-close" type="button" aria-label="Close dialog" onClick={() => setSelectedTrust(null)} disabled={submitting}><X size={18} /></button>
            <p className="eyebrow">VERIFICATION DECISION</p>
            <h2 id="review-title">Review trust</h2>
            <p className="modal-trust-name">{selectedTrust.trustName}</p>
            <dl className="review-details"><div><dt>Trustee</dt><dd>{selectedTrust.trusteeName}</dd></div><div><dt>Current status</dt><dd>{selectedTrust.verificationStatus}</dd></div><div><dt>Contact</dt><dd>{selectedTrust.contactEmail}</dd></div></dl>
            <p className="modal-note">Your decision will be added to the trust status history.</p>
            <div className="modal-actions">
              <button className="button button-outline" type="button" onClick={() => reviewTrust('Rejected')} disabled={submitting}><X size={16} /> Reject</button>
              <button className="button button-primary" type="button" onClick={() => reviewTrust('Verified')} disabled={submitting}><Check size={16} /> {submitting ? 'Saving...' : 'Verify trust'}</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Dashboard;