import { create } from 'zustand';

export type ModuleId = 'dashboard' | 'persona' | 'content' | 'inbox' | 'dms' | 'history' | 'settings';

interface NavigationState {
  activeModule: ModuleId;
  setActiveModule: (module: ModuleId) => void;
  isContextSidebarOpen: boolean;
  toggleContextSidebar: () => void;
}

export const useNavigationStore = create<NavigationState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
  isContextSidebarOpen: true,
  toggleContextSidebar: () => set((state) => ({ isContextSidebarOpen: !state.isContextSidebarOpen })),
}));

