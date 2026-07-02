import React, { useState } from 'react';
import { api } from '../api';

export default function SignUp({ setTab }) {
  const [fullName, setFullName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [mobile, setMobile] = useState('+1 (555) 000-0000');
  const [password, setPassword] = useState('password123');
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!agree) {
      setError('You must agree to the Terms and Conditions');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.sendOtp(email);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.signup(email, password, fullName, otp);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.dispatchEvent(new Event('authChange'));
      setTab('PREVIOUS');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col font-body-md text-on-surface bg-[#f5f5f5]/30">
      <main className="flex-grow flex items-center justify-center p-6 min-h-[calc(100vh-8rem)]">
        <div className="w-full max-w-[440px] bg-white border border-border-subtle rounded-md p-8 md:p-10 shadow-sm">
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center mb-6">
            <img 
              alt="Stock Island Logo" 
              className="h-6 w-auto object-contain mb-3"
              src="/Stock_Island.svg"
            />
            <h1 className="text-xl font-bold text-primary tracking-tight">Stock Island</h1>
            <p className="text-xs text-on-surface-variant/80 mt-1.5 font-medium">Create your trading account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-sm text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={step === 1 ? handleSendOtp : handleVerifyOtp} className="space-y-4">
            {step === 1 ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="fullname">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullname"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="email">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="mobile">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                    placeholder="+1 (555) 000-0000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="password">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all"
                    placeholder="Password"
                    required
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2 py-1 select-none">
                  <input 
                    type="checkbox" 
                    id="agree" 
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                    className="rounded-sm border-border-subtle bg-surface-container-low text-primary focus:ring-primary w-3.5 h-3.5"
                  />
                  <label htmlFor="agree" className="text-[11px] text-on-surface-variant/90 font-medium">
                    I agree to the <a href="#" className="text-primary hover:underline">Terms and Conditions</a>
                  </label>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5" htmlFor="otp">
                  Enter OTP
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-border-subtle rounded-sm text-xs text-on-surface placeholder-outline outline-none focus:border-primary transition-all text-center tracking-widest text-lg"
                  placeholder="------"
                  maxLength={6}
                  required
                />
                <p className="text-[11px] text-on-surface-variant mt-3 text-center">
                  OTP sent to <span className="font-semibold">{email}</span>
                </p>
                <button 
                  type="button" 
                  onClick={() => setStep(1)} 
                  className="w-full text-center text-[11px] text-primary hover:underline mt-2"
                >
                  Change Email
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-primary hover:bg-[#2d76c8] disabled:bg-primary/50 text-white font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm mt-4"
            >
              {loading ? 'Processing...' : (step === 1 ? 'Send OTP' : 'Verify & Register')}
              <span className="material-symbols-outlined text-[15px] font-bold">arrow_forward</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-xs text-on-surface-variant/90">
              Already have an account?{' '}
              <button 
                onClick={() => setTab('login')} 
                className="text-primary font-bold hover:underline"
              >
                Login
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
