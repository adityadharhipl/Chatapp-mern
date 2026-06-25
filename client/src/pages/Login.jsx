import React, { useState } from 'react';
import { useChatStore } from '../store/chatStore';
import ThemeToggle from '../components/ThemeToggle';
import { API_URL } from '../services/api';

const Login = () => {
  const { login } = useChatStore();
  const [view, setView] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    if (view === 'register' && password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
      const body = view === 'login' ? { email, password } : { name, email, password, confirmPassword };

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      login(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="min-h-screen w-full flex items-center justify-center bg-[#111111] font-sans p-4 md:p-8 relative">
        <ThemeToggle theme={useChatStore().theme} toggleTheme={useChatStore().toggleTheme} />

        {/* <div className="w-full max-w-5xl bg-white rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row shadow-2xl min-h-[600px] overflow-hidden relative z-10"> */}
        <div className="w-full max-w-6xl bg-white rounded-[2rem] md:rounded-[2.5rem] flex flex-col md:flex-row shadow-2xl overflow-hidden relative z-10">
          {/* Left Side: Form */}
          <div className="w-full md:w-1/2 p-8 md:p-14 lg:p-16 flex flex-col justify-center relative bg-white">
            <div className="max-w-md w-full mx-auto">
              <h1 className="text-[32px] font-bold text-slate-900 mb-3 flex items-center gap-2">
                {view === 'login' ? 'Welcome Back' : 'Create Account'} <span className="text-3xl">👋</span>
              </h1>
              <p className="text-slate-500 mb-8 text-[15px] leading-relaxed pr-4">
                {view === 'login'
                  ? "Today is a new day. It's your day. You shape it. Sign in to start chatting with your friends."
                  : "Today is a new day. It's your day. You shape it. Sign up to start chatting with your friends."}
              </p>

              {error && (
                <div className="mb-6 text-red-500 text-center bg-red-50 border border-red-100 py-3 px-4 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                {view === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 block">Full Name</label>
                    <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 text-[15px]" />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 block">Email</label>
                  <input type="email" placeholder="Example@email.com" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 text-[15px]" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700 block">Password</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required
                      className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 pr-12 text-[15px]" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? '🫣' : '👁️'}
                    </button>
                  </div>
                </div>

                {view === 'register' && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 block">Confirm Password</label>
                    <div className="relative">
                      <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                        className="w-full px-4 py-3.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-400 transition-all placeholder:text-slate-400 pr-12 text-[15px]" />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showConfirmPassword ? '🫣' : '👁️'}
                      </button>
                    </div>
                  </div>
                )}

                {view === 'login' && (
                  <div className="flex justify-end pt-1 pb-1">
                    <a href="#" className="text-sm text-blue-600 hover:underline font-medium">Forgot Password?</a>
                  </div>
                )}

                <button type="submit" className="w-full py-3.5 bg-[#1e293b] hover:bg-[#0f172a] text-white rounded-xl font-medium transition-all text-[15px] shadow-md shadow-slate-200">
                  {view === 'login' ? 'Sign in' : 'Sign up'}
                </button>
              </form>

              {/* <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-slate-400 text-sm font-medium">Or</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="mt-6 space-y-3">
                <button className="w-full py-3 px-4 bg-[#f8fafc] hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[15px] font-medium text-slate-700 transition-colors">
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
                  Sign in with Google
                </button>
                <button className="w-full py-3 px-4 bg-[#f8fafc] hover:bg-slate-100 border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[15px] font-medium text-slate-700 transition-colors">
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" className="w-5 h-5" alt="Facebook" />
                  Sign in with Facebook
                </button>
              </div> */}

              <div className="mt-8 text-center text-[15px] text-slate-500">
                {view === 'login' ? "Don't you have an account?" : "Already have an account?"}
                <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="ml-1.5 text-blue-600 hover:underline font-medium">
                  {view === 'login' ? 'Sign up' : 'Sign in'}
                </button>
              </div>

              <div className="mt-12 text-center text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                Powered by Aditya
              </div>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="hidden md:block md:w-1/2 p-4">
            <img
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"
              alt="Dark Floral"
              className="w-full h-full min-h-[650px] object-cover rounded-[2rem]"
            />
          </div>
          {/* <div className="w-full md:w-1/2 p-4 hidden md:block bg-white">
            <img
              src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=1000&auto=format&fit=crop"
              alt="Dark Floral"
              className="w-full h-full object-cover rounded-[1.5rem]"
            />
          </div> */}
        </div>
      </div>
    </>
  );
};

export default Login;
