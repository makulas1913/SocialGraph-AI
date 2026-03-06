import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, PenTool, Inbox, MessageSquare, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  username: string | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ username, onLogout }) => {
  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'لوحة التحكم' },
    { to: '/studio', icon: <PenTool size={20} />, label: 'استوديو المحتوى' },
    { to: '/inbox', icon: <Inbox size={20} />, label: 'صندوق الردود' },
    { to: '/messages', icon: <MessageSquare size={20} />, label: 'الرسائل الخاصة' },
    { to: '/settings', icon: <Settings size={20} />, label: 'الإعدادات' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-l border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">X</span> Agent
        </h1>
        {username && (
          <p className="text-sm text-slate-400 mt-2">@{username}</p>
        )}
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-medium'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-right rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};
