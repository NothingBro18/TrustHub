import { useState } from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const Register = () => {
  const { register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Use a password with at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create your account. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-screen">
      <section className="login-panel" aria-labelledby="register-title">
        <Link className="auth-brand" to="/"><span className="brand-mark"><ShieldCheck size={19} strokeWidth={2.2} /></span><span>Trust<span>Hub</span></span></Link>
        <p className="eyebrow">TRUSTHUB / CREATE ACCOUNT</p>
        <h1 id="register-title">Start your workspace.</h1>
        <p className="login-copy">Create an account to manage your trust records.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required />
          <label htmlFor="register-email">Email address</label>
          <input id="register-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="register-password">Password</label>
          <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required />
          <label htmlFor="confirm-password">Confirm password</label>
          <input id="confirm-password" name="confirmPassword" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary login-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating account...' : 'Create account'} <ArrowRight size={17} />
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        <p className="login-footnote">Your password is securely hashed before storage.</p>
      </section>
      <aside className="login-aside" aria-hidden="true">
        <div className="aside-grid" />
        <p className="aside-kicker">LOCAL SKILLS. REAL PEOPLE.</p>
        <p className="aside-number">Find good help.<br /><span>Right around the corner.</span></p>
      </aside>
    </main>
  );
};

export default Register;