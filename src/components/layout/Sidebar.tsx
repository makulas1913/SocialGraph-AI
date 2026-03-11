import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PenTool, Inbox, MessageSquare, Settings, LogOut, Brain, Twitter } from 'lucide-react';

interface SidebarProps {
  username: string | null;
  onLogout: () => void;
  onLogin: () => void;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ username, onLogout, onLogin, onClose }) => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
    { to: '/studio', icon: <PenTool size={20} />, label: 'استوديو المحتوى' },
    { to: '/persona', icon: <Brain size={20} />, label: 'مختبر الشخصية' },
    { to: '/inbox', icon: <Inbox size={20} />, label: 'صندوق الردود' },
    { to: '/messages', icon: <MessageSquare size={20} />, label: 'الرسائل الخاصة' },
    { to: '/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  return (
    <div className="w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md text-slate-700 dark:text-slate-300 flex flex-col h-screen border-l border-emerald-100 dark:border-emerald-900/50 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6 border-b border-emerald-100 dark:border-emerald-900/50">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="text-emerald-500">X</span> Agent
        </h1>
        {username ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">@{username}</p>
        ) : (
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">غير متصل</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-l from-emerald-500/10 to-emerald-600/5 text-emerald-600 dark:text-emerald-400 font-medium shadow-sm border border-emerald-200/50 dark:border-emerald-800/50'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-emerald-100 dark:border-emerald-900/50">
        {username ? (
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-right rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={20} />
            <span>تسجيل الخروج</span>
          </button>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-3 px-4 py-3 w-full text-right rounded-xl text-white bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
          >
            <Twitter size={20} />
            <span>ربط حساب X</span>
          </button>
        )}
      </div>
    </div>
  );
};
