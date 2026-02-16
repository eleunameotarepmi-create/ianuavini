
import React from 'react';
import { MenuItem, Wine, Winery } from '../types';
import { UtensilsCrossed, Leaf, Fish, Beef, Cake, Star, Wine as WineIcon, Sparkles, BookOpen, ImageIcon, AlertCircle, Camera, Users, Loader2, ChevronDown, Feather, X } from 'lucide-react';
import { getPerfectPairing } from '../services/geminiService';

interface MenuViewProps {
    menu: MenuItem[];
    wines: Wine[];
    wineries: Winery[];
    language: 'it' | 'en' | 'fr';
    onSelectWine: (wine: Wine) => void;
    onOpenGruppi?: () => void;
    onUpdateMenu?: (items: MenuItem[]) => void;
    onExploreWineries?: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
    'Antipasti': <Leaf size={24} />,
    'Primi': <UtensilsCrossed size={24} />,
    'Secondi': <Beef size={24} />,
    'Dolci': <Cake size={24} />,
    'Fuori Menu': <Star size={24} />
};

const categoryTranslations: Record<string, { en: string, fr: string }> = {
    'Antipasti': { en: 'Starters', fr: 'Entrées' },
    'Primi': { en: 'First Courses', fr: 'Premiers Plats' },
    'Secondi': { en: 'Main Courses', fr: 'Plats Principaux' },
    'Dolci': { en: 'Desserts', fr: 'Desserts' },
    'Fuori Menu': { en: 'Off Menu', fr: 'Hors Menu' }
};

const categoryOrder = ['Antipasti', 'Primi', 'Secondi', 'Dolci', 'Fuori Menu'];

const toTitleCase = (str: string) => {
    if (!str) return '';
    const smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via|con|e|ed|o|di|da|in|su|fra|tra|del|dello|della|dei|degli|delle|dal|dallo|dalla|dai|dagli|dalle|nel|nello|nella|nei|negli|nelle|sul|sullo|sulla|sui|sugli|sulle|l|il|lo|la|i|gli|le|un|uno|una)$/i;

    return str.toLowerCase().replace(/[a-zà-ù]+/gi, (word, index) => {
        if (index > 0 && smallWords.test(word)) {
            return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
};

const toSentenceCase = (str: string) => {
    if (!str) return '';
    // Lowercase everything first to kill ALL CAPS
    let lower = str.toLowerCase();
    // Capitalize first letter of string
    lower = lower.charAt(0).toUpperCase() + lower.slice(1);
    // Capitalize after punctuation (. ! ?)
    return lower.replace(/([.!?]\s+)([a-zà-ù])/g, (match, p1, p2) => p1 + p2.toUpperCase());
};

export const MenuView: React.FC<MenuViewProps> = (props) => {
    const { menu, wines, wineries, language, onSelectWine, onOpenGruppi, onUpdateMenu, onExploreWineries } = props;
    const [expandedPairingId, setExpandedPairingId] = React.useState<string | null>(null);
    const [aiPairings, setAiPairings] = React.useState<Record<string, { wineId: string, justification: string, score?: number, label?: string, technicalDetail?: string }[]>>({});
    const [loadingPairs, setLoadingPairs] = React.useState<Set<string>>(new Set());
    // ... rest of component


    const [expandedDetailId, setExpandedDetailId] = React.useState<string | null>(null);
    const [zoomedDishImage, setZoomedDishImage] = React.useState<{ src: string; name: string } | null>(null);
    const [showManifesto, setShowManifesto] = React.useState(false);
    const [showChefBio, setShowChefBio] = React.useState(false);

    // Accordion: track which categories are expanded (first one open by default)
    const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set());
    const toggleCategory = (cat: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Scroll to top on mount
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Helpers for translation
    // Fix for Passito filtering v2
    const getTranslated = (item: MenuItem, field: 'name' | 'description' | 'story' | 'preparation') => {
        if (language === 'en') return item[`${field}_en`] || item[field];
        if (language === 'fr') return item[`${field}_fr`] || item[field];
        return item[field];
    }

    // Filter out hidden items
    const visibleMenu = menu.filter(item => !item.hidden);
    const groupedMenu = categoryOrder.reduce((acc, category) => {
        acc[category] = visibleMenu.filter(item => item.category === category);
        return acc;
    }, {} as Record<string, MenuItem[]>);

    const handleGetPairing = async (item: MenuItem) => {
        const drawerId = `${item.id}_wine`;

        // 1. Check for Manual Pairings (Reverse Lookup from Wine -> Dish)
        // Find wines that explicitly list this dish in their ianuaPairings
        const manualMatches = wines.filter(w =>
            w.ianuaPairings?.some(p => p.dishId === item.id)
        ).map(w => {
            const pairData = w.ianuaPairings?.find(p => p.dishId === item.id);
            return {
                wineId: w.id,
                justification: (() => {
                    const n = pairData?.notes || "";
                    const d = pairData?.description || "";
                    // Prefer the longer text to avoid single-word tags like "Persistenza"
                    // unless description is empty.
                    const text = n.length > d.length ? n : (d || n);
                    return text || (language === 'it' ? "Abbinamento consigliato dalla carta." : "Recommended pairing from the menu.");
                })(),
                score: 100, // Top score for manual matches
                label: pairData?.label || (language === 'it' ? 'Scelta del Sommelier' : 'Sommelier Choice'),
                technicalDetail: ""
            };
        });

        // 2. Check for Verified Pairings (Direct on Dish -> Wine)
        // (Legacy or complementary source)
        const verifiedMatches = item.verifiedPairings || [];

        // Combine unique matches
        const allDirectMatches = [...manualMatches];
        verifiedMatches.forEach(vm => {
            if (!allDirectMatches.find(m => m.wineId === vm.wineId)) {
                allDirectMatches.push(vm);
            }
        });

        // If we found direct matches, use them instantly
        if (allDirectMatches.length > 0) {
            setAiPairings(prev => ({
                ...prev,
                [item.id]: allDirectMatches
            }));

            // Only toggle if not already open or if different drawer
            if (expandedPairingId !== drawerId) {
                setExpandedPairingId(drawerId);
            } else {
                setExpandedPairingId(null); // Toggle close if same
            }
            return;
        }

        if (loadingPairs.has(item.id)) return;

        // Se è già aperto, chiudiamo e basta
        if (expandedPairingId === drawerId) {
            setExpandedPairingId(null);
            return;
        }

        // Apriamo il drawer
        setExpandedPairingId(drawerId);

        // Se abbiamo già i dati AI, non rifacciamo la chiamata
        if (aiPairings[item.id]) return;

        // Altrimenti, triggeriamo l'AI
        setLoadingPairs(prev => new Set(prev).add(item.id));
        try {
            const results = await getPerfectPairing(item, wines, wineries, language);
            setAiPairings(prev => ({ ...prev, [item.id]: results }));
        } catch (error) {
            console.error("AI Pairing Fetch Error:", error);
        } finally {
            setLoadingPairs(prev => {
                const next = new Set(prev);
                next.delete(item.id);
                return next;
            });
        }
    };

    return (
        <div className="pb-32 bg-stone-950 min-h-full animate-in fade-in duration-700">
            {/* GOLDEN DECOR OVERLAYS */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/golden_vines.png')] bg-cover opacity-20" />
            </div>

            {/* Header — La Cantina style (Top Bar) */}
            <div className="pt-12 pb-6 px-6 relative z-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-serif text-[#D4AF37] uppercase tracking-[0.2em]">Ianua</h1>
                    {onOpenGruppi && (
                        <button
                            onClick={onOpenGruppi}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-[#D4AF37]/40 text-[#D4AF37] rounded-full hover:bg-[#D4AF37]/10 active:bg-[#D4AF37]/20 transition-all duration-300 font-serif text-xs tracking-wider"
                        >
                            <Users size={14} />
                            <span>{language === 'it' ? 'Gruppi' : language === 'fr' ? 'Groupes' : 'Groups'}</span>
                        </button>
                    )}
                </div>
                <p className="text-sm font-serif text-stone-500 italic mt-1">
                    {language === 'it' ? 'La Carte' : language === 'fr' ? 'La Carte' : 'The Menu'}
                    <span onClick={() => setShowChefBio(true)} className="ml-2 inline-flex items-center gap-1 cursor-pointer text-[#D4AF37]/60 text-sm hover:text-[#D4AF37]/80 transition-colors" style={{ fontFamily: "'Great Vibes', cursive" }}>
                        by Zuco <Feather size={12} className="inline -rotate-45 opacity-70" />
                    </span>
                </p>
            </div>

            {/* Main Section Title */}
            <div className="text-center py-6 relative z-10">
                <div className="flex items-center gap-4 max-w-2xl mx-auto px-4">
                    <div className="flex-1 h-px bg-[#D4AF37]/20" />
                    <h2 className="flex items-center gap-3 text-4xl text-[#D4AF37] font-serif tracking-widest uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                        {language === 'it' ? 'Il Nostro Menu' : language === 'fr' ? 'Notre Menu' : 'Our Menu'}
                        <button
                            onClick={() => setShowManifesto(!showManifesto)}
                            className="text-[#D4AF37]/60 hover:text-[#D4AF37] hover:scale-110 active:scale-95 transition-all outline-none"
                            title={language === 'it' ? 'Il Nostro Manifesto' : 'Our Manifesto'}
                        >
                            <Feather size={28} className="-rotate-45 drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]" strokeWidth={1.5} />
                        </button>
                    </h2>
                    <div className="flex-1 h-px bg-[#D4AF37]/20" />
                </div>

                {/* Manifesto — collapsible */}
                <div className={`transition-all duration-700 ease-in-out overflow-hidden ${showManifesto ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'}`}>
                    <div className="bg-stone-900/60 backdrop-blur-md rounded-2xl p-8 border border-[#D4AF37]/20 text-center relative max-w-lg mx-auto shadow-2xl mb-8 mt-4">
                        <h3 className="font-serif text-2xl text-[#D4AF37] mb-6 mt-2">
                            {language === 'it' ? 'La Filosofia' : language === 'fr' ? 'La Philosophie' : 'The Philosophy'}
                        </h3>
                        <div className="space-y-4 font-serif text-stone-300 italic leading-relaxed text-sm">
                            <p>
                                Ianua Restaurant, in una eccezionale location bimillenaria nel centro storico di Aosta, offre una cucina basata su tradizione e contaminazione, che tiene conto dei segni lasciati dalla storia sul nostro territorio, attraverso i commerci e le diverse influenze lasciate da culture limitrofe.
                            </p>
                            <p>
                                Definiamo la nostra cucina “sabauda” (non pensate ai Re ma alla terra che unisce il Mediterraneo della Sardegna alla Savoia passando per le pianure e le valli piemontesi) per l’utilizzo dei prodotti che storicamente, seguendo vie commerciali come la via del sale, hanno arricchito le nostre tavole.
                            </p>
                            <p>
                                A memoria a noi trasmessa ancora dai nostri nonni.
                            </p>
                            <p>
                                Preferiamo prodotti locali, di contadini e “artigiani” del territorio, senza rinunciare a variazioni sul tema. Alla base di molti dei nostri piatti vi sono i prodotti che hanno ottenuto il marchio DOP.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-6 justify-center">
                            <div className="w-12 h-px bg-[#D4AF37]/20" />
                            <span className="text-[#D4AF37] text-lg" style={{ fontFamily: "'Great Vibes', cursive" }}>Giuliana e Paolo</span>
                            <div className="w-12 h-px bg-[#D4AF37]/20" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Menu Categories */}
            <div className="px-2 space-y-8 max-w-3xl mx-auto relative z-10">
                {categoryOrder.map((category) => {
                    const items = groupedMenu[category];
                    if (!items || items.length === 0) return null;
                    const isOpen = expandedCategories.has(category);

                    // Correct Translation Logic
                    const displayCategory = language === 'it'
                        ? category
                        : (categoryTranslations[category][language] || category);

                    return (
                        <section key={category} className="rounded-2xl overflow-hidden transition-all duration-500 border border-stone-800 bg-stone-900/40 shadow-lg">
                            {/* Accordion Header */}
                            <button
                                onClick={() => toggleCategory(category)}
                                className={`w-full flex items-center justify-between p-6 transition-colors ${isOpen ? 'bg-stone-900' : 'bg-stone-900/60 hover:bg-stone-800'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <span className={`p-2 rounded-full ${isOpen ? 'bg-[#D4AF37] text-stone-900' : 'bg-stone-800 text-[#D4AF37]'}`}>
                                        {categoryIcons[category]}
                                    </span>
                                    <h3 className="font-serif text-2xl text-[#D4AF37] tracking-wide uppercase">
                                        {displayCategory}
                                    </h3>
                                </div>
                                <ChevronDown
                                    size={24}
                                    className={`text-[#D4AF37] transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* Accordion Content */}
                            <div className={`transition-all duration-700 ease-in-out ${isOpen ? 'max-h-[50000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-2 pt-4 pb-4">
                                    {items.map((item) => {
                                        // Determine if any pairing is active for this item
                                        const isPairingActive = expandedPairingId === `${item.id}_wine`;
                                        const hasMasterPairing = (item.verifiedPairings && item.verifiedPairings.length > 0) ||
                                            wines.some(w => w.ianuaPairings?.some(p => p.dishId === item.id));

                                        return (
                                            <div key={item.id} className="relative mb-4 last:mb-2 group">
                                                {/* Dish Card */}
                                                <div className="relative z-20 bg-stone-900/80 rounded-xl p-5 border border-stone-800 hover:border-[#D4AF37]/30 transition-all">
                                                    <div className="flex items-start gap-4">
                                                        {/* LEFT COLUMN: Icons */}
                                                        <div className="flex flex-col gap-3 pt-1">
                                                            {onSelectWine && (
                                                                <button
                                                                    onClick={() => handleGetPairing(item)}
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${hasMasterPairing || expandedPairingId === `${item.id}_wine`
                                                                        ? 'bg-[#D4AF37] border-[#D4AF37] text-stone-900 shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                                                                        : 'bg-stone-800 border-stone-700 text-stone-500 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                                                                        }`}
                                                                >
                                                                    {loadingPairs.has(item.id) ? <Loader2 className="animate-spin" size={20} /> : <WineIcon size={20} strokeWidth={1.5} />}
                                                                </button>
                                                            )}
                                                            {(item.story || item.preparation) && (
                                                                <button
                                                                    onClick={() => setExpandedPairingId(expandedPairingId === `${item.id}_info` ? null : `${item.id}_info`)}
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${expandedPairingId === `${item.id}_info`
                                                                        ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                                                                        : 'bg-transparent border-transparent text-stone-600 hover:text-[#D4AF37]'
                                                                        }`}
                                                                >
                                                                    <BookOpen size={18} strokeWidth={1.5} />
                                                                </button>
                                                            )}
                                                            {item.allergens && (
                                                                <button
                                                                    onClick={() => setExpandedPairingId(expandedPairingId === `${item.id}_allergens` ? null : `${item.id}_allergens`)}
                                                                    className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${expandedPairingId === `${item.id}_allergens`
                                                                        ? 'bg-red-900/20 border-red-500/50 text-red-400'
                                                                        : 'bg-transparent border-transparent text-stone-700 hover:text-red-400'
                                                                        }`}
                                                                >
                                                                    <AlertCircle size={18} strokeWidth={1.5} />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* CENTER COLUMN: Dish Info */}
                                                        <div className="flex-1 min-w-0 pr-2">
                                                            <h4 className="text-xl text-stone-100 font-normal uppercase tracking-[0.15em] leading-tight group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                                                                {getTranslated(item, 'name')}
                                                            </h4>
                                                            {(() => {
                                                                const rawDesc = (getTranslated(item, 'description') || '');
                                                                // Convert to proper sentence case (lowercase except first char)
                                                                const s = rawDesc.replace(/ A CAPO /g, '\n').trim();
                                                                const desc = s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';

                                                                return desc ? (
                                                                    <p className="text-base text-stone-400 leading-relaxed mt-2 italic opacity-90" style={{ fontFamily: "'Lato', sans-serif" }}>
                                                                        {desc}
                                                                    </p>
                                                                ) : null;
                                                            })()}
                                                        </div>

                                                        {/* RIGHT COLUMN: Price & Image */}
                                                        <div className="flex flex-col items-end gap-3 pt-1">
                                                            {item.price && (
                                                                <span className="font-serif text-xl text-[#D4AF37] whitespace-nowrap drop-shadow-sm">
                                                                    € {item.price}
                                                                </span>
                                                            )}
                                                            {item.image && (
                                                                <div
                                                                    className="w-36 h-36 rounded-lg overflow-hidden border border-stone-800 shadow-lg cursor-pointer hover:border-[#D4AF37]/50 transition-all bg-black shrink-0"
                                                                    onClick={() => setZoomedDishImage({ src: item.image!, name: getTranslated(item, 'name') })}
                                                                >
                                                                    <img
                                                                        src={item.image}
                                                                        alt="Dish"
                                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                                                                    />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* EXPANDABLE DRAWERS CONTAINER */}
                                                    <div className="relative overflow-visible">

                                                        {/* WINE PAIRING DRAWER — Full width edge-to-edge */}
                                                        {isPairingActive && (
                                                            <div className="h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent mt-5 mb-3 -mx-5" />
                                                        )}
                                                        <div className={`transition-all duration-500 ease-in-out overflow-visible ${isPairingActive ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'} -mx-5`}>
                                                            <div className="bg-stone-950/90 rounded-xl py-4 px-0 border-y border-[#D4AF37]/20 relative overflow-visible">

                                                                {/* Header */}
                                                                <div className="mb-3 relative z-10">
                                                                    <span className="bg-stone-800/80 text-[#D4AF37] text-sm font-medium uppercase tracking-wide px-4 py-2 rounded-full inline-block">
                                                                        {language === 'it' ? 'Consigli dal Sommelier AI:' : 'Sommelier AI Recommendations:'}
                                                                    </span>
                                                                </div>

                                                                {aiPairings[item.id] ? (
                                                                    <div className="space-y-3 relative z-10 max-h-[500px] overflow-y-auto pt-2">
                                                                        {aiPairings[item.id].map((pairing, idx) => {
                                                                            const wine = wines.find(w => w.id === pairing.wineId);
                                                                            if (!wine) return null;
                                                                            const winery = wineries.find(w => w.id === wine.wineryId);

                                                                            return (
                                                                                <div
                                                                                    key={idx}
                                                                                    className="group rounded-2xl flex flex-col border border-[#D4AF37]/40 active:scale-[0.98] transition-all relative z-0 overflow-visible shadow-lg"
                                                                                    style={{ padding: '12px', gap: '0px', background: 'linear-gradient(135deg, #1c1917 0%, #292524 50%, #1c1917 100%)' }}
                                                                                    onClick={() => onSelectWine(wine)}
                                                                                >
                                                                                    <div className="absolute inset-0 rounded-2xl overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-[#D4AF37]/0 translate-x-[-100%] group-active:translate-x-[100%] transition-transform duration-700" /></div>

                                                                                    {/* Top Row: Bottle + Wine Info + Match Badge */}
                                                                                    <div className="flex items-start relative z-10" style={{ paddingLeft: '8px', gap: '12px' }}>
                                                                                        {/* Bottle */}
                                                                                        <div className="flex items-center justify-center shrink-0 relative" style={{ width: '56px', height: '80px' }}>
                                                                                            <img
                                                                                                src={wine.image}
                                                                                                alt={wine.name}
                                                                                                className="object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] relative z-10"
                                                                                                style={{ height: '105px', marginTop: '-12px' }}
                                                                                            />
                                                                                        </div>

                                                                                        {/* Wine Info */}
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <p className="text-[#D4AF37] uppercase font-bold truncate" style={{ fontSize: 'clamp(9px, 2.5vw, 13px)', letterSpacing: '0.12em', marginBottom: '2px' }}>{winery?.name}</p>
                                                                                            <h4 className="text-stone-100 font-serif line-clamp-2 group-active:text-[#D4AF37] transition-colors" style={{ fontSize: 'clamp(14px, 3.8vw, 20px)', lineHeight: '1.25', marginBottom: '4px' }}>{wine.name}</h4>
                                                                                            <p className="text-[#D4AF37] font-medium uppercase truncate" style={{ fontSize: 'clamp(9px, 2.5vw, 13px)', letterSpacing: '0.1em' }}>{wine.grapes}</p>
                                                                                        </div>

                                                                                        {/* Match Badge */}
                                                                                        {pairing.score && (
                                                                                            <span className="text-[#D4AF37] font-serif font-bold bg-[#D4AF37]/10 rounded-full shadow-[0_0_12px_rgba(212,175,55,0.25)] border border-[#D4AF37]/30 whitespace-nowrap shrink-0 flex flex-col items-center justify-center leading-none" style={{ fontSize: 'clamp(8px, 2.2vw, 10px)', padding: '4px 6px', minWidth: '42px' }}>
                                                                                                {pairing.score === 100 ? (
                                                                                                    <>
                                                                                                        <span>100%</span>
                                                                                                        <span className="text-[7px] mt-0.5 opacity-90">match</span>
                                                                                                    </>
                                                                                                ) : `${pairing.score}%`}
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    {/* Justification — BELOW */}
                                                                                    {pairing.justification && (
                                                                                        <p className="text-stone-400 text-sm italic leading-relaxed relative z-10 border-t border-stone-800/60 pt-3 mt-3">
                                                                                            {pairing.justification}
                                                                                        </p>
                                                                                    )}
                                                                                    {pairing.technicalDetail && (
                                                                                        <p className="text-xs text-stone-600 font-serif leading-relaxed mt-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-10">
                                                                                            {pairing.technicalDetail}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-stone-500 text-xs italic">{language === 'it' ? 'Chiedi al personale per un consiglio.' : language === 'en' ? 'Ask our staff for a suggestion.' : 'Demandez à notre personnel pour un conseil.'}</p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* INFO DRAWER (Story & Prep) */}
                                                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPairingId === `${item.id}_info` ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                            <div className="bg-stone-900 rounded-xl p-8 border border-stone-800 relative shadow-inner">
                                                                <div className="absolute top-4 right-4 text-stone-800 opacity-20"><BookOpen size={80} /></div>
                                                                <div className="space-y-8 relative z-10">
                                                                    {(getTranslated(item, 'story') || item.story) && (
                                                                        <div>
                                                                            <h5 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
                                                                                {language === 'it' ? 'La Storia' : language === 'fr' ? 'L\'Histoire' : 'The Story'}
                                                                            </h5>
                                                                            <p className="font-serif text-stone-300 text-lg italic leading-relaxed">{getTranslated(item, 'story') || item.story}</p>
                                                                        </div>
                                                                    )}
                                                                    {(getTranslated(item, 'preparation') || item.preparation) && (
                                                                        <div>
                                                                            <h5 className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
                                                                                {language === 'it' ? 'La Preparazione' : language === 'fr' ? 'La Préparation' : 'Preparation'}
                                                                            </h5>
                                                                            <p className="font-serif text-stone-400 text-base leading-relaxed whitespace-pre-line border-l-2 border-[#D4AF37]/30 pl-4">{getTranslated(item, 'preparation') || item.preparation}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* PHOTO DRAWER */}
                                                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPairingId === `${item.id}_photo` ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                            <div
                                                                className="rounded-xl overflow-hidden shadow-2xl relative group/photo cursor-pointer active:scale-[0.98] transition-transform border border-stone-800"
                                                                onClick={() => item.image && setZoomedDishImage({ src: item.image, name: getTranslated(item, 'name') || item.name })}
                                                            >
                                                                <img src={item.image} className="w-full object-contain max-h-[400px] bg-black" alt={item.name} />
                                                                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-stone-950 to-transparent flex items-end justify-between p-6">
                                                                    <p className="text-white font-serif text-xl italic drop-shadow-md">{getTranslated(item, 'name')}</p>
                                                                    <span className="text-[#D4AF37] text-[10px] uppercase tracking-widest font-bold flex items-center gap-1"><Camera size={12} /> Zoom</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* ALLERGENS DRAWER */}
                                                        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${expandedPairingId === `${item.id}_allergens` ? 'max-h-[200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                            <div className="bg-red-950/20 rounded-xl p-4 border border-red-900/30 flex items-start gap-4">
                                                                <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                                                                <div>
                                                                    <h5 className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-red-400 mb-1">{language === 'it' ? 'Allergeni Presenti' : language === 'en' ? 'Allergens Present' : 'Allergènes Présents'}</h5>
                                                                    <p className="font-serif text-stone-400 italic">{item.allergens}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section >
                    );
                })}

                {
                    menu.length === 0 && (
                        <div className="text-center py-20 text-stone-500 font-serif italic">
                            {language === 'it' ? 'Il menu non è ancora stato inserito.' : language === 'en' ? 'The menu has not been added yet.' : 'Le menu n\'a pas encore été ajouté.'}
                            <br />
                            <span className="text-sm">{language === 'it' ? 'Aggiungi piatti dalla sezione Admin.' : language === 'en' ? 'Add dishes from the Admin section.' : 'Ajoutez des plats depuis la section Admin.'}</span>
                        </div>
                    )
                }
            </div >

            {/* Footer Note */}
            < div className="max-w-2xl mx-auto mt-16 pt-8 border-t border-[#D4AF37]/20 text-center pb-8" >
                <p className="font-serif text-sm text-stone-500 italic font-medium">
                    {language === 'it' ? 'Tutti i nostri piatti possono essere accompagnati dai vini del nostro territorio.' : language === 'en' ? 'All our dishes can be paired with wines from our region.' : 'Tous nos plats peuvent être accompagnés des vins de notre terroir.'}
                    <br />
                    {language === 'it' ? 'Chiedi al sommelier per l\'abbinamento perfetto.' : language === 'en' ? 'Ask the sommelier for the perfect pairing.' : 'Demandez au sommelier pour l\'accord parfait.'}
                </p>

                {/* Esplora Cantine Button */}
                <button
                    onClick={onExploreWineries}
                    className="mt-6 px-10 py-3 bg-[#D4AF37] text-stone-900 font-serif uppercase tracking-[0.15em] text-xs hover:bg-white transition-colors rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)]"
                >
                    {language === 'it' ? 'Esplora Cantine' : language === 'en' ? 'Explore Wineries' : 'Explorer les Caves'}
                </button>
            </div >

            {/* FULLSCREEN DISH PHOTO ZOOM OVERLAY */}
            {
                zoomedDishImage && (
                    <div
                        className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
                        onClick={() => setZoomedDishImage(null)}
                    >
                        <div className="relative max-w-full max-h-[80vh] animate-in zoom-in-95 duration-500">
                            <img
                                src={zoomedDishImage.src}
                                alt={zoomedDishImage.name}
                                className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-stone-800"
                            />
                        </div>
                        <p className="text-[#D4AF37] font-serif text-lg italic mt-4 text-center drop-shadow-md">{zoomedDishImage.name}</p>
                        <p className="text-stone-500 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">
                            {language === 'it' ? 'Tocca per chiudere' : 'Tap to close'}
                        </p>
                    </div>
                )
            }
            {/* CHEF BIO MODAL */}
            {
                showChefBio && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setShowChefBio(false)}>
                        <div className="relative max-w-md w-full max-h-[85vh] overflow-y-auto rounded-2xl border border-[#D4AF37]/30 overflow-hidden" onClick={e => e.stopPropagation()}
                            style={{ background: 'linear-gradient(160deg, #1c1917 0%, #0c0a09 50%, #1c1917 100%)' }}>
                            {/* Close button */}
                            <button onClick={() => setShowChefBio(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-stone-800/60 flex items-center justify-center text-stone-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>

                            {/* Chef Photo */}
                            <div className="w-full aspect-[3/2] overflow-hidden relative">
                                <img src="/assets/chef_zuco.png" alt="Chef Giovanni Zuco" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1c1917] to-transparent" />
                            </div>

                            <div className="p-6 space-y-4 -mt-10 relative z-10">
                                {/* Header */}
                                <div className="text-center space-y-1 mb-6">
                                    <h2 className="text-xl font-serif text-[#D4AF37] uppercase tracking-[0.2em] drop-shadow-lg">Lo Chef</h2>
                                    <div className="w-12 h-px bg-[#D4AF37]/50 mx-auto" />
                                </div>

                                <p className="text-stone-300 font-serif text-sm leading-relaxed">
                                    Alla guida della cucina del ristorante IANUA c’è lo chef <strong className="text-[#D4AF37]">Giovanni Zuco</strong>.
                                </p>
                                <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
                                    Quarantenne, calabrese di origine, ormai valdostano di adozione, è tornato in Valle d’Aosta, dopo una lunga esperienza al ristorante bistro Sur la Place di Aosta, qualche anno fa.
                                </p>
                                <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
                                    Partito giovanissimo dalla sua Motta San Giovanni (RC), Giovanni nella sua carriera ha lavorato sulle navi da crociera, sulle Dolomiti, in Romagna, in prestigiosi ristoranti reggini…
                                </p>
                                <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
                                    Al ristorante IANUA oggi porta il suo bagaglio fatto soprattutto di tanta esperienza.
                                </p>
                                <p className="text-stone-300 font-serif text-sm leading-relaxed">
                                    La sua è una cucina versatile che spazia dalla montagna al mare, un ideale connubio per IANUA che si ispira ai transiti e ai commerci dal mediterraneo alle alpi.
                                </p>
                                <p className="text-stone-300 font-serif text-sm leading-relaxed">
                                    Zuco è il mago che sa trasformare la materia prima in piatti che sono prima di tutto buoni.
                                </p>
                                <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
                                    Al bando la sofisticazione, la cucina troppo cerebrale, le forzature estetiche, “Gianni” porta in tavola sostanza e bellezza, quella bellezza che scaturisce da una cucina vera.
                                </p>
                                <p className="text-stone-300 font-serif text-sm leading-relaxed">
                                    L’ingrediente segreto di ogni piatto del nostro chef? <em className="text-[#D4AF37]">Metterci sempre passione.</em>
                                </p>
                                <p className="text-stone-400 font-serif text-sm leading-relaxed italic">
                                    Perché le ricette in sé non hanno l’anima, l’anima ce la mettono gli chef.
                                </p>

                                {/* Team */}
                                <div className="pt-6 border-t border-[#D4AF37]/20 mt-4">
                                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3 text-center">In cucina con Giovanni Zuco</h3>
                                    <div className="space-y-1 text-center">
                                        <p className="text-stone-400 font-serif text-sm"><strong className="text-stone-300">Masun Md</strong> — ai primi piatti</p>
                                        <p className="text-stone-400 font-serif text-sm"><strong className="text-stone-300">Daniela Malacarne</strong> — antipasti e dessert</p>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center gap-3 pt-4">
                                    <div className="flex-1 h-px bg-[#D4AF37]/20" />
                                    <Feather size={14} className="text-[#D4AF37]/40 -rotate-45" />
                                    <div className="flex-1 h-px bg-[#D4AF37]/20" />
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};
