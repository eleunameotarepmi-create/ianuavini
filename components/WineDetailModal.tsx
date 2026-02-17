import React, { useState, useEffect, useMemo } from 'react';
import { getGlassTypeFromWine } from '../data/glassData';
import type { Wine, Winery, MenuItem } from '../types';
import { X, Droplets, Thermometer, Utensils, Grape, ArrowUpRight, Wine as WineIcon, Activity, ChevronDown } from 'lucide-react';
import { t, Language } from '../translations';
import { getSafeImage } from '../utils/imageUtils';
import { WineGlass } from './WineGlass';
import { BottleSizeModal } from './BottleSizeModal';


// Helper to get translated field
const getTranslated = (obj: any, field: string, lang: Language): string => {
  if (lang === 'en' && obj[`${field}_en`]) return obj[`${field}_en`];
  if (lang === 'fr' && obj[`${field}_fr`]) return obj[`${field}_fr`];
  return obj[field] || '';
};

// Helper to check if a wine is "small"
const isSmallBottle = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('375') || n.includes('0.375') || n.includes('mezza') || n.includes('piccola') || n.includes('demie');
};

// Helper to check if a wine is "magnum"
const isMagnumBottle = (name: string) => {
  const n = name.toLowerCase();
  return n.includes('1.5') || n.includes('1,5') || n.includes('magnum');
};

const getGlassDescription = (type: string | undefined, language: Language): string => {
  if (!type) return t('glass.standard', language);
  if (['red', 'balloon'].includes(type)) return t('glass.balloon', language);
  if (['white'].includes(type)) return t('glass.white', language);
  if (['rose'].includes(type)) return t('glass.renano_rose', language);
  if (['sparkling', 'sparkling_rose'].includes(type)) return t('glass.sparkling', language);
  if (['sparkling_complex', 'champagne'].includes(type)) return t('glass.tulipano', language);
  if (['sparkling_rose_complex'].includes(type)) return t('glass.tulipano_rose', language);
  if (['dessert'].includes(type)) return t('glass.dessert', language);
  if (['borgogna', 'white_structured', 'white_complex'].includes(type)) return t('glass.borgogna', language);
  if (['borgogna_red'].includes(type)) return t('glass.borgogna_red', language);
  if (['red_complex'].includes(type)) return t('glass.gran_balloon', language);
  if (['red_structured'].includes(type)) return t('glass.borgogna_red_structured', language);
  if (['borgogna_rose', 'rose_structured'].includes(type)) return t('glass.borgogna_rose', language);
  if (['red_premium', 'barbaresco'].includes(type)) return t('glass.barbaresco', language);
  if (['flute_rose'].includes(type)) return t('glass.flute_rose', language);
  return t('glass.balloon', language); // Default fallback
}

interface WineDetailModalProps {
  wine: Wine & { ianuaPairings?: { dishId: string; label?: string; notes?: string }[] };
  winery: Winery | undefined;
  wines: Wine[];
  menu?: MenuItem[];
  language: Language;
  onClose: () => void;
  onGoToWinery?: (winery: Winery) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({ wine, winery, wines, menu = [], language, onClose, onGoToWinery }) => {
  const [selectedVintage, setSelectedVintage] = useState<{ year: string; price: string } | null>(null);
  const [glassInfoOpen, setGlassInfoOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showIanuaPairings, setShowIanuaPairings] = useState(false);
  const [isBottleGuideOpen, setIsBottleGuideOpen] = useState(false);
  const [zoomedDishImage, setZoomedDishImage] = useState<{ src: string; name: string } | null>(null);
  const [openAccordion, setOpenAccordion] = useState<'sensory' | 'pairing' | null>(null);



  // Compute "Effective Wine" - inheriting text from standard bottle if this is a small bottle
  const effectiveWine = useMemo(() => {
    // If it's not a small bottle, just return the wine as is
    if (!isSmallBottle(wine.name)) return wine;

    // Find a potential parent/standard bottle
    // Criteria: Same winery, NOT small, name similarity
    const candidates = wines.filter(w =>
      w.wineryId === wine.wineryId &&
      w.id !== wine.id &&
      !isSmallBottle(w.name)
    );

    if (candidates.length === 0) return wine;

    // Find best match (simple fuzzy match: contains mostly same words)
    // For now, let's just pick the one with the most similar name length or just first one if it's obvious?
    // Let's look for one that shares the first word at least
    const firstWord = wine.name.split(' ')[0].toLowerCase();
    const parent = candidates.find(c => c.name.toLowerCase().includes(firstWord));

    if (!parent) return wine;



    return {
      ...wine,
      description: parent.description || wine.description,
      description_en: parent.description_en || wine.description_en,
      description_fr: parent.description_fr || wine.description_fr,
      pairing: parent.pairing || wine.pairing,
      pairing_en: parent.pairing_en || wine.pairing_en,
      pairing_fr: parent.pairing_fr || wine.pairing_fr,
      curiosity: parent.curiosity || wine.curiosity,
      curiosity_en: parent.curiosity_en || wine.curiosity_en,
      curiosity_fr: parent.curiosity_fr || wine.curiosity_fr,
      ianuaPairings: parent.ianuaPairings || wine.ianuaPairings,
    };
  }, [wine, wines]);

  // Calculate related wines (siblings) once, for reuse
  const relatedWines = useMemo(() => {
    // intelligent name matching to avoid "Barolo" matching all Barolos
    const cleanName = (n: string) => {
      return n.toLowerCase()
        .replace(/barolo|barbaresco|barbera|nebbiolo|dolcetto|roero|langhe|verduno|dogliani|gavi|arneis|moscato|alta langa|docg|doc|superiore|riserva/g, '')
        .replace(/[0-9]/g, '') // remove years/numbers
        .replace(/[^a-z]/g, ' ') // remove special chars
        .trim();
    };

    const baseWords = cleanName(wine.name).split(/\s+/).filter(w => w.length >= 3);
    const baseName = baseWords.slice(0, Math.min(2, baseWords.length)).join(' '); // Use first 2 significant words

    if (!baseName || baseName.length < 3) return []; // Safety check

    return wines.filter(w =>
      w.wineryId === wine.wineryId &&
      w.id !== wine.id &&
      cleanName(w.name).includes(baseName)
    );
  }, [wine, wines]);

  // Check if we should show the bottle guide:
  // Show if CURRENT wine is special format OR if related wines exist with special formats
  const showBottleGuide = useMemo(() => {
    if (isSmallBottle(wine.name) || isMagnumBottle(wine.name)) return true;
    return relatedWines.some(s => isSmallBottle(s.name) || isMagnumBottle(s.name));
  }, [wine, relatedWines]);

  useEffect(() => {
    setIsAnimating(true);
    if (wine.vintages && wine.vintages.length > 0) {
      setSelectedVintage(wine.vintages[0]);
    } else {
      setSelectedVintage(null);
    }
  }, [wine]);

  const getRotationStyle = () => {
    const name = wine.name.toLowerCase();
    const id = wine.id.toLowerCase();
    // Base style for all wines focused on high-end presentation
    // Slight rotation for liveliness, scaling for impact
    if (id.includes('muscat')) {
      return { transform: 'rotate(-45deg) scale(1.4) translateY(10%)', filter: 'drop-shadow(20px 20px 30px rgba(0,0,0,0.5))' };
    }
    return { transform: 'rotate(-12deg) scale(1.1)', filter: 'drop-shadow(25px 25px 40px rgba(0,0,0,0.4))' };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 bg-stone-950/95 backdrop-blur-3xl animate-in fade-in duration-500 text-stone-200 transition-colors duration-500 overflow-hidden" style={{ overscrollBehavior: 'none' }}>


      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#800020]/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#D4AF37]/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-overlay" />


      </div>

      <div className="relative w-full h-full flex flex-col overflow-y-auto bg-stone-900/40">

        {/* Close Button - Moved inside the card specifically to avoid overlapping the frame */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full text-[#C9A84C] hover:text-[#E8D48B] hover:bg-white/5 transition-all"
        >
          <X size={24} strokeWidth={1.5} />
        </button>

        {/* LEFT COLUMN: HERO IMAGE - On mobile, fixed at top, nothing can cover it */}
        <div className="w-full h-[45vh] shrink-0 relative flex items-center justify-center p-8 overflow-hidden bg-gradient-to-b from-stone-950 to-stone-900 z-30">
          {/* Subtle background glow, not obscuring */}
          <div className="absolute inset-0 bg-radial-gradient from-[#D4AF37]/5 to-transparent opacity-50" />

          {/* Winery Logo/Image Background - Fills Header */}
          {winery?.image && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.15] mix-blend-overlay pointer-events-none grayscale contrast-125">
              <img
                src={winery.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* MOBILE PRICE - Floating in Hero - Metallic Gold Gradient */}
          {(selectedVintage?.price || effectiveWine.price) && (
            <div className="absolute bottom-4 right-2 z-20 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <div className="bg-transparent px-2 py-1 rounded-full border border-[#D4AF37]/50 flex items-center justify-center">
                <span className="font-serif text-xl font-bold tracking-wide bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-md">
                  €{(selectedVintage ? selectedVintage.price : effectiveWine.price || '').toString().replace(/[^0-9.,();\-\s]/g, '').trim()}
                </span>
              </div>
            </div>
          )}

          <div
            className={`relative z-10 h-full flex items-center justify-center transition-all duration-1000 ease-out transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'} cursor-pointer group`}
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={getSafeImage(effectiveWine.image)}
              alt={effectiveWine.name}
              style={getRotationStyle()}
              className="h-[90%] w-auto object-contain max-w-full drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {/* Wine Glass Indicator - Bottom Left of Bottle (Hero) */}
          <div className="absolute bottom-[12%] left-[0px] z-20 flex flex-col items-center gap-1">
            {/* Glass image - tappable */}
            <div className="relative cursor-pointer" onClick={() => setGlassInfoOpen(true)}>
              <WineGlass
                wine={effectiveWine}
                straight={true}
                className="w-[160px] h-[240px] !translate-y-0 opacity-90 drop-shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent blur-sm mix-blend-overlay rounded-b-3xl pointer-events-none" />
            </div>

            {/* Glass Label - Small */}
            <div className="bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
              <div className="flex items-center gap-1">
                <span className="text-[9px] uppercase tracking-wider text-[#D4AF37] whitespace-pre-line text-center">
                  {getGlassDescription(effectiveWine.type, language)}
                </span>
              </div>
            </div>
          </div>

          {/* Glass Info Fullscreen Overlay */}
          {glassInfoOpen && (() => {
            const glassDef = getGlassTypeFromWine(effectiveWine.type);
            return (
              <div
                className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300"
                onClick={() => setGlassInfoOpen(false)}
              >
                <div
                  className="relative bg-stone-900 border border-[#D4AF37]/20 rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setGlassInfoOpen(false)}
                    className="absolute top-5 right-5 p-2 text-stone-500 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>

                  {/* Gold line */}
                  <div className="w-16 h-[2px] bg-[#D4AF37]/40 mb-5" />

                  {/* Title */}
                  <h3 className="text-[#D4AF37] font-sans text-sm font-bold uppercase tracking-[0.25em] mb-2">
                    {glassDef.name}
                  </h3>
                  <p className="text-stone-300 font-serif text-base italic mb-6">
                    {glassDef.shortDescription}
                  </p>

                  {/* Description */}
                  <p className="text-stone-200 text-base leading-[1.8] mb-6">
                    {glassDef.fullDescription}
                  </p>

                  {/* Technical details */}
                  <div className="bg-stone-800/60 rounded-xl p-5 mb-5 border border-[#D4AF37]/10">
                    <h4 className="text-[#D4AF37]/80 text-xs font-bold uppercase tracking-[0.2em] mb-3">
                      {language === 'en' ? 'Technical Details' : language === 'fr' ? 'Détails Techniques' : 'Dettagli Tecnici'}
                    </h4>
                    <p className="text-stone-300 text-sm leading-[1.7]">{glassDef.technicalDetails}</p>
                  </div>

                  {/* Usage */}
                  <p className="text-[#D4AF37]/60 text-sm italic leading-relaxed">{glassDef.usage}</p>
                </div>
              </div>
            );
          })()}
        </div>

        {/* RIGHT COLUMN: DETAILS (The "Sheet") - On mobile, stays below hero, internal scroll only */}
        <div className="w-full h-[55vh] relative bg-stone-900 flex flex-col justify-start overflow-y-auto overflow-x-hidden no-scrollbar rounded-t-[2.5rem] z-20 border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-colors duration-500">

          {/* BACKGROUND WATERMARK & GOLDEN DECOR */}
          <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-screen overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/golden_vines.png')] bg-cover opacity-20" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-[url('/assets/golden_corkscrew.png')] bg-contain bg-no-repeat opacity-30 rotate-[-20deg]" />
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[url('/assets/golden_barrel.png')] bg-contain bg-no-repeat opacity-20 rotate-12" />
          </div>

          {winery?.image && (
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none grayscale mix-blend-luminosity z-0">
              <img
                src={winery.image}
                alt=""
                className="w-[150%] h-[150%] object-cover blur-[1px]"
              />
            </div>
          )}

          {/* Ornamental Drag Handle */}
          <div className="w-full flex items-center justify-center pt-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-[#D4AF37]/40" />
              <span className="text-[#D4AF37]/50 text-xs">✦</span>
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-[#D4AF37]/40" />
            </div>
          </div>

          <div className="px-5 py-4 mx-auto space-y-8">

            {/* Header Info (Unified for Mobile & Desktop) */}
            <div className="space-y-5 text-center">
              {/* Winery pill */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-800/50 backdrop-blur-sm border border-[#D4AF37]/20 text-xs uppercase tracking-[0.25em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: '#D4AF37' }}>
                  {winery?.name}
                </span>
              </div>

              <h1 className="text-3xl font-serif text-stone-100 leading-tight">
                {effectiveWine.name}
              </h1>

              {/* Bottle Formats Guide */}
              {showBottleGuide && (
                <button
                  onClick={() => setIsBottleGuideOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/40 backdrop-blur-sm border border-white/10 rounded-full text-xs uppercase tracking-widest text-stone-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all mx-auto" style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  <span>{t('bottle.formats', language)}</span>
                  <span className="text-[#D4AF37]">→</span>
                </button>
              )}

              <div className="flex flex-col items-center gap-3">
                <span className="text-lg uppercase tracking-[0.15em] italic" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4AF37' }}>
                  {effectiveWine.grapes}
                </span>

                {/* DESKTOP PRICE - Inline, Elegant, Metallic Gold */}
                {(selectedVintage?.price || effectiveWine.price) && (
                  <div className="order-1 hidden relative">
                    <div className="absolute -inset-4 bg-black/20 blur-xl rounded-full -z-10" />
                    <span className="relative font-serif text-3xl font-medium tracking-wide bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                      {(() => {
                        const rawPrice = selectedVintage ? selectedVintage.price : effectiveWine.price;
                        const p = rawPrice ? rawPrice.toString() : '';

                        // Special fix for "Verticale" concatenated prices (e.g. 1192014...) - if parsed price is suspiciously huge (>10000) and looks like concat years
                        // Or if effectiveWine.vintages exists, show range
                        if (effectiveWine.vintages && effectiveWine.vintages.length > 0 && !selectedVintage) {
                          const minP = Math.min(...effectiveWine.vintages.map(v => parseFloat((v.price || '0').replace(/[^0-9.]/g, '')) || 0));
                          const maxP = Math.max(...effectiveWine.vintages.map(v => parseFloat((v.price || '0').replace(/[^0-9.]/g, '')) || 0));
                          if (minP > 0) return `€${minP} - €${maxP}`;
                        }

                        // Relaxed regex to allow vintage ranges like "119 (2014); 125 (2013)"
                        // We allow numbers, dots, commas, parentheses, semicolons, dashes and spaces
                        return "€" + p.replace(/[^0-9.,();\-\s]/g, '').trim();
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Vintage Selector (Mobile + Desktop) */}
            {effectiveWine.vintages && effectiveWine.vintages.length > 0 && (
              <div className="flex gap-3 flex-wrap items-center justify-center py-2">
                {effectiveWine.vintages.map(v => (
                  <button
                    key={v.year}
                    onClick={() => setSelectedVintage(v)}
                    className={`
                      w-16 h-16 rounded-full flex flex-col items-center justify-center border-2 transition-all duration-300
                      ${selectedVintage?.year === v.year
                        ? 'bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] border-transparent text-stone-900 scale-110 shadow-[0_0_20px_rgba(212,175,55,0.4)]'
                        : 'bg-transparent border-stone-500 text-stone-400 hover:border-[#D4AF37] hover:text-[#D4AF37] active:scale-95'}
                    `}
                  >
                    <span className="text-xs font-serif font-bold leading-none italic">{v.year}</span>
                    <span className="text-[10px] font-serif opacity-70 whitespace-nowrap">€{v.price}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Technical Grid - Glassmorphism Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-stone-800/30 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] mb-2">
                  <Droplets size={14} /> <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t('wine.alcohol', language)}</span>
                </div>
                <p className="text-stone-200 text-xl font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{effectiveWine.alcohol}</p>
              </div>

              <div className="bg-stone-800/30 backdrop-blur-sm border border-[#D4AF37]/15 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[#D4AF37] mb-2">
                  <Thermometer size={14} /> <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t('wine.temperature', language)}</span>
                </div>
                <p className="text-stone-200 text-xl font-medium" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{effectiveWine.temperature}</p>
              </div>
            </div>

            {/* Accordion Buttons - Side by Side */}
            <div className="flex gap-3">
              {/* Sensory Profile Button */}
              {getTranslated(effectiveWine, 'sensoryProfile', language)?.length > 3 && (
                <div className={`flex-1 rounded-2xl overflow-hidden border transition-all duration-400 ${openAccordion === 'sensory'
                  ? 'border-[#D4AF37]/35 bg-stone-800/25'
                  : 'border-[#D4AF37]/20 bg-stone-800/15'
                  }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAccordion(prev => prev === 'sensory' ? null : 'sensory');
                    }}
                    className="group flex items-center justify-center w-full px-5 py-4 bg-transparent hover:bg-[#D4AF37]/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-900/60 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
                        <Activity size={16} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: '#D4AF37' }}>
                        {t('wine.sensory_profile', language)}
                      </span>
                    </div>
                  </button>
                </div>
              )}

              {/* Winery Pairings Button */}
              {getTranslated(effectiveWine, 'pairing', language)?.length > 3 && (
                <div className={`flex-1 rounded-2xl overflow-hidden border transition-all duration-400 ${openAccordion === 'pairing'
                  ? 'border-[#D4AF37]/35 bg-stone-800/25'
                  : 'border-[#D4AF37]/20 bg-stone-800/15'
                  }`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenAccordion(prev => prev === 'pairing' ? null : 'pairing');
                    }}
                    className="group flex items-center justify-center w-full px-5 py-4 bg-transparent hover:bg-[#D4AF37]/5 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-stone-900/60 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
                        <Utensils size={16} />
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif", color: '#D4AF37' }}>
                        {t('wine.pairing', language)}
                      </span>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Expanded Content - Full Width Below */}
            {openAccordion === 'sensory' && getTranslated(effectiveWine, 'sensoryProfile', language)?.length > 3 && (
              <div className={`rounded-2xl overflow-hidden border transition-all duration-400 border-[#D4AF37]/35 bg-stone-800/25 mt-3`}>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden max-h-[2000px] opacity-100`}>
                  <div className="px-5 pb-5 pt-3 space-y-3">
                    {(() => {
                      const profile = getTranslated(effectiveWine, 'sensoryProfile', language);
                      const coloreMatch = profile?.match(/Colore:\s*([\s\S]*?)(?=Profumo:|Naso:|Olfatto:|$)/i);
                      const profumoMatch = profile?.match(/(?:Profumo|Naso|Olfatto):\s*([\s\S]*?)(?=Gusto:|Bocca:|Palato:|$)/i);
                      const gustoMatch = profile?.match(/(?:Gusto|Bocca|Palato):\s*([\s\S]*)$/i);

                      if (coloreMatch && profumoMatch && gustoMatch) {
                        return (
                          <>
                            <div className="flex gap-0 items-baseline">
                              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] shrink-0" style={{ fontFamily: "'Montserrat', sans-serif", minWidth: '80px' }}>Colore:</span>
                              <span className="text-base text-stone-300 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{coloreMatch[1].trim()}</span>
                            </div>
                            <div className="flex gap-0 items-baseline">
                              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] shrink-0" style={{ fontFamily: "'Montserrat', sans-serif", minWidth: '80px' }}>Profumo:</span>
                              <span className="text-base text-stone-300 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{profumoMatch[1].trim()}</span>
                            </div>
                            <div className="flex gap-0 items-baseline">
                              <span className="text-[11px] font-bold text-[#D4AF37] uppercase tracking-[0.1em] shrink-0" style={{ fontFamily: "'Montserrat', sans-serif", minWidth: '80px' }}>Gusto:</span>
                              <span className="text-base text-stone-300 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{gustoMatch[1].trim().split(/\.\s*\n/)[0].trim()}{gustoMatch[1].trim().split(/\.\s*\n/)[0].trim().endsWith('.') ? '' : '.'}</span>
                            </div>
                          </>
                        );
                      }
                      return <p className="text-base text-stone-300 leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{profile}</p>;
                    })()}
                  </div>
                </div>
              </div>
            )}

            {openAccordion === 'pairing' && getTranslated(effectiveWine, 'pairing', language)?.length > 3 && (
              <div className={`rounded-2xl overflow-hidden border transition-all duration-400 border-[#D4AF37]/35 bg-stone-800/25 mt-3`}>
                <div className={`transition-all duration-500 ease-in-out overflow-hidden max-h-[600px] opacity-100`}>
                  <div className="px-5 pb-5 pt-3">
                    <p className="text-stone-300 text-base leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {getTranslated(effectiveWine, 'pairing', language)}
                    </p>
                  </div>
                </div>
              </div>
            )}



            {/* IANUA PAIRINGS - Full Width Below */}
            {effectiveWine.ianuaPairings && effectiveWine.ianuaPairings.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowIanuaPairings(!showIanuaPairings)}
                  className="group flex items-center justify-between w-full px-6 py-4 bg-gradient-to-r from-[#D4AF37]/10 to-transparent border border-[#D4AF37]/30 rounded-xl hover:from-[#D4AF37]/20 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-stone-800/80 border border-[#D4AF37]/50 flex items-center justify-center text-[#D4AF37] shadow-lg shadow-[#D4AF37]/10">
                      <Utensils size={18} strokeWidth={2.5} />
                    </div>
                    <div className="text-left">
                      <span className="block font-serif text-sm uppercase tracking-widest text-[#D4AF37] font-bold opacity-80">
                        {t('wine.ianua_recommends', language)}
                      </span>
                      <span className="block text-base text-stone-300 font-bold">
                        {effectiveWine.ianuaPairings.length} {t('wine.pairings_count', language)}
                      </span>
                    </div>
                  </div>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center border transition-transform duration-300 ${showIanuaPairings ? 'rotate-180 bg-stone-800/80 border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-black/20 border-[#D4AF37]/20 text-[#D4AF37]'}`}>
                    <ArrowUpRight size={16} />
                  </div>
                </button>

                {/* EXPANDABLE PAIRING LIST */}
                <div className={`transition-all duration-500 ease-in-out overflow-x-hidden ${showIanuaPairings ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-3 overflow-y-auto overflow-x-hidden max-h-[450px] scrollbar-thin scrollbar-thumb-[#D4AF37]/20 scrollbar-track-transparent">
                    {effectiveWine.ianuaPairings.map((pair, idx) => {
                      const dish = menu?.find(m => m.id === pair.dishId);
                      if (!dish) return null;

                      return (
                        <div key={idx} className="animate-in fade-in duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                          <div className="flex gap-2.5 items-center">
                            <div
                              className="w-12 h-12 rounded-lg bg-stone-800 overflow-hidden shrink-0 border border-white/10 cursor-pointer active:scale-95 transition-transform"
                              onClick={(e) => { e.stopPropagation(); if (dish.image) setZoomedDishImage({ src: dish.image, name: dish.name }); }}
                            >
                              {dish.image ? (
                                <img src={dish.image} alt={dish.name} className="w-full h-full object-contain" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-stone-600"><Utensils size={16} /></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-[#D4AF37] font-serif text-sm font-medium leading-snug">{dish.name}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs text-[#D4AF37]/60 uppercase tracking-wider">{dish.category} • {dish.price}€</p>
                                {pair.label && (
                                  <span className="text-[9px] px-1.5 py-px rounded-full uppercase tracking-wider font-bold bg-stone-800/80 border border-[#D4AF37]/50 text-[#D4AF37]">{pair.label}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {(pair.notes || pair.description) && (
                            <div className="mt-1 border-l-2 border-[#D4AF37]/30 pl-2.5 ml-1">
                              {pair.notes && pair.notes.length <= 30 && <p className="text-sm text-[#D4AF37]/80 font-serif font-semibold">{pair.notes}</p>}
                              {pair.notes && pair.notes.length > 30 && !pair.description && <p className="text-sm text-stone-300 leading-snug font-serif">{pair.notes}</p>}
                              {pair.description && pair.description !== pair.notes && <p className="text-sm text-stone-300 leading-snug font-serif">{pair.description}</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Ornamental Divider */}
            <div className="flex items-center justify-center gap-3 py-1">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/20" />
              <span className="text-[#D4AF37]/30 text-[10px]">✦</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/20" />
            </div>

            {/* Description */}
            <div className="relative">
              <p className="text-lg text-stone-200 leading-relaxed italic border-l-2 border-accent/30 pl-4 py-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {getTranslated(effectiveWine, 'description', language)}
              </p>
            </div>

            {/* Ornamental Divider */}
            <div className="flex items-center justify-center gap-3 py-1">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#D4AF37]/20" />
              <span className="text-[#D4AF37]/30 text-[10px]">✦</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#D4AF37]/20" />
            </div>

            {/* Curiosity Card - Premium Glassmorphism */}
            {getTranslated(effectiveWine, 'curiosity', language) && (
              <div className="bg-stone-800/20 backdrop-blur-sm border border-[#D4AF37]/15 p-5 rounded-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                  <WineIcon size={48} className="text-[#D4AF37]" />
                </div>
                <div className="flex items-center gap-2 text-[#D4AF37] mb-3">
                  <span className="text-sm">✦</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "'Montserrat', sans-serif" }}>{t('wine.curiosity', language)}</span>
                </div>
                <p className="text-stone-300 text-base leading-relaxed relative z-10 italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  {getTranslated(effectiveWine, 'curiosity', language)}
                </p>
              </div>
            )}

            {/* CTA */}
            {onGoToWinery && winery && (
              <button
                onClick={() => onGoToWinery(winery)}
                className="w-full py-3.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] text-[#D4AF37]/80 hover:text-[#D4AF37] rounded-full uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-2 hover:bg-[#D4AF37]/5 backdrop-blur-sm" style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {t('wine.discover_winery', language)} <ArrowUpRight size={14} />
              </button>
            )}

            <div className="h-4" /> {/* Minimal Spacer */}
          </div>
        </div>
      </div>

      {/* LIGHTBOX ZOOM OVERLAY */}
      {
        isZoomed && (
          <div
            className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            {/* Close Button - Top Right as requested */}
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-8 right-8 p-4 text-white/50 hover:text-white transition-colors z-[160]"
            >
              <X size={40} strokeWidth={1} />
            </button>

            <div className="absolute inset-0 opacity-60 bg-[url('/assets/golden_vines.png')] bg-cover bg-center pointer-events-none" />

            {/* ZOOM PRICE - Floating Bottom Left - Metallic Gold */}
            {(selectedVintage?.price || effectiveWine.price) && (
              <div className="absolute bottom-8 right-4 z-[160] animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                <div className="bg-stone-800/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D4AF37]/50 flex items-center justify-center">
                  <span className="font-serif text-3xl font-medium tracking-wide bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,1)]">
                    €{(selectedVintage ? selectedVintage.price : effectiveWine.price || '').toString().replace(/[^0-9.,();\-\s]/g, '').trim()}
                  </span>
                </div>
              </div>
            )}

            {/* DYNAMIC WIREFRAME WINE GLASS - Floating Bottom Left */}
            <div className="absolute bottom-8 left-4 z-[155] animate-in fade-in zoom-in-50 duration-1000 delay-500 hidden pointer-events-none">

            </div>

            <img
              src={getSafeImage(effectiveWine.image)}
              alt={effectiveWine.name}
              className="h-[85vh] w-auto object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-90 duration-500"
              onClick={(e) => e.stopPropagation()} // Optional: Prevent closing when clicking the image itself? No, user said "clicco sulla bottiglia" often implies interaction, but usually lightbox closes on bg. User said "chiusura click ovunque in alto a sinistra" (then corrected to right). "Click ovunque" usually implies background. Let's start with FULL close on click anywhere.
            />
          </div>
        )
      }

      {/* BOTTLE SIZE GUIDE MODAL */}
      {
        isBottleGuideOpen && (
          <BottleSizeModal
            language={language}
            onClose={() => setIsBottleGuideOpen(false)}
            wineImage={getSafeImage(effectiveWine.image)}
            availableFormats={{
              mezza: isSmallBottle(effectiveWine.name) || (relatedWines && relatedWines.some(w => isSmallBottle(w.name))),
              standard: (!isSmallBottle(effectiveWine.name) && !isMagnumBottle(effectiveWine.name)) || (relatedWines && relatedWines.some(w => !isSmallBottle(w.name) && !isMagnumBottle(w.name))),
              magnum: isMagnumBottle(effectiveWine.name) || (relatedWines && relatedWines.some(w => isMagnumBottle(w.name)))
            }}
          />
        )
      }

      {/* FULLSCREEN DISH PHOTO ZOOM */}
      {zoomedDishImage && (
        <div
          className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 cursor-pointer"
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
          <p className="text-white/40 text-xs uppercase tracking-[0.3em] mt-2 font-bold">
            {t('wine.tap_to_close', language)}
          </p>
        </div>
      )}
    </div >
  );
};
