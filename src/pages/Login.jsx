import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-lg font-bold text-gray-900">Splitzy</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h1 className="text-xl font-bold mb-1 text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-5">Log in to manage your expenses.</p>

          {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              {submitting ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-4 text-center">
            No account?{' '}
            <Link to="/signup" className="text-primary-600 font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
