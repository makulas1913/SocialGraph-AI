import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Trash2, RefreshCw, MessageSquare, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

interface HistoryItem {
  id: string;
  prompt: string;
  content: string;
  type: string;
  createdAt: string;
}

export function History() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'history'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const data: HistoryItem[] = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as HistoryItem);
      });
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history from Firestore:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;
    try {
      await deleteDoc(doc(db, 'history', id));
      setHistory(prev => prev.filter(item => item.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      console.error("Failed to delete history from Firestore:", err);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const renderContent = (item: HistoryItem) => {
    try {
      const parsed = JSON.parse(item.content);
      if (Array.isArray(parsed)) {
        return (
          <div className="space-y-3">
            {parsed.map((tweet, idx) => {
              const copyKey = `${item.id}-tweet-${idx}`;
              return (
                <Card key={idx} className="relative group">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        تغريدة {idx + 1}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); handleCopy(tweet.text, copyKey); }}
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        title="نسخ التغريدة"
                      >
                        {copiedId === copyKey ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{tweet.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      }
      
      const copyKey = `${item.id}-content`;
      return (
        <Card className="glass border-border/50 relative group">
          <CardContent className="p-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleCopy(typeof parsed === 'string' ? parsed : JSON.stringify(parsed), copyKey); }}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="نسخ المحتوى"
              >
                {copiedId === copyKey ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">
              {typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)}
            </div>
          </CardContent>
        </Card>
      );
    } catch (e) {
      const copyKey = `${item.id}-raw`;
      return (
        <Card className="glass border-border/50 relative group">
          <CardContent className="p-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => { e.stopPropagation(); handleCopy(item.content, copyKey); }}
                className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="نسخ المحتوى"
              >
                {copiedId === copyKey ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="text-sm whitespace-pre-wrap leading-relaxed">{item.content}</div>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-primary" />
            سجل المحتوى
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            جميع الثريدات والتغريدات التي قمت بتوليدها محفوظة هنا.
          </p>
        </div>
        <Button 
          variant="outline"
          size="icon"
          onClick={fetchHistory}
          disabled={isLoading}
          title="تحديث"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <RefreshCw className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : history.length === 0 ? (
        <Card className="glass border-border/50 text-center py-20 border-dashed">
          <CardContent>
            <MessageSquare className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-medium">لا يوجد سجل حتى الآن</h3>
            <p className="text-muted-foreground mt-2 text-sm">قم بتوليد بعض المحتوى في استوديو المحتوى ليظهر هنا.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass border-border/50 overflow-hidden">
                <div 
                  className="p-4 sm:p-5 cursor-pointer hover:bg-muted/50 transition-colors flex justify-between items-center gap-3 sm:gap-4"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {item.type === 'thread' ? 'ثريد' : item.type === 'reply' ? 'رد' : item.type === 'article' ? 'مقال' : item.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <h3 className="font-medium text-sm sm:text-base truncate">
                      {item.prompt}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="p-2 text-muted-foreground">
                      {expandedId === item.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-t"
                    >
                      <div className="p-4 sm:p-5 bg-muted/30">
                        {renderContent(item)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
