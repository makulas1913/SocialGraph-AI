import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Loader2, Send, Sparkles, Check, Twitter } from 'lucide-react';
import { generateReply } from '../services/gemini';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface DMEvent {
  id: string;
  text: string;
  created_at: string;
  sender_id: string;
  sender?: {
    name: string;
    username: string;
    profile_image_url: string;
  };
}

export const DirectMessages: React.FC = () => {
  const { username, onLogin } = useOutletContext<{ username: string | null, onLogin: () => void }>();
  
  const [dms, setDms] = useState<DMEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDm, setSelectedDm] = useState<DMEvent | null>(null);
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchDms = async () => {
    if (!username) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/twitter/dms');
      
      if (res.status === 401) {
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Map senders to DMs
        const users = data.includes?.users || [];
        const enrichedDms = data.data.map((dm: any) => {
          const sender = users.find((u: any) => u.id === dm.sender_id);
          return { ...dm, sender };
        });
        setDms(enrichedDms);
      } else {
        setError(data.error || 'فشل في جلب الرسائل الخاصة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchDms();
    }
  }, [username]);

  if (!username) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center font-cairo"
      >
        <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500 rounded-full flex items-center justify-center mb-6">
          <Twitter size={40} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">الرسائل الخاصة</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          قم بربط حساب X الخاص بك للوصول إلى رسائلك الخاصة والرد عليها بذكاء وسرعة باستخدام الذكاء الاصطناعي.
        </p>
        <button
          onClick={onLogin}
          className="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
        >
          <Twitter size={20} />
          ربط حساب X
        </button>
      </motion.div>
    );
  }

  const handleGenerateReply = async (dm: DMEvent) => {
    setSelectedDm(dm);
    setIsGenerating(true);
    setReplyText('');
    setSuccessMessage(null);
    
    try {
      const prompt = `قم بالرد على هذه الرسالة الخاصة من @${dm.sender?.username}:\n"${dm.text}"`;
      const generated = await generateReply(prompt, 'احترافي وودي');
      setReplyText(generated);
    } catch (err) {
      console.error(err);
      setError('فشل في توليد الرد');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedDm || !replyText) return;
    
    setIsSending(true);
    setError(null);
    try {
      const res = await fetch('/api/twitter/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId: selectedDm.sender_id,
          text: replyText
        })
      });
      
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('تم إرسال الرسالة بنجاح!');
        setTimeout(() => {
          setSuccessMessage(null);
          setSelectedDm(null);
          setReplyText('');
        }, 3000);
      } else {
        setError(data.error || 'فشل في إرسال الرسالة');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الرسالة');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MessageSquare className="text-blue-500 w-6 h-6 md:w-8 md:h-8" />
            الرسائل الخاصة
          </h1>
          <p className="text-slate-500 mt-2 text-sm md:text-base">قراءة والرد على الرسائل الخاصة (DMs) باستخدام الذكاء الاصطناعي</p>
        </div>
        <button 
          onClick={fetchDms}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 w-full md:w-auto"
        >
          <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          تحديث
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100 flex items-center gap-2">
          <Check size={18} />
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* DMs List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">أحدث الرسائل ({dms.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && dms.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : dms.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                <MessageSquare size={48} className="mb-4 opacity-20" />
                <p>لا توجد رسائل جديدة حالياً.</p>
              </div>
            ) : (
              dms.map((dm) => (
                <div 
                  key={dm.id}
                  onClick={() => handleGenerateReply(dm)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors border ${
                    selectedDm?.id === dm.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {dm.sender?.profile_image_url ? (
                      <img src={dm.sender.profile_image_url} alt={dm.sender.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {dm.sender?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-900">{dm.sender?.name}</span>
                        <span className="text-xs text-slate-500">@{dm.sender?.username}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2">{dm.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Composer */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
          {selectedDm ? (
            <div className="flex flex-col h-full">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-900">{selectedDm.sender?.name}</span>
                  <span className="text-sm text-slate-500">@{selectedDm.sender?.username}</span>
                </div>
                <p className="text-slate-800">{selectedDm.text}</p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-500" />
                    الرد المقترح
                  </label>
                  <button 
                    onClick={() => handleGenerateReply(selectedDm)}
                    disabled={isGenerating}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                    إعادة توليد
                  </button>
                </div>
                
                {isGenerating ? (
                  <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-500" />
                    <p>جاري توليد الرد الذكي...</p>
                  </div>
                ) : (
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 w-full p-4 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 outline-none transition-all resize-none bg-white text-slate-800 leading-relaxed"
                    placeholder="سيظهر الرد المقترح هنا. يمكنك تعديله قبل الإرسال..."
                  />
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleSendReply}
                  disabled={!replyText || isSending || isGenerating}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span>إرسال الرسالة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">اختر رسالة للرد عليها</h3>
              <p className="max-w-sm">قم باختيار إحدى الرسائل من القائمة الجانبية ليقوم الذكاء الاصطناعي باقتراح رد مناسب لها.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
