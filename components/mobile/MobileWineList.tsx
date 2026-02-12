import React, { useState, useRef, useEffect } from 'react';
import { Wine, Winery } from '../../types';
import { Search, MapPin, ArrowUpRight, ChevronDown, Grape, List, Layers, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSafeImage } from '../../utils/imageUtils';
import { determineWineryRegion, ALL_REGIONS, getGlobalAltitude } from '../regions/registry';

// --- MEMOIZED COMPONENTS FOR SCROLL PERFORMANCE ---

const WineListItem = React.memo(({ item, wineries, onSelectWine, language }: { item: any, wineries: Winery[], onSelectWine: (w: Wine) => void, language: string }) => {
    if (item.type === 'header') {
        return (
            <div className="sticky top-0 z-10 -mx-1 mb-2 rounded-xl overflow-hidden border border-stone-800 relative" style={{ height: item.image ? '72px' : 'auto', minHeight: item.image ? undefined : '48px' }}>
                {/* Zone background image */}
                {item.image && (
                    <>
                        <img src={item.image} alt={item.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/30" />
                    </>
                )}
                {!item.image && <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md" />}
                <div className="relative z-10 h-full flex items-center justify-between px-4">
                    <h3 className="text-[#D4AF37] font-serif font-bold tracking-[0.2em] uppercase drop-shadow-lg" style={{ fontSize: 'clamp(14px, 3.5vw, 18px)' }}>
                        {item.label}
                    </h3>
                    <span className="text-stone-300 font-sans font-medium drop-shadow-lg" style={{ fontSize: 'clamp(10px, 2.5vw, 13px)' }}>{item.count} {language === 'it' ? 'VINI' : language === 'fr' ? 'VINS' : 'WINES'}</span>
                </div>
            </div>
        );
    }

    const wine = item as Wine;
    const winery = wineries.find(w => w.id === wine.wineryId);

    return (
        <div
            onClick={() => onSelectWine(wine)}
            className="group rounded-2xl flex items-center border border-[#D4AF37]/20 active:scale-[0.98] transition-all relative z-0 overflow-visible shadow-lg mb-3 last:mb-0"
            style={{ padding: '12px', paddingLeft: '8px', gap: '12px', background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' }}
        >
            <div className="absolute inset-0 rounded-2xl overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-700" /></div>

            <div className="flex items-center justify-center shrink-0 relative" style={{ width: '56px', height: '80px' }}>
                <img
                    src={getSafeImage(wine.image)}
                    alt={wine.name}
                    loading="lazy"
                    className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] relative z-10"
                    style={{ height: '105px', marginTop: '-12px' }}
                    onError={(e) => {
                        e.currentTarget.src = '/assets/placeholder-wine.png';
                    }}
                />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[#D4AF37] uppercase font-bold truncate" style={{ fontSize: 'clamp(9px, 2.5vw, 13px)', letterSpacing: '0.12em', marginBottom: '2px' }}>{winery?.name}</p>
                <h4 className="text-stone-100 font-serif line-clamp-2 group-active:text-[#D4AF37] transition-colors" style={{ fontSize: 'clamp(14px, 3.8vw, 20px)', lineHeight: '1.25', marginBottom: '4px' }}>{wine.name}</h4>
                <p className="text-[#D4AF37] font-medium uppercase truncate" style={{ fontSize: 'clamp(9px, 2.5vw, 13px)', letterSpacing: '0.1em' }}>{wine.grapes}</p>
                {/* Vintage prices row for verticale wines */}
                {wine.vintages && Array.isArray(wine.vintages) && wine.vintages.length > 0 && (
                    <div className="mt-2">
                        <span className="text-stone-500 uppercase tracking-widest font-bold" style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}>Verticale</span>
                        <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1">
                            {wine.vintages.map((v: any, i: number) => (
                                <span key={i} className="text-stone-400 font-mono" style={{ fontSize: 'clamp(9px, 2.2vw, 11px)' }}>
                                    {v.year}: € {v.price}{i < wine.vintages.length - 1 ? ' ·' : ''}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {(wine.price || wine.priceRange) && (
                <span className="text-[#D4AF37] font-serif font-bold bg-[#D4AF37]/10 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.25)] border border-[#D4AF37]/30 whitespace-nowrap shrink-0" style={{ fontSize: 'clamp(14px, 3.8vw, 20px)', padding: '6px 12px' }}>
                    {wine.price ? `${(wine.price || '').toString().replace(/[^0-9.,€\s]/g, '').trim()}` : wine.priceRange}
                </span>
            )}
        </div>
    );
});

const AccordionWineItem = React.memo(({ wine, onSelectWine }: { wine: Wine, onSelectWine: (w: Wine) => void }) => (
    <div
        onClick={(e) => { e.stopPropagation(); onSelectWine(wine); }}
        className="group flex items-center border-b border-stone-800/60 last:border-b-0 active:bg-[#D4AF37]/10 transition-colors cursor-pointer"
        style={{ padding: '12px 16px', gap: '12px' }}
    >
        {/* Bottle thumbnail */}
        <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '48px', height: '68px' }}>
            <img
                src={getSafeImage(wine.image)}
                alt={wine.name}
                loading="lazy"
                className="h-full object-contain drop-shadow-sm"
                onError={(e) => { e.currentTarget.src = '/assets/placeholder-wine.png'; }}
            />
        </div>
        {/* Wine info */}
        <div className="flex-1 min-w-0">
            <h5 className="text-stone-100 font-serif line-clamp-2 group-active:text-[#D4AF37] transition-colors" style={{ fontSize: 'clamp(13px, 3.5vw, 18px)', lineHeight: '1.25' }}>{wine.name}</h5>
            <p className="text-[#D4AF37] uppercase tracking-wider truncate" style={{ fontSize: 'clamp(9px, 2.5vw, 12px)', marginTop: '4px' }}>{wine.grapes}</p>
            {/* Vintage prices for verticale wines */}
            {wine.vintages && Array.isArray(wine.vintages) && wine.vintages.length > 0 && (
                <div className="mt-1">
                    <span className="text-stone-500 uppercase tracking-widest font-bold" style={{ fontSize: 'clamp(7px, 1.8vw, 9px)' }}>Verticale</span>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 mt-0.5">
                        {wine.vintages.map((v: any, i: number) => (
                            <span key={i} className="text-stone-400 font-mono" style={{ fontSize: 'clamp(8px, 2vw, 10px)' }}>
                                {v.year}: €{v.price}{i < wine.vintages.length - 1 ? ' ·' : ''}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
        {/* Price */}
        {(wine.price || wine.priceRange) && (
            <span className="text-[#D4AF37] font-serif font-bold bg-[#D4AF37]/10 rounded-full whitespace-nowrap flex-shrink-0 shadow-md border border-[#D4AF37]/20" style={{ fontSize: 'clamp(13px, 3.5vw, 18px)', padding: '5px 10px' }}>
                {wine.price ? `${(wine.price || '').toString().replace(/[^0-9.,€\s]/g, '').trim()}` : wine.priceRange}
            </span>
        )}
        <ArrowUpRight size={16} className="text-stone-600 group-active:text-[#D4AF37] transition-colors flex-shrink-0" />
    </div>
));

// --- WINERY ACCORDION ---
const WineryAccordion = React.memo(({ winery, wines, isOpen, onToggle, onSelectWine, onSelectWinery, language }: {
    winery: Winery, wines: Wine[], isOpen: boolean, onToggle: () => void,
    onSelectWine: (w: Wine) => void, onSelectWinery?: (w: Winery) => void, language: string
}) => {
    const visibleWines = wines.filter(w => !w.hidden);
    return (
        <div className={`rounded-2xl overflow-hidden border transition-all duration-500 relative z-0 ${isOpen ? 'border-[#D4AF37]/50 shadow-lg shadow-[#D4AF37]/5' : 'border-[#D4AF37]/25'}`}>
            {/* Winery background image */}
            {winery.image && (
                <>
                    <img src={winery.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    <div className={`absolute inset-0 transition-all duration-500 ${isOpen ? 'bg-gradient-to-r from-black/85 via-black/80 to-black/70' : 'bg-gradient-to-r from-black/90 via-black/85 to-black/80'}`} />
                </>
            )}
            {!winery.image && <div className={`absolute inset-0 ${isOpen ? 'bg-stone-900/80' : 'bg-stone-900/40'}`} />}
            {/* Accordion Header */}
            <button
                onClick={onToggle}
                className="w-full flex items-center gap-4 p-5 active:bg-white/5 transition-colors text-left relative z-10"
            >
                {/* Winery image mini */}
                <div className="rounded-full overflow-hidden border-2 border-[#D4AF37]/30 flex-shrink-0 shadow-md" style={{ width: '48px', height: '48px' }}>
                    {winery.image ? (
                        <img src={winery.image} alt={winery.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-stone-800 flex items-center justify-center text-[#D4AF37]"><Grape size={18} /></div>
                    )}
                </div>
                {/* Winery info */}
                <div className="flex-1 min-w-0">
                    <h4 className="text-stone-100 font-serif font-bold tracking-wide leading-tight truncate" style={{ fontSize: 'clamp(14px, 3.8vw, 20px)' }}>{winery.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                        <MapPin size={12} className="text-[#D4AF37] flex-shrink-0" />
                        <span className="text-[#D4AF37] uppercase tracking-wider truncate" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}>
                            {winery.location}
                            {(() => { const alt = getGlobalAltitude(winery.location || ''); return alt > 0 ? ` · ${alt}m` : ''; })()}
                        </span>
                        <span className="text-stone-600" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}>·</span>
                        <span className="text-[#D4AF37] font-bold whitespace-nowrap" style={{ fontSize: 'clamp(10px, 2.5vw, 14px)' }}>{visibleWines.length} {language === 'it' ? 'vini' : language === 'fr' ? 'vins' : 'wines'}</span>
                    </div>
                </div>
                {/* Chevron */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-400 flex-shrink-0 border ${isOpen ? 'bg-stone-800/80 border-[#D4AF37]/50 text-[#D4AF37] rotate-180' : 'bg-stone-800 border-[#D4AF37]/15 text-stone-500'}`}>
                    <ChevronDown size={20} />
                </div>
            </button>

            {/* Expanded Wines List */}
            <div
                className="transition-all duration-500 ease-in-out overflow-y-auto relative z-10"
                style={{ maxHeight: isOpen ? '450px' : '0px', opacity: isOpen ? 1 : 0 }}
            >
                <div className="border-t border-stone-800/60">
                    {visibleWines.map(wine => (
                        <AccordionWineItem key={wine.id} wine={wine} onSelectWine={onSelectWine} />
                    ))}
                    {/* Link to full winery detail */}
                    {onSelectWinery && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelectWinery(winery); }}
                            className="w-full py-4 flex items-center justify-center gap-2 text-[#D4AF37] text-sm uppercase tracking-[0.2em] font-bold border-t border-stone-800/40 hover:bg-[#D4AF37]/10 transition-colors"
                        >
                            {language === 'it' ? 'Scopri la Cantina' : language === 'fr' ? 'Découvrir le Domaine' : 'Discover Winery'} <ArrowUpRight size={14} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
});

// Region images mapping
const REGION_IMAGES: Record<string, { src: string; label: string }[]> = {
    vda: [
        { src: '/assets/vda-zones/vda-gateway.jpg', label: 'Gateway VDA' },
        { src: '/assets/vda-zones/strada-consolare-donnas.jpg', label: 'Strada Consolare Donnas' },
        { src: '/assets/vda-zones/nus-vigneti.jpg', label: 'Nus Vigneti' },
        { src: '/assets/vda-zones/valdigne-new.jpg', label: 'Valdigne' },
        { src: '/assets/vda-zones/arnad.jpg', label: 'Arnad' },
        { src: '/assets/vda-zones/bassa-valle-new.jpg', label: 'Bassa Valle' },
        { src: '/assets/vda-zones/coverview.jpg', label: 'Panoramica' },
        { src: '/assets/vda-zones/donnas-town.jpg', label: 'Donnas' },
        { src: '/assets/vda-zones/la-plaine-vigne.jpg', label: 'La Plaine' },
        { src: '/assets/vda-zones/lumieres-en-ciel.png', label: 'Lumières en Ciel' },
        { src: '/assets/vda-zones/media-valle-new.jpg', label: 'Media Valle' },
    ],
    piemonte: [
        { src: '/assets/images/piemonte/Langhe.jpg', label: 'Langhe' },
        { src: '/assets/images/piemonte/Rocche_Roero_cover.jpg', label: 'Roero' },
        { src: '/assets/images/piemonte/Monferrato.jpg', label: 'Monferrato' },
        { src: '/assets/images/piemonte/alto piemonte vigne.jpg', label: 'Alto Piemonte' },
        { src: '/assets/images/piemonte/Canavese immagine.jpg', label: 'Canavese' },
        { src: '/assets/images/piemonte/Colli_Tortonesi.webp', label: 'Colli Tortonesi' },
    ],
};

interface MobileWineListProps {
    wines: Wine[];
    wineries: Winery[];
    initialRegion?: string | null;
    onSelectWine: (wine: Wine) => void;
    onSelectWinery?: (winery: Winery) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    language: 'it' | 'en' | 'fr';
    autoFocusSearch?: boolean;
}

export const MobileWineList: React.FC<MobileWineListProps> = ({
    wines,
    wineries,
    initialRegion,
    onSelectWine,
    onSelectWinery,
    searchTerm,
    setSearchTerm,
    language,
    autoFocusSearch
}) => {
    const searchInputRef = useRef<HTMLInputElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [viewMode, setViewModeRaw] = useState<'wines' | 'wineries'>(() => {
        try { const v = localStorage.getItem('iw_viewMode'); return v === 'wines' || v === 'wineries' ? v : 'wines'; } catch { return 'wines'; }
    });
    const [visibleCount, setVisibleCount] = useState(20);
    const [openWineryIds, setOpenWineryIds] = useState<Set<string>>(new Set());
    const [selectedRegionFilter, setSelectedRegionFilterRaw] = useState<string>(() => {
        try { return localStorage.getItem('iw_regionFilter') || initialRegion || 'all'; } catch { return initialRegion || 'all'; }
    });
    const [wineViewStyle, setWineViewStyleRaw] = useState<'list' | 'accordion'>(() => {
        try { const v = localStorage.getItem('iw_viewStyle'); return v === 'list' || v === 'accordion' ? v : 'list'; } catch { return 'list'; }
    });
    const [carouselIndex, setCarouselIndex] = useState(0);

    // Persisted setters
    const setViewMode = (v: 'wines' | 'wineries') => { setViewModeRaw(v); try { localStorage.setItem('iw_viewMode', v); } catch { } };
    const setSelectedRegionFilter = (v: string) => { setSelectedRegionFilterRaw(v); try { localStorage.setItem('iw_regionFilter', v); } catch { } };
    const setWineViewStyle = (v: 'list' | 'accordion') => { setWineViewStyleRaw(v); try { localStorage.setItem('iw_viewStyle', v); } catch { } };

    // Auto-focus search input when arriving via Cerca button
    useEffect(() => {
        if (autoFocusSearch && searchInputRef.current) {
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [autoFocusSearch]);

    // Get images for current region filter
    const currentImages = React.useMemo(() => {
        if (selectedRegionFilter === 'all') {
            return [...(REGION_IMAGES.vda || []), ...(REGION_IMAGES.piemonte || [])];
        }
        return REGION_IMAGES[selectedRegionFilter] || [];
    }, [selectedRegionFilter]);

    // Auto-rotate carousel
    useEffect(() => {
        if (currentImages.length <= 1) return;
        const timer = setInterval(() => {
            setCarouselIndex(prev => (prev + 1) % currentImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentImages.length]);

    // Reset carousel index on region change
    useEffect(() => {
        setCarouselIndex(0);
    }, [selectedRegionFilter]);

    // Derive available regions from wineries
    const availableRegions = React.useMemo(() => {
        const regionSet = new Map<string, string>();
        ALL_REGIONS.forEach(r => {
            const hasWineries = wineries.some(w => {
                const zoneId = determineWineryRegion(w);
                return r.zones.some(z => z.id === zoneId);
            });
            if (hasWineries) {
                regionSet.set(r.id, r.label);
            }
        });
        return regionSet;
    }, [wineries]);

    const toggleWinery = (id: string) => {
        setOpenWineryIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) { next.delete(id); } else { next.add(id); }
            return next;
        });
    };

    // Filter Wineries based on search AND region
    const filteredWineries = React.useMemo(() => {
        const allZones = ALL_REGIONS.flatMap(r => r.zones);
        const zoneOrder = new Map(allZones.map((z, i) => [z.id, i]));

        // Determine which zone IDs belong to the selected region
        let allowedZoneIds: Set<string> | null = null;
        if (selectedRegionFilter !== 'all') {
            const selectedRegion = ALL_REGIONS.find(r => r.id === selectedRegionFilter);
            if (selectedRegion) {
                allowedZoneIds = new Set(selectedRegion.zones.map(z => z.id));
            }
        }

        return wineries
            .filter(w => {
                // Search filter
                const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    w.location.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;

                // Region filter
                if (allowedZoneIds) {
                    const zoneId = determineWineryRegion(w);
                    return allowedZoneIds.has(zoneId);
                }
                return true;
            })
            .sort((a, b) => {
                const zoneA = determineWineryRegion(a);
                const zoneB = determineWineryRegion(b);
                const orderA = zoneOrder.get(zoneA) ?? 999;
                const orderB = zoneOrder.get(zoneB) ?? 999;
                if (orderA !== orderB) return orderA - orderB;
                // Same zone: sort by altitude then name
                const altA = getGlobalAltitude(a.location || '');
                const altB = getGlobalAltitude(b.location || '');
                if (altA !== altB) return altA - altB;
                return a.name.localeCompare(b.name);
            });
    }, [wineries, searchTerm, selectedRegionFilter]);

    // Reset visible count when search or wines change
    React.useEffect(() => {
        setVisibleCount(20);
    }, [searchTerm, wines]);

    // Grouping Logic for WINES view (flat list with zone headers)
    const groupedWines = React.useMemo(() => {
        // Filter zones by selected region
        let allZones = ALL_REGIONS.flatMap(r => r.zones);
        if (selectedRegionFilter !== 'all') {
            const selectedRegion = ALL_REGIONS.find(r => r.id === selectedRegionFilter);
            if (selectedRegion) {
                allZones = selectedRegion.zones;
            }
        }

        const groups: { id: string; label: string; wines: Wine[] }[] = [];
        const ungrouped: Wine[] = [];
        const wineMap = new Map<string, Wine[]>();

        // Only include non-hidden wines, and filter by search
        const filteredWinesList = wines.filter(w => !w.hidden).filter(w => {
            if (!searchTerm) return true;
            const term = searchTerm.toLowerCase();
            const winery = wineries.find(wr => wr.id === w.wineryId);
            return w.name.toLowerCase().includes(term) ||
                (w.grapes || '').toLowerCase().includes(term) ||
                (winery?.name || '').toLowerCase().includes(term);
        });

        filteredWinesList.forEach(wine => {
            const winery = wineries.find(w => w.id === wine.wineryId);
            const zoneId = determineWineryRegion(winery);
            const zoneDef = allZones.find(z => z.id === zoneId);

            if (zoneDef) {
                if (!wineMap.has(zoneId)) wineMap.set(zoneId, []);
                wineMap.get(zoneId)?.push(wine);
            } else if (selectedRegionFilter === 'all') {
                ungrouped.push(wine);
            }
        });

        allZones.forEach(zone => {
            const winesInZone = wineMap.get(zone.id);
            if (winesInZone && winesInZone.length > 0) {
                winesInZone.sort((a, b) => {
                    try {
                        const wineryA = wineries.find(w => w.id === a.wineryId);
                        const wineryB = wineries.find(w => w.id === b.wineryId);
                        const altA = getGlobalAltitude(wineryA?.location || '');
                        const altB = getGlobalAltitude(wineryB?.location || '');
                        if (altA !== altB) return altA - altB;
                        return (wineryA?.name || '').localeCompare(wineryB?.name || '');
                    } catch (e) { return 0; }
                });
                groups.push({ id: zone.id, label: zone.label.toUpperCase(), wines: winesInZone });
            }
        });

        if (ungrouped.length > 0) {
            ungrouped.sort((a, b) => {
                try {
                    const wineryA = wineries.find(w => w.id === a.wineryId);
                    const wineryB = wineries.find(w => w.id === b.wineryId);
                    const altA = getGlobalAltitude(wineryA?.location || '');
                    const altB = getGlobalAltitude(wineryB?.location || '');
                    if (altA !== altB) return altA - altB;
                    return (wineryA?.name || '').localeCompare(wineryB?.name || '');
                } catch (e) { return 0; }
            });
            groups.push({ id: 'other', label: 'ALTRI VINI', wines: ungrouped });
        }
        return groups;
    }, [wines, wineries, selectedRegionFilter, searchTerm]);

    // Grouping Logic for CANTINE view (zone → winery accordion)
    const groupedByZoneAndWinery = React.useMemo(() => {
        // Filter zones by selected region
        let allZones = ALL_REGIONS.flatMap(r => r.zones);
        if (selectedRegionFilter !== 'all') {
            const selectedRegion = ALL_REGIONS.find(r => r.id === selectedRegionFilter);
            if (selectedRegion) {
                allZones = selectedRegion.zones;
            }
        }

        const zoneWineryMap = new Map<string, { winery: Winery; wines: Wine[] }[]>();
        const processedWineryIds = new Set<string>();

        // Group wines by winery first
        const wineryWineMap = new Map<string, Wine[]>();
        wines.filter(w => !w.hidden).forEach(wine => {
            if (!wineryWineMap.has(wine.wineryId)) wineryWineMap.set(wine.wineryId, []);
            wineryWineMap.get(wine.wineryId)?.push(wine);
        });

        // Build zone → winery groups following journey order
        allZones.forEach(zone => {
            const wineriesInZone: { winery: Winery; wines: Wine[] }[] = [];

            // Find wineries that belong to this zone
            filteredWineries.forEach(winery => {
                if (processedWineryIds.has(winery.id)) return;
                const zoneId = determineWineryRegion(winery);
                if (zoneId === zone.id) {
                    const wineList = wineryWineMap.get(winery.id) || [];
                    if (wineList.length > 0) { // Only show wineries that have wines
                        wineriesInZone.push({ winery, wines: wineList });
                        processedWineryIds.add(winery.id);
                    }
                }
            });

            // Sort wineries by altitude within zone
            wineriesInZone.sort((a, b) => {
                const altA = getGlobalAltitude(a.winery.location || '');
                const altB = getGlobalAltitude(b.winery.location || '');
                if (altA !== altB) return altA - altB;
                return a.winery.name.localeCompare(b.winery.name);
            });

            if (wineriesInZone.length > 0) {
                zoneWineryMap.set(zone.id, wineriesInZone);
            }
        });

        // Handle unmatched wineries (only when showing all)
        if (selectedRegionFilter === 'all') {
            const otherWineries: { winery: Winery; wines: Wine[] }[] = [];
            filteredWineries.forEach(winery => {
                if (processedWineryIds.has(winery.id)) return;
                const wineList = wineryWineMap.get(winery.id) || [];
                if (wineList.length > 0) {
                    otherWineries.push({ winery, wines: wineList });
                    processedWineryIds.add(winery.id);
                }
            });
            if (otherWineries.length > 0) {
                zoneWineryMap.set('other', otherWineries);
            }
        }

        // Convert to ordered array
        const result: { zoneId: string; zoneLabel: string; wineries: { winery: Winery; wines: Wine[] }[] }[] = [];
        allZones.forEach(zone => {
            const entries = zoneWineryMap.get(zone.id);
            if (entries && entries.length > 0) {
                result.push({ zoneId: zone.id, zoneLabel: zone.label.toUpperCase(), wineries: entries });
            }
        });
        if (selectedRegionFilter === 'all') {
            const otherEntries = zoneWineryMap.get('other');
            if (otherEntries && otherEntries.length > 0) {
                result.push({ zoneId: 'other', zoneLabel: language === 'it' ? 'ALTRE CANTINE' : language === 'fr' ? 'AUTRES DOMAINES' : 'OTHER WINERIES', wineries: otherEntries });
            }
        }
        return result;
    }, [wines, wineries, filteredWineries, language, selectedRegionFilter]);

    const showHeaders = groupedWines.length > 1 || (groupedWines.length === 1 && groupedWines[0].id !== 'other');

    const renderList = React.useMemo(() => {
        if (!showHeaders) return [];
        // Build zone image lookup
        const allZones = ALL_REGIONS.flatMap(r => r.zones);
        const zoneImageMap = new Map<string, string>();
        allZones.forEach(z => { if (z.image) zoneImageMap.set(z.id, z.image); });

        return groupedWines.flatMap(g => [
            { type: 'header', id: `header-${g.id}`, label: g.label, count: g.wines.length, image: zoneImageMap.get(g.id) || '' },
            ...g.wines.map(w => ({ type: 'wine', ...w }))
        ]);
    }, [groupedWines, showHeaders]);

    const visibleItems = showHeaders ? renderList.slice(0, visibleCount) : wines.slice(0, visibleCount);
    const totalItems = showHeaders ? renderList.length : wines.length;

    // Infinite Scroll Observer
    const observerTarget = React.useRef(null);

    React.useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    setVisibleCount(prev => prev + 40);
                }
            },
            { threshold: 0.1, rootMargin: '200px' }
        );
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [totalItems]);

    return (
        <div className="pb-32 bg-stone-950 min-h-full">

            {/* Hero Header with Region Background Images */}
            <div className="relative overflow-hidden rounded-b-3xl mb-4">
                {/* Background Images - Crossfade */}
                {currentImages.length > 0 && (
                    <div className="absolute inset-0">
                        {currentImages.map((img, idx) => (
                            <img
                                key={img.src}
                                src={img.src}
                                alt={img.label}
                                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out"
                                style={{ opacity: idx === carouselIndex ? 1 : 0 }}
                                loading="lazy"
                            />
                        ))}
                        {/* Dark overlay for readability */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
                    </div>
                )}
                {/* If no images, dark bg */}
                {currentImages.length === 0 && <div className="absolute inset-0 bg-stone-950" />}

                {/* Controls on top of background */}
                <div className="relative z-10 px-4 pt-4 pb-5 space-y-4">

                    {/* View Toggle */}
                    <div className="flex gap-1 p-1 bg-stone-900/60 backdrop-blur-md rounded-2xl border border-stone-700/40">
                        <button
                            onClick={() => setViewMode('wines')}
                            className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'wines' ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md' : 'text-stone-500 hover:text-stone-300 active:bg-white/5 border border-[#D4AF37]/15'}`}
                            style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}
                        >
                            {language === 'it' ? 'Vini' : language === 'fr' ? 'Vins' : 'Wines'}
                        </button>
                        <button
                            onClick={() => setViewMode('wineries')}
                            className={`flex-1 py-3 rounded-xl font-bold uppercase tracking-widest transition-all duration-300 ${viewMode === 'wineries' ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md' : 'text-stone-500 hover:text-stone-300 active:bg-white/5 border border-[#D4AF37]/15'}`}
                            style={{ fontSize: 'clamp(12px, 3vw, 16px)' }}
                        >
                            {language === 'it' ? 'Cantine' : language === 'fr' ? 'Domaines' : 'Wineries'}
                        </button>
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={
                                viewMode === 'wines'
                                    ? (language === 'it' ? 'Cerca vino, vitigno, cantina...' : language === 'fr' ? 'Chercher vin, cépage, domaine...' : 'Search wine, grape, winery...')
                                    : (language === 'it' ? 'Cerca cantina, zona...' : language === 'fr' ? 'Chercher domaine, zone...' : 'Search winery, location...')
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-stone-800/50 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl py-4 pl-12 pr-4 text-stone-100 placeholder:text-[#D4AF37]/45 placeholder:italic focus:border-[#D4AF37]/60 focus:ring-1 focus:ring-[#D4AF37]/20 outline-none transition-all shadow-sm shadow-[#D4AF37]/10"
                            style={{ fontSize: 'clamp(13px, 3.5vw, 16px)' }}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" size={20} />
                    </div>

                    {/* Region Filter Chips */}
                    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
                        <button
                            onClick={() => setSelectedRegionFilter('all')}
                            className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex-shrink-0 ${selectedRegionFilter === 'all'
                                ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                                : 'bg-black/40 backdrop-blur-sm text-stone-400 border border-[#D4AF37]/15 active:bg-white/10'
                                }`}
                            style={{ fontSize: 'clamp(10px, 2.8vw, 14px)' }}
                        >
                            {language === 'it' ? 'Tutte' : language === 'fr' ? 'Toutes' : 'All'}
                        </button>
                        {Array.from(availableRegions.entries()).map(([id, label]) => (
                            <button
                                key={id}
                                onClick={() => setSelectedRegionFilter(id)}
                                className={`px-5 py-2.5 rounded-full font-bold uppercase tracking-widest whitespace-nowrap transition-all duration-300 flex-shrink-0 ${selectedRegionFilter === id
                                    ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40 shadow-md'
                                    : 'bg-black/40 backdrop-blur-sm text-stone-400 border border-[#D4AF37]/15 active:bg-white/10'
                                    }`}
                                style={{ fontSize: 'clamp(10px, 2.8vw, 14px)' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Wine List Content */}
            <div className="px-4">

                {/* View Style Toggle (only in wines mode) */}
                {viewMode === 'wines' && (
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-stone-500 uppercase tracking-widest" style={{ fontSize: 'clamp(10px, 2.5vw, 13px)' }}>
                            {groupedWines.reduce((sum, g) => sum + g.wines.length, 0)} {language === 'it' ? 'bottiglie' : language === 'fr' ? 'bouteilles' : 'bottles'}
                        </span>
                        <div className="flex gap-1 bg-stone-900 rounded-lg p-1 border border-stone-800">
                            <button
                                onClick={() => setWineViewStyle('list')}
                                className={`p-2 rounded-md transition-all ${wineViewStyle === 'list' ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-stone-500 active:text-stone-300 border border-[#D4AF37]/15'}`}
                                title={language === 'it' ? 'Tutte le bottiglie' : language === 'fr' ? 'Toutes les bouteilles' : 'All bottles'}
                            >
                                <List size={18} />
                            </button>
                            <button
                                onClick={() => setWineViewStyle('accordion')}
                                className={`p-2 rounded-md transition-all ${wineViewStyle === 'accordion' ? 'bg-stone-800/80 text-[#D4AF37] border border-[#D4AF37]/40' : 'text-stone-500 active:text-stone-300 border border-[#D4AF37]/15'}`}
                                title={language === 'it' ? 'Per cantina' : language === 'fr' ? 'Par domaine' : 'By winery'}
                            >
                                <Layers size={18} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-4">

                    {viewMode === 'wines' ? (
                        <>
                            {wineViewStyle === 'list' ? (
                                /* =============================================
                                   FLAT LIST — All bottles scrollable
                                   ============================================= */
                                <>
                                    {groupedWines.length === 0 && (
                                        <div className="text-center text-stone-500 py-10 font-serif italic">
                                            {language === 'it' ? 'Nessun vino trovato' : language === 'fr' ? 'Aucun vin trouvé' : 'No wines found'}
                                        </div>
                                    )}

                                    {groupedWines.map(group => {
                                        // Look up zone image from registry
                                        const allZones = ALL_REGIONS.flatMap(r => r.zones);
                                        const zoneDef = allZones.find(z => z.id === group.id);
                                        const zoneImage = zoneDef?.image || '';
                                        return (
                                            <div key={group.id} className="mb-10">
                                                {/* Zone Header with Background Image */}
                                                <div className="sticky top-0 z-10 -mx-1 mb-4 mt-4 rounded-xl overflow-hidden border border-[#D4AF37]/20 relative" style={{ height: zoneImage ? '110px' : 'auto' }}>
                                                    {zoneImage && (
                                                        <>
                                                            <img src={zoneImage} alt={group.label} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
                                                        </>
                                                    )}
                                                    {!zoneImage && <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md" />}
                                                    <div className="relative z-10 h-full flex items-center justify-between px-5" style={{ minHeight: zoneImage ? '110px' : '64px' }}>
                                                        <h3 className="text-[#D4AF37] font-serif font-bold tracking-[0.2em] uppercase drop-shadow-lg" style={{ fontSize: 'clamp(18px, 5vw, 26px)' }}>
                                                            {group.label}
                                                        </h3>
                                                        <span className="text-stone-200 font-sans font-medium drop-shadow-lg" style={{ fontSize: 'clamp(10px, 2.5vw, 13px)' }}>
                                                            {group.wines.length} {language === 'it' ? 'VINI' : language === 'fr' ? 'VINS' : 'WINES'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Wine Cards */}
                                                <div className="space-y-3">
                                                    {group.wines.map(wine => {
                                                        return (
                                                            <WineListItem
                                                                key={wine.id}
                                                                item={{ type: 'wine', ...wine }}
                                                                wineries={wineries}
                                                                onSelectWine={onSelectWine}
                                                                language={language}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            ) : (
                                /* =============================================
                                   ACCORDION — Zone → Winery → Wines
                                   ============================================= */
                                <>
                                    {groupedByZoneAndWinery.length === 0 && (
                                        <div className="text-center text-stone-500 py-10 font-serif italic">
                                            {language === 'it' ? 'Nessun vino trovato' : 'No wines found'}
                                        </div>
                                    )}

                                    {groupedByZoneAndWinery.map(zoneGroup => {
                                        const allZones = ALL_REGIONS.flatMap(r => r.zones);
                                        const zoneDef = allZones.find(z => z.id === zoneGroup.zoneId);
                                        const zoneImage = zoneDef?.image || '';
                                        return (
                                            <div key={zoneGroup.zoneId} className="mb-10">
                                                {/* Zone Header with Background Image */}
                                                <div className="sticky top-0 z-10 -mx-1 mb-4 mt-4 rounded-xl overflow-hidden border border-[#D4AF37]/20 relative" style={{ height: zoneImage ? '110px' : 'auto' }}>
                                                    {zoneImage && (
                                                        <>
                                                            <img src={zoneImage} alt={zoneGroup.zoneLabel} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                                                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/35 to-black/15" />
                                                        </>
                                                    )}
                                                    {!zoneImage && <div className="absolute inset-0 bg-stone-950/95 backdrop-blur-md" />}
                                                    <div className="relative z-10 h-full flex items-center justify-between px-5" style={{ minHeight: zoneImage ? '110px' : '64px' }}>
                                                        <h3 className="text-[#D4AF37] font-serif font-bold tracking-[0.2em] uppercase drop-shadow-lg" style={{ fontSize: 'clamp(18px, 5vw, 26px)' }}>
                                                            {zoneGroup.zoneLabel}
                                                        </h3>
                                                        <span className="text-stone-200 font-sans font-medium drop-shadow-lg" style={{ fontSize: 'clamp(10px, 2.5vw, 13px)' }}>
                                                            {zoneGroup.wineries.length} {language === 'it' ? 'CANTINE' : language === 'fr' ? 'DOMAINES' : 'WINERIES'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Winery Accordions */}
                                                <div className="space-y-3">
                                                    {zoneGroup.wineries.map(({ winery, wines: wineryWines }) => (
                                                        <WineryAccordion
                                                            key={winery.id}
                                                            winery={winery}
                                                            wines={wineryWines}
                                                            isOpen={openWineryIds.has(winery.id)}
                                                            onToggle={() => toggleWinery(winery.id)}
                                                            onSelectWine={onSelectWine}
                                                            onSelectWinery={onSelectWinery}
                                                            language={language}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </>
                            )}
                        </>
                    ) : (
                        /* =============================================
                           CANTINE VIEW — Original Hero Cards
                           ============================================= */
                        <>
                            {filteredWineries.length === 0 && (
                                <div className="text-center text-stone-500 py-10 font-serif italic">
                                    {language === 'it' ? 'Nessuna cantina trovata' : language === 'fr' ? 'Aucun domaine trouvé' : 'No wineries found'}
                                </div>
                            )}

                            {filteredWineries.map(winery => (
                                <div
                                    key={winery.id}
                                    onClick={() => onSelectWinery && onSelectWinery(winery)}
                                    className="group relative h-48 w-full rounded-2xl overflow-hidden shadow-lg border border-[#D4AF37]/20 active:scale-95 transition-transform duration-300"
                                >
                                    {/* Background Image */}
                                    <div className="absolute inset-0 bg-stone-900">
                                        <img
                                            src={winery.image}
                                            alt={winery.name}
                                            loading="lazy"
                                            className="w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-110"
                                        />
                                    </div>

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                    <div className="absolute bottom-0 left-0 p-6 w-full">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    <MapPin size={12} className="text-[#D4AF37]" />
                                                    <span className="text-[#D4AF37] text-xs uppercase tracking-[0.2em] font-bold shadow-black drop-shadow-md">
                                                        {winery.location}
                                                        {(() => {
                                                            const alt = getGlobalAltitude(winery.location || '');
                                                            return alt > 0 ? ` · ${alt}m` : '';
                                                        })()}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-serif text-white font-bold tracking-wide shadow-black drop-shadow-lg">
                                                    {winery.name}
                                                </h3>
                                            </div>
                                            <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                                                <ArrowUpRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </div >
    );
};
