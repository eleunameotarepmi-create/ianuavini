import React, { useState } from 'react';
import { GlossaryItem } from '../../types';
import { Search, BookOpen, Wine as WineIcon } from 'lucide-react';
import { Language, t } from '../../translations';
import { GLASS_DEFINITIONS } from '../../data/glassData';
import { WineGlass } from '../WineGlass';
import { GlassGuideModal } from '../GlassGuideModal';
import type { Wine } from '../../types';

interface MobileGlossaryProps {
    items: GlossaryItem[];
    language: Language;
}

export const MobileGlossary: React.FC<MobileGlossaryProps> = ({ items, language }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');
    const [subTab, setSubTab] = useState<'glossary' | 'guide'>('glossary');
    const [showGlassGuide, setShowGlassGuide] = useState(false);
    const [selectedGlassId, setSelectedGlassId] = useState<string | null>(null);

    const categoryLabels: Record<string, { it: string, en: string, fr: string }> = {
        'Tutti': { it: 'Tutti', en: 'All', fr: 'Tous' },
        'Vitigno': { it: 'Vitigno', en: 'Grape', fr: 'Cépage' },
        'Territorio': { it: 'Territorio', en: 'Terroir', fr: 'Terroir' },
        'Tecnica': { it: 'Tecnica', en: 'Technique', fr: 'Technique' },
    };
    const categories = ['Tutti', 'Vitigno', 'Territorio', 'Tecnica'];

    const filteredItems = (items || []).filter(item => {
        if (!item || !item.term || !item.definition) return false;
        const matchesSearch = item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.definition.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Tutti' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    }).sort((a, b) => a.term.localeCompare(b.term));

    const groupedItems = filteredItems.reduce((acc, item) => {
        const letter = item.term.charAt(0).toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(item);
        return acc;
    }, {} as Record<string, GlossaryItem[]>);

    const letters = Object.keys(groupedItems).sort();

    // Glass guide
    const glassEntries = Object.values(GLASS_DEFINITIONS);
    const typeMap: Record<string, string> = {
        'flute': 'sparkling', 'white': 'white', 'red': 'red',
        'dessert': 'dessert', 'rose': 'rose', 'universal': 'red'
    };

    return (
        <div className="pb-32 px-4 pt-4 min-h-full bg-stone-950 text-stone-100">
            {/* Header */}
            <div className="text-center space-y-2 mb-6">
                <div className="flex justify-center mb-2">
                    <div className="w-12 h-12 rounded-full bg-stone-900 flex items-center justify-center text-[#D4AF37] border border-stone-800">
                        <BookOpen size={20} />
                    </div>
                </div>
                <h2 className="text-2xl font-serif text-[#D4AF37] uppercase tracking-widest">
                    {subTab === 'glossary' ? t('glossary.title', language) : (language === 'it' ? 'Guide' : language === 'fr' ? 'Guides' : 'Guides')}
                </h2>
            </div>

            {/* Sub-tab toggle: Glossario | Guide */}
            <div className="flex gap-2 mb-6 bg-stone-900 rounded-xl p-1 border border-stone-800">
                <button
                    onClick={() => { setSubTab('glossary'); setShowGlassGuide(false); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'glossary'
                        ? 'bg-[#D4AF37] text-stone-900 shadow-md'
                        : 'text-stone-500 hover:text-stone-300'
                        }`}
                >
                    <BookOpen size={14} /> {language === 'it' ? 'Glossario' : language === 'fr' ? 'Glossaire' : 'Glossary'}
                </button>
                <button
                    onClick={() => { setSubTab('guide'); setShowGlassGuide(false); }}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${subTab === 'guide'
                        ? 'bg-[#D4AF37] text-stone-900 shadow-md'
                        : 'text-stone-500 hover:text-stone-300'
                        }`}
                >
                    <WineIcon size={14} /> {language === 'it' ? 'Guide' : language === 'fr' ? 'Guides' : 'Guides'}
                </button>
            </div>

            {/* ====== GLOSSARY SUB-TAB ====== */}
            {subTab === 'glossary' && (
                <>
                    <div className="sticky top-0 z-20 bg-stone-950/95 backdrop-blur-md py-2 space-y-3 mb-6 -mx-4 px-4 border-b border-stone-800">
                        <div className="relative">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-500" />
                            <input
                                type="text"
                                placeholder={t('glossary.search', language)}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-stone-900 border border-stone-800 rounded-xl py-3 pl-10 pr-4 font-serif text-sm text-stone-200 outline-none focus:border-[#D4AF37] shadow-inner"
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${selectedCategory === cat
                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-stone-900 shadow-md'
                                        : 'bg-stone-900 border-stone-800 text-stone-500 hover:border-stone-700'
                                        }`}
                                >
                                    {categoryLabels[cat][language]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {letters.length > 0 ? (
                        <div className="space-y-8">
                            {letters.map(letter => (
                                <div key={letter} className="relative">
                                    <div className="sticky top-28 z-10 mb-2 pointer-events-none">
                                        <span className="text-4xl font-serif font-bold text-stone-800/50 uppercase select-none absolute -top-4 -left-2">{letter}</span>
                                    </div>
                                    <div className="grid gap-3 relative z-0">
                                        {groupedItems[letter].map(item => (
                                            <div key={item.term} className="bg-stone-900 p-4 rounded-xl border border-stone-800 shadow-sm active:scale-[0.99] transition-transform">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-serif text-lg font-bold text-stone-200">{item.term}</h3>
                                                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded text-center min-w-[50px]">
                                                        {item.category}
                                                    </span>
                                                </div>
                                                <p className="font-serif text-sm text-stone-400 leading-relaxed italic border-l-2 border-stone-800 pl-3">
                                                    {item.definition}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 opacity-40 font-serif italic text-stone-600">
                            {t('glossary.no_results', language)}
                        </div>
                    )}
                </>
            )}

            {/* ====== GUIDE SUB-TAB ====== */}
            {subTab === 'guide' && !showGlassGuide && (
                <div className="space-y-4">
                    {/* Guida ai Bicchieri card */}
                    <button
                        onClick={() => setShowGlassGuide(true)}
                        className="w-full bg-stone-900 rounded-2xl border border-stone-800 p-6 flex items-center gap-5 active:scale-[0.98] transition-all hover:border-[#D4AF37]/30 group"
                    >
                        <div className="w-16 h-16 rounded-full bg-stone-800 flex items-center justify-center border border-[#D4AF37]/20 group-hover:border-[#D4AF37]/50 transition-colors shrink-0">
                            <WineIcon size={28} className="text-[#D4AF37]" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-serif text-stone-200 group-hover:text-[#D4AF37] transition-colors">
                                {language === 'it' ? 'Guida ai Bicchieri' : language === 'fr' ? 'Guide des Verres' : 'Glass Guide'}
                            </h3>
                            <p className="text-xs text-stone-500 mt-1 font-serif italic">
                                {language === 'it' ? 'Il calice giusto per ogni vino' : language === 'fr' ? 'Le bon verre pour chaque vin' : 'The right glass for every wine'}
                            </p>
                        </div>
                    </button>
                </div>
            )}

            {/* Glass Guide Content (expanded) */}
            {subTab === 'guide' && showGlassGuide && (
                <div>
                    <button
                        onClick={() => setShowGlassGuide(false)}
                        className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold mb-4 flex items-center gap-1 hover:opacity-80"
                    >
                        ← {language === 'it' ? 'Torna alle Guide' : language === 'fr' ? 'Retour' : 'Back'}
                    </button>

                    <h3 className="text-lg font-serif text-[#D4AF37] mb-4 text-center">
                        {language === 'it' ? 'Guida ai Bicchieri' : language === 'fr' ? 'Guide des Verres' : 'Glass Guide'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {glassEntries.map(glass => {
                            const mockWine: Wine = {
                                id: `mock-${glass.id}`, name: glass.name,
                                type: typeMap[glass.id] as any, grapes: '', description: '',
                                price: '0', altitude: 0, priceRange: '€',
                                wineryId: '', image: '', alcohol: '', temperature: '', pairing: ''
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
                </div>
            )}

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
