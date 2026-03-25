import React from 'react';
import { PrimarySidebar } from './PrimarySidebar';
import { ContextSidebar } from './ContextSidebar';
import { ActionHeader } from './ActionHeader';
import { useNavigationStore, ModuleId } from '../../stores/useNavigationStore';
import { LayoutDashboard, UserCircle, PenTool, Inbox, MessageSquare, History, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface MainLayoutProps {
  username: string | null;
  onLogout: () => void;
  onLogin: () => void;
  children: React.ReactNode;
}

const mobileModules: { id: ModuleId; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
  { id: 'persona', label: 'الهوية', icon: UserCircle },
  { id: 'content', label: 'الاستوديو', icon: PenTool },
  { id: 'inbox', label: 'المنشن', icon: Inbox },
  { id: 'history', label: 'السجل', icon: History },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ username, onLogout, onLogin, children }) => {
  const { activeModule, setActiveModule } = useNavigationStore();

  return (
    <div className="flex h-[100dvh] bg-transparent text-foreground overflow-hidden" dir="rtl">
      <PrimarySidebar />
      <ContextSidebar />
      
      <div className="flex-1 flex flex-col min-w-0 relative">
        <ActionHeader username={username} onLogin={onLogin} onLogout={onLogout} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-20 glass flex items-center justify-around px-4 z-50 pb-safe border-t border-border/50">
          {mobileModules.map((m) => {
            const Icon = m.icon;
            const isActive = activeModule === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveModule(m.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1.5 transition-all relative px-3 py-2 rounded-xl",
                  isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                <span className={cn("text-[10px] font-bold uppercase tracking-tighter", isActive ? "opacity-100" : "opacity-70")}>{m.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
