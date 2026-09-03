import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedPlatform, setActiveNavTab } from '../../store/calendarSlice';
import { 
  BarChart2, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Twitter 
} from 'lucide-react';

export const Sidebar = () => {
  const dispatch = useDispatch();
  const selectedPlatform = useSelector((state) => state.calendar.selectedPlatform);
  const activeNavTab = useSelector((state) => state.calendar.activeNavTab);

  const platforms = [
    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600' },
    { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-700' },
    { id: 'twitter', label: 'Twitter', icon: Twitter, color: 'text-slate-700' },
  ];

  return (
    <aside className="w-56 bg-white border-r border-slate-200 flex flex-col justify-between p-5 min-h-screen">
      <div>
        {/* Top Menu Item: Analytics */}
        <button
          onClick={() => {
            dispatch(setActiveNavTab('analytics'));
            dispatch(setSelectedPlatform('all'));
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
            activeNavTab === 'analytics'
              ? 'bg-slate-100 text-slate-900'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <BarChart2 className="w-5 h-5 text-slate-500" />
          <span>Analytics</span>
        </button>

        {/* Category Header: PLATFORMS */}
        <div className="mt-8 mb-3 px-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            PLATFORMS
          </span>
        </div>

        {/* Platform Selection Items */}
        <div className="flex flex-col gap-1">
          <button
            onClick={() => {
              dispatch(setActiveNavTab('calendar'));
              dispatch(setSelectedPlatform('all'));
            }}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              selectedPlatform === 'all' && activeNavTab === 'calendar'
                ? 'bg-indigo-50 text-indigo-700 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span className="w-5 text-center font-bold text-slate-400">🌐</span>
            <span>All Channels</span>
          </button>

          {platforms.map((p) => {
            const Icon = p.icon;
            const isSelected = selectedPlatform === p.id && activeNavTab === 'calendar';

            return (
              <button
                key={p.id}
                onClick={() => {
                  dispatch(setActiveNavTab('calendar'));
                  dispatch(setSelectedPlatform(p.id));
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isSelected
                    ? 'bg-indigo-50 text-indigo-700 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${p.color}`} />
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile Section matching screenshot */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
          SK
        </div>
        <div>
          <h4 className="text-sm font-extrabold text-slate-900 leading-tight">Sukhraj</h4>
          <p className="text-xs text-slate-400 font-medium">Content Manager</p>
        </div>
      </div>
    </aside>
  );
};
