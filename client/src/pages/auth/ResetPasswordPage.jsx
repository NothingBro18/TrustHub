import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { ArrowLeft, Shield } from 'lucide-react';
import { authService } from '../../services';

const resetSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters').max(50, 'Password is too long'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetSchema) });

  const onSubmit = async ({ password }) => {
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      toast.success('Password reset. Sign in with your new password.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 p-4">
      <section className="w-full max-w-md space-y-6 rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600"><Shield className="h-5 w-5 text-white" /></div>
          <span className="text-xl font-bold text-gray-900">TrustHub</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Set a new password</h1>
          <p className="mt-1 text-sm text-gray-500">Choose a password with at least six characters.</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            New password
            <input {...register('password')} type="password" autoComplete="new-password" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            {errors.password && <span className="text-xs text-red-600">{errors.password.message}</span>}
          </label>
          <label className="block space-y-1 text-sm font-medium text-gray-700">
            Confirm password
            <input {...register('confirmPassword')} type="password" autoComplete="new-password" className="w-full rounded-lg border border-gray-200 px-3 py-2" />
            {errors.confirmPassword && <span className="text-xs text-red-600">{errors.confirmPassword.message}</span>}
          </label>
          <button disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? 'Updating…' : 'Reset password'}</button>
        </form>
        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"><ArrowLeft size={16} /> Back to login</Link>
      </section>
    </main>
  );
};

export default ResetPasswordPage;
