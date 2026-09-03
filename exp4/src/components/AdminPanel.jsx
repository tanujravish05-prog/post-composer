import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, ArrowLeft, CheckCircle2 } from 'lucide-react';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, storageStrategy } = useAuth();

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-zinc-900 text-white rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-900">Admin Control Center</h1>
              <p className="text-xs text-zinc-500">System Administration & Role Audit</p>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn btn-secondary text-xs">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white">
            <span className="text-xs font-medium text-zinc-500">Active Admin Session</span>
            <h3 className="text-base font-bold text-zinc-900 mt-1">{user?.name}</h3>
            <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 uppercase">
              Role: {user?.role}
            </span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white">
            <span className="text-xs font-medium text-zinc-500">Token Storage Strategy</span>
            <h3 className="text-base font-bold text-zinc-900 mt-1 capitalize">{storageStrategy}</h3>
            <span className="inline-block mt-2 text-[10px] text-zinc-500">Axios Interceptors Active</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-zinc-200 bg-white">
            <span className="text-xs font-medium text-zinc-500">System Authorization</span>
            <h3 className="text-base font-bold text-emerald-600 mt-1">Full Privileges</h3>
            <span className="inline-block mt-2 text-[10px] text-zinc-500">Schedule, Edit, Delete & Manage</span>
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-zinc-200 p-6 bg-white">
          <h3 className="text-sm font-bold text-zinc-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-zinc-700" />
            User Role Directory
          </h3>

          <div className="divide-y divide-zinc-200 text-xs">
            <div className="py-2.5 flex items-center justify-between font-bold text-zinc-500 uppercase tracking-wider text-[10px]">
              <span>User</span>
              <span>Username</span>
              <span>Role</span>
              <span>Permissions</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="font-bold text-zinc-900">Tanuj (Admin)</span>
              <span className="font-mono text-zinc-500">admin</span>
              <span className="px-2 py-0.5 rounded bg-zinc-900 text-white font-bold uppercase text-[10px]">Admin</span>
              <span className="text-emerald-600 flex items-center gap-1 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Full Access</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="font-bold text-zinc-900">Sarah (Editor)</span>
              <span className="font-mono text-zinc-500">editor</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold uppercase text-[10px] border border-zinc-200">Editor</span>
              <span className="text-zinc-700 font-semibold">Schedule & Edit</span>
            </div>

            <div className="py-2.5 flex items-center justify-between">
              <span className="font-bold text-zinc-900">Alex (Viewer)</span>
              <span className="font-mono text-zinc-500">viewer</span>
              <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 font-bold uppercase text-[10px] border border-zinc-200">Viewer</span>
              <span className="text-zinc-500">Read-Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
