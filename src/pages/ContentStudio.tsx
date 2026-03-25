import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { Save, Bot, Sparkles, Zap, RefreshCw, Image as ImageIcon, Copy, Check, Twitter, Loader2, Search, Flame, Lightbulb, Target, MessageCircleReply, Upload, X, FileText, Settings2, Edit3, Palette, Globe, Link, PenTool } from "lucide-react";
import {
  getSmartSuggestions,
  generateThread,
  generateImage,
  generateReply,
  generateArticle,
} from "../services/gemini";
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Tweet = {
  text: string;
  imagePrompt?: string;
  imageUrl?: string | null;
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
      className="relative glass rounded-2xl p-6 shadow-sm border border-border/50 me-10 group"
    >
      {/* Thread Connector Dot */}
      <div className="absolute top-8 -end-[26px] w-3 h-3 rounded-full bg-primary ring-4 ring-background shadow-[0_0_8px_rgba(79,70,229,0.5)] z-10" />

      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shadow-inner">
            {index + 1}
          </div>
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
              isOverLimit ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
            )}
          >
            {charCount} حرف
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveEdit}
              className="text-primary hover:text-primary hover:bg-primary/10 h-8"
            >
              <Check className="w-4 h-4 ms-1" /> حفظ
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary h-8 w-8"
              title="تعديل التغريدة"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="text-muted-foreground hover:text-primary h-8 w-8"
            title="نسخ التغريدة"
          >
            {copied ? (
              <Check className="w-4 h-4 text-primary" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="relative">
          <Textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="min-h-[120px] resize-none bg-muted/20 border-primary/20 focus-visible:ring-primary/30"
            dir="auto"
            autoFocus
          />
          <div className="absolute bottom-2 left-2 flex items-center gap-2">
            <span className={cn(
              "text-[10px] font-bold",
              editText.length > 280 ? 'text-destructive' : 'text-muted-foreground'
            )}>
              {editText.length}/280
            </span>
          </div>
        </div>
      ) : (
        <div className="relative group/text">
          <p className="whitespace-pre-wrap leading-relaxed text-base">
            {tweet.text}
          </p>
        </div>
      )}

      {tweet.imageUrl && (
        <div className="mt-5 rounded-xl overflow-hidden border border-border/50 shadow-inner bg-muted/30">
          <img
            src={tweet.imageUrl}
            alt="Generated for tweet"
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      {tweet.imagePrompt && !tweet.imageUrl && (
        <div className="mt-5 pt-5 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            onClick={onGenerateImage}
            disabled={tweet.isGeneratingImage}
            className="w-full sm:w-auto border-dashed hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
          >
            {tweet.isGeneratingImage ? (
              <>
                <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                جاري توليد الصورة...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4 ml-2" />
                توليد صورة مرافقة بالذكاء الاصطناعي
              </>
            )}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default function ContentStudio() {
  const { twitterUser: username, login: onLogin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'thread' | 'reply' | 'article'>('thread');
  console.log("activeTab:", activeTab);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [threadImage, setThreadImage] = useState<{ url: string, base64: string, mimeType: string } | null>(null);
  const [threadUrl, setThreadUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [tweetCount, setTweetCount] = useState<string>("auto");
  const [tweetStyle, setTweetStyle] = useState<string>("auto");
  const [tweetLanguage, setTweetLanguage] = useState<string>("arabic");
  const [variationsCount, setVariationsCount] = useState<string>("1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [threadVariations, setThreadVariations] = useState<Tweet[][]>([]);
  const [activeVariation, setActiveVariation] = useState<number>(0);
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

  // Personas state
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('');

  // Templates state
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('none');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  useEffect(() => {
    fetchPersonas();
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [selectedPersonaId]);

  const fetchTemplates = async () => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'templates'));
      const fetchedTemplates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Failed to fetch templates", error);
    }
  };

  const handleSaveTemplate = async () => {
    if (!customPrompt.trim()) return;
    setIsSavingTemplate(true);
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      const newTemplate = {
        name: `قالب ${new Date().toLocaleDateString()}`,
        prompt: customPrompt,
        tweetCount,
        tweetStyle,
        tweetLanguage,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'templates'), newTemplate);
      setTemplates([...templates, { id: docRef.id, ...newTemplate }]);
      alert('تم حفظ القالب بنجاح!');
    } catch (error) {
      console.error("Failed to save template", error);
      alert('فشل حفظ القالب.');
    } finally {
      setIsSavingTemplate(false);
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'none') return;
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCustomPrompt(template.prompt);
      setTweetCount(template.tweetCount || 'auto');
      setTweetStyle(template.tweetStyle || 'auto');
      setTweetLanguage(template.tweetLanguage || 'arabic');
    }
  };

  const fetchPersonas = async () => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'personas'));
      const fetchedPersonas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersonas(fetchedPersonas);
      if (fetchedPersonas.length > 0) {
         const defaultPersona = fetchedPersonas.find(p => p.isDefault) || fetchedPersonas.find(p => p.id === 'default') || fetchedPersonas[0];
         setSelectedPersonaId(defaultPersona.id);
      } else {
         setSelectedPersonaId('default');
      }
    } catch (error) {
      console.error("Failed to fetch personas", error);
      setSelectedPersonaId('default');
    }
  };

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
        body: JSON.stringify({ tweets: [generatedArticle.substring(0, 280)] })
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
    if (!selectedPersonaId) return;
    setIsLoadingSuggestions(true);
    try {
      const sugs = await getSmartSuggestions(selectedPersonaId);
      setSuggestions(sugs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const saveToHistory = async (prompt: string, content: any, type: string) => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc } = await import('firebase/firestore');
      await addDoc(collection(db, 'history'), {
        prompt,
        content: JSON.stringify(content),
        type: type || "thread",
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      console.error("Failed to save to history in Firestore", err);
    }
  };

  const handleGenerate = async (prompt: string, useSearch: boolean, count: string = tweetCount, style: string = tweetStyle, lang: string = tweetLanguage, isQuickAction: boolean = false) => {
    setIsGenerating(true);
    setError(null);
    setThread([]);
    setThreadVariations([]);
    try {
      const vCount = parseInt(variationsCount);
      if (vCount > 1) {
        const promises = Array.from({ length: vCount }).map((_, i) => {
          const variationPrompt = `${prompt}\n\nملاحظة: هذه هي النسخة رقم ${i + 1}. حاول أن تجعلها مميزة ومختلفة قليلاً في الصياغة عن النسخ الأخرى.`;
          return generateThread(variationPrompt, useSearch, count, style, lang, threadImage?.base64, threadImage?.mimeType, threadUrl, isQuickAction, selectedPersonaId);
        });
        const results = await Promise.all(promises);
        setThreadVariations(results);
        setThread(results[0]);
        setActiveVariation(0);
        saveToHistory(prompt, results[0], "thread");
      } else {
        const result = await generateThread(prompt, useSearch, count, style, lang, threadImage?.base64, threadImage?.mimeType, threadUrl, isQuickAction, selectedPersonaId);
        setThread(result);
        setThreadVariations([result]);
        setActiveVariation(0);
        saveToHistory(prompt, result, "thread");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "حدث خطأ أثناء توليد التغريدات.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTodayTrend = () => {
    handleGenerate(
      "ابحث في الويب عن تريند اليوم (Trend of the Day) أو أكثر المواضيع تداولاً حالياً في مجالات اهتمامي. قم بتحليل هذا التريند واكتب ثريداً يشرح ماهيته، لماذا هو رائج الآن، وكيف يمكن للمتابعين الاستفادة منه أو التفاعل معه بشكل ذكي.",
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

  const handlePasteImage = (e: React.ClipboardEvent<HTMLTextAreaElement>, type: 'thread' | 'reply') => {
    const items = e.clipboardData?.items;
    if (!items) return;
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (!file) continue;
        
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
      }
    }
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
        replyTone,
        selectedPersonaId
      );
      setGeneratedReply(result);
      saveToHistory(replyPrompt || "رد على منشور", result, "reply");
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
      const result = await generateArticle(articlePrompt, true, selectedPersonaId);
      setGeneratedArticle(result);
      saveToHistory(articlePrompt, result, "article");
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
      dir="rtl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="pb-12"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <PenTool className="text-primary w-6 h-6" />
            </div>
            استوديو المحتوى
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">قم بإنشاء خيوط تغريدات (Threads) ومقالات احترافية باستخدام الذكاء الاصطناعي المتقدم.</p>
        </div>
        {personas.length > 0 && (
          <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-xl border border-border/50">
            <Label className="text-sm font-medium text-foreground whitespace-nowrap">الشخصية:</Label>
            <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId} dir="rtl">
              <SelectTrigger className="w-[200px] bg-background border-border/50">
                <SelectValue placeholder="اختر الشخصية" />
              </SelectTrigger>
              <SelectContent>
                {personas.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="max-w-6xl mx-auto" dir="rtl">
        <TabsList className="mb-10 glass p-1 border border-border/50 rounded-xl">
          <TabsTrigger value="thread" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">صانع الثريدات</TabsTrigger>
          <TabsTrigger value="reply" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">الردود الذكية</TabsTrigger>
          <TabsTrigger value="article" className="rounded-lg px-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">كتابة المقالات</TabsTrigger>
        </TabsList>

        <TabsContent value="thread">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Sidebar / Controls */}
            <div className="lg:col-span-4 space-y-6 order-2 lg:order-2">
              <Card className="glass border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/50 border-b border-border/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    إجراءات سريعة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleTodayTrend}
                    disabled={isGenerating}
                    className="w-full justify-between hover:bg-primary/10 hover:text-primary group transition-all"
                  >
                    <span className="text-sm">تريند اليوم</span>
                    <Search className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleQuickGenerate}
                    disabled={isGenerating}
                    className="w-full justify-between hover:bg-primary/10 hover:text-primary group transition-all"
                  >
                    <span className="text-sm">توليد سريع</span>
                    <Sparkles className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleMotivational}
                    disabled={isGenerating}
                    className="w-full justify-between hover:bg-primary/5 hover:text-primary group transition-all"
                  >
                    <span className="text-sm">ثريد تحفيزي</span>
                    <Target className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleAdvice}
                    disabled={isGenerating}
                    className="w-full justify-between hover:bg-primary/5 hover:text-primary group transition-all"
                  >
                    <span className="text-sm">نصيحة مهنية</span>
                    <Lightbulb className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleControversial}
                    disabled={isGenerating}
                    className="w-full justify-between hover:bg-primary/5 hover:text-primary group transition-all"
                  >
                    <span className="text-sm">رأي جدلي</span>
                    <Flame className="w-4 h-4 opacity-40 group-hover:opacity-100" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-border/50 shadow-sm overflow-hidden">
                <CardHeader className="pb-3 bg-muted/50 border-b border-border/50 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    اقتراحات ذكية
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fetchSuggestions}
                    disabled={isLoadingSuggestions}
                    className="h-6 w-6 hover:bg-primary/10 hover:text-primary"
                  >
                    <RefreshCw className={cn("w-3 h-3", isLoadingSuggestions && "animate-spin")} />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 pt-4">
                  {isLoadingSuggestions ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary/40" />
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((sug, i) => (
                      <Button
                        key={i}
                        variant="ghost"
                        onClick={() => setCustomPrompt(`اكتب ثريد عن: ${sug}`)}
                        className="w-full justify-start text-start h-auto whitespace-normal p-3 font-normal text-sm hover:bg-primary/10 hover:text-primary border border-transparent hover:border-primary/20"
                      >
                        {sug}
                      </Button>
                    ))
                  ) : (
                    <div className="text-xs text-muted-foreground text-center py-4 italic">
                      لا توجد اقتراحات حالياً
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-8 space-y-8 order-1 lg:order-1">
              <Card className="glass border-border/50 shadow-md overflow-hidden ring-1 ring-primary/5">
                <div className="p-1">
                  {threadImage && (
                    <div className="relative rounded-xl overflow-hidden border border-border/50 bg-muted/50 mb-2 mx-2 mt-2 group">
                      <img src={threadImage.url} alt="Thread context" className="w-full max-h-64 object-contain" />
                      <Button 
                        variant="destructive"
                        size="icon"
                        onClick={() => setThreadImage(null)}
                        className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="relative px-4 pt-4">
                    <Textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      onPaste={(e) => handlePasteImage(e, 'thread')}
                      placeholder="اكتب فكرتك هنا، أو الصق خبراً لتحويله إلى ثريد..."
                      className="min-h-[160px] border-0 focus-visible:ring-0 resize-none bg-transparent text-lg placeholder:text-muted-foreground/50"
                      dir="auto"
                    />
                    {customPrompt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCustomPrompt("")}
                        className="absolute top-2 left-2 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        title="مسح النص"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {showUrlInput && (
                    <div className="px-4 pb-4">
                      <div className="flex items-center gap-3 bg-primary/10 rounded-xl px-4 py-3 border border-border/50">
                        <Link className="w-4 h-4 text-primary" />
                        <Input
                          type="url"
                          value={threadUrl}
                          onChange={(e) => setThreadUrl(e.target.value)}
                          placeholder="أدخل رابط التغريدة أو المقال هنا..."
                          className="border-0 bg-transparent h-8 focus-visible:ring-0 text-sm"
                          dir="ltr"
                        />
                        <Button variant="ghost" size="icon" onClick={() => { setShowUrlInput(false); setThreadUrl(""); }} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col items-stretch p-4 border-t border-border/50 bg-muted/30 gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <Label className="flex items-center justify-center h-10 px-3 border rounded-xl cursor-pointer hover:bg-muted transition-all text-muted-foreground hover:text-primary hover:border-primary/30" title="إرفاق صورة">
                        <ImageIcon className="w-4 h-4 ms-2" />
                        <span className="text-xs font-bold uppercase tracking-wider">صورة</span>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'thread')} />
                      </Label>
                      <Button
                        variant={showUrlInput || threadUrl ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => setShowUrlInput(!showUrlInput)}
                        className="h-10 rounded-xl gap-2"
                      >
                        <Link className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">رابط</span>
                      </Button>
                      
                      <div className="h-6 w-[1px] bg-border/50 mx-1 hidden sm:block" />

                      <Select value={tweetCount} onValueChange={(v) => v && setTweetCount(v)} dir="rtl">
                        <SelectTrigger className="w-[130px] h-10 rounded-xl bg-background border-border/50">
                          <Settings2 className="w-4 h-4 ms-2 text-muted-foreground" />
                          <SelectValue placeholder="الطول" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">طول تلقائي</SelectItem>
                          <SelectItem value="1">تغريدة يتيمة</SelectItem>
                          <SelectItem value="3">3 تغريدات</SelectItem>
                          <SelectItem value="5">5 تغريدات</SelectItem>
                          <SelectItem value="7">7 تغريدات</SelectItem>
                          <SelectItem value="10">10 تغريدات</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={tweetStyle} onValueChange={(v) => v && setTweetStyle(v)} dir="rtl">
                        <SelectTrigger className="w-[130px] h-10 rounded-xl bg-background border-border/50">
                          <Palette className="w-4 h-4 ms-2 text-muted-foreground" />
                          <SelectValue placeholder="الأسلوب" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">أسلوب تلقائي</SelectItem>
                          <SelectItem value="formal">رسمي</SelectItem>
                          <SelectItem value="sarcastic">ساخر</SelectItem>
                          <SelectItem value="surreal">سيريالي</SelectItem>
                          <SelectItem value="comedic">كوميدي</SelectItem>
                          <SelectItem value="storytelling">قصصي</SelectItem>
                          <SelectItem value="educational">تعليمي مبسط</SelectItem>
                          <SelectItem value="philosophical">فلسفي</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={tweetLanguage} onValueChange={(v) => v && setTweetLanguage(v)} dir="rtl">
                        <SelectTrigger className="w-[110px] h-10 rounded-xl bg-background border-border/50">
                          <Globe className="w-4 h-4 ml-2 text-muted-foreground" />
                          <SelectValue placeholder="اللغة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="arabic">العربية</SelectItem>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="french">Français</SelectItem>
                          <SelectItem value="spanish">Español</SelectItem>
                        </SelectContent>
                      </Select>

                      <Select value={variationsCount} onValueChange={(v) => v && setVariationsCount(v)} dir="rtl">
                        <SelectTrigger className="w-[140px] h-10 rounded-xl text-primary border-primary/20 bg-primary/5 font-bold">
                          <Sparkles className="w-4 h-4 ml-2" />
                          <SelectValue placeholder="النسخ" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">نسخة واحدة</SelectItem>
                          <SelectItem value="2">نسختين (A/B Test)</SelectItem>
                          <SelectItem value="3">3 نسخ مختلفة</SelectItem>
                        </SelectContent>
                      </Select>

                      <div className="h-6 w-[1px] bg-border/50 mx-1 hidden sm:block" />

                      <Select value={selectedTemplateId} onValueChange={handleApplyTemplate} dir="rtl">
                        <SelectTrigger className="w-[150px] h-10 rounded-xl bg-background border-border/50">
                          <FileText className="w-4 h-4 ml-2 text-muted-foreground" />
                          <SelectValue placeholder="القوالب المحفوظة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">بدون قالب</SelectItem>
                          {templates.map(t => (
                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSaveTemplate}
                        disabled={!customPrompt.trim() || isSavingTemplate}
                        className="h-10 rounded-xl gap-2"
                      >
                        {isSavingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span className="text-xs font-bold uppercase tracking-wider">حفظ كقالب</span>
                      </Button>
                    </div>
                    <Button
                      onClick={() => handleGenerate(customPrompt, true, tweetCount, tweetStyle, tweetLanguage)}
                      disabled={!customPrompt.trim() || isGenerating}
                      size="lg"
                      className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          جاري توليد المحتوى...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 ml-2" />
                          توليد الثريد الآن
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20">
                  {error}
                </div>
              )}

              <AnimatePresence>
                {threadVariations.length > 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-indigo-50/50 p-2 rounded-xl border border-indigo-100 overflow-x-auto"
                  >
                    <span className="text-sm font-bold text-indigo-800 px-2 whitespace-nowrap">اختر النسخة الأفضل:</span>
                    {threadVariations.map((_, idx) => (
                      <Button
                        key={idx}
                        variant={activeVariation === idx ? "default" : "outline"}
                        onClick={() => {
                          setActiveVariation(idx);
                          setThread(threadVariations[idx]);
                        }}
                        className={activeVariation === idx ? "bg-indigo-600 hover:bg-indigo-700" : "text-indigo-600 border-indigo-200"}
                      >
                        النسخة {idx + 1}
                      </Button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {thread.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between px-1 gap-3">
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        <Twitter className="w-5 h-5 text-primary" />
                        الثريد الجاهز ({thread.length} تغريدات)
                      </h3>
                      <Button
                        onClick={handlePostToTwitter}
                        disabled={isPostingToTwitter}
                        className="w-full sm:w-auto"
                      >
                        {isPostingToTwitter ? (
                          <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                        ) : (
                          <Twitter className="w-4 h-4 ml-2" />
                        )}
                        نشر الثريد على X
                      </Button>
                    </div>

                    <div className="space-y-4 relative before:absolute before:inset-y-4 before:right-6 before:w-0.5 before:bg-border">
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
        </TabsContent>

        <TabsContent value="reply">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageCircleReply className="w-5 h-5 text-indigo-500" />
                  صياغة رد احترافي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">صورة المنشور (اختياري)</Label>
                  {replyImage ? (
                    <div className="relative rounded-xl overflow-hidden border bg-muted">
                      <img src={replyImage.url} alt="Post to reply to" className="w-full max-h-64 object-contain" />
                      <Button 
                        variant="secondary"
                        size="icon"
                        onClick={() => setReplyImage(null)}
                        className="absolute top-2 left-2 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">اضغط لرفع صورة المنشور</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageUpload(e, 'reply')} />
                    </Label>
                  )}
                </div>

                <div>
                  <Label className="mb-2 block">نبرة الرد</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant={replyTone === 'professional' ? 'default' : 'outline'}
                      onClick={() => setReplyTone('professional')}
                      className={replyTone === 'professional' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      احترافية
                    </Button>
                    <Button
                      variant={replyTone === 'friendly' ? 'default' : 'outline'}
                      onClick={() => setReplyTone('friendly')}
                      className={replyTone === 'friendly' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      ودية
                    </Button>
                    <Button
                      variant={replyTone === 'analytical' ? 'default' : 'outline'}
                      onClick={() => setReplyTone('analytical')}
                      className={replyTone === 'analytical' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      تحليلية
                    </Button>
                    <Button
                      variant={replyTone === 'quote' ? 'default' : 'outline'}
                      onClick={() => setReplyTone('quote')}
                      className={replyTone === 'quote' ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
                    >
                      تعليق/اقتباس
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">توجيهات الرد (اختياري)</Label>
                  <div className="relative">
                    <Textarea
                      value={replyPrompt}
                      onChange={(e) => setReplyPrompt(e.target.value)}
                      onPaste={(e) => handlePasteImage(e, 'reply')}
                      placeholder="مثال: اكتب رداً داعماً يضيف معلومة جديدة عن أتمتة المحاسبة..."
                      className="min-h-[100px] resize-none"
                      dir="auto"
                    />
                    {replyPrompt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplyPrompt('')}
                        className="absolute top-2 left-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateReply}
                  disabled={isGeneratingReply || (!replyPrompt.trim() && !replyImage)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isGeneratingReply ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري صياغة الرد...
                    </>
                  ) : (
                    <>
                      <MessageCircleReply className="w-5 h-5 ml-2" />
                      توليد الرد
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20">
                {error}
              </div>
            )}

            <AnimatePresence>
              {generatedReply && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-5 shadow-sm border border-indigo-100 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-indigo-500" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-3">
                    <h3 className="font-bold">الرد المقترح</h3>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Button
                        onClick={handlePostReplyToTwitter}
                        disabled={isPostingToTwitter}
                        className="flex-1 sm:flex-none"
                      >
                        {isPostingToTwitter ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Twitter className="w-4 h-4 ml-2" />}
                        نشر
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={handleCopyReply}
                        className="flex-1 sm:flex-none"
                      >
                        {replyCopied ? (
                          <><Check className="w-4 h-4 ml-2 text-primary" /> تم النسخ</>
                        ) : (
                          <><Copy className="w-4 h-4 ml-2" /> نسخ الرد</>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {generatedReply}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>

        <TabsContent value="article">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  كتابة مقال احترافي
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-2 block">موضوع المقال</Label>
                  <div className="relative">
                    <Textarea
                      value={articlePrompt}
                      onChange={(e) => setArticlePrompt(e.target.value)}
                      placeholder="اكتب موضوع المقال أو الفكرة التي تريد الكتابة عنها بالتفصيل..."
                      className="min-h-[120px] resize-none"
                      dir="auto"
                    />
                    {articlePrompt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setArticlePrompt('')}
                        className="absolute top-2 left-2 h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleGenerateArticle}
                  disabled={isGeneratingArticle || !articlePrompt.trim()}
                  className="w-full"
                >
                  {isGeneratingArticle ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      جاري كتابة المقال...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5 ml-2" />
                      كتابة المقال
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20">
                {error}
              </div>
            )}

            <AnimatePresence>
              {generatedArticle && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl p-5 shadow-sm border relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-1 h-full bg-primary" />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 border-b pb-4">
                    <h3 className="font-bold">المقال الجاهز</h3>
                    <Button 
                      variant="outline"
                      onClick={handleCopyArticle}
                      className="w-full sm:w-auto"
                    >
                      {articleCopied ? (
                        <><Check className="w-4 h-4 ml-2 text-primary" /> تم النسخ</>
                      ) : (
                        <><Copy className="w-4 h-4 ml-2" /> نسخ المقال</>
                      )}
                    </Button>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed" dir="rtl">
                    <Markdown>{generatedArticle}</Markdown>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
