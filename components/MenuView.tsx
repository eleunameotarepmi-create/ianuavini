
import React from 'react';
import { MenuItem, Wine, Winery } from '../types';
import { UtensilsCrossed, Leaf, Fish, Beef, Cake, Star, Wine as WineIcon, Sparkles, BookOpen, ImageIcon, AlertCircle, Camera, Users, Loader2 } from 'lucide-react';
import { getPerfectPairing } from '../services/geminiService';

interface MenuViewProps {
    menu: MenuItem[];
    wines: Wine[];
    wineries: Winery[];
    language: 'it' | 'en' | 'fr';
    onSelectWine: (wine: Wine) => void;
    onOpenGruppi?: () => void;
    onUpdateMenu?: (items: MenuItem[]) => void;
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

export const MenuView: React.FC<MenuViewProps> = ({ menu, wines, wineries, language, onSelectWine, onOpenGruppi, onUpdateMenu }) => {
    const [expandedPairingId, setExpandedPairingId] = React.useState<string | null>(null);
    const [aiPairings, setAiPairings] = React.useState<Record<string, { wineId: string, justification: string, score?: number, label?: string, technicalDetail?: string }[]>>({});
    const [loadingPairs, setLoadingPairs] = React.useState<Set<string>>(new Set());

    const [expandedDetailId, setExpandedDetailId] = React.useState<string | null>(null);
    const [zoomedDishImage, setZoomedDishImage] = React.useState<{ src: string; name: string } | null>(null);

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
                justification: pairData?.notes || pairData?.description || (language === 'it' ? "Abbinamento consigliato dalla carta." : "Recommended pairing from the menu."),
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
        <div className="pb-32 px-4 md:px-6 animate-in fade-in duration-700 bg-background relative overflow-hidden transition-colors duration-500">
            {/* GOLDEN DECOR OVERLAYS */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-screen overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/golden_vines.png')] bg-cover opacity-20" />
                <div className="absolute top-1/4 right-[-50px] w-64 h-64 bg-[url('/assets/golden_corkscrew.png')] bg-contain bg-no-repeat opacity-30 rotate-12" />
                <div className="absolute bottom-1/4 left-[-50px] w-64 h-64 bg-[url('/assets/golden_barrel.png')] bg-contain bg-no-repeat opacity-20 -rotate-12" />
            </div>
            {/* Header */}
            <div className="pt-12 pb-8 text-center space-y-2">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-white border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-lg">
                        <UtensilsCrossed size={28} strokeWidth={1.5} />
                    </div>
                </div>
                <h2 className="text-4xl font-serif text-primary uppercase tracking-[0.2em]">
                    {language === 'it' ? 'La Carte' : language === 'fr' ? 'La Carte' : 'The Menu'}
                </h2>
                <p className="text-sm font-serif text-secondary italic max-w-md mx-auto">
                    {language === 'it'
                        ? 'I sapori della tradizione, accompagnati dai nostri vini'
                        : language === 'fr'
                            ? 'Les saveurs de la tradition, accompagnées de nos vins'
                            : 'Traditional flavors, paired with our wines'}
                </p>
                <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto mt-4" />

                {/* Gruppi 2026 Button */}
                {onOpenGruppi && (
                    <button
                        onClick={onOpenGruppi}
                        className="mt-8 mx-auto flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-[#D4AF37] to-[#c5a028] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 font-serif tracking-widest uppercase text-sm"
                    >
                        <Users size={20} />
                        <span>{language === 'it' ? 'Menu Gruppi 2026' : language === 'fr' ? 'Menus Groupes 2026' : 'Group Menus 2026'}</span>
                    </button>
                )}
            </div>

            {/* Menu Categories */}
            <div className="max-w-2xl mx-auto space-y-12">
                {categoryOrder.map(category => {
                    const items = groupedMenu[category];
                    if (items.length === 0) return null;

                    return (
                        <section key={category} className="space-y-6">
                            {/* Category Header */}
                            <div className="flex items-center gap-4">
                                <div className="text-[#D4AF37]">
                                    {categoryIcons[category]}
                                </div>
                                <h3 className="text-2xl font-serif text-primary uppercase tracking-widest">
                                    {language === 'it' ? category :
                                        language === 'en' ? categoryTranslations[category].en :
                                            categoryTranslations[category].fr}
                                </h3>
                                <div className="flex-1 h-[1px] bg-accent/20" />
                            </div>

                            {/* Menu Items */}
                            <div className="space-y-6 pl-2">
                                {items.map(item => {
                                    const itemAiPairings = aiPairings[item.id] || [];
                                    const isLoading = loadingPairs.has(item.id);

                                    // REVISED LAYOUT: Icons next to dish name (Left side)
                                    // User wants icons "starting from left of the glass".
                                    // Structure: [Dish Text] ... [Icons Row]
                                    // Actually user said "le icone devono partire dalla sinistra del bicchiere on sotto".
                                    // Previous was: [Icons Col] [Dish Text]
                                    // New Idea: [Dish Text] [Row: Extra Icons -> Wine Icon]
                                    // Wait, if I put them on the right, it might conflict with price.

                                    // Let's interpret "partire dalla sinistra del bicchiere":
                                    // Imagine the wine glass is the anchor.
                                    // [Allergens] [Photo] [Info] [WineGlass]
                                    // This entire group should probably be... where?
                                    // If it's to the left of the dish text, it looks like a toolbar.
                                    // If it's below the dish text? No "on sotto".
                                    // If it's to the RIGHT of the dish text?

                                    // Or just flex-row and order correctly.

                                    // [Dish Info (Flex 1)]   [Icons Row (Flex 0)]

                                    return (
                                        <div key={item.id} className="group transition-all">
                                            {(() => {
                                                // Check for ANY master pairing (direct or reverse)
                                                const hasMasterPairing = (item.verifiedPairings && item.verifiedPairings.length > 0) ||
                                                    wines.some(w => w.ianuaPairings?.some(p => p.dishId === item.id));

                                                return (
                                                    <div className="flex items-start gap-2">
                                                        {/* Left Side: Fixed-width container - icons aligned right so wine glass stays in place */}
                                                        <div className="flex flex-row items-center justify-end gap-0.5 sm:gap-1 w-20 sm:w-24 md:w-28 shrink-0">
                                                            {/* Info / Story Button */}
                                                            {(item.story || item.preparation) && (
                                                                <button
                                                                    onClick={() => setExpandedPairingId(expandedPairingId === `${item.id}_info` ? null : `${item.id}_info`)}
                                                                    className={`p-1.5 rounded-full transition-all duration-500 ${expandedPairingId === `${item.id}_info` ? 'bg-stone-900 text-[#D4AF37] shadow-lg scale-110' : 'text-[#D4AF37] hover:bg-stone-100 hover:scale-110'}`}
                                                                    title="Storia e Preparazione"
                                                                >
                                                                    <BookOpen size={20} />
                                                                </button>
                                                            )}

                                                            {/* Photo Button - Changed to Camera */}
                                                            {item.image && (
                                                                <button
                                                                    onClick={() => setExpandedPairingId(expandedPairingId === `${item.id}_photo` ? null : `${item.id}_photo`)}
                                                                    className={`p-2.5 rounded-full transition-all duration-500 ${expandedPairingId === `${item.id}_photo` ? 'bg-stone-900 text-[#D4AF37] shadow-lg scale-110' : 'text-[#D4AF37] hover:bg-stone-100 hover:scale-110'}`}
                                                                    title="Foto Piatto"
                                                                >
                                                                    <Camera size={24} />
                                                                </button>
                                                            )}

                                                            {/* Allergens Button */}
                                                            {item.allergens && (
                                                                <button
                                                                    onClick={() => setExpandedPairingId(expandedPairingId === `${item.id}_allergens` ? null : `${item.id}_allergens`)}
                                                                    className={`p-1.5 rounded-full transition-all duration-500 ${expandedPairingId === `${item.id}_allergens` ? 'bg-stone-900 text-[#D4AF37] shadow-lg scale-110' : 'text-[#D4AF37] hover:bg-stone-100 hover:scale-110'}`}
                                                                    title="Allergeni"
                                                                >
                                                                    <AlertCircle size={20} />
                                                                </button>
                                                            )}

                                                            {/* Wine Pairing Button - stays at right edge */}
                                                            <button
                                                                onClick={() => handleGetPairing(item)}
                                                                className={`p-2 rounded-full transition-all duration-500 z-10 relative ${expandedPairingId === `${item.id}_wine` ? 'bg-stone-900 text-[#D4AF37] shadow-lg scale-110' : 'text-[#722F37] hover:text-[#722F37] hover:scale-110 hover:bg-stone-100'}`}
                                                                title="Abbinamento Vino"
                                                            >
                                                                <WineIcon
                                                                    size={24}
                                                                    strokeWidth={1.5}
                                                                    fill={expandedPairingId === `${item.id}_wine` ? "#D4AF37" : (hasMasterPairing ? "#722F37" : "none")}
                                                                    className={expandedPairingId === `${item.id}_wine` ? "" : "opacity-100"}
                                                                />
                                                                {hasMasterPairing && (
                                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#D4AF37] rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                                                                        <Star size={6} fill="white" className="text-white" />
                                                                    </div>
                                                                )}
                                                            </button>
                                                        </div>

                                                        {/* Right Side: Dish Info */}
                                                        <div className="flex-1">
                                                            <div className="flex justify-between items-baseline gap-4">
                                                                <h4 className="font-serif text-xl text-primary font-medium group-hover:text-accent transition-colors">
                                                                    {getTranslated(item, 'name')}
                                                                </h4>
                                                                <div className="flex-1 border-b border-dotted border-stone-200" />
                                                                <span className="font-serif text-lg text-[#D4AF37] font-bold whitespace-nowrap">
                                                                    {item.price} €
                                                                </span>
                                                            </div>
                                                            {/* Only show description if it's different from name and not empty */}
                                                            {(() => {
                                                                const desc = (getTranslated(item, 'description') || '').replace(/ A CAPO /g, '\n').trim();
                                                                const name = (getTranslated(item, 'name') || '').trim();
                                                                if (!desc || desc === name) return null;
                                                                return (
                                                                    <div className="mt-1">
                                                                        <p className="font-serif text-base text-secondary italic leading-relaxed whitespace-pre-line">
                                                                            {desc}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                );
                                            })()}

                                            {/* DRAWERS CONTAINER */}
                                            <div className="relative overflow-hidden">

                                                {/* WINE DRAWER */}
                                                <div className={`transition-all duration-700 ease-in-out ${expandedPairingId === `${item.id}_wine` ? 'max-h-[1200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                    <div className="bg-surface rounded-xl p-6 shadow-2xl border border-accent/20 relative">
                                                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none text-stone-900"><WineIcon size={120} /></div>
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h5 className="text-[#D4AF37] text-sm font-bold uppercase tracking-[0.3em] flex items-center gap-2"><Sparkles size={14} />{language === 'it' ? 'Il Sommelier Consiglia' : language === 'en' ? 'Sommelier Suggests' : 'Le Sommelier Conseille'}</h5>

                                                        </div>

                                                        {isLoading ? (
                                                            <div className="flex flex-col items-center justify-center py-10 text-[#D4AF37]">
                                                                <Loader2 size={32} className="animate-spin mb-2" />
                                                                <p className="text-xs font-serif italic">{language === 'it' ? 'Il Sommelier sta scegliendo...' : language === 'en' ? 'Sommelier is choosing...' : 'Le Sommelier choisit...'}</p>
                                                            </div>
                                                        ) : itemAiPairings.length > 0 ? (
                                                            <div className="flex gap-4 overflow-x-auto pb-6 -mb-6 scrollbar-thin scrollbar-thumb-stone-200 scrollbar-track-transparent items-start">
                                                                {itemAiPairings.map(pairing => {
                                                                    const wine = wines.find(w => w.id === pairing.wineId);
                                                                    if (!wine) return null;
                                                                    const winery = wineries.find(w => w.id === wine.wineryId);
                                                                    return (
                                                                        <div key={wine.id} onClick={() => onSelectWine(wine)} className="min-w-[180px] w-[180px] flex flex-col gap-2 group/card cursor-pointer">
                                                                            <div className="aspect-[2/3] bg-stone-50 rounded-lg overflow-hidden relative border border-stone-100 group-hover/card:border-[#D4AF37]/50 transition-colors shadow-inner">
                                                                                {wine.image ? <img src={wine.image} className="w-full h-full object-contain p-2 opacity-100 transition-opacity" /> : <div className="w-full h-full flex items-center justify-center text-stone-300"><WineIcon size={32} /></div>}
                                                                            </div>
                                                                            <div>
                                                                                <p className="text-[11px] text-[#D4AF37] uppercase tracking-wider truncate font-bold">{winery?.name || 'Cantina'}</p>
                                                                                <div className="flex items-start justify-between gap-1 mb-1 h-[60px]">
                                                                                    <p className="text-stone-700 font-serif text-base leading-tight group-hover/card:text-[#D4AF37] transition-colors line-clamp-3">{wine.name}</p>
                                                                                    {pairing.label && (
                                                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${pairing.label === 'Perfetto' ? 'bg-[#D4AF37] text-white' :
                                                                                            pairing.label === 'Ottimo' ? 'bg-stone-800 text-[#D4AF37]' :
                                                                                                pairing.label === 'Scelta del Sommelier' ? 'bg-[#722F37] text-white' :
                                                                                                    'bg-stone-100 text-stone-500'
                                                                                            }`}>
                                                                                            {pairing.label}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                                <div className="mt-2 p-2.5 bg-[#D4AF37]/5 rounded border border-[#D4AF37]/10">
                                                                                    <p className="text-base text-stone-600 leading-snug">
                                                                                        {pairing.justification}
                                                                                    </p>
                                                                                    {pairing.technicalDetail && (
                                                                                        <p className="text-sm text-stone-500 font-serif leading-relaxed mt-2">
                                                                                            {pairing.technicalDetail}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : <p className="text-stone-400 text-xs italic">{language === 'it' ? 'Chiedi al personale per un consiglio.' : language === 'en' ? 'Ask our staff for a suggestion.' : 'Demandez à notre personnel pour un conseil.'}</p>}
                                                    </div>
                                                </div>

                                                {/* INFO DRAWER (Story & Prep) */}
                                                <div className={`transition-all duration-500 ease-in-out ${expandedPairingId === `${item.id}_info` ? 'max-h-[800px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                    <div className="bg-surface rounded-xl p-8 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] border border-accent/20 relative">
                                                        <div className="absolute top-4 right-4 text-[#D4AF37]/10"><BookOpen size={80} /></div>
                                                        <div className="space-y-8 relative z-10">
                                                            {(getTranslated(item, 'story') || item.story) && (
                                                                <div>
                                                                    <h5 className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
                                                                        {language === 'it' ? 'La Storia' : language === 'fr' ? 'L\'Histoire' : 'The Story'}
                                                                    </h5>
                                                                    <p className="font-serif text-stone-700 text-lg italic leading-relaxed">{getTranslated(item, 'story') || item.story}</p>
                                                                </div>
                                                            )}
                                                            {(getTranslated(item, 'preparation') || item.preparation) && (
                                                                <div>
                                                                    <h5 className="font-sans text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-3">
                                                                        {language === 'it' ? 'La Preparazione' : language === 'fr' ? 'La Préparation' : 'Preparation'}
                                                                    </h5>
                                                                    <p className="font-serif text-stone-600 text-base leading-relaxed whitespace-pre-line border-l-2 border-[#D4AF37]/30 pl-4">{getTranslated(item, 'preparation') || item.preparation}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* PHOTO DRAWER */}
                                                <div className={`transition-all duration-500 ease-in-out ${expandedPairingId === `${item.id}_photo` ? 'max-h-[600px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                    <div
                                                        className="rounded-xl overflow-hidden shadow-2xl relative group/photo cursor-pointer active:scale-[0.98] transition-transform"
                                                        onClick={() => item.image && setZoomedDishImage({ src: item.image, name: getTranslated(item, 'name') || item.name })}
                                                    >
                                                        <img src={item.image} className="w-full object-cover max-h-[400px] brightness-105 saturate-110" alt={item.name} />
                                                        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between p-6">
                                                            <p className="text-white font-serif text-xl italic drop-shadow-md">{getTranslated(item, 'name')}</p>
                                                            <span className="text-white/60 text-[10px] uppercase tracking-widest font-bold flex items-center gap-1">🔍 Zoom</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* ALLERGENS DRAWER */}
                                                <div className={`transition-all duration-500 ease-in-out ${expandedPairingId === `${item.id}_allergens` ? 'max-h-[200px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 flex items-start gap-4">
                                                        <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
                                                        <div>
                                                            <h5 className="font-sans text-[9px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-1">{language === 'it' ? 'Allergeni Presenti' : language === 'en' ? 'Allergens Present' : 'Allergènes Présents'}</h5>
                                                            <p className="font-serif text-stone-700 italic">{item.allergens}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}

                {menu.length === 0 && (
                    <div className="text-center py-20 text-stone-400 font-serif italic">
                        {language === 'it' ? 'Il menu non è ancora stato inserito.' : language === 'en' ? 'The menu has not been added yet.' : 'Le menu n\'a pas encore été ajouté.'}
                        <br />
                        <span className="text-sm">{language === 'it' ? 'Aggiungi piatti dalla sezione Admin.' : language === 'en' ? 'Add dishes from the Admin section.' : 'Ajoutez des plats depuis la section Admin.'}</span>
                    </div>
                )}
            </div>

            {/* Footer Note */}
            <div className="max-w-2xl mx-auto mt-16 pt-8 border-t border-[#D4AF37]/20 text-center">
                <p className="font-serif text-xs text-stone-400 italic">
                    {language === 'it' ? 'Tutti i nostri piatti possono essere accompagnati dai vini del nostro territorio.' : language === 'en' ? 'All our dishes can be paired with wines from our region.' : 'Tous nos plats peuvent être accompagnés des vins de notre terroir.'}
                    <br />
                    {language === 'it' ? 'Chiedi al sommelier per l\'abbinamento perfetto.' : language === 'en' ? 'Ask the sommelier for the perfect pairing.' : 'Demandez au sommelier pour l\'accord parfait.'}
                </p>
            </div>

            {/* FULLSCREEN DISH PHOTO ZOOM OVERLAY */}
            {zoomedDishImage && (
                <div
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
                    onClick={() => setZoomedDishImage(null)}
                >
                    <div className="relative max-w-full max-h-[80vh] animate-in zoom-in-95 duration-500">
                        <img
                            src={zoomedDishImage.src}
                            alt={zoomedDishImage.name}
                            className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl"
                        />
                    </div>
                    <p className="text-white/80 font-serif text-lg italic mt-4 text-center drop-shadow-md">{zoomedDishImage.name}</p>
                    <p className="text-white/40 text-[10px] uppercase tracking-[0.3em] mt-2 font-bold">
                        {language === 'it' ? 'Tocca per chiudere' : 'Tap to close'}
                    </p>
                </div>
            )}
        </div>
    );
};
