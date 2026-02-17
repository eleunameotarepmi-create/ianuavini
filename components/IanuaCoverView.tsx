import React, { useState, useEffect } from 'react';
import { ArrowRight, Lock, LogIn, Sparkles } from 'lucide-react';
import { getHomeIntro } from '../contentTranslations';
import { t } from '../translations';

// Internal BackgroundSlider component reused from App.tsx
const BackgroundSlider: React.FC = () => {
    const images = [
        "https://ianua.it/site/assets/files/1/img_20221021_204707_hdr.webp",
        "/assets/images/cellar_view.jpg"
    ];
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % images.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="absolute inset-0 z-0">
            {images.map((img, index) => (
                <div
                    key={img}
                    className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === current ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img src={img} className="w-full h-full object-cover scale-110 brightness-[0.5] blur-[1px]" alt="Background" />
                </div>
            ))}
            <div className="absolute inset-0 bg-black/30" />
        </div>
    );
};

interface IanuaCoverViewProps {
    onEnter: () => void;
    onViewMenu?: () => void;
    language: 'it' | 'en' | 'fr';
    setLanguage?: (lang: 'it' | 'en' | 'fr') => void;
    onLogin?: () => void;
}

export const IanuaCoverView: React.FC<IanuaCoverViewProps> = ({ onEnter, onViewMenu, language, setLanguage, onLogin }) => {

    return (
        <div className="relative h-screen w-full flex flex-col items-center justify-between text-center px-6 overflow-hidden bg-[#1c1917] pb-8">
            <BackgroundSlider />

            {/* Language Selector - Top Right on Mobile - Minimal and Single */}
            {/* Top Right Controls - Language & Admin */}
            <div className="absolute top-6 right-6 z-50 flex gap-2 items-center">
                {setLanguage && (
                    <div className="flex gap-2 mr-2">
                        <button
                            onClick={() => setLanguage('it')}
                            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded-full transition-all border border-white/10 ${language === 'it' ? 'bg-[#D4AF37] text-black shadow-lg border-[#D4AF37]' : 'bg-stone-900/40 text-white/50 hover:bg-white/10'}`}
                        >IT</button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded-full transition-all border border-white/10 ${language === 'en' ? 'bg-[#D4AF37] text-black shadow-lg border-[#D4AF37]' : 'bg-stone-900/40 text-white/50 hover:bg-white/10'}`}
                        >EN</button>
                    </div>
                )}
                {onLogin && (
                    <button
                        onClick={onLogin}
                        className="bg-stone-900/40 border border-white/10 text-white/50 hover:text-[#D4AF37] hover:border-[#D4AF37] p-1.5 rounded-full transition-all"
                        title="Admin Login"
                    >
                        <Lock size={14} />
                    </button>
                )}
            </div>

            {/* Main Content Area - Full Impact */}
            <div className="relative z-10 w-full max-w-7xl h-full flex flex-col items-center justify-between pt-20 pb-4">

                {/* Header Group */}
                <div className="flex flex-col items-center animate-in fade-in slide-in-from-top duration-1000">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="flex gap-1">
                            <div className="w-[2px] h-14 bg-[#D4AF37] shadow-[0_0_12px_rgba(244,196,48,0.5)]" />
                            <div className="w-[2px] h-14 bg-[#D4AF37] shadow-[0_0_12px_rgba(244,196,48,0.5)]" />
                        </div>
                        <h1 className="text-6xl sm:text-7xl font-serif text-[#D4AF37] uppercase tracking-[0.15em] drop-shadow-[0_0_12px_rgba(244,196,48,0.5)]">IANUA</h1>
                        <div className="flex gap-1">
                            <div className="w-[2px] h-14 bg-[#D4AF37] shadow-[0_0_12px_rgba(244,196,48,0.5)]" />
                            <div className="w-[2px] h-14 bg-[#D4AF37] shadow-[0_0_12px_rgba(244,196,48,0.5)]" />
                        </div>
                    </div>
                    <img src="/assets/ianua_ristorante.png" alt="Ristorante" className="h-14 w-auto mb-2 -mt-6 brightness-[1.12]" />
                    <span className="text-[10px] sm:text-xs font-serif italic tracking-[0.4em] uppercase text-[#D4AF37] drop-shadow-[0_0_12px_rgba(244,196,48,0.5)]">
                        La Porte des Alpes
                    </span>
                    <div className="mt-1 relative">
                        <h2 className="text-[10px] sm:text-xs font-serif tracking-[0.4em] uppercase text-[#D4AF37] drop-shadow-[0_0_12px_rgba(244,196,48,0.5)]">
                            Valle d'Aosta • Vallée d'Aoste
                        </h2>
                    </div>
                </div>

                {/* Manifesto - Big, Centered, Massive Impact with Serif Font */}
                <div className="w-full max-w-5xl transform animate-in fade-in duration-1000 delay-300 flex-grow flex flex-col justify-center">
                    <div className="text-[25px] sm:text-3xl text-stone-100 font-serif leading-snug italic space-y-4 px-2 text-center">
                        {getHomeIntro(language).manifesto.split('\n\n').map((paragraph, index) => (
                            <p key={index} className="text-balance drop-shadow-md">
                                {paragraph}
                            </p>
                        ))}
                        <div className="pt-4 flex justify-end pr-6 opacity-90">
                            <div className="relative inline-block transform -rotate-1">
                                <span className="block italic text-xl text-[#D4AF37] drop-shadow-[0_0_10px_rgba(244,196,48,0.4)]">Giuliana & Paolo</span>
                                <div className="absolute -bottom-2 right-0 w-32 h-[1px] bg-[#D4AF37]/60 shadow-[0_0_8px_rgba(244,196,48,0.3)]" />
                            </div>
                        </div>
                    </div>
                </div>


                {/* Desktop Buttons - Center Aligned below Text */}
                <div className="hidden sm:flex flex-row items-center justify-center gap-8 mt-12 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                    <button
                        onClick={onEnter}
                        className="group flex items-center gap-3 px-8 py-3.5 bg-stone-900/80 backdrop-blur-xl border border-[#D4AF37]/50 rounded-full text-white font-serif uppercase tracking-[0.2em] text-[12px] hover:bg-stone-800 hover:border-[#D4AF37] transition-all duration-500 shadow-[0_0_30px_rgba(212,175,55,0.2)] hover:scale-105"
                    >
                        {t('home.begin_ascent', language)} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                    </button>
                    {onViewMenu && (
                        <button
                            onClick={onViewMenu}
                            className="group flex items-center gap-3 px-7 py-3 bg-white/5 backdrop-blur-xl border border-[#D4AF37]/50 rounded-full text-white font-serif uppercase tracking-[0.2em] text-[11px] hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-500 shadow-xl hover:scale-105"
                        >
                            {t('home.view_menu', language)} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-[#D4AF37]" />
                        </button>
                    )}
                </div>

                {/* Mobile Buttons - Big and Tappable, Shifted Up */}
                <div className="sm:hidden w-full flex flex-row items-center justify-center gap-4 px-1 mb-16 animate-in fade-in slide-in-from-bottom duration-1000 delay-500">
                    <button
                        onClick={onEnter}
                        className="flex-1 group flex flex-col items-center justify-center py-7 bg-stone-900/90 backdrop-blur-xl border-2 border-[#D4AF37]/50 rounded-full text-white font-serif uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-stone-800 hover:border-[#D4AF37] transition-all duration-500 shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-95"
                    >
                        <span>{t('home.begin_ascent', language).split(' ').slice(0, 2).join(' ')}</span>
                        <span className="text-[#D4AF37] flex items-center gap-2">
                            {t('home.begin_ascent', language).split(' ').slice(2).join(' ')} <ArrowRight size={16} />
                        </span>
                    </button>
                    {onViewMenu && (
                        <button
                            onClick={onViewMenu}
                            className="flex-1 group flex flex-col items-center justify-center py-7 bg-white/10 backdrop-blur-xl border-2 border-[#D4AF37]/50 rounded-full text-white font-serif uppercase tracking-[0.2em] text-[13px] font-bold hover:bg-white/20 hover:border-[#D4AF37] transition-all duration-500 shadow-2xl active:scale-95"
                        >
                            <span>{t('home.view_menu', language).split(' ').slice(0, 2).join(' ')}</span>
                            <span className="text-[#D4AF37] flex items-center gap-2">
                                {t('home.view_menu', language).split(' ').slice(2).join(' ')} <ArrowRight size={16} />
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
