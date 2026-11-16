import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_HOME = {
  customer: '/dashboard',
  provider: '/provider/dashboard',
  admin: '/admin',
};

const OAuthCallbackPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login?error=oauth', { replace: true });
      return;
    }
    navigate(ROLE_HOME[user.role] || '/', { replace: true });
  }, [loading, navigate, user]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-gray-600" role="status">Completing sign-in…</p>
    </div>
  );
};

export default OAuthCallbackPage;
