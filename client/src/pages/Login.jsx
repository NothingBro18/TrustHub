import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Login = () => {
  const { login, guestLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [guestSubmitting, setGuestSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in. Check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setGuestSubmitting(true);
    try {
      await guestLogin();
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Guest access is currently unavailable.');
    } finally {
      setGuestSubmitting(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-panel" aria-labelledby="login-title">
        <Link className="auth-brand" to="/"><span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.2} /></span><span>Trust<span>Hub</span></span></Link>
        <p className="eyebrow">TRUSTHUB / SECURE ACCESS</p>
        <h1 id="login-title">Welcome back.</h1>
        <p className="login-copy">Sign in to continue to your trust workspace.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'} <ArrowRight size={17} />
          </button>
        </form>
        <div className="login-divider"><span>OR</span></div>
        <button className="button button-guest login-submit" type="button" onClick={handleGuestLogin} disabled={submitting || guestSubmitting}>
          {guestSubmitting ? 'Opening sample workspace...' : 'Continue as guest'}
        </button>
        <p className="guest-note">Explore sample records in read-only mode.</p>
        <p className="auth-switch">New to TrustHub? <Link to="/register">Create an account</Link></p>
        <p className="login-footnote">Your workspace is protected with encrypted authentication.</p>
      </section>
      <aside className="login-aside" aria-hidden="true">
        <div className="aside-grid" />
        <p className="aside-kicker">LOCAL SKILLS. REAL PEOPLE.</p>
        <p className="aside-number">Find good help.<br /><span>Right around the corner.</span></p>
      </aside>
    </main>
  );
};

export default Login;