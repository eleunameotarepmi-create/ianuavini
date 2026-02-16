
import React, { useState, useEffect, useMemo } from 'react';
import { Winery, Wine } from '../types';
import { MapPin, ChevronRight, Store, Mountain, Wind, Grape, Wine as WineIcon, Users, Search, X, ArrowUp } from 'lucide-react';
import { WINE_REGIONS, PIEMONTE_REGIONS, LOCATION_ALTITUDES, getAltitude } from '../constants';
import { getRegionById } from './regions/registry';
import { t, Language } from '../translations';
import { getHomeIntro, getWineriesIntroContent, getBassaValleIntro, getBassaValleDescription, getNusQuartDescription, getAostaPlainDescription, getMediaValleDescription, getValdigneDescription } from '../contentTranslations';
import { PIEMONTE_CONTENT } from '../piemonteContent';
import { CantineListIntro } from './CantineListIntro';


// Safe, verified static images
const BASSA_VALLE_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80"; // Alpine valley (Safe)
const NUS_QUART_IMAGE = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80"; // Same as Bassa Valle (Debugging)
const LA_PLAINE_IMAGE = "https://images.unsplash.com/photo-1597916829826-02e5bb4a54e0?q=80&w=2069&auto=format&fit=crop"; // Vineyard view (Safe)

// ... (RegionHeroSlider code remains) ...


const RegionHeroSection: React.FC<{
    image: string;
    title: string;
    subtitle: string;
    description: { paragraphs: string[] };
    id: string; // Added ID prop
    children: React.ReactNode;
}> = ({ image, title, subtitle, description, id, children }) => {
    return (
        <div id={id} className="scroll-mt-32 relative mb-20 -mx-6 px-6">
            {/* Background Image (Static) */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src={image}
                        alt={`${title} background`}
                        className="w-full h-full object-cover grayscale"
                        style={{ opacity: 0.2 }}
                    />
                </div>
            </div>

            {/* Content Overlay */}
            <div className="relative max-w-4xl mx-auto py-20">
                <div className="text-center mb-16 space-y-6">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent">{subtitle}</span>
                    <h3 className="text-4xl sm:text-5xl font-serif text-primary uppercase tracking-widest leading-none">{title}</h3>
                    <div className="w-16 h-0.5 bg-accent mx-auto" />

                    <div className="space-y-6 mt-8 text-left sm:text-justify px-4 max-w-3xl mx-auto">
                        {description.paragraphs.map((para, idx) => (
                            <p key={idx} className="font-serif text-lg sm:text-xl text-stone-700 leading-relaxed italic">
                                {idx === 0 ? `"${para}"` : para}
                            </p>
                        ))}
                    </div>
                </div>

                <div className="grid gap-12">
                    {children}
                </div>
            </div>
        </div>
    );
};


interface WineriesViewProps {
    wineries: Winery[];
    wines: Wine[];
    language: 'it' | 'en' | 'fr';
    onSelectWinery: (winery: Winery) => void;
    regionMode: string;
}

export const WineriesView: React.FC<WineriesViewProps> = ({ wineries, wines, language, onSelectWinery, regionMode }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredWineries = wineries.filter(w =>
        (w.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (w.location || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Grouping Logic
    // Grouping Logic using Centralized Configuration
    const groupedWineries = useMemo(() => {
        const groups: Record<string, Winery[]> = {};

        // Initialize groups
        const currentRegion = getRegionById(regionMode);
        const activeRegions = currentRegion ? currentRegion.zones : [];
        const activeIds = new Set(activeRegions.map(r => r.id));

        activeRegions.forEach(region => {
            groups[region.id] = [];
        });
        groups['Altro'] = [];

        filteredWineries.forEach(winery => {
            let wineryRegionId = 'unknown';

            // 1. Explicit Manual Override (Admin Panel)
            if (winery.region && activeIds.has(winery.region)) {
                wineryRegionId = winery.region;
            }
            // 2. Automatic Location Matching (Fallback)
            else {
                // Find which zone this winery belongs to in the current active region
                // We use the locationMap if available, otherwise fallback to zone label matching
                const matchedZone = activeRegions.find(zone => {
                    const keywords = (currentRegion?.locationMap && currentRegion.locationMap[zone.id])
                        ? currentRegion.locationMap[zone.id]
                        : [zone.label, zone.id]; // Fallback

                    return keywords.some(k => winery.location?.toLowerCase().includes(k.toLowerCase()));
                });

                if (matchedZone) {
                    wineryRegionId = matchedZone.id;
                }
            }

            if (activeIds.has(wineryRegionId)) {
                groups[wineryRegionId].push(winery);
            } else if (regionMode === 'vda' && wineryRegionId === 'unknown') {
                // Legacy: VDA wineries that don't match a zone go to Altro
                groups['Altro'].push(winery);
            }
        });

        // Sort wineries by altitude within each group
        Object.keys(groups).forEach(key => {
            groups[key].sort((a, b) => {
                const altA = getAltitude(a.location) || 0;
                const altB = getAltitude(b.location) || 0;
                return altA - altB;
            });
        });

        return groups;
    }, [filteredWineries, regionMode]);

    // Check if there are any results at all
    const hasAnyResults = Object.values(groupedWineries).some((group: Winery[]) => group.length > 0);

    const renderWineryCard = (winery: Winery) => {
        const wineryWines = wines.filter(w => w.wineryId === winery.id);
        return (
            <div
                id={`winery - ${winery.name.replace(/\s+/g, '-').toLowerCase()} `}
                key={winery.id}
                onClick={() => onSelectWinery(winery)}
                className="bg-surface rounded-[2.5rem] overflow-hidden shadow-md cursor-pointer hover:scale-[1.02] transition-transform duration-500 group border border-border scroll-mt-32"
            >
                <div className="h-56 relative overflow-hidden">
                    <img
                        src={winery.image || "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&q=80"}
                        alt={winery.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 grayscale group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white">
                        <h3 className="font-serif text-3xl font-bold uppercase tracking-widest text-[#D4AF37] mb-2 shadow-black drop-shadow-lg">{winery.name}</h3>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-90">
                            <MapPin size={12} /> {winery.location} {getAltitude(winery.location) && `· ${getAltitude(winery.location)} m s.l.m.`}
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <p className="font-serif text-secondary line-clamp-3 leading-relaxed italic mb-8 font-light text-lg">
                        "{language === 'en' && (winery as any).description_en
                            ? (winery as any).description_en
                            : language === 'fr' && (winery as any).description_fr
                                ? (winery as any).description_fr
                                : winery.description || "Una storia di passione e verticalità..."}"
                    </p>

                    <div className="flex items-center justify-between border-t border-border pt-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary group-hover:text-accent transition-colors">
                            {wineryWines.length} {t('wineries.wines_in_menu', language)}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-stone-300 group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                            <ChevronRight size={20} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderRegionSection = (
        id: string,
        title: string,
        subtitle: string,
        description: { paragraphs: string[] },
        image: string,
        regionKey: keyof typeof groupedWineries
    ) => {
        const wineriesInRegion = groupedWineries[regionKey];

        // Logic:
        // 1. If NOT searching: Show section if it has wineries, OR show "No wineries" placeholder (original behavior)
        // 2. If SEARCHING: ONLY show section if it has wineries. Hide if empty.

        if (searchTerm && (!wineriesInRegion || wineriesInRegion.length === 0)) {
            return null;
        }

        return (
            <RegionHeroSection
                key={regionKey}
                id={id}
                title={title}
                subtitle={subtitle}
                description={description}
                image={image}
            >
                {(!wineriesInRegion || wineriesInRegion.length === 0) ? (
                    <div className="text-center py-10 opacity-40 font-serif italic border border-dashed border-stone-300 rounded-3xl">
                        {searchTerm ? t('wineries.no_winery_region', language) : t('wineries.no_winery_region', language)}
                    </div>
                ) : (
                    <div className="grid gap-12">
                        {wineriesInRegion.map(renderWineryCard)}
                    </div>
                )}
            </RegionHeroSection>
        );
    };

    return (
        <div className="pb-32 px-6 animate-in fade-in duration-700 bg-background transition-colors duration-500">
            {/* Header Generale */}
            <div className="pt-8 pb-4 text-center space-y-2">
                <div className="flex justify-center mb-4">
                    <div className="w-14 h-14 rounded-full bg-surface border border-accent/20 flex items-center justify-center text-accent shadow-lg">
                        <Store size={24} strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-3xl font-serif text-primary uppercase tracking-[0.2em]">{t('wineries.page_title', language)}</h2>
                <div className="w-12 h-0.5 bg-accent mx-auto mt-4" />
            </div>

            {/* Search Bar - Relocated under header */}
            <div className="max-w-md mx-auto px-6 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-[#D4AF37] transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder={t('wineries.search_placeholder', language)}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-10 py-3 rounded-full border border-border bg-surface shadow-sm focus:border-accent focus:ring-1 focus:ring-accent outline-none font-serif text-primary transition-all placeholder:italic"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300 hover:text-stone-500 p-1"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Region Intro Header - UNIFIED */}
            {(!searchTerm && (regionMode !== 'none')) && (
                <div className="text-center py-8 px-6">
                    <span className="text-xs font-bold uppercase tracking-[0.4em] text-accent mb-3 block">
                        {regionMode === 'vda' ? getBassaValleIntro(language).title : (getRegionById(regionMode)?.label || "Regione")}
                    </span>
                    <h2 className="text-3xl sm:text-5xl font-serif text-primary uppercase tracking-widest mb-4">
                        {regionMode === 'vda' ? getBassaValleIntro(language).subtitle : (getRegionById(regionMode)?.introTitle || getRegionById(regionMode)?.label)}
                    </h2>
                    <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-8" />
                    <p className="font-serif text-xl text-stone-700 italic max-w-2xl mx-auto text-balance">
                        "{regionMode === 'vda' ? getBassaValleIntro(language).content : getRegionById(regionMode)?.introContent}"
                    </p>
                </div>
            )}

            {/* List Intro (Alphabetical Summary) - UNIFIED FOR ALL REGIONS */}
            {!searchTerm && regionMode !== 'none' && (
                <CantineListIntro
                    wineries={wineries}
                    language={language}
                    title={regionMode === 'vda'
                        ? undefined // Use default VDA title from component
                        : `Le Cantine ${['Piemonte', 'Veneto'].includes(getRegionById(regionMode)?.label || '') ? 'del' : 'della'} ${getRegionById(regionMode)?.label}`
                    }
                    description={regionMode === 'vda'
                        ? undefined // Use default VDA description
                        : "" // Empty description to hide the paragraph
                    }
                />
            )}

            {/* Navigation Bar - Sticky */}
            {!searchTerm && (
                <div className="sticky top-24 z-40 bg-[#fcfbf9]/95 backdrop-blur-md py-3 -mx-6 mb-8 border-b border-[#D4AF37]/10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex flex-wrap justify-center w-full items-center px-6 gap-2">
                        {[
                            ...(getRegionById(regionMode)?.zones.map(r => ({ id: r.id, label: r.label, target: r.targetId || r.id })) || [])
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="px-4 py-2 rounded-full border border-[#D4AF37] text-[#D4AF37] font-serif uppercase tracking-wider text-[10px] sm:text-xs hover:bg-[#D4AF37] hover:text-white transition-all whitespace-nowrap bg-white shadow-sm flex-shrink-0"
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}




            {searchTerm ? (
                <div className="max-w-4xl mx-auto min-h-[50vh]">
                    {filteredWineries.length > 0 ? (
                        <div className="grid gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {filteredWineries.map(renderWineryCard)}
                        </div>
                    ) : (
                        <div className="text-center py-24 opacity-60 font-serif italic text-xl text-stone-500 animate-in fade-in duration-500">
                            <p>{t('wineries.no_winery_search', language)} "{searchTerm}".</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="mt-4 text-sm text-[#D4AF37] hover:underline"
                            >
                                {t('wineries.show_all', language)}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    {/* SEZIONI DINAMICHE */}
                    {regionMode === 'vda' ? (
                        <>
                            {renderRegionSection('bassa-valle', getBassaValleDescription(language).title, getBassaValleDescription(language).subtitle, getBassaValleDescription(language), getRegionById('vda')?.zones.find(z => z.id === 'bassa')?.image || BASSA_VALLE_IMAGE, 'bassa')}
                            {renderRegionSection('nus-quart', getNusQuartDescription(language).title, getNusQuartDescription(language).subtitle, getNusQuartDescription(language), getRegionById('vda')?.zones.find(z => z.id === 'nus-quart')?.image || NUS_QUART_IMAGE, 'nus-quart')}
                            {renderRegionSection('la-plaine', getAostaPlainDescription(language).title, getAostaPlainDescription(language).subtitle, getAostaPlainDescription(language), getRegionById('vda')?.zones.find(z => z.id === 'la-plaine')?.image || LA_PLAINE_IMAGE, 'la-plaine')}
                            {renderRegionSection('plaine-to-valdigne', getMediaValleDescription(language).title, getMediaValleDescription(language).subtitle, getMediaValleDescription(language), getRegionById('vda')?.zones.find(z => z.id === 'plaine-to-valdigne')?.image || LA_PLAINE_IMAGE, 'plaine-to-valdigne')}
                            {renderRegionSection('valdigne', getValdigneDescription(language).title, getValdigneDescription(language).subtitle, getValdigneDescription(language), getRegionById('vda')?.zones.find(z => z.id === 'valdigne')?.image || LA_PLAINE_IMAGE, 'valdigne')}
                        </>
                    ) : (
                        <>
                            {/* DYNAMIC REGIONS SECTIONS */}
                            {getRegionById(regionMode)?.zones.map(zone => {
                                // For Piemonte, we look up rich content. For others, we might have it in the zone object later.
                                const content = regionMode === 'piemonte' ? PIEMONTE_CONTENT[zone.id as keyof typeof PIEMONTE_CONTENT] : null;

                                // Fallback title/subtitle if no rich content exists
                                const title = content?.title || zone.label;
                                const subtitle = content?.subtitle || "";
                                const description = content?.description || { paragraphs: [] };

                                // PRIORITIZE IMAGE FROM ZONE CONFIG (Updated with user assets)
                                const image = zone.image || content?.image || BASSA_VALLE_IMAGE;

                                return renderRegionSection(
                                    zone.id,
                                    title,
                                    subtitle,
                                    description,
                                    image,
                                    (zone.targetId || zone.id) as any
                                );
                            })}
                        </>
                    )}

                    {groupedWineries['Altro']?.length > 0 && (
                        <div className="max-w-4xl mx-auto mb-20 pt-20 border-t border-stone-200">
                            <h3 className="text-3xl font-serif text-stone-800 uppercase tracking-widest text-center mb-12">{t('wineries.other', language)}</h3>
                            <div className="grid gap-12">
                                {groupedWineries['Altro'].map(renderWineryCard)}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Scroll to Top Button */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className={`fixed bottom-24 right-6 p-4 rounded-full bg-[#D4AF37] text-white shadow-lg transition-all duration-500 z-50 ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
            >
                <ArrowUp size={24} />
            </button>

        </div>
    );
};
