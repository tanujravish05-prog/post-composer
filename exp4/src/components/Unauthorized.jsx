import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="glass-panel max-w-md w-full p-8 rounded-3xl border border-red-500/30 text-center shadow-2xl bg-slate-900/90">
        <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto mb-4 border border-red-500/30">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black text-white">403 - Access Denied</h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          Your current role <span className="text-red-400 font-bold capitalize">"{user?.role || 'Guest'}"</span> does not have authorization to access this page.
        </p>

        <button
          onClick={() => navigate('/dashboard')}
          className="mt-6 btn btn-primary text-xs w-full justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
