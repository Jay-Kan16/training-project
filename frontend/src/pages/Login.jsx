import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden page-enter items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-2xl font-black tracking-tight text-white">Splitzy</span>
        </div>

        <div className="bg-surface-card/90 backdrop-blur-xl p-5 sm:p-7 rounded-3xl border border-white/10 shadow-xl shadow-black/40">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 text-white">Welcome back</h1>
          <p className="text-xs sm:text-sm text-slate-400 mb-5">Log in to manage your expenses.</p>

          {error && <p className="text-xs sm:text-sm text-rose-400 mb-3">{error}</p>}

          <GoogleAuthButton text="signin_with" onError={(msg) => setError(msg)} />

          <div className="relative my-4 flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-surface-card px-2 text-xs text-slate-500 uppercase tracking-wider absolute">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/10 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-surface-card text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-white/10 rounded-xl px-3.5 py-3 sm:py-2.5 text-base sm:text-sm bg-surface-card text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white font-bold text-sm sm:text-base py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              {submitting ? 'Logging in...' : 'Log in with Email'}
            </button>
          </form>

          <p className="text-xs sm:text-sm text-slate-400 mt-4 text-center">
            No account?{' '}
            <Link to="/signup" className="text-primary-300 font-semibold hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
