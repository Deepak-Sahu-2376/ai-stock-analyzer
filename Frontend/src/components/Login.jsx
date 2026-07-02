import React, { useState } from 'react';
import { api } from '../api';

export default function Login({ setTab }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(userId, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Dispatch custom storage event to update Navbar and others
      window.dispatchEvent(new Event('authChange'));
      setTab('PREVIOUS');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-body-md text-on-surface bg-[#f5f5f5]/30">
      <main className="flex-grow flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-[440px] bg-white border border-border-subtle rounded-md p-8 md:p-10 shadow-sm">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-8">
            <img 
              alt="Stock Island Logo" 
              className="h-6 w-auto object-contain mb-3"
              src="/Stock_Island.svg"
            />
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Stock Island</h1>
            <p className="text-xs text-on-surface-variant/80 mt-1.5 font-medium">Login to your terminal</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="userid">
                User ID
              </label>
              <input
                type="text"
                id="userid"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                placeholder="Enter your User ID"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <span 
                  role="button"
                  onClick={() => setTab('forgot_password')}
                  className="text-[11px] font-semibold text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </span>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-[#2d76c8] disabled:bg-primary/50 text-white font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              {loading ? 'Logging in...' : 'Login'}
              <span className="material-symbols-outlined text-[15px] font-bold">arrow_forward</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-on-surface-variant/90">
              Don't have an account?{' '}
              <button 
                onClick={() => setTab('signup')} 
                className="text-primary font-bold hover:underline"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
