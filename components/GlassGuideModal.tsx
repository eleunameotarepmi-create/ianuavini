
import React, { useState } from 'react';
import { X, ExternalLink, Wine as WineIcon } from 'lucide-react';
import { GLASS_DEFINITIONS, GLASS_TYPE_MAP, GlassDefinition, getGlassTypeFromWine as getDef } from '../data/glassData';
import { WineGlass } from './WineGlass';
import { Wine } from '../types';

interface GlassGuideModalProps {
    glassId?: string; // specific ID
    wineType?: string; // derive from wine type
    onClose: () => void;
    language: 'it' | 'en' | 'fr';
}

export const GlassGuideModal: React.FC<GlassGuideModalProps> = ({ glassId, wineType, onClose, language }) => {
    const [isZoomed, setIsZoomed] = useState(false);
    // Resolve definition
    let definition: GlassDefinition;

    if (glassId && GLASS_DEFINITIONS[glassId]) {
        definition = GLASS_DEFINITIONS[glassId];
    } else {
        definition = getDef(wineType);
    }

    // Fallback if still undefined (should cover by universal)
    if (!definition) definition = GLASS_DEFINITIONS['universal'];


    // Mock wine for WineGlass component visualization to ensure correct glass
    // The WineGlass component uses internal logic based on type.
    // We need to trick it or pass specific props if supported.
    // Currently WineGlass relies on 'type' or text search.
    // We can map our definition ID back to a reliable 'type'.
    const typeMap: Record<string, string> = {
        'flute': 'sparkling',
        'tulipano': 'sparkling_complex',
        'renano': 'white',
        'borgogna': 'borgogna',
        'borgogna_red': 'borgogna_red',
        'borgogna_rose': 'borgogna_rose',
        'balloon': 'red',
        'barbaresco': 'red_premium',
        'marsala': 'dessert',
        'white': 'white',
        'red': 'red',
        'dessert': 'dessert',
        'rose': 'rose',
        'flute_rose': 'flute_rose',
        'universal': 'red'
    };

    const mockWine: Wine = {
        id: 'mock',
        name: 'Technical View',
        type: (definition.id === 'flute_rose' ? 'flute_rose' : (GLASS_TYPE_MAP[definition.id] || 'red')) as any,
        grapes: '',
        description: '',

        price: '0',
        altitude: 0,
        priceRange: '€',
        wineryId: '',
        image: '',
        alcohol: '',
        temperature: '',
        pairing: ''
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="relative w-full max-w-sm bg-stone-900 border border-[#D4AF37]/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-300"
                onClick={e => e.stopPropagation()}
            >

                {/* Header / Hero with Glass */}
                <div className="relative h-64 bg-gradient-to-b from-stone-800 to-stone-900 flex items-center justify-center overflow-hidden shrink-0">
                    <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-10 mix-blend-overlay" />
                    <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/10 to-transparent opacity-50" />

                    {/* Glass Visualization - Tappable for Zoom */}
                    <div
                        className="relative z-10 w-32 h-48 drop-shadow-2xl translate-y-4 cursor-zoom-in active:scale-95 transition-transform"
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(true); }}
                    >
                        <WineGlass wine={mockWine} straight={true} className="" />
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white/70 hover:text-white transition-colors z-20"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute top-4 left-4 p-2 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] border border-[#D4AF37]/20">
                        <WineIcon size={16} />
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide bg-stone-950">

                    <div className="text-center">
                        <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold mb-1 block">
                            Scheda tecnica
                        </span>
                        <h2 className="text-2xl font-serif text-white leading-tight font-medium">
                            {definition.name}
                        </h2>
                        <p className="text-sm text-stone-400 mt-2 font-serif italic border-b border-white/5 pb-4">
                            "{definition.shortDescription}"
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 shadow-inner">
                            <h3 className="text-[#D4AF37] text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Perché questa forma?
                            </h3>
                            <p className="text-sm text-stone-300 leading-relaxed font-sans text-justify">
                                {definition.fullDescription}
                            </p>
                        </div>

                        <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 shadow-inner">
                            <h3 className="text-[#D4AF37] text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Dettagli Tecnici
                            </h3>
                            <p className="text-sm text-stone-300 leading-relaxed font-sans text-justify">
                                {definition.technicalDetails}
                            </p>
                        </div>

                        <div className="bg-stone-900/50 p-4 rounded-xl border border-white/5 shadow-inner">
                            <h3 className="text-[#D4AF37] text-xs uppercase tracking-wider font-bold mb-2 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" /> Quando usarlo
                            </h3>
                            <p className="text-sm text-stone-300 leading-relaxed font-sans text-justify">
                                {definition.usage}
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 text-center pb-4">
                        <a
                            href={`https://www.quattrocalici.it/glossario-degustazione/bicchiere-da-vino-${definition.id === 'flute' ? 'spumante' : definition.id === 'red' ? 'rosso-classico' : 'bianco-leggero'}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-[10px] text-stone-500 hover:text-[#D4AF37] transition-colors uppercase tracking-widest opacity-60 hover:opacity-100"
                        >
                            Fonte: Quattrocalici.it <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </div>

            {/* FULLSCREEN GLASS ZOOM */}
            {isZoomed && (
                <div
                    className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 cursor-zoom-out"
                    onClick={() => setIsZoomed(false)}
                >
                    <button
                        onClick={() => setIsZoomed(false)}
                        className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors z-10"
                    >
                        <X size={24} />
                    </button>
                    <div className="w-[70vw] h-[70vh] max-w-md animate-in zoom-in-90 duration-500">
                        <WineGlass wine={mockWine} straight={true} className="" />
                    </div>
                    <p className="absolute bottom-8 text-white/60 font-serif text-sm italic">{definition.name}</p>
                </div>
            )}
        </div>
    );
};
