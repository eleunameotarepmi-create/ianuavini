import React, { useState } from 'react';
import { Wine as WineIcon } from 'lucide-react';
import { GLASS_DEFINITIONS, GLASS_TYPE_MAP } from '../../data/glassData';
import { WineGlass } from '../WineGlass';
import { GlassGuideModal } from '../GlassGuideModal';
import type { Wine } from '../../types';
import { Language } from '../../translations';

interface MobileGuideProps {
    language: Language;
}

export const MobileGuide: React.FC<MobileGuideProps> = ({ language }) => {
    const [selectedGlassId, setSelectedGlassId] = useState<string | null>(null);

    const glassEntries = Object.values(GLASS_DEFINITIONS);

    return (
        <div className="pb-32 px-4 pt-4 min-h-full bg-stone-950 text-stone-100">
            {/* Header */}
            <div className="text-center space-y-2 mb-8">
                <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#D4AF37] border border-stone-800">
                        <WineIcon size={20} />
                    </div>
                </div>
                <h2 className="text-2xl font-serif text-[#D4AF37] uppercase tracking-widest">
                    {language === 'it' ? 'Guida Bicchieri' : language === 'fr' ? 'Guide des Verres' : 'Glass Guide'}
                </h2>
                <p className="font-serif italic text-stone-500 text-xs text-center px-4">
                    {language === 'it' ? 'Il calice giusto per ogni vino' : language === 'fr' ? 'Le bon verre pour chaque vin' : 'The right glass for every wine'}
                </p>
            </div>

            {/* Glass Grid */}
            <div className="grid grid-cols-2 gap-4">
                {glassEntries.map(glass => {
                    const mockWine: Wine = {
                        id: `mock-${glass.id}`,
                        name: glass.name,
                        type: GLASS_TYPE_MAP[glass.id] as any,
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
                        <button
                            key={glass.id}
                            onClick={() => setSelectedGlassId(glass.id)}
                            className="bg-stone-900 rounded-2xl border border-stone-800 p-4 flex flex-col items-center gap-3 active:scale-95 transition-all hover:border-[#D4AF37]/30 group"
                        >
                            <div className="w-20 h-28 relative">
                                <WineGlass wine={mockWine} straight={true} className="" />
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-serif text-stone-200 group-hover:text-[#D4AF37] transition-colors leading-tight">
                                    {glass.name.split('/')[0].trim()}
                                </h3>
                                <p className="text-[10px] text-stone-500 mt-1 italic font-serif line-clamp-2">
                                    {glass.shortDescription}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Glass Detail Modal */}
            {selectedGlassId && (
                <GlassGuideModal
                    glassId={selectedGlassId}
                    onClose={() => setSelectedGlassId(null)}
                    language={language}
                />
            )}
        </div>
    );
};
