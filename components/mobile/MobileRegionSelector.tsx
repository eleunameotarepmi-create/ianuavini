import React, { useState } from 'react';
import { ALL_REGIONS } from '../regions/registry';
import { ChevronRight, BookOpen, Lock, Feather, X } from 'lucide-react';
import { t, Language } from '../../translations';
import { getHomeIntro } from '../../contentTranslations';

interface MobileRegionSelectorProps {
    onSelectRegion: (id: string) => void;
    onOpenGlossary: () => void;
    onOpenAdmin: () => void;
    language: 'it' | 'en' | 'fr';
}

export const MobileRegionSelector: React.FC<MobileRegionSelectorProps> = ({ onSelectRegion, onOpenGlossary, onOpenAdmin, language }) => {
    const [showManifesto, setShowManifesto] = useState(false);
    const homeIntro = getHomeIntro(language);

    return (
        <div className="p-4 space-y-6 pt-12 pb-32">


            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <h1 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-[0.2em]">Ianua</h1>
                    <p className="text-sm font-serif text-stone-400 italic">
                        {language === 'it' ? 'La Cantina' : language === 'fr' ? 'La Cave' : 'The Cellar'}
                        <span onClick={() => setShowManifesto(true)} className="ml-2 inline-flex items-center gap-1 cursor-pointer text-[#D4AF37]/60 text-sm hover:text-[#D4AF37]/80 transition-colors" style={{ fontFamily: "'Great Vibes', cursive" }}>
                            by Louvin <Feather size={12} className="inline -rotate-45 opacity-70" />
                        </span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onOpenAdmin}
                        className="p-3 text-[#D4AF37] bg-[#D4AF37]/5 rounded-full hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20"
                        aria-label="Admin"
                    >
                        <Lock size={20} />
                    </button>
                    <button
                        onClick={onOpenGlossary}
                        className="p-3 text-[#D4AF37] bg-[#D4AF37]/5 rounded-full hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20"
                        aria-label="Glossario"
                    >
                        <BookOpen size={20} />
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {ALL_REGIONS.map((region) => (
                    <div
                        key={region.id}
                        onClick={() => onSelectRegion(region.id)}
                        className="group relative h-48 w-full rounded-2xl overflow-hidden shadow-lg border border-stone-800 active:scale-95 transition-transform duration-300"
                    >
                        {/* Background Image */}
                        <div className="absolute inset-0 bg-stone-900">
                            <img
                                src={region.coverImage || region.heroImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80"}
                                alt={region.label}
                                className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-2xl font-serif text-stone-100 uppercase tracking-widest mb-1 group-hover:text-[#D4AF37] transition-colors">
                                        {region.label}
                                    </h3>
                                    <p className="text-xs text-stone-400 font-sans uppercase tracking-wider line-clamp-1">
                                        {region.id === 'vda'
                                            ? t('region.begin_ascent', language)
                                            : (t(`region.intro.${region.id}`, language) !== `region.intro.${region.id}`
                                                ? t(`region.intro.${region.id}`, language)
                                                : t('region.discover_wines', language))
                                        }
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-stone-800/60 border border-[#D4AF37]/40 flex items-center justify-center backdrop-blur-sm group-hover:border-[#D4AF37]/70 group-hover:bg-stone-800/80 transition-colors">
                                    <ChevronRight className="text-[#D4AF37]" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manifesto Modal */}
            {showManifesto && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowManifesto(false)}>
                    <div className="relative max-w-md w-full rounded-2xl border border-[#D4AF37]/30 overflow-hidden" onClick={e => e.stopPropagation()}
                        style={{ background: 'linear-gradient(160deg, #1c1917 0%, #0c0a09 50%, #1c1917 100%)' }}>
                        {/* Close button */}
                        <button onClick={() => setShowManifesto(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-800/60 flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                            <X size={16} />
                        </button>

                        <div className="p-8 space-y-6">
                            {/* Header */}
                            <div className="text-center space-y-2">
                                <Feather size={24} className="text-[#D4AF37] mx-auto" />
                                <h2 className="text-xl font-serif text-[#D4AF37] uppercase tracking-[0.2em]">Ianua</h2>
                                <div className="w-16 h-px bg-[#D4AF37]/30 mx-auto" />
                            </div>

                            {/* Manifesto text */}
                            <div className="space-y-4">
                                {homeIntro.manifesto.split('\n\n').map((paragraph: string, idx: number) => (
                                    <p key={idx} className="text-stone-300 font-serif text-sm leading-relaxed italic text-center">
                                        {paragraph}
                                    </p>
                                ))}
                            </div>

                            {/* Footer divider */}
                            <div className="flex items-center gap-3 pt-2">
                                <div className="flex-1 h-px bg-[#D4AF37]/20" />
                                <span className="text-[#D4AF37] text-sm drop-shadow-[0_0_10px_rgba(244,196,48,0.4)]" style={{ fontFamily: "'Great Vibes', cursive" }}>Giuliana e Paolo</span>
                                <div className="flex-1 h-px bg-[#D4AF37]/20" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
