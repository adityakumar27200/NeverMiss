import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Phone,
  Lock,
  User,
  Eye,
  EyeOff,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Sparkles,
  KeyRound,
  Smartphone,
} from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+1', name: 'US / Canada' },
  { code: '+91', name: 'India' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+61', name: 'Australia' },
  { code: '+49', name: 'Germany' },
  { code: '+33', name: 'France' },
  { code: '+81', name: 'Japan' },
  { code: '+971', name: 'UAE' },
  { code: '+65', name: 'Singapore' },
];

export const LoginView: React.FC = () => {
  const { loginWithPhone, registerWithPhone, resetPasswordWithPhone, users } = useApp();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Forgot password OTP simulation state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [simulatedReceivedOtp, setSimulatedReceivedOtp] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const res = loginWithPhone(countryCode, phone, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    const res = registerWithPhone(fullName, countryCode, phone, password);
    if (!res.success) {
      setErrorMessage(res.error || 'Registration failed.');
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length < 5) {
      setErrorMessage('Please enter a valid registered phone number.');
      return;
    }

    const random4Digit = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedReceivedOtp(random4Digit);
    setOtpSent(true);
    setErrorMessage(null);
    setSuccessMessage(`SMS verification code ${random4Digit} sent to ${countryCode} ${phone}`);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== simulatedReceivedOtp) {
      setErrorMessage('Invalid verification code. Please check SMS code.');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('New password must be at least 4 characters.');
      return;
    }

    const res = resetPasswordWithPhone(countryCode, phone, password);
    if (res.success) {
      setMode('login');
      setSuccessMessage('Password reset successfully! You can now log in.');
      setOtpSent(false);
      setOtpCode('');
    } else {
      setErrorMessage(res.error || 'Failed to reset password.');
    }
  };

  const handleQuickDemoLogin = (uCountry: string, uPhone: string, uPass: string) => {
    setCountryCode(uCountry);
    setPhone(uPhone);
    setPassword(uPass);
    loginWithPhone(uCountry, uPhone, uPass);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Background radial gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 shadow-xl shadow-indigo-600/30 mb-2">
            <Clock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Chronos Productivity Suite
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in with your phone number to access your tasks, routines, and deadlines.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Messages */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Phone Number
                </label>
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 focus-within:border-indigo-500 overflow-hidden transition">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-slate-800/90 text-slate-200 text-xs px-2.5 py-3 border-r border-slate-700 focus:outline-none cursor-pointer"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center flex-1 px-3">
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210 or 555-0199"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 focus-within:border-indigo-500 px-3 py-2.5 transition">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Sign In via Phone</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Don&apos;t have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  Create an Account
                </button>
              </div>
            </form>
          )}

          {/* REGISTRATION FORM */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Aditya Kumar, Alex Vance"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Phone Number
                </label>
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                  <select
                    value={countryCode}
                    onChange={e => setCountryCode(e.target.value)}
                    className="bg-slate-800 text-slate-200 text-xs px-2.5 py-2.5 border-r border-slate-700 focus:outline-none"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.name})
                      </option>
                    ))}
                  </select>

                  <div className="flex items-center flex-1 px-3">
                    <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Create Password
                </label>
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-200 p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Confirm Password
                </label>
                <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 px-3 py-2.5">
                  <Lock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Register with Phone Number</span>
                <CheckCircle className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">
                  Already registered?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="text-xs text-slate-300 leading-relaxed">
                    Enter your registered mobile phone number to receive a temporary verification code.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number
                    </label>
                    <div className="flex items-center rounded-xl bg-slate-800 border border-slate-700 overflow-hidden">
                      <select
                        value={countryCode}
                        onChange={e => setCountryCode(e.target.value)}
                        className="bg-slate-800 text-slate-200 text-xs px-2.5 py-3 border-r border-slate-700 focus:outline-none"
                      >
                        {COUNTRY_CODES.map(c => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center flex-1 px-3">
                        <Phone className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          placeholder="Your registered phone"
                          className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer flex items-center justify-center space-x-2 shadow-md shadow-indigo-600/20"
                  >
                    <span>Send SMS Verification Code</span>
                    <Smartphone className="w-4 h-4" />
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="text-xs text-slate-400 hover:text-white"
                    >
                      ← Back to Login
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-indigo-300">
                    <span className="font-semibold block text-white mb-0.5">SMS Code Simulated:</span>
                    Enter the 4-digit code: <span className="font-mono font-bold text-cyan-400 text-sm">{simulatedReceivedOtp}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      4-Digit Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={4}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-center font-mono text-lg tracking-widest text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Set New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="New password (min 4 chars)"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition cursor-pointer"
                  >
                    Reset Password & Continue
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Quick Demo Pre-Seeded Accounts Banner */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Quick 1-Click Demo Logins:</span>
              </span>
              <span className="text-[10px] text-slate-500">password: password123</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+91', '9876543210', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-purple-500/30 rounded-xl text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-purple-400 transition flex items-center space-x-1.5">
                    <span>Aditya Kumar</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-purple-500/20 text-purple-300 rounded font-bold">ADMIN</span>
                  </div>
                  <div className="text-[10px] text-pink-300/90 font-medium">
                    👨‍👩‍👧‍👦 Kumar Family (Head)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +91 9876543210
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+91', '9123456789', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-indigo-500/30 rounded-xl text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-400 transition flex items-center space-x-1.5">
                    <span>Priya Kumar</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-bold">USER</span>
                  </div>
                  <div className="text-[10px] text-pink-300/90 font-medium">
                    👨‍👩‍👧‍👦 Kumar Family (Spouse)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +91 9123456789
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+91', '9988776655', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-indigo-500/30 rounded-xl text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-blue-400 transition flex items-center space-x-1.5">
                    <span>Aarav Kumar</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-bold">USER</span>
                  </div>
                  <div className="text-[10px] text-pink-300/90 font-medium">
                    👨‍👩‍👧‍👦 Kumar Family (Son)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +91 9988776655
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('+1', '5550199', 'password123')}
                className="p-2.5 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl text-left transition cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <div className="font-semibold text-slate-200 group-hover:text-teal-400 transition flex items-center space-x-1.5">
                    <span>Alex Vance</span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded font-bold">USER</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    👨‍👩‍👧‍👦 Vance Family (Isolated)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    +1 555-0199
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Encrypted phone authentication • Local persistent session token</span>
        </div>
      </div>
    </div>
  );
};
