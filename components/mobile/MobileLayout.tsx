import React, { useState } from 'react';
import { Home, Search, Sparkles, Camera, BookOpen, Utensils } from 'lucide-react';
import { Wine, Winery, MenuItem } from '../../types';

interface MobileLayoutProps {
    children: React.ReactNode;
    activeTab: 'home' | 'cellar' | 'sommelier' | 'scan' | 'menu' | 'glossary';
    onTabChange: (tab: 'home' | 'cellar' | 'sommelier' | 'scan' | 'menu' | 'glossary') => void;
    isAuthenticated: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
    children,
    activeTab,
    onTabChange,
    isAuthenticated
}) => {
    return (
        <div className="flex flex-col h-screen bg-stone-950 text-stone-100 overflow-hidden font-sans">
            {/* Main Content Area - Scrollable */}
            <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth pb-24 relative">
                {children}
            </main>

            {/* Bottom Navigation Dock */}
            <nav className="fixed bottom-0 left-0 right-0 bg-stone-900/95 backdrop-blur-md border-t border-white/5 pb-safe-area-inset-bottom z-50 pt-2 px-2 shadow-2xl">
                <div className="flex justify-around items-end h-16 pb-2">

                    <NavButton
                        icon={<Home size={24} />}
                        label="Home"
                        isActive={activeTab === 'home'}
                        onClick={() => onTabChange('home')}
                    />

                    <NavButton
                        icon={<Search size={24} />}
                        label="Cerca"
                        isActive={activeTab === 'cellar'}
                        onClick={() => onTabChange('cellar')}
                    />

                    {/* Center FAB - Sommelier */}
                    <div className="relative -top-6">
                        <button
                            onClick={() => onTabChange('sommelier')}
                            className={`w-14 h-14 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-all duration-300 ${activeTab === 'sommelier'
                                ? 'bg-stone-800 border-2 border-[#D4AF37] text-[#D4AF37] scale-110'
                                : 'bg-stone-800 border border-[#D4AF37]/50 text-[#D4AF37]'
                                }`}
                        >
                            <Sparkles size={24} strokeWidth={2} />
                        </button>
                        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-wider font-bold text-[#D4AF37]">
                            AI
                        </span>
                    </div>

                    <NavButton
                        icon={<Utensils size={24} />}
                        label="Menu"
                        isActive={activeTab === 'menu'}
                        onClick={() => onTabChange('menu')}
                    />

                    <NavButton
                        icon={<Camera size={24} />}
                        label="Scan"
                        isActive={activeTab === 'scan'}
                        onClick={() => onTabChange('scan')}
                    />

                </div>
            </nav>
        </div>
    );
};

interface NavButtonProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 p-2 w-16 transition-colors duration-300 ${isActive ? 'text-[#D4AF37]' : 'text-stone-500 hover:text-stone-300'
            }`}
    >
        <div className={`transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
            {icon}
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-medium ${isActive ? 'opacity-100' : 'opacity-60'} transition-opacity duration-300 -mt-1`}>
            {label}
        </span>
    </button>
);
