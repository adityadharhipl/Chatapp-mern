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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-900 transition-colors font-sans">
      <ThemeToggle theme={useChatStore().theme} toggleTheme={useChatStore().toggleTheme} />
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-white text-center mb-6">
          {view === 'login' ? 'Login' : 'Create Account'}
        </h1>
        {error && <div className="mb-4 text-red-500 text-center bg-red-100 dark:bg-red-900/30 py-2 rounded-lg">{error}</div>}
        <form onSubmit={handleAuth} className="space-y-4">
          {view === 'register' && (
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
          )}
          <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white" />
          
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500" />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500">
              {showPassword ? '' : '👁️‍🗨️'}
            </button>
          </div>
          
          {view === 'register' && (
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full pl-4 pr-12 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 dark:text-white outline-none focus:border-indigo-500" />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-indigo-500">
                {showConfirmPassword ? '' : '👁️‍🗨️'}
              </button>
            </div>
          )}
          
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
            {view === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        <div className="mt-6 text-center text-slate-500 dark:text-slate-400">
          <button onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(''); }} className="text-indigo-500 hover:underline">
            {view === 'login' ? 'Create an account' : 'Log in instead'}
          </button>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
