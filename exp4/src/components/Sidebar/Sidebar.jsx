import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveNavTab } from '../../store/calendarSlice';
import { 
  Calendar as CalendarIcon, 
  Layers, 
  BarChart3, 
  Users, 
  Settings, 
  ChevronDown,
  Sparkles,
  Zap,
  Radio
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const activeNavTab = useSelector((state) => state.calendar.activeNavTab);
  const postsCount = useSelector((state) => state.posts.posts.length);

  const navItems = [
    { id: 'calendar', label: 'Scheduler', icon: CalendarIcon },
    { id: 'queue', label: 'Content Queue', icon: Layers, badge: postsCount },
    { id: 'analytics', label: 'Performance', icon: BarChart3 },
    { id: 'accounts', label: 'Social Accounts', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 glass-panel border-r border-slate-800 bg-slate-950/90 flex flex-col justify-between p-4 hidden md:flex min-h-screen">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800/80">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/25">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1">
              PostPulse <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">PRO</span>
            </h1>
            <p className="text-[11px] text-slate-400">Social Content Suite</p>
          </div>
        </div>

        {/* Workspace Dropdown */}
        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 mb-6 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
              AC
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">Acme Media</p>
              <p className="text-[10px] text-slate-400">Global Brand Workspace</p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Navigation Section */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-1">
            Menu
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => dispatch(setActiveNavTab(item.id))}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                    isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer User Profile & Upgrade Box */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900 p-3 rounded-xl border border-indigo-500/20 text-xs">
          <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Scheduler Active</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Optimal engagement hours automatically mapped for X & Instagram.
          </p>
        </div>

        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900/60 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow">
            TR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">Tanuj Ravish</p>
            <p className="text-[10px] text-slate-400 truncate">Content Operations Director</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
