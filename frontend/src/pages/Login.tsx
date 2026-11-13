import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/axios';
import { Eye, EyeOff, UtensilsCrossed, Sparkles, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleQuickFill = (role: 'student' | 'admin') => {
    if (role === 'student') {
      setEmail('student@smartmess.com');
      setPassword('student123');
    } else {
      setEmail('admin@smartmess.com');
      setPassword('admin123');
    }
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      if (response.data.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      // If server is unreachable and credentials match demo, provide fallback
      if (err.code === 'ERR_NETWORK' || !err.response) {
        if (email === 'student@smartmess.com' && password === 'student123') {
          login('demo-token', { id: 'demo-student', name: 'Demo Student', email, role: 'STUDENT', rollNumber: 'DEMO001' });
          navigate('/student/dashboard');
          return;
        }
        if (email === 'admin@smartmess.com' && password === 'admin123') {
          login('demo-token', { id: 'demo-admin', name: 'Admin User', email, role: 'ADMIN' });
          navigate('/admin/dashboard');
          return;
        }
      }
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-stone-50 font-sans">
      {/* Left side hero banner with food background image */}
      <div className="hidden lg:flex lg:w-1/2 p-6 xl:p-7">
        <div className="relative w-full h-full bg-stone-900 text-white flex flex-col justify-between p-10 xl:p-12 overflow-hidden rounded-3xl shadow-xl border border-stone-800/40">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-60 scale-105 transition-transform duration-1000"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1600&q=80')"
            }}
          />
          {/* Dark warm gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/95 via-stone-950/65 to-stone-900/45" />

          {/* Top Branding */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-display font-bold tracking-tight text-white flex items-center gap-1.5">
                Smart<span className="text-amber-400">Mess</span>
              </span>
              <span className="text-xs uppercase tracking-widest text-amber-200/80 font-medium block">
                College Mess Management
              </span>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-400/30 text-amber-300 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Nourishing Campus Life Everyday</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-display font-bold leading-tight tracking-tight text-stone-100">
              <span className="block">Fresh Meals.</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-400">
                Zero Waste.
              </span>
              <span className="block whitespace-nowrap text-stone-100">
                Real Feedback.
              </span>
            </h1>

            <p className="text-stone-300 text-base leading-relaxed font-normal">
              SmartMess connects college students and mess administration for daily meal schedules, quick attendance verification, and food quality improvement.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {[
                'Live Menu & Timings',
                'One-Tap Attendance',
                'Food Ratings & Reviews',
                'Transparent Feedback'
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-stone-300 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 backdrop-blur-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Footer info */}
          <div className="relative z-10 text-xs text-stone-400 flex items-center justify-between border-t border-white/10 pt-6">
            <span>College Minor Project</span>
            <span className="text-stone-300 font-medium">React • Express • PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 bg-stone-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-stone-200/50 p-8 sm:p-10 border border-stone-200/80">

          {/* Mobile branding header */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6 pb-6 border-b border-stone-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-500/20 text-white">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-display font-bold text-stone-900">
                Smart<span className="text-orange-600">Mess</span>
              </span>
              <span className="text-[10px] tracking-wide text-stone-500 block uppercase">College Mess Portal</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 tracking-tight">
              Welcome Back 👋
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Sign in to view today's menu, mark attendance and share your feedback.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 border border-red-200 flex items-start gap-2.5 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm bg-stone-50/50 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400"
                placeholder="e.g. student@smartmess.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm bg-stone-50/50 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 pr-11"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium py-3 px-4 rounded-xl shadow-md shadow-orange-500/25 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to SmartMess</span>
              )}
            </button>

            <p className="text-center text-xs text-stone-400 mt-3 flex items-center justify-center gap-1.5 font-normal select-none">
              <span>🔒 Your information is securely protected.</span>
            </p>
          </form>

          {/* Demo Credentials Box with One-Click Fill */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Demo Accounts (Click to Fill)
              </span>
              <span className="text-[11px] text-amber-700 font-medium bg-amber-100/70 px-2 py-0.5 rounded-full">
                For Viva & Testing
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                className="group p-3 rounded-xl border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-300 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                    Student
                  </span>
                  <span className="text-[10px] text-orange-700 group-hover:underline">Use</span>
                </div>
                <p className="text-[11px] text-stone-600 truncate">student@smartmess.com</p>
                <p className="text-[10px] font-mono text-stone-500 mt-0.5">student123</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="group p-3 rounded-xl border border-amber-200/80 bg-amber-50/70 hover:bg-amber-100/70 hover:border-amber-300 text-left transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-orange-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                    Admin
                  </span>
                  <span className="text-[10px] text-orange-700 group-hover:underline">Use</span>
                </div>
                <p className="text-[11px] text-stone-600 truncate">admin@smartmess.com</p>
                <p className="text-[10px] font-mono text-stone-500 mt-0.5">admin123</p>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
