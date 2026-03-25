import React from 'react';
import { useNavigationStore, ModuleId } from '../../stores/useNavigationStore';
import { cn } from '@/lib/utils';

const moduleContexts: Record<ModuleId, { title: string; links: { label: string; id: string }[] }> = {
  dashboard: {
    title: 'الرئيسية',
    links: [{ label: 'نظرة عامة', id: 'overview' }, { label: 'الإحصائيات', id: 'stats' }]
  },
  persona: {
    title: 'الهوية الرقمية',
    links: [{ label: 'إعدادات الهوية', id: 'settings' }, { label: 'النبرة والأسلوب', id: 'tone' }, { label: 'الاهتمامات', id: 'interests' }]
  },
  content: {
    title: 'استوديو المحتوى',
    links: [{ label: 'كتابة ثريد', id: 'thread' }, { label: 'تغريدة سريعة', id: 'quick' }, { label: 'مقال', id: 'article' }]
  },
  inbox: {
    title: 'المنشن والردود',
    links: [{ label: 'المنشن الجديد', id: 'new' }, { label: 'الردود السابقة', id: 'replied' }]
  },
  dms: {
    title: 'الرسائل الخاصة',
    links: [{ label: 'صندوق الوارد', id: 'inbox' }, { label: 'رسائل مرسلة', id: 'sent' }]
  },
  history: {
    title: 'السجل',
    links: [{ label: 'كل السجلات', id: 'all' }, { label: 'الثريدات', id: 'threads' }, { label: 'الردود', id: 'replies' }]
  },
  settings: {
    title: 'الإعدادات',
    links: [{ label: 'حساب تويتر', id: 'twitter' }, { label: 'النظام', id: 'system' }]
  }
};

export function ContextSidebar() {
  const { activeModule, isContextSidebarOpen } = useNavigationStore();
  const context = moduleContexts[activeModule];

  return (
    <div 
      className={cn(
        "hidden lg:flex h-[100dvh] glass border-l border-border/50 flex-col transition-all duration-300 ease-in-out z-10 shrink-0",
        isContextSidebarOpen ? "w-64" : "w-0 overflow-hidden border-none"
      )}
    >
      <div className="h-16 flex items-center px-6 border-b border-border/50 shrink-0 bg-transparent">
        <h2 className="font-bold text-lg text-foreground truncate">{context.title}</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <div className="px-2 mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">القائمة الفرعية</p>
        </div>
        {context.links.map((link, idx) => (
          <button
            key={link.id}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all group",
              idx === 0 
                ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            )}
          >
            <div className={cn(
              "w-1.5 h-1.5 rounded-full transition-all",
              idx === 0 ? "bg-primary scale-100 shadow-[0_0_4px_rgba(79,70,229,0.5)]" : "bg-muted-foreground/30 scale-50 group-hover:scale-100 group-hover:bg-primary/50"
            )} />
            <span className="truncate">{link.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

