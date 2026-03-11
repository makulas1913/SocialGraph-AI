import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Bot,
  Sparkles,
  Zap,
  RefreshCw,
  Image as ImageIcon,
  Copy,
  Check,
  Twitter,
  Loader2,
  Search,
  Flame,
  Lightbulb,
  Target,
  MessageCircleReply,
  Upload,
  X,
  FileText,
  Settings2,
  Edit3,
  Palette,
  Globe,
  Link,
  PenTool
} from "lucide-react";
import {
  getSmartSuggestions,
  generateThread,
  generateImage,
  generateReply,
  generateArticle,
} from "../services/gemini";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";

type Tweet = {
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
};

const TweetCard: React.FC<{
  tweet: Tweet;
  index: number;
  onGenerateImage: () => void;
  onUpdateText: (text: string) => void;
}> = ({ tweet, index, onGenerateImage, onUpdateText }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tweet.text);

  const handleCopy = () => {
    navigator.clipboard.writeText(tweet.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = () => {
    onUpdateText(editText);
    setIsEditing(false);
  };

  const charCount = isEditing ? editText.length : tweet.text.length;
  const isOverLimit = charCount > 280;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-200 mr-12"
    >
      {/* Thread Connector Dot */}
      <div className="absolute top-6 -right-[29px] w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50" />

      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-sm font-medium">
          <span
            className={`px-2 py-1 rounded-md ${isOverLimit ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500"}`}
          >
            {index + 1} • {charCount} حرف
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="text-emerald-600 hover:bg-emerald-50 transition-colors px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
            >
              <Check className="w-4 h-4" /> حفظ
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
              title="تعديل التغريدة"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleCopy}
            className="text-slate-400 hover:text-blue-600 transition-colors p-1.5 hover:bg-blue-50 rounded-lg"
            title="نسخ التغريدة"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="relative">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full min-h-[100px] p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all resize-none bg-emerald-50/50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[15px] leading-relaxed"
            dir="auto"
            autoFocus
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <span className={`text-xs font-medium ${editText.length > 280 ? 'text-red-500' : 'text-slate-400'}`}>
              {editText.length}/280
            </span>
            {editText && (
              <button
                onClick={() => setEditText('')}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="مسح النص"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          <p className="text-slate-800 whitespace-pre-wrap leading-relaxed text-[15px]">
            {tweet.text}
          </p>
          <div className={`text-left mt-2 text-xs font-medium ${tweet.text.length > 280 ? 'text-red-500' : 'text-slate-400'}`}>
            {tweet.text.length}/280
          </div>
        </div>
      )}

      {tweet.imageUrl && (
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
          <img
            src={tweet.imageUrl}
            alt="Generated for tweet"
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {tweet.imagePrompt && !tweet.imageUrl && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <button
            onClick={onGenerateImage}
            disabled={tweet.isGeneratingImage}
            className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            {tweet.isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                جاري توليد الصورة...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                توليد صورة مرافقة
              </>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default function ContentStudio() {
  const { username, onLogin } = useOutletContext<{ username: string | null, onLogin: () => void }>();
  
  const [activeTab, setActiveTab] = useState<'thread' | 'reply' | 'article'>('thread');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [threadImage, setThreadImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const [threadUrl, setThreadUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tweetCount, setTweetCount] = useState<string>("auto");
  const [tweetStyle, setTweetStyle] = useState<string>("auto");
  const [tweetLanguage, setTweetLanguage] = useState<string>("arabic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [thread, setThread] = useState<Tweet[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Reply state
  const [replyPrompt, setReplyPrompt] = useState("");
  const [replyTone, setReplyTone] = useState<string>("professional");
  const [replyImage, setReplyImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const [generatedReply, setGeneratedReply] = useState<string | null>(null);
  const [isGeneratingReply, setIsGeneratingReply] = useState(false);
  const [replyCopied, setReplyCopied] = useState(false);

  // Article state
  const [articlePrompt, setArticlePrompt] = useState("");
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [isGeneratingArticle, setIsGeneratingArticle] = useState(false);
  const [articleCopied, setArticleCopied] = useState(false);

  const [isPostingToTwitter, setIsPostingToTwitter] = useState(false);

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const handlePostToTwitter = async () => {
    if (!username) {
      onLogin();
      return;
    }
    if (!thread || thread.length === 0) return;
    setIsPostingToTwitter(true);
    try {
      const tweets = thread.map(t => t.text);
      const res = await fetch('/api/twitter/post-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweets })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("تم نشر الثريد بنجاح على حسابك في X!");
      } else {
        if (res.status === 401) {
           onLogin();
        } else {
           alert("فشل النشر: " + (data.error || "خطأ غير معروف"));
        }
      }
    } catch (err) {
      console.error("Failed to post thread", err);
      alert("حدث خطأ أثناء محاولة النشر.");
    } finally {
      setIsPostingToTwitter(false);
    }
  };

  const handlePostReplyToTwitter = async () => {
    if (!username) {
      onLogin();
      return;
    }
    if (!generatedReply) return;
    setIsPostingToTwitter(true);
    try {
      const res = await fetch('/api/twitter/post-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tweets: [generatedReply] })
      });
      
      const data = await res.json();
      if (data.success) {
        alert("تم نشر الرد بنجاح على حسابك في X!");
      } else {
        if (res.status === 401) {
           onLogin();
        } else {
           alert("فشل النشر: " + (data.error || "خطأ غير معروف"));
        }
      }
    } catch (err) {
      console.error("Failed to post reply", err);
      alert("حدث خطأ أثناء محاولة النشر.");
    } finally {
      setIsPostingToTwitter(false);
    }
  };

  const handlePostArticleToTwitter = async () => {
    if (!username) {
      onLogin();
      return;
    }
    if (!generatedArticle) return;
    setIsPostingToTwitter(true);
    try {
      const res = await fetch('/api/twitter/post-thread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We can't post a full article as a single tweet if it's too long, but we'll try or let Twitter API fail
        body: JSON.stringify({ tweets: [generatedArticle.substring(0, 280)] }) // Just an example, maybe we shouldn't post articles directly to X unless it's a thread
      });
      
      const data = await res.json();
      if (data.success) {
        alert("تم نشر المقال بنجاح على حسابك في X!");
      } else {
        if (res.status === 401) {
           onLogin();
        } else {
           alert("فشل النشر: " + (data.error || "خطأ غير معروف"));
        }
      }
    } catch (err) {
      console.error("Failed to post article", err);
      alert("حدث خطأ أثناء محاولة النشر.");
    } finally {
      setIsPostingToTwitter(false);
    }
  };

  const fetchSuggestions = async () => {
    setIsLoadingSuggestions(true);
    try {
      const sugs = await getSmartSuggestions();
      setSuggestions(sugs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleGenerate = async (prompt: string, useSearch: boolean, count: string = tweetCount, style: string = tweetStyle, lang: string = tweetLanguage, isQuickAction: boolean = false) => {
    setIsGenerating(true);
    setError(null);
    setThread([]);
    try {
      const result = await generateThread(prompt, useSearch, count, style, lang, threadImage?.base64, threadImage?.mimeType, threadUrl, isQuickAction);
      setThread(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء توليد التغريدات.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTodayIdea = () => {
    handleGenerate(
      "أعطني فكرة اليوم: ابحث في الويب عن أداة أو تقنية أو خبر جديد في مجالات اهتمامي (صدرت أو تم تحديثها مؤخراً جداً في وقتنا الحالي)، واشرح كيف يمكن الاستفادة منها في 3 خطوات بسيطة على شكل مسودة ثريد جاهزة للنشر.",
      true, tweetCount, tweetStyle, tweetLanguage, true
    );
  };

  const handleQuickGenerate = () => {
    handleGenerate(
      "قم بتوليد سلسلة تغريدات مبتكرة عن أحدث التطورات والأخبار في مجالات اهتمامي (تأكد من أن الأخبار حديثة جداً وتخص وقتنا الحالي، وتجنب الأخبار القديمة).",
      true, tweetCount, tweetStyle, tweetLanguage, true
    );
  };

  const handleMotivational = () => {
    handleGenerate(
      "اكتب ثريد تحفيزي حول أهمية التطور المستمر والتعلم في مجالات اهتمامي لزيادة الإنتاجية والإبداع والنجاح المهني.",
      false, tweetCount, tweetStyle, tweetLanguage, true
    );
  };

  const handleControversial = () => {
    handleGenerate(
      "اكتب ثريد جدلي (ولكن مهني) يطرح فكرة غير تقليدية أو رأي مخالف للسائد في مجالات اهتمامي. اطرح حججاً قوية ومقنعة.",
      false, tweetCount, tweetStyle, tweetLanguage, true
    );
  };

  const handleAdvice = () => {
    handleGenerate(
      "اكتب ثريد عبارة عن 5 نصائح ذهبية وعملية جداً للمهتمين أو العاملين في مجالات اهتمامي لتطوير مهاراتهم وتحقيق نتائج أفضل.",
      false, tweetCount, tweetStyle, tweetLanguage, true
    );
  };

  const handleUpdateTweetText = (index: number, newText: string) => {
    setThread(prev => prev.map((t, i) => i === index ? { ...t, text: newText } : t));
  };

  const handleGenerateImage = async (index: number) => {
    const tweet = thread[index];
    if (!tweet.imagePrompt) return;

    setThread((prev) =>
      prev.map((t, i) => (i === index ? { ...t, isGeneratingImage: true } : t)),
    );
    try {
      const imageUrl = await generateImage(tweet.imagePrompt);
      setThread((prev) =>
        prev.map((t, i) =>
          i === index ? { ...t, imageUrl, isGeneratingImage: false } : t,
        ),
      );
    } catch (err) {
      console.error(err);
      setThread((prev) =>
        prev.map((t, i) =>
          i === index ? { ...t, isGeneratingImage: false } : t,
        ),
      );
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'thread' | 'reply') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const imageData = {
          url: URL.createObjectURL(file),
          base64: event.target.result as string,
          mimeType: file.type
        };
        if (type === 'thread') {
          setThreadImage(imageData);
        } else {
          setReplyImage(imageData);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateReply = async () => {
    if (!replyPrompt.trim() && !replyImage) return;
    
    setIsGeneratingReply(true);
    setError(null);
    setGeneratedReply(null);
    
    try {
      const result = await generateReply(
        replyPrompt || "اكتب رداً احترافياً على هذا المنشور.", 
        replyImage?.base64, 
        replyImage?.mimeType,
        replyTone
      );
      setGeneratedReply(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء توليد الرد.");
    } finally {
      setIsGeneratingReply(false);
    }
  };

  const handleCopyReply = () => {
    if (generatedReply) {
      navigator.clipboard.writeText(generatedReply);
      setReplyCopied(true);
      setTimeout(() => setReplyCopied(false), 2000);
    }
  };

  const handleGenerateArticle = async () => {
    if (!articlePrompt.trim()) return;
    
    setIsGeneratingArticle(true);
    setError(null);
    setGeneratedArticle(null);
    
    try {
      const result = await generateArticle(articlePrompt, true);
      setGeneratedArticle(result);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء كتابة المقال.");
    } finally {
      setIsGeneratingArticle(false);
    }
  };

  const handleCopyArticle = () => {
    if (generatedArticle) {
      navigator.clipboard.writeText(generatedArticle);
      setArticleCopied(true);
      setTimeout(() => setArticleCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="font-cairo text-slate-900 dark:text-slate-100 selection:bg-emerald-200 dark:selection:bg-emerald-900"
    >
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <PenTool className="text-emerald-500 w-6 h-6 md:w-8 md:h-8" />
            استوديو المحتوى
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">قم بإنشاء خيوط تغريدات (Threads) ومقالات احترافية باستخدام الذكاء الاصطناعي</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl overflow-x-auto whitespace-nowrap border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('thread')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'thread' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            صانع الثريدات
          </button>
          <button
            onClick={() => setActiveTab('reply')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'reply' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            الردود الذكية
          </button>
          <button
            onClick={() => setActiveTab('article')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'article' ? 'bg-white dark:bg-slate-700 shadow-sm text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
          >
            كتابة المقالات
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto">
        {activeTab === 'thread' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Sidebar / Controls */}
            <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 dark:text-white">
              <Zap className="w-5 h-5 text-amber-500" />
              إجراءات سريعة
            </h2>
            <div className="space-y-3">
              <button
                onClick={handleTodayIdea}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
              >
                <span className="font-semibold">فكرة اليوم 💡</span>
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={handleQuickGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
              >
                <span className="font-semibold">توليد سريع ⚡</span>
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={handleMotivational}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors disabled:opacity-50"
              >
                <span className="font-semibold">ثريد تحفيزي 🚀</span>
                <Target className="w-4 h-4" />
              </button>
              <button
                onClick={handleAdvice}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
              >
                <span className="font-semibold">نصيحة مهنية 🎯</span>
                <Lightbulb className="w-4 h-4" />
              </button>
              <button
                onClick={handleControversial}
                disabled={isGenerating}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors disabled:opacity-50"
              >
                <span className="font-semibold">رأي جدلي 🔥</span>
                <Flame className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Bot className="w-5 h-5 text-indigo-500" />
                اقتراحات ذكية
              </h2>
              <button
                onClick={fetchSuggestions}
                disabled={isLoadingSuggestions}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingSuggestions ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="space-y-2">
              {isLoadingSuggestions ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                </div>
              ) : suggestions.length > 0 ? (
                suggestions.map((sug, i) => (
                  <button
                    key={i}
                    onClick={() => setCustomPrompt(`اكتب ثريد عن: ${sug}`)}
                    className="w-full text-right p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50 text-sm text-slate-700 transition-colors"
                  >
                    {sug}
                  </button>
                ))
              ) : (
                <div className="text-sm text-slate-500 text-center py-2">
                  لا توجد اقتراحات حالياً
                </div>
              )}
            </div>
          </div>
        </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-emerald-100 dark:border-emerald-900/50 focus-within:border-emerald-400 focus-within:ring-1 focus-within:ring-emerald-400 transition-all relative">
                {threadImage && (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 mb-2 mx-2 mt-2">
                    <img src={threadImage.url} alt="Thread context" className="w-full max-h-48 object-contain" />
                    <button 
                      onClick={() => setThreadImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-lg text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <div className="relative">
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="اكتب فكرتك هنا، أو الصق خبراً لتحويله إلى ثريد..."
                    className="w-full min-h-[120px] p-3 resize-none outline-none bg-transparent dark:text-white"
                    dir="auto"
                  />
                  {customPrompt && (
                    <button
                      onClick={() => setCustomPrompt('')}
                      className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="مسح النص"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showUrlInput && (
                  <div className="px-3 pb-3">
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
                      <Link className="w-4 h-4 text-slate-400" />
                      <input
                        type="url"
                        value={threadUrl}
                        onChange={(e) => setThreadUrl(e.target.value)}
                        placeholder="أدخل رابط التغريدة أو المقال هنا..."
                        className="w-full bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200"
                        dir="ltr"
                      />
                      <button onClick={() => { setShowUrlInput(false); setThreadUrl(""); }} className="text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex flex-col items-start justify-between p-2 border-t border-slate-100 dark:border-slate-800 gap-3">
                  <div className="flex flex-wrap items-center gap-2 w-full">
                    <label className="flex items-center justify-center p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400" title="إرفاق صورة">
                      <ImageIcon className="w-4 h-4" />
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thread')} />
                    </label>
                    <button
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className={`flex items-center justify-center p-2 border rounded-lg transition-colors ${showUrlInput || threadUrl ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-emerald-600'}`}
                      title="إرفاق رابط"
                    >
                      <Link className="w-4 h-4" />
                    </button>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all flex-1 min-w-[120px]">
                      <Settings2 className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={tweetCount}
                        onChange={(e) => setTweetCount(e.target.value)}
                        className="bg-transparent text-slate-700 text-sm block py-2 outline-none cursor-pointer w-full"
                      >
                        <option value="auto">طول تلقائي</option>
                        <option value="1">تغريدة يتيمة</option>
                        <option value="3">3 تغريدات</option>
                        <option value="5">5 تغريدات</option>
                        <option value="7">7 تغريدات</option>
                        <option value="10">10 تغريدات</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all flex-1 min-w-[120px]">
                      <Palette className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={tweetStyle}
                        onChange={(e) => setTweetStyle(e.target.value)}
                        className="bg-transparent text-slate-700 text-sm block py-2 outline-none cursor-pointer w-full"
                      >
                        <option value="auto">أسلوب تلقائي</option>
                        <option value="formal">رسمي</option>
                        <option value="sarcastic">ساخر</option>
                        <option value="surreal">سيريالي</option>
                        <option value="comedic">كوميدي</option>
                        <option value="storytelling">قصصي</option>
                        <option value="educational">تعليمي مبسط</option>
                        <option value="philosophical">فلسفي</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all flex-1 min-w-[100px]">
                      <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                      <select
                        value={tweetLanguage}
                        onChange={(e) => setTweetLanguage(e.target.value)}
                        className="bg-transparent text-slate-700 text-sm block py-2 outline-none cursor-pointer w-full"
                      >
                        <option value="arabic">العربية</option>
                        <option value="english">English</option>
                        <option value="french">Français</option>
                        <option value="spanish">Español</option>
                      </select>
                    </div>
                  </div>
                  <button
                    onClick={() => handleGenerate(customPrompt, true, tweetCount, tweetStyle, tweetLanguage)}
                    disabled={!customPrompt.trim() || isGenerating}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري التوليد...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        توليد الثريد
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {thread.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-3">
                      <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Twitter className="w-5 h-5 text-emerald-500" />
                        الثريد الجاهز ({thread.length} تغريدات)
                      </h3>
                      <button
                        onClick={handlePostToTwitter}
                        disabled={isPostingToTwitter}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-black text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
                      >
                        {isPostingToTwitter ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Twitter className="w-4 h-4" />
                        )}
                        نشر الثريد على X
                      </button>
                    </div>

                    <div className="space-y-4 relative before:absolute before:inset-y-4 before:right-6 before:w-0.5 before:bg-slate-200">
                      {thread.map((tweet, index) => (
                        <TweetCard
                          key={index}
                          tweet={tweet}
                          index={index}
                          onGenerateImage={() => handleGenerateImage(index)}
                          onUpdateText={(text) => handleUpdateTweetText(index, text)}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
          
        {activeTab === 'reply' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <MessageCircleReply className="w-5 h-5 text-indigo-500" />
                  صياغة رد احترافي
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      صورة المنشور (اختياري)
                    </label>
                    {replyImage ? (
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img src={replyImage.url} alt="Post to reply to" className="w-full max-h-64 object-contain" />
                        <button 
                          onClick={() => setReplyImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg text-slate-600 hover:text-red-600 hover:bg-white transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-6 h-6 text-slate-400 mb-2" />
                          <p className="text-sm text-slate-500">اضغط لرفع صورة المنشور</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'reply')} />
                      </label>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      نبرة الرد
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        onClick={() => setReplyTone('professional')}
                        className={`p-2 rounded-xl text-sm font-medium transition-colors border ${replyTone === 'professional' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        احترافية
                      </button>
                      <button
                        onClick={() => setReplyTone('friendly')}
                        className={`p-2 rounded-xl text-sm font-medium transition-colors border ${replyTone === 'friendly' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        ودية
                      </button>
                      <button
                        onClick={() => setReplyTone('analytical')}
                        className={`p-2 rounded-xl text-sm font-medium transition-colors border ${replyTone === 'analytical' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        تحليلية
                      </button>
                      <button
                        onClick={() => setReplyTone('quote')}
                        className={`p-2 rounded-xl text-sm font-medium transition-colors border ${replyTone === 'quote' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                      >
                        تعليق/اقتباس
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      توجيهات الرد (اختياري)
                    </label>
                    <div className="relative">
                      <textarea
                        value={replyPrompt}
                        onChange={(e) => setReplyPrompt(e.target.value)}
                        placeholder="مثال: اكتب رداً داعماً يضيف معلومة جديدة عن أتمتة المحاسبة..."
                        className="w-full min-h-[100px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all resize-none"
                        dir="auto"
                      />
                      {replyPrompt && (
                        <button
                          onClick={() => setReplyPrompt('')}
                          className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="مسح النص"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateReply}
                    disabled={isGeneratingReply || (!replyPrompt.trim() && !replyImage)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingReply ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري صياغة الرد...
                      </>
                    ) : (
                      <>
                        <MessageCircleReply className="w-5 h-5" />
                        توليد الرد
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {generatedReply && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                      <h3 className="font-bold text-slate-800">الرد المقترح</h3>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={handlePostReplyToTwitter}
                          disabled={isPostingToTwitter}
                          className="text-white bg-black hover:bg-slate-800 transition-colors px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 text-sm font-medium disabled:opacity-50 flex-1 sm:flex-none"
                        >
                          {isPostingToTwitter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Twitter className="w-4 h-4" />}
                          نشر
                        </button>
                        <button 
                          onClick={handleCopyReply}
                          className="text-slate-400 hover:text-indigo-600 transition-colors p-1.5 hover:bg-indigo-50 rounded-lg flex items-center justify-center gap-1 text-sm flex-1 sm:flex-none"
                        >
                          {replyCopied ? (
                            <><Check className="w-4 h-4 text-emerald-500" /> تم النسخ</>
                          ) : (
                            <><Copy className="w-4 h-4" /> نسخ الرد</>
                          )}
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {generatedReply}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
        )}

        {activeTab === 'article' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  كتابة مقال احترافي
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      موضوع المقال
                    </label>
                    <div className="relative">
                      <textarea
                        value={articlePrompt}
                        onChange={(e) => setArticlePrompt(e.target.value)}
                        placeholder="اكتب موضوع المقال أو الفكرة التي تريد الكتابة عنها بالتفصيل..."
                        className="w-full min-h-[120px] p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all resize-none"
                        dir="auto"
                      />
                      {articlePrompt && (
                        <button
                          onClick={() => setArticlePrompt('')}
                          className="absolute top-2 left-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="مسح النص"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateArticle}
                    disabled={isGeneratingArticle || !articlePrompt.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingArticle ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري كتابة المقال...
                      </>
                    ) : (
                      <>
                        <FileText className="w-5 h-5" />
                        كتابة المقال
                      </>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {generatedArticle && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 shadow-sm border border-emerald-100 relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-1 h-full bg-emerald-500" />
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 border-b border-slate-100 pb-4">
                      <h3 className="font-bold text-slate-800">المقال الجاهز</h3>
                      <button 
                        onClick={handleCopyArticle}
                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1.5 hover:bg-emerald-50 rounded-lg flex items-center justify-center gap-1 text-sm w-full sm:w-auto"
                      >
                        {articleCopied ? (
                          <><Check className="w-4 h-4 text-emerald-500" /> تم النسخ</>
                        ) : (
                          <><Copy className="w-4 h-4" /> نسخ المقال</>
                        )}
                      </button>
                    </div>
                    <div className="prose prose-slate prose-emerald max-w-none text-slate-700 leading-relaxed" dir="rtl">
                      <Markdown>{generatedArticle}</Markdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
      </main>
    </motion.div>
  );
}
