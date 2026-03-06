import React, { useState, useEffect } from 'react';
import { Inbox, MessageCircle, RefreshCw, Loader2, Send, Sparkles, Check } from 'lucide-react';
import { generateReply } from '../services/gemini';

interface Mention {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  author?: {
    name: string;
    username: string;
    profile_image_url: string;
  };
}

export const SmartInbox: React.FC = () => {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMention, setSelectedMention] = useState<Mention | null>(null);
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchMentions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/twitter/mentions');
      
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      
      const data = await res.json();
      
      if (data.success) {
        // Map authors to mentions
        const users = data.includes?.users || [];
        const enrichedMentions = data.data.map((mention: any) => {
          const author = users.find((u: any) => u.id === mention.author_id);
          return { ...mention, author };
        });
        setMentions(enrichedMentions);
      } else {
        setError(data.error || 'فشل في جلب الإشارات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions();
  }, []);

  const handleGenerateReply = async (mention: Mention) => {
    setSelectedMention(mention);
    setIsGenerating(true);
    setReplyText('');
    setSuccessMessage(null);
    
    try {
      const prompt = `قم بالرد على هذه التغريدة من @${mention.author?.username}:\n"${mention.text}"`;
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
    if (!selectedMention || !replyText) return;
    
    setIsSending(true);
    setError(null);
    try {
      const res = await fetch('/api/twitter/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tweetId: selectedMention.id,
          text: replyText
        })
      });
      
      if (res.status === 401) {
        window.location.reload();
        return;
      }
      
      const data = await res.json();
      if (data.success) {
        setSuccessMessage('تم إرسال الرد بنجاح!');
        setTimeout(() => {
          setSuccessMessage(null);
          setSelectedMention(null);
          setReplyText('');
        }, 3000);
      } else {
        setError(data.error || 'فشل في إرسال الرد');
      }
    } catch (err) {
      setError('حدث خطأ أثناء إرسال الرد');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Inbox className="text-blue-500" />
            صندوق الردود الذكي
          </h1>
          <p className="text-slate-500 mt-2">إدارة المنشن والردود على تغريداتك باستخدام الذكاء الاصطناعي</p>
        </div>
        <button 
          onClick={fetchMentions}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
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
        {/* Mentions List */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">أحدث الإشارات ({mentions.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoading && mentions.length === 0 ? (
              <div className="flex justify-center items-center h-full text-slate-400">
                <Loader2 className="animate-spin w-8 h-8" />
              </div>
            ) : mentions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center p-4">
                <MessageCircle size={48} className="mb-4 opacity-20" />
                <p>لا توجد إشارات جديدة حالياً.</p>
              </div>
            ) : (
              mentions.map((mention) => (
                <div 
                  key={mention.id}
                  onClick={() => handleGenerateReply(mention)}
                  className={`p-4 rounded-xl cursor-pointer transition-colors border ${
                    selectedMention?.id === mention.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : 'bg-white border-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {mention.author?.profile_image_url ? (
                      <img src={mention.author.profile_image_url} alt={mention.author.name} className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                        {mention.author?.name?.charAt(0) || '?'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-900">{mention.author?.name}</span>
                        <span className="text-xs text-slate-500">@{mention.author?.username}</span>
                      </div>
                      <p className="text-sm text-slate-700 mt-1 line-clamp-2">{mention.text}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Reply Composer */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-[600px]">
          {selectedMention ? (
            <div className="flex flex-col h-full">
              <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-slate-900">{selectedMention.author?.name}</span>
                  <span className="text-sm text-slate-500">@{selectedMention.author?.username}</span>
                </div>
                <p className="text-slate-800">{selectedMention.text}</p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={18} className="text-blue-500" />
                    الرد المقترح
                  </label>
                  <button 
                    onClick={() => handleGenerateReply(selectedMention)}
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
                  <span>إرسال الرد</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={40} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-600 mb-2">اختر تغريدة للرد عليها</h3>
              <p className="max-w-sm">قم باختيار إحدى الإشارات من القائمة الجانبية ليقوم الذكاء الاصطناعي باقتراح رد مناسب لها.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
