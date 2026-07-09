import React, { useState } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { api } from '../services/api.js';
import { Mail, Lock, User, Sparkles } from 'lucide-react';

interface LoginProps {
  showToast: (text: string, type: 'success' | 'warning' | 'error') => void;
}

export const Login: React.FC<LoginProps> = ({ showToast }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginAction = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      showToast('Please fill out all fields.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        const data = await api.login(email, password);
        await loginAction(data.token, data.user);
        showToast(`Welcome back, ${data.user.name}!`, 'success');
      } else {
        const data = await api.register(name, email, password);
        await loginAction(data.token, data.user);
        showToast('Account registered successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col justify-between bg-slate-50 p-6 overflow-y-auto">
      {/* Top Graphic Header */}
      <div className="flex flex-col items-center text-center mt-4">
        <div className="w-12 h-12 bg-gradient-to-tr from-sky-400 to-sky-600 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-100 mb-3.5">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800">GigCraft AI</h1>
        <p className="text-xs text-slate-500 mt-1">Transform your skills into high-converting Fiverr gigs</p>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm my-6 flex-1 flex flex-col justify-center">
        <h2 className="text-sm font-semibold text-slate-700 mb-4 text-center">
          {isLogin ? 'Sign In to Your Account' : 'Create Free Account'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-sky-100 transition duration-150 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>

      {/* Switch Toggles */}
      <div className="text-center pb-2">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setEmail('');
            setPassword('');
            setName('');
          }}
          className="text-xs text-sky-600 hover:text-sky-700 font-medium transition"
        >
          {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
        </button>
      </div>
    </div>
  );
};
