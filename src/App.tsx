import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { useNavigationStore } from './stores/useNavigationStore';
import { Dashboard } from './pages/Dashboard';
import PersonaLab from './pages/PersonaLab';
import ContentStudio from './pages/ContentStudio';
import { SmartInbox } from './pages/SmartInbox';
import { DirectMessages } from './pages/DirectMessages';
import { History } from './pages/History';
import { Settings } from './pages/Settings';
import { Toaster } from 'sonner';
import { auth, db } from './lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function App() {
  const { activeModule } = useNavigationStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Save user to firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error("Error saving user to Firestore:", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard />;
      case 'persona':
        return <PersonaLab />;
      case 'content':
        return <ContentStudio />;
      case 'inbox':
        return <SmartInbox />;
      case 'dms':
        return <DirectMessages />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <MainLayout 
        username={user?.displayName || user?.email?.split('@')[0] || null} 
        onLogin={handleLogin} 
        onLogout={handleLogout}
      >
        {renderModule()}
      </MainLayout>
      <Toaster position="top-center" richColors />
    </div>
  );
}
