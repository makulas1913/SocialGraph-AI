import React from 'react';
import { useNavigationStore, ModuleId } from '../../stores/useNavigationStore';
import { LayoutDashboard, UserCircle, PenTool, Inbox, MessageSquare, History, Settings, Bot, Sun, Moon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';
import { useTheme } from '../ThemeProvider';

const modules: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'persona', label: 'الهوية الرقمية', icon: UserCircle },
  { id: 'content', label: 'استوديو المحتوى', icon: PenTool },
  { id: 'inbox', label: 'المنشن والردود', icon: Inbox },
  { id: 'dms', label: 'الرسائل الخاصة', icon: MessageSquare },
  { id: 'history', label: 'السجل', icon: History },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function PrimarySidebar() {
  const { activeModule, setActiveModule } = useNavigationStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="hidden lg:flex w-16 h-[100dvh] glass border-l border-border/50 flex-col items-center py-4 z-20 shrink-0">
      <div className="mb-8 flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
        <Bot className="w-6 h-6" />
      </div>

      <div className="flex-1 flex flex-col gap-3 w-full px-2">
        <TooltipProvider delayDuration={0}>
          {modules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <Tooltip key={m.id}>
                <TooltipTrigger
                  onClick={() => setActiveModule(m.id)}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 relative group",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                      : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  )}
                >
                  <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute -left-2 w-1 h-6 bg-primary rounded-l-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                    />
                  )}
                </TooltipTrigger>
                <TooltipContent side="left" className="font-sans text-xs border-border/50 bg-background text-foreground font-bold uppercase tracking-wider">
                  {m.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <div className="mt-auto flex flex-col gap-3 w-full px-2">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </TooltipTrigger>
            <TooltipContent side="left" className="font-sans text-xs border-border/50 bg-background text-foreground font-bold uppercase tracking-wider">
              {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

