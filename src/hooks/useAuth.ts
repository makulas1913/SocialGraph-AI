import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [twitterUser, setTwitterUser] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkTwitterAuth();

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'TWITTER_AUTH_SUCCESS') {
        setTwitterUser(event.data.username);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const checkTwitterAuth = async () => {
    try {
      const res = await fetch('/api/auth/twitter/status');
      const data = await res.json();
      if (data.authenticated) {
        setTwitterUser(data.username);
      }
    } catch (err) {
      console.error("Failed to check Twitter auth status", err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      const res = await fetch('/api/auth/twitter/url');
      const data = await res.json();
      if (data.url) {
        window.open(data.url, 'twitter_oauth', 'width=600,height=700');
      } else {
        alert("فشل في الحصول على رابط المصادقة. تأكد من إعداد مفاتيح X.");
      }
    } catch (err) {
      console.error("Failed to get Twitter auth URL", err);
      alert("حدث خطأ أثناء محاولة الاتصال بـ X.");
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/twitter/logout', { method: 'POST' });
      setTwitterUser(null);
    } catch (err) {
      console.error("Failed to logout from Twitter", err);
    }
  };

  return { twitterUser, isLoading, login, logout };
};
