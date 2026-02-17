import React, { useState, useEffect } from 'react';
import { ArrowRight, Mountain, Grape, Anchor, Sun, Wind, Home } from 'lucide-react';
import { RegionConfig } from './regions/types';
import { getHomeIntro, getWineriesIntroContent, getPiemonteIntroContent, getLiguriaIntroContent, getSardegnaIntroContent } from '../contentTranslations';
import { t } from '../translations';

interface RegionCoverViewProps {
    region: RegionConfig;
    onEnter: () => void;
    onViewMenu?: () => void;
    onHome?: () => void;
    language: 'it' | 'en' | 'fr';
}

export const RegionCoverView: React.FC<RegionCoverViewProps> = ({ region, onEnter, onViewMenu, onHome, language }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    // Helper to get localized content
    const getLocalizedRegionData = () => {
        if (region.id === 'vda') {
            const content = getWineriesIntroContent(language);
            return {
                // IMPORTANT: VDA has NO introTitle in the original config. 
                // Do NOT inject content.title here to respect the original design.
                introTitle: content.title,
                details: {
                    territory: {
                        title: content.sections[0].title,
                        points: content.sections[0].items
                    },
                    philosophy: {
                        title: content.sections[1].title,
                        points: content.sections[1].items
                    },
                    varieties: {
                        title: content.grapes.title,
                        groups: content.grapes.categories.map(c => ({
                            label: c.name,
                            items: c.list.split(' · ')
                        }))
                    }
                }
            };
        }
        if (region.id === 'piemonte') {
            const content = getPiemonteIntroContent(language);
            return {
                introTitle: content.title,
                details: {
                    territory: { title: content.sections[0].title, points: content.sections[0].items },
                    philosophy: { title: content.sections[1].title, points: content.sections[1].items },
                    varieties: {
                        title: content.grapes.title,
                        groups: content.grapes.categories.map(c => ({ label: c.name, items: c.list.split(' · ') }))
                    }
                }
            };
        }
        if (region.id === 'liguria') {
            const content = getLiguriaIntroContent(language);
            return {
                introTitle: content.title,
                details: {
                    territory: { title: content.sections[0].title, points: content.sections[0].items },
                    philosophy: { title: content.sections[1].title, points: content.sections[1].items },
                    varieties: {
                        title: content.grapes.title,
                        groups: content.grapes.categories.map(c => ({ label: c.name, items: c.list.split(' · ') }))
                    }
                }
            };
        }
        if (region.id === 'sardegna') {
            const content = getSardegnaIntroContent(language);
            return {
                introTitle: content.title,
                details: {
                    territory: { title: content.sections[0].title, points: content.sections[0].items },
                    philosophy: { title: content.sections[1].title, points: content.sections[1].items },
                    varieties: {
                        title: content.grapes.title,
                        groups: content.grapes.categories.map(c => ({ label: c.name, items: c.list.split(' · ') }))
                    }
                }
            };
        }
        return {
            introTitle: region.introTitle,
            details: region.details
        };
    };

    const localizedData = getLocalizedRegionData();

    const getIcon = (id: string) => {
        switch (id) {
            case 'vda': return Mountain;
            case 'piemonte': return Grape;
            case 'liguria': return Anchor;
            case 'sardegna': return Sun;
            default: return Grape;
        }
    };

    const Icon = getIcon(region.id);

    return (
        <div className="relative min-h-screen w-full bg-[#1c1917] font-serif overflow-y-auto transition-colors duration-1000">
            {/* Background Image - Fixed to ensure it stays during mobile scroll */}
            <div className="fixed inset-0 z-0">
                <div
                    className={`fixed inset-0 bg-cover bg-center transition-transform duration-[3000ms] ease-out ${isVisible ? 'scale-105' : 'scale-100'}`}
                    style={{ backgroundImage: `url("${region.coverImage || region.heroImage}")` }}
                />
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[0.5px]" />
            </div>

            {/* Home Button - Top Right - Optimized Touch Target */}
            {onHome && (
                <button
                    onClick={onHome}
                    className="fixed top-6 right-6 z-50 p-4 bg-stone-900/30 backdrop-blur-md border border-[#D4AF37]/40 rounded-full text-[#D4AF37] hover:bg-[#D4AF37] hover:text-stone-900 transition-all duration-500 group shadow-[0_0_20px_rgba(212,175,55,0.2)] active:scale-95"
                    title="Torna alla Home"
                >
                    <Home size={22} className="group-hover:scale-110 transition-transform" />
                </button>
            )}

            {/* Main Layout Container */}
            <div className={`relative z-10 min-h-screen flex flex-col items-center justify-between pt-12 pb-24 px-6 transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>

                {/* Top Section: Header + Title */}
                <div className="flex flex-col items-center w-full shrink-0">
                    {/* 1. Header Portion: Icon and Region */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="fixed inset-0 bg-[#D4AF37]/40 blur-3xl rounded-full scale-[2.2]" />
                            <Icon size={46} className="relative text-[#D4AF37] drop-shadow-[0_0_20px_rgba(244,196,48,0.8)]" strokeWidth={1} />
                        </div>
                        <span className="text-xs uppercase tracking-[0.8em] text-[#D4AF37] font-bold drop-shadow-[0_0_15px_rgba(244,196,48,0.5)] text-center">
                            {region.id === 'vda' ? "Valle d'Aosta • Vallée d'Aoste" : region.label}
                        </span>
                    </div>

                    {/* 2. Center Piece: The Big Hero Title */}
                    {localizedData.introTitle && (
                        <div className="flex flex-col items-center text-center max-w-5xl mt-8 mb-12">
                            <h1 className={`font-serif text-white uppercase tracking-[0.15em] leading-tight mb-6 drop-shadow-lg ${localizedData.introTitle.length > 25
                                ? 'text-2xl
                                : 'text-3xl
                                }`}>
                                {localizedData.introTitle}
                            </h1>
                            <div className="w-16 h-[1px] bg-[#D4AF37]/40" />
                        </div>
                    )}
                </div>

                {/* 3. The Integrated Info Grid: Territory, Philosophy, Varieties */}
                {localizedData.details && (
                    <div className="w-full flex-grow flex items-center justify-center my-8">
                        <div className="w-full grid grid-cols-1 gap-12 items-start max-w-6xl mx-auto">
                            {/* Territory */}
                            <div className="flex flex-col items-center text-center group">
                                <h3 className="text-[12px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold flex items-center gap-3 drop-shadow-[0_0_10px_rgba(244,196,48,0.4)]">
                                    <Mountain size={15} className="opacity-90" /> {localizedData.details.territory.title}
                                </h3>
                                <div className="space-y-4">
                                    {localizedData.details.territory.points.slice(0, 4).map((point, idx) => (
                                        <p key={idx} className="text-sm text-stone-300 italic font-light leading-relaxed">
                                            {point}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Philosophy */}
                            <div className="flex flex-col items-center text-center group">
                                <h3 className="text-[12px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold flex items-center gap-3 drop-shadow-[0_0_10px_rgba(244,196,48,0.4)]">
                                    <Wind size={15} className="opacity-90" /> {localizedData.details.philosophy.title}
                                </h3>
                                <div className="space-y-4">
                                    {localizedData.details.philosophy.points.slice(0, 4).map((point, idx) => (
                                        <p key={idx} className="text-sm text-stone-300 italic font-light leading-relaxed">
                                            {point}
                                        </p>
                                    ))}
                                </div>
                            </div>

                            {/* Varieties */}
                            <div className="flex flex-col items-center text-center group">
                                <h3 className="text-[12px] uppercase tracking-[0.3em] text-[#D4AF37] mb-6 font-bold flex items-center gap-3 drop-shadow-[0_0_10px_rgba(244,196,48,0.4)]">
                                    <Grape size={15} className="opacity-90" /> {localizedData.details.varieties.title}
                                </h3>
                                <div className="space-y-6">
                                    {localizedData.details.varieties.groups.map((group, idx) => (
                                        <div key={idx} className="flex flex-col gap-3">
                                            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]/80 font-bold">
                                                {group.label}
                                            </span>
                                            <p className="text-sm text-stone-200 font-light leading-relaxed">
                                                {group.items.join(' • ')}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Bottom Portion: Action Buttons - Touch Optimized */}
                <div className="flex flex-col sm:flex-row items-center gap-6 mt-12 shrink-0 pb-8 w-full sm:w-auto">
                    <button
                        onClick={onViewMenu}
                        className="group relative w-full sm:w-auto px-10 py-5 bg-stone-900/80 backdrop-blur-xl border border-[#D4AF37]/50 text-white uppercase tracking-[0.25em] text-sm font-serif hover:bg-stone-800 hover:border-[#D4AF37] transition-all duration-500 rounded-full shadow-[0_0_30px_rgba(244,196,48,0.2)] active:scale-[0.98]"
                    >
                        <span className="flex items-center justify-center gap-3">
                            {t('cover.a_la_cave', language)} <ArrowRight size={20} className="text-[#D4AF37] group-hover:translate-x-1 transition-transform drop-shadow-[0_0_5px_rgba(244,196,48,0.4)]" />
                        </span>
                    </button>

                    <button
                        onClick={onEnter}
                        className="group w-full sm:w-auto px-10 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-stone-400 uppercase tracking-[0.2em] text-[10px] font-serif hover:text-white hover:border-white/30 transition-all duration-500 rounded-full active:scale-[0.98]"
                    >
                        {t('cover.explore_wineries', language)}
                    </button>
                </div>
            </div>
        </div>
    );
};
