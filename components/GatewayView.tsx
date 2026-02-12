import React, { useState } from 'react';
import { Sparkles, ArrowRight, Mountain, Grape, Anchor, Sun } from 'lucide-react';
import { ALL_REGIONS } from './regions/registry';
import { getHomeIntro } from '../contentTranslations';

interface GatewayViewProps {
    onSelectRegion: (region: string) => void;
    language: 'it' | 'en' | 'fr';
}

export const GatewayView: React.FC<GatewayViewProps> = ({ onSelectRegion, language }) => {
    const [hovered, setHovered] = useState<string | null>(null);

    const getIcon = (id: string) => {
        switch (id) {
            case 'vda': return Mountain;
            case 'piemonte': return Grape;
            case 'liguria': return Anchor;
            case 'sardegna': return Sun;
            default: return Grape;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#1c1917] flex flex-col md:flex-row animate-in fade-in duration-1000 font-serif">

            {ALL_REGIONS.map((region) => {
                const Icon = getIcon(region.id);
                const isHovered = hovered === region.id;

                return (
                    <div
                        key={region.id}
                        onClick={() => onSelectRegion(region.id)}
                        onMouseEnter={() => setHovered(region.id)}
                        onMouseLeave={() => setHovered(null)}
                        className={`
                            relative flex-1 cursor-pointer group overflow-hidden 
                            border-b md:border-b-0 md:border-r border-[#D4AF37]/20 last:border-0
                            transition-all duration-700 ease-in-out
                            ${hovered && !isHovered ? 'opacity-40 scale-[0.98]' : 'opacity-100 scale-100'}
                        `}
                    >
                        {/* Background Image - Color on mobile, Grayscale on desktop unless hovered */}
                        <div className={`absolute inset-0 bg-cover bg-center transition-all duration-[2000ms] ease-out scale-100 group-hover:scale-105 ${isHovered ? 'grayscale-0' : 'grayscale-0 md:grayscale md:group-hover:grayscale-0'}`}
                            style={{ backgroundImage: `url("${region.heroImage}")` }}>
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-700" />
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-between py-6 md:py-16 px-6 text-center">

                            {/* TOP: ICON */}
                            <div className={`transition-all duration-700 transform ${isHovered ? 'scale-110' : 'scale-100'}`}>
                                <Icon className="w-16 h-16 md:w-20 md:h-20 text-[#D4AF37] stroke-[1px] opacity-80 group-hover:opacity-100" />
                            </div>

                            {/* CENTER: TITLES & QUOTES */}
                            <div className="space-y-2 md:space-y-6 max-w-sm mx-auto">
                                <h2 className="text-2xl md:text-5xl lg:text-5xl font-serif text-[#D4AF37] uppercase tracking-[0.15em] leading-tight italic">
                                    {region.id === 'vda' ? getHomeIntro(language).title.split(' ').join('\n') :
                                        region.id === 'piemonte' ? getHomeIntro(language).piemonteTitle.split(' ').join('\n') :
                                            region.id === 'liguria' ? getHomeIntro(language).liguriaTitle.split(' ').join('\n') :
                                                getHomeIntro(language).sardegnaTitle.split(' ').join('\n')}
                                </h2>

                                <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto" />

                                <p className="text-sm md:text-base font-serif italic text-stone-200 leading-relaxed max-w-xs mx-auto opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-700">
                                    "{region.id === 'vda' ? getHomeIntro(language).content :
                                        region.id === 'piemonte' ? getHomeIntro(language).piemonteContent :
                                            region.id === 'liguria' ? getHomeIntro(language).liguriaContent :
                                                getHomeIntro(language).sardegnaContent}"
                                </p>
                            </div>

                            {/* BOTTOM: REGION NAME & ENTRA */}
                            <div className="space-y-3 md:space-y-6">
                                <span className="block text-[12px] md:text-xs font-serif tracking-[0.4em] uppercase text-[#D4AF37] font-bold">
                                    {region.id === 'vda' ? "Valle d'Aosta • Vallée d'Aoste" : region.label}
                                </span>

                                <div className={`transition-all duration-700 transform ${isHovered ? 'md:opacity-100 md:translate-y-0' : 'md:opacity-0 md:translate-y-4'} opacity-100 translate-y-0`}>
                                    <button className="px-8 py-2 border border-[#D4AF37] text-[#D4AF37] uppercase text-[10px] font-bold tracking-[0.3em] rounded-full">
                                        Entra <ArrowRight size={14} className="inline ml-2" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Subtle Border */}
                        <div className="absolute inset-0 border border-white/5 pointer-events-none" />
                    </div>
                );
            })}

            {/* Brand Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none opacity-30">
                <span className="text-[10px] uppercase tracking-[0.8em] text-white">Ianua Vini</span>
            </div>

        </div>
    );
};


