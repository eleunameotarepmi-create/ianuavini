import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, Wine, Store, Utensils, ChevronRight, ArrowRight } from 'lucide-react';
import { Wine as WineType, Winery, MenuItem, AppView } from '../types';
import { useTheme } from '../context/ThemeContext';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    wines: WineType[];
    wineries: Winery[];
    menu: MenuItem[];
    onSelectWine: (wine: WineType) => void;
    onSelectWinery: (winery: Winery) => void;
    onSelectMenuItem?: (item: MenuItem) => void; // Optional if we want to jump to menu
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
    isOpen,
    onClose,
    wines,
    wineries,
    menu,
    onSelectWine,
    onSelectWinery,
    onSelectMenuItem
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'wines' | 'wineries' | 'menu'>('all');
    const { currentTheme } = useTheme();

    // Reset search when closed
    useEffect(() => {
        if (!isOpen) setSearchTerm('');
    }, [isOpen]);

    // Prevent body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    const results = useMemo(() => {
        if (!searchTerm.trim()) return { wines: [], wineries: [], menu: [] };

        const lowerTerm = searchTerm.toLowerCase();

        const filteredWines = wines.filter(w =>
            !w.hidden && (
                w.name.toLowerCase().includes(lowerTerm) ||
                w.grapes.toLowerCase().includes(lowerTerm) ||
                w.description.toLowerCase().includes(lowerTerm)
            )
        );

        const filteredWineries = wineries.filter(w =>
            w.name.toLowerCase().includes(lowerTerm) ||
            w.location.toLowerCase().includes(lowerTerm)
        );

        const filteredMenu = menu.filter(m =>
            !m.hidden && (
                m.name.toLowerCase().includes(lowerTerm) ||
                m.description.toLowerCase().includes(lowerTerm) ||
                m.ingredients?.toLowerCase().includes(lowerTerm)
            )
        );

        return {
            wines: filteredWines,
            wineries: filteredWineries,
            menu: filteredMenu
        };
    }, [searchTerm, wines, wineries, menu]);

    const hasResults = results.wines.length > 0 || results.wineries.length > 0 || results.menu.length > 0;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col">
            {/* Search Header */}
            <div className="p-4 border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-10 safe-top">
                <div className="max-w-3xl mx-auto w-full relative">
                    <button
                        onClick={onClose}
                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-primary transition-colors bg-surface rounded-full shadow-sm"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex flex-col gap-4 pr-12">
                        <h2 className="text-xl font-serif font-bold text-primary uppercase tracking-widest pl-2 border-l-2 border-accent">
                            Cerca
                        </h2>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-accent transition-colors" size={20} />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Cerca vini, cantine, piatti..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-surface border-2 border-border focus:border-accent rounded-xl py-4 pl-12 pr-4 text-lg font-serif outline-none transition-all shadow-sm placeholder:text-stone-300/50"
                            />
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 no-scrollbar">
                        {[
                            { id: 'all', label: 'Tutto' },
                            { id: 'wines', label: `Vini (${results.wines.length})` },
                            { id: 'wineries', label: `Cantine (${results.wineries.length})` },
                            { id: 'menu', label: `Menu (${results.menu.length})` },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setActiveFilter(f.id as any)}
                                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${activeFilter === f.id
                                        ? 'bg-accent text-white shadow-lg shadow-accent/20'
                                        : 'bg-surface border border-border text-secondary hover:border-accent/50'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Content */}
            <div className="flex-1 overflow-y-auto p-4 safe-bottom">
                <div className="max-w-3xl mx-auto space-y-8 pb-20">

                    {!searchTerm && (
                        <div className="flex flex-col items-center justify-center h-64 opacity-30 text-center space-y-4">
                            <Search size={48} className="text-stone-300" />
                            <p className="font-serif italic text-stone-400">Inizia a digitare per cercare...</p>
                        </div>
                    )}

                    {searchTerm && !hasResults && (
                        <div className="text-center py-20 opacity-50">
                            <p className="font-serif italic text-stone-500">Nessun risultato trovato per "{searchTerm}"</p>
                        </div>
                    )}

                    {/* Wineries Section */}
                    {(activeFilter === 'all' || activeFilter === 'wineries') && results.wineries.length > 0 && (
                        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-2 text-accent border-b border-border pb-2">
                                <Store size={18} />
                                <h3 className="font-bold font-sans uppercase tracking-widest text-sm">Cantine</h3>
                            </div>
                            <div className="grid gap-3">
                                {results.wineries.map(winery => (
                                    <button
                                        key={winery.id}
                                        onClick={() => { onSelectWinery(winery); onClose(); }}
                                        className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border hover:border-accent/50 group text-left transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-stone-300 group-hover:text-accent transition-colors">
                                            <Store size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-primary group-hover:text-accent transition-colors">{winery.name}</h4>
                                            <p className="text-xs text-secondary font-sans uppercase tracking-wider">{winery.location}</p>
                                        </div>
                                        <ArrowRight className="ml-auto text-stone-300 group-hover:translate-x-1 transition-transform" size={16} />
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Menu Section */}
                    {(activeFilter === 'all' || activeFilter === 'menu') && results.menu.length > 0 && (
                        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-100">
                            <div className="flex items-center gap-2 text-accent border-b border-border pb-2">
                                <Utensils size={18} />
                                <h3 className="font-bold font-sans uppercase tracking-widest text-sm">Menu</h3>
                            </div>
                            <div className="grid gap-3">
                                {results.menu.map(item => (
                                    <button
                                        key={item.id}
                                        onClick={() => { onSelectMenuItem?.(item); onClose(); }}
                                        className="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border hover:border-accent/50 group text-left transition-all shadow-sm hover:shadow-md"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-background overflow-hidden flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-stone-300">
                                                    <Utensils size={20} />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-primary group-hover:text-accent transition-colors">{item.name}</h4>
                                            <p className="text-xs text-secondary font-sans uppercase tracking-wider">{item.category} • {item.price}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Wines Section */}
                    {(activeFilter === 'all' || activeFilter === 'wines') && results.wines.length > 0 && (
                        <section className="space-y-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
                            <div className="flex items-center gap-2 text-accent border-b border-border pb-2">
                                <Wine size={18} />
                                <h3 className="font-bold font-sans uppercase tracking-widest text-sm">Vini</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {results.wines.map(wine => {
                                    const winery = wineries.find(w => w.id === wine.wineryId);
                                    return (
                                        <button
                                            key={wine.id}
                                            onClick={() => { onSelectWine(wine); onClose(); }}
                                            className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border hover:border-accent/50 group text-left transition-all shadow-sm hover:shadow-md"
                                        >
                                            <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center p-1">
                                                <img src={wine.image} alt={wine.name} className="h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-serif font-bold text-sm text-primary group-hover:text-accent transition-colors truncate">{wine.name}</h4>
                                                <p className="text-[10px] text-secondary font-sans uppercase tracking-wider truncate">{winery?.name}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                </div>
            </div>
        </div>
    );
};
