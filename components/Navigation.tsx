import React from 'react';
import { AppView } from '../types';
import { Map, Wine, Sparkles, Settings, Utensils, BookOpen, Home, WineOff } from 'lucide-react';
import { t, Language } from '../translations';

interface NavigationProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  language: Language;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, setView, language }) => {
  const tabs: { id: AppView; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'home', labelKey: 'nav.home', icon: <Home size={20} /> },
    { id: 'journey', labelKey: 'nav.journey', icon: <Map size={20} /> },
    { id: 'menu', labelKey: 'nav.menu', icon: <Utensils size={20} /> },
    { id: 'wineries', labelKey: 'nav.wineries', icon: <Wine size={20} /> },
    { id: 'opening-guide', labelKey: 'nav.opening_guide', icon: <WineOff size={20} /> },
    { id: 'glossary', labelKey: 'nav.glossary', icon: <BookOpen size={20} /> },
    { id: 'ai-assistant', labelKey: 'nav.sommelier', icon: <Sparkles size={20} /> },
    { id: 'admin', labelKey: 'nav.admin', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border flex justify-around items-center px-2 py-4 safe-bottom z-50 shadow-[0_-15px_40px_rgba(0,0,0,0.05)] transition-colors duration-500">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 relative group flex-1 ${currentView === tab.id ? 'text-primary scale-105' : 'text-secondary hover:text-accent'
            }`}
        >
          <div className={`${currentView === tab.id ? 'text-accent drop-shadow-[0_0_5px_rgba(244,196,48,0.5)]' : 'transition-transform'}`}>
            {tab.icon}
          </div>
          <span className="font-sans text-[7px] font-bold uppercase tracking-[0.1em]">{t(tab.labelKey, language)}</span>
          {currentView === tab.id && (
            <div className="absolute -bottom-2 w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(244,196,48,0.6)]" />
          )}
        </button>
      ))}
    </nav>
  );
};