import React, { useState } from 'react';
import { api } from '../api';

export default function ForgotPassword({ setTab }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.forgotPasswordOtp(email);
      setStep(2);
      setMessage('OTP has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await api.resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully. Redirecting to login...');
      setTimeout(() => setTab('login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-body-md text-on-surface bg-[#f5f5f5]/30">
      <main className="flex-grow flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-[440px] bg-white border border-border-subtle rounded-md p-8 md:p-10 shadow-sm">
          <div className="flex flex-col items-center mb-8">
            <h1 className="text-xl font-bold text-on-surface tracking-tight">Forgot Password</h1>
            <p className="text-xs text-on-surface-variant/80 mt-1.5 font-medium">
              {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP and your new password'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-xs font-semibold text-center">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-sm text-xs font-semibold text-center">
              {message}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="email">
                  Registered Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                  placeholder="Enter your email address"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary hover:bg-[#2d76c8] disabled:bg-primary/50 text-white font-bold text-xs rounded-sm transition-colors shadow-sm"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="otp">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                  placeholder="Enter the OTP from your email"
                  required
                  maxLength={6}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="newPassword">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-primary hover:bg-[#2d76c8] disabled:bg-primary/50 text-white font-bold text-xs rounded-sm transition-colors shadow-sm"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => setTab('login')} 
              className="text-xs text-primary font-bold hover:underline"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
