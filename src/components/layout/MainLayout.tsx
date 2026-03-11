import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, X, LayoutDashboard, PenTool, Inbox, MessageSquare, Settings, Brain } from 'lucide-react';

interface MainLayoutProps {
  username: string | null;
  onLogout: () => void;
  onLogin: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ username, onLogout, onLogin }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'الرئيسية' },
    { to: '/studio', icon: <PenTool size={20} />, label: 'الاستوديو' },
    { to: '/persona', icon: <Brain size={20} />, label: 'الشخصية' },
    { to: '/inbox', icon: <Inbox size={20} />, label: 'الردود' },
    { to: '/messages', icon: <MessageSquare size={20} />, label: 'الرسائل' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-cairo" dir="rtl">
      {/* Mobile Header (Glassmorphism) */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-between px-4 border-b border-emerald-100 dark:border-emerald-900/50 shadow-sm">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-emerald-500">X</span> Agent
        </h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container (Desktop) / Dropdown (Mobile) */}
      <div className={`
        fixed md:static inset-y-0 right-0 z-50 transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        md:block
      `}>
        <Sidebar username={username} onLogout={onLogout} onLogin={onLogin} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 pt-16 md:pt-0 pb-20 md:pb-0 w-full">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <Outlet context={{ username, onLogin }} />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-emerald-100 dark:border-emerald-900/50 z-40 flex items-center justify-around px-2 pb-safe">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-500 dark:text-slate-400 hover:text-emerald-500'
              }`
            }
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};
