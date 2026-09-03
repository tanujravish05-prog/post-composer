import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Key, ShieldCheck, UserCheck, Eye, Terminal } from 'lucide-react';
import { ConsoleLog } from './ConsoleLog';

const Login = () => {
  const navigate = useNavigate();
  const { login, storageStrategy, setStorageStrategy } = useAuth();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = async (userType) => {
    setError('');
    let un = 'admin';
    if (userType === 'editor') un = 'editor';
    if (userType === 'viewer') un = 'viewer';
    
    setUsername(un);
    setPassword('password123');

    try {
      await login(un, 'password123');
      navigate('/dashboard');
    } catch (err) {
      setError('Quick login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4 text-zinc-900 relative">
      <div className="glass-panel w-full max-w-md p-8 rounded-2xl border border-zinc-200 bg-white shadow-lg animate-fade-in relative z-10">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center mx-auto mb-3 text-white shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 tracking-tight">PostPulse Suite</h2>
          <p className="text-xs text-zinc-500 mt-1">Exp 2 Clean Look + Exp 4 Features & Redux</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Username</label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username (e.g. admin)"
                className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                data-testid="input-username"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white border border-zinc-200 rounded-lg pl-9 pr-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900"
                data-testid="input-password"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">Token Storage Location</label>
            <select
              value={storageStrategy}
              onChange={(e) => setStorageStrategy(e.target.value)}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900"
            >
              <option value="localStorage">localStorage (Persists browser restart)</option>
              <option value="sessionStorage">sessionStorage (Cleared on tab close)</option>
              <option value="memory">Memory State (Highest Security)</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary text-xs w-full justify-center py-2.5 mt-2" data-testid="login-submit-btn">
            Sign In to Dashboard
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-zinc-200">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 text-center mb-3">
            Quick Role Demo Sign In
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
              data-testid="quick-login-admin"
            >
              <ShieldCheck className="w-4 h-4 text-zinc-700" />
              Admin
            </button>
            <button
              onClick={() => handleQuickLogin('editor')}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
              data-testid="quick-login-editor"
            >
              <UserCheck className="w-4 h-4 text-zinc-700" />
              Editor
            </button>
            <button
              onClick={() => handleQuickLogin('viewer')}
              className="p-2 rounded-lg bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-zinc-800 text-[11px] font-bold flex flex-col items-center gap-1 transition-all"
              data-testid="quick-login-viewer"
            >
              <Eye className="w-4 h-4 text-zinc-700" />
              Viewer
            </button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsConsoleOpen(true)}
            className="text-xs text-zinc-600 hover:text-zinc-900 font-semibold inline-flex items-center gap-1.5"
          >
            <Terminal className="w-3.5 h-3.5" />
            Open Security & Axios Audit HUD
          </button>
        </div>
      </div>

      <ConsoleLog isOpen={isConsoleOpen} onClose={() => setIsConsoleOpen(false)} />
    </div>
  );
};

export default Login;
