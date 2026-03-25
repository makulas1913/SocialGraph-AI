import React, { useState, useEffect } from 'react';
import { MessageSquare, RefreshCw, Loader2, Send, Sparkles, Check, Twitter } from 'lucide-react';
import { generateReply } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  const { twitterUser: username, login: onLogin } = useAuth();
  
  const [dms, setDms] = useState<DMEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDm, setSelectedDm] = useState<DMEvent | null>(null);
  
  // Reply State
  const [replyText, setReplyText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Personas state
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('default');

  const fetchPersonas = async () => {
    try {
      const { db } = await import('@/lib/firebase');
      const { collection, getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(collection(db, 'personas'));
      const fetchedPersonas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPersonas(fetchedPersonas);
      if (fetchedPersonas.length > 0 && !fetchedPersonas.find(p => p.id === 'default')) {
         setSelectedPersonaId(fetchedPersonas[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch personas", error);
    }
  };

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
      fetchPersonas();
    }
  }, [username]);

  if (!username) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
          <Twitter size={40} />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">الرسائل الخاصة</h2>
        <p className="text-muted-foreground max-w-md mb-8">
          قم بربط حساب X الخاص بك للوصول إلى رسائلك الخاصة والرد عليها بذكاء وسرعة باستخدام الذكاء الاصطناعي.
        </p>
        <Button
          onClick={onLogin}
          size="lg"
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Twitter size={20} />
          ربط حساب X
        </Button>
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
      const generated = await generateReply(prompt, undefined, undefined, 'احترافي وودي', selectedPersonaId);
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
            <MessageSquare className="text-primary w-6 h-6 md:w-8 md:h-8" />
            الرسائل الخاصة
          </h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">قراءة والرد على الرسائل الخاصة (DMs) باستخدام الذكاء الاصطناعي</p>
        </div>
        <div className="flex items-center gap-4">
          {personas.length > 0 && (
            <div className="flex items-center gap-3 bg-muted/50 p-2 rounded-xl border border-border/50">
              <Label className="text-sm font-medium text-foreground whitespace-nowrap">الشخصية:</Label>
              <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId} dir="rtl">
                <SelectTrigger className="w-[150px] bg-background border-border/50">
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
          <Button 
            onClick={fetchDms}
            disabled={isLoading}
            variant="outline"
            className="gap-2 w-full md:w-auto border-border/50 hover:bg-muted/50 text-primary"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
            تحديث
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 text-destructive p-4 rounded-xl text-sm border border-destructive/20"
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-primary/10 text-primary p-4 rounded-xl text-sm border border-primary/20 flex items-center gap-2"
          >
            <Check size={18} />
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-[600px]">
        {/* DMs List */}
        <Card className="glass lg:col-span-1 flex flex-col h-full overflow-hidden border-border/50">
          <CardHeader className="py-4 border-b border-border/50 bg-muted/50">
            <CardTitle className="text-base flex items-center justify-between">
              <span>أحدث الرسائل</span>
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{dms.length}</span>
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {isLoading && dms.length === 0 ? (
                <div className="flex justify-center items-center h-40 text-muted-foreground">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : dms.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-center">
                  <MessageSquare size={48} className="mb-4 opacity-20" />
                  <p>لا توجد رسائل جديدة حالياً.</p>
                </div>
              ) : (
                dms.map((dm) => (
                  <div 
                    key={dm.id}
                    onClick={() => handleGenerateReply(dm)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedDm?.id === dm.id 
                        ? 'bg-primary/5 border-primary/30 shadow-sm' 
                        : 'bg-muted/30 border-transparent hover:border-border/50 hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 border">
                        <AvatarImage src={dm.sender?.profile_image_url} alt={dm.sender?.name} />
                        <AvatarFallback>{dm.sender?.name?.charAt(0) || '?'}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-semibold text-sm text-foreground truncate">{dm.sender?.name}</span>
                          <span className="text-xs text-muted-foreground truncate">@{dm.sender?.username}</span>
                        </div>
                        <p className="text-sm text-foreground/80 line-clamp-2 leading-relaxed">{dm.text}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Reply Composer */}
        <Card className="glass lg:col-span-2 flex flex-col h-full overflow-hidden border-border/50">
          {selectedDm ? (
            <>
              <CardHeader className="py-4 border-b border-border/50 bg-muted/30">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 border">
                    <AvatarImage src={selectedDm.sender?.profile_image_url} alt={selectedDm.sender?.name} />
                    <AvatarFallback>{selectedDm.sender?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-foreground">{selectedDm.sender?.name}</span>
                      <span className="text-sm text-muted-foreground">@{selectedDm.sender?.username}</span>
                    </div>
                    <p className="text-foreground/90 mt-1 leading-relaxed">{selectedDm.text}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-6 gap-4">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles size={18} className="text-primary" />
                    الرد المقترح
                  </label>
                  <Button 
                    onClick={() => handleGenerateReply(selectedDm)}
                    disabled={isGenerating}
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/10 gap-2"
                  >
                    <RefreshCw size={14} className={isGenerating ? "animate-spin" : ""} />
                    إعادة توليد
                  </Button>
                </div>
                
                {isGenerating ? (
                  <div className="flex-1 bg-muted/30 rounded-xl border border-border/50 flex flex-col items-center justify-center text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin mb-3 text-primary" />
                    <p>جاري توليد الرد الذكي...</p>
                  </div>
                ) : (
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 w-full p-4 rounded-xl resize-none text-base leading-relaxed bg-muted/30 border-border/50 focus-visible:ring-primary"
                    placeholder="سيظهر الرد المقترح هنا. يمكنك تعديله قبل الإرسال..."
                  />
                )}
              </CardContent>

              <CardFooter className="p-6 pt-0 border-t border-border/50 bg-muted/30 flex justify-end">
                <Button
                  onClick={handleSendReply}
                  disabled={!replyText || isSending || isGenerating}
                  className="gap-2 mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                  size="lg"
                >
                  {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  <span>إرسال الرسالة</span>
                </Button>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-center p-6">
              <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={40} className="text-primary/50" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">اختر رسالة للرد عليها</h3>
              <p className="max-w-sm">قم باختيار إحدى الرسائل من القائمة الجانبية ليقوم الذكاء الاصطناعي باقتراح رد مناسب لها.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
