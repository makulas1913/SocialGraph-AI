import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import ContentStudio from './pages/ContentStudio';
import { SmartInbox } from './pages/SmartInbox';
import { DirectMessages } from './pages/DirectMessages';
import { Settings } from './pages/Settings';
import { useAuth } from './hooks/useAuth';
import { Twitter } from 'lucide-react';

export default function App() {
  const { twitterUser, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!twitterUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans" dir="rtl">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Twitter size={40} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 mb-3">مرحباً بك في X Agent</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            المساعد الذكي الأول لإدارة حسابك على منصة X. قم بربط حسابك للبدء في توليد المحتوى والردود الذكية.
          </p>
          <button
            onClick={login}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
          >
            <Twitter size={20} />
            <span>ربط حساب X</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout username={twitterUser} onLogout={logout} />}>
          <Route index element={<Dashboard />} />
          <Route path="studio" element={<ContentStudio />} />
          <Route path="inbox" element={<SmartInbox />} />
          <Route path="messages" element={<DirectMessages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
