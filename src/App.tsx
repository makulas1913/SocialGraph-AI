import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import ContentStudio from './pages/ContentStudio';
import PersonaLab from './pages/PersonaLab';
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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout username={twitterUser} onLogout={logout} onLogin={login} />}>
          <Route index element={<Dashboard />} />
          <Route path="studio" element={<ContentStudio />} />
          <Route path="persona" element={<PersonaLab />} />
          <Route path="inbox" element={<SmartInbox />} />
          <Route path="messages" element={<DirectMessages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
