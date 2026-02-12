
import React, { useState } from 'react';
import { GlossaryItem } from '../types';
import { Search, ChevronDown, BookOpen } from 'lucide-react';
import { Language, t } from '../translations';

interface GlossaryViewProps {
    items: GlossaryItem[];
    language: Language;
}

export const GlossaryView: React.FC<GlossaryViewProps> = ({ items, language }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');

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

    return (
        <div className="pb-32 px-6 animate-in fade-in duration-700">
            <div className="pt-24 pb-12 text-center space-y-4">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-[#D4AF37]">
                        <BookOpen size={24} />
                    </div>
                </div>
                <h2 className="text-4xl font-serif text-stone-800 uppercase tracking-widest">{t('glossary.title', language)}</h2>
                <p className="font-serif italic text-stone-500 max-w-md mx-auto">
                    {t('glossary.subtitle', language)}
                </p>
            </div>

            <div className="sticky top-20 z-20 bg-[#fcfbf9]/95 backdrop-blur-sm py-4 space-y-4 mb-8">
                <div className="relative">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                        type="text"
                        placeholder={t('glossary.search', language)}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-2xl py-4 pl-12 pr-4 font-serif text-lg outline-none focus:border-[#D4AF37] shadow-sm transition-all"
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-stone-800 text-[#D4AF37] shadow-lg scale-105'
                                : 'bg-white border border-stone-200 text-stone-500 hover:border-[#D4AF37]'
                                }`}
                        >
                            {categoryLabels[cat][language]}
                        </button>
                    ))}
                </div>
            </div>

            {letters.length > 0 ? (
                <div className="space-y-12">
                    {letters.map(letter => (
                        <div key={letter} className="relative">
                            <div className="sticky top-48 z-10 mb-6">
                                <span className="text-6xl font-serif font-bold text-stone-100 uppercase select-none">{letter}</span>
                            </div>
                            <div className="grid gap-4 relative z-0 mt-[-40px] pl-4">
                                {groupedItems[letter].map(item => (
                                    <div key={item.term} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-lg transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-serif text-xl font-bold text-[#800020]">{item.term}</h3>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#D4AF37] bg-[#D4AF37]/5 px-2 py-1 rounded-full">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="font-serif text-stone-600 leading-relaxed italic border-l-2 border-[#D4AF37]/20 pl-4">
                                            {item.definition}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 opacity-40 font-serif italic">
                    {t('glossary.no_results', language)}
                </div>
            )}
        </div>
    );
};
