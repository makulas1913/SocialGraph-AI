import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  username: string | null;
  onLogout: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ username, onLogout }) => {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans" dir="rtl">
      <Sidebar username={username} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
