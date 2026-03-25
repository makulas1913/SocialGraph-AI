import React from 'react';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { Menu, Search, Bell, Plus, Twitter, LogOut, Sun, Moon, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTheme } from '../ThemeProvider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ActionHeaderProps {
  username?: string | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

export function ActionHeader({ username, onLogin, onLogout }: ActionHeaderProps) {
  const { toggleContextSidebar } = useNavigationStore();
  const { theme, setTheme } = useTheme();

  return (
    <header className="h-16 border-b border-border/50 glass flex items-center justify-between px-4 lg:px-8 z-30 sticky top-0 shrink-0">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleContextSidebar} className="text-muted-foreground hidden lg:flex hover:bg-primary/10 hover:text-primary rounded-xl">
          <Menu className="w-5 h-5" />
        </Button>
        
        {/* Mobile Menu Trigger */}
        <Button variant="ghost" size="icon" className="lg:hidden text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative hidden md:flex items-center w-64 lg:w-96 group">
          <Search className="w-4 h-4 absolute right-3 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="ابحث في التطبيق..." 
            className="pl-3 pr-9 bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:bg-background h-10 text-sm rounded-xl transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <Button variant="outline" size="sm" className="hidden sm:flex gap-2 h-10 rounded-xl border-border/50 hover:bg-muted text-foreground">
          <Plus className="w-4 h-4" />
          <span className="font-bold text-xs uppercase tracking-wider">تغريدة جديدة</span>
        </Button>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl h-10 w-10"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="text-muted-foreground relative hover:bg-primary/10 hover:text-primary rounded-xl h-10 w-10">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-background shadow-[0_0_4px_rgba(79,70,229,0.5)]"></span>
        </Button>

        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block"></div>

        {username ? (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-transparent hover:ring-primary/30 transition-all border border-border/50">
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl border-border/50 shadow-xl glass">
              <DropdownMenuLabel className="px-3 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none">{username}</p>
                  <p className="text-xs leading-none text-muted-foreground">متصل الآن</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2 bg-border/50" />
              <DropdownMenuItem onClick={onLogout} className="text-destructive cursor-pointer rounded-lg px-3 py-2 focus:bg-destructive/10 focus:text-destructive">
                <LogOut className="w-4 h-4 ml-2" />
                <span className="font-bold text-xs uppercase tracking-wider">تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={onLogin} size="sm" className="gap-2 h-10 rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white border-0">
            <UserCircle className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-wider">تسجيل الدخول</span>
          </Button>
        )}
      </div>
    </header>
  );
}
