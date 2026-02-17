
import React, { useEffect, useState } from 'react';
import { Winery, Wine } from '../types';
import { X, MapPin, Globe, ChevronRight, Lightbulb, Info, MoveRight, ArrowUpRight, Store, Grape } from 'lucide-react';
import { t, Language } from '../translations';
import { getAltitude } from '../constants';
import { getSafeImage } from '../utils/imageUtils';

// Helper to get translated field
const getTranslated = (obj: any, field: string, lang: Language): string => {
  if (lang === 'en' && obj[`${field}_en`]) return obj[`${field}_en`];
  if (lang === 'fr' && obj[`${field}_fr`]) return obj[`${field}_fr`];
  return obj[field] || '';
};

const TRUNCATE_LENGTH = 200;

const ExpandableDescription: React.FC<{ text: string; language: Language }> = ({ text, language }) => {
  const [expanded, setExpanded] = useState(false);
  const needsTruncation = text.length > TRUNCATE_LENGTH;
  const displayText = !expanded && needsTruncation
    ? text.slice(0, TRUNCATE_LENGTH).replace(/\s+\S*$/, '') + '…'
    : text;

  return (
    <div>
      <p className="font-serif text-[15px] leading-[1.8] text-stone-300 italic">
        {displayText}
      </p>
      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-accent/80 hover:text-accent text-xs font-sans uppercase tracking-[0.2em] transition-colors duration-300"
        >
          {expanded
            ? (language === 'en' ? '— Read less' : language === 'fr' ? '— Lire moins' : '— Chiudi')
            : (language === 'en' ? '+ Read more' : language === 'fr' ? '+ Lire plus' : '+ Leggi di più')}
        </button>
      )}
    </div>
  );
};

export const WineryDetailModal: React.FC<{
  winery: Winery;
  wines: Wine[];
  language: Language;
  onClose: () => void;
  onSelectWine: (wine: Wine) => void;
  allWineries?: Winery[];
  onSelectWinery?: (winery: Winery) => void;
}> = ({ winery, wines, language, onClose, onSelectWine, allWineries, onSelectWinery }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-in fade-in duration-700 transition-colors duration-500">

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[70] p-3 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-white transition-all border border-white/10"
      >
        <X size={22} />
      </button>

      <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar">

        {/* ═══════ HERO SECTION ═══════ */}
        <div className="relative w-full h-[55vh] flex items-end overflow-hidden">
          <div className={`absolute inset-0 transition-transform duration-[20s] ease-linear ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <img
              src={winery.image}
              alt={winery.name}
              className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.1]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />

          {/* Title content - pinned to bottom */}
          <div className="relative z-10 w-full px-5 pb-8">
            <div className={`transition-all duration-1000 delay-300 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[#D4AF37] font-sans text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                <MapPin size={11} /> {winery.location}
              </span>
            </div>

            <h1 className={`text-3xl font-serif text-white uppercase tracking-tight leading-[0.95] transition-all duration-1000 delay-500 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {winery.name}
            </h1>

            <div className={`w-16 h-[2px] bg-[#D4AF37] mt-4 transition-all duration-1000 delay-700 transform ${isAnimating ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
          </div>
        </div>

        {/* ═══════ CONTENT - Full width on mobile ═══════ */}
        <div className="relative bg-stone-950">

          {/* Background accents */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-[-20%] w-[60%] h-[40%] bg-[#D4AF37]/3 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-[-20%] w-[50%] h-[40%] bg-[#800020]/5 blur-[120px] rounded-full" />
          </div>

          {/* ─── STORIA & TERRITORIO ─── */}
          <div className="relative px-5 py-8 max-w-5xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-10 h-[1px] bg-[#D4AF37]" />
              <h2 className="text-[#D4AF37] font-sans text-[11px] font-bold uppercase tracking-[0.3em]">{t('wineries.story_territory', language)}</h2>
            </div>

            <ExpandableDescription text={getTranslated(winery, 'description', language)} language={language} />

            {/* Curiosity */}
            {(winery.curiosity || (winery as any).curiosity_en || (winery as any).curiosity_fr) && (
              <div className="mt-8 bg-stone-900/60 border border-[#D4AF37]/15 p-5 rounded-2xl flex gap-4 items-start">
                <div className="p-2.5 bg-[#D4AF37]/10 rounded-full text-[#D4AF37] flex-shrink-0">
                  <Lightbulb size={20} />
                </div>
                <div>
                  <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] mb-2">{t('wineries.curiosity', language)}</h4>
                  <p className="font-serif text-stone-300 italic text-[15px] leading-[1.7]">
                    {getTranslated(winery, 'curiosity', language)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="px-5 max-w-5xl">
            <div className="h-[1px] bg-white/5" />
          </div>

          {/* ─── VINI IN CARTA ─── */}
          <div className="relative px-5 py-8 max-w-5xl">
            <div className="mb-6">
              <h3 className="text-2xl font-serif text-white uppercase tracking-wider mb-1">{t('wineries.in_menu', language)}</h3>
              <p className="text-stone-500 font-sans text-[11px] uppercase tracking-[0.2em]">{wines.filter(w => !w.hidden).length} Etichette Selezionate</p>
            </div>

            {wines.filter(w => !w.hidden).length > 0 ? (
              <div className="space-y-3">
                {wines.filter(w => !w.hidden).map(wine => (
                  <div
                    key={wine.id}
                    onClick={() => onSelectWine(wine)}
                    className="group flex items-center gap-4 bg-stone-900/50 hover:bg-stone-900 border border-white/5 hover:border-[#D4AF37]/30 rounded-xl p-3 cursor-pointer transition-all duration-300"
                  >
                    {/* Bottle */}
                    <div className="h-20 w-10 flex-shrink-0 flex items-center justify-center">
                      <img
                        src={getSafeImage(wine.image)}
                        alt={wine.name}
                        className={`w-auto object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110
                          ${wine.id.includes('muscat') ? 'rotate-[-45deg] scale-[1.3] h-full' :
                            (wine.name.toLowerCase().includes('1.5') || wine.name.toLowerCase().includes('magnum')) ? 'h-full rotate-[-10deg]' :
                              (wine.name.toLowerCase().includes('375') || wine.name.toLowerCase().includes('mezza') || wine.name.toLowerCase().includes('0.375')) ? 'h-[55%] rotate-[-10deg]' :
                                'h-[80%] rotate-[-10deg]'
                          }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-[14px] font-bold text-white group-hover:text-[#D4AF37] transition-colors leading-snug uppercase line-clamp-2 mb-0.5" title={wine.name}>
                        {wine.name}
                      </h4>
                      <p className="text-[10px] text-stone-500 font-bold uppercase tracking-widest line-clamp-1">{wine.grapes}</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 text-stone-600 group-hover:text-[#D4AF37] transition-colors">
                      <ChevronRight size={18} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-white/10 rounded-2xl">
                <p className="font-serif italic text-stone-500">{t('wineries.no_wines', language)}</p>
              </div>
            )}
          </div>

          {/* ─── FOOTER ─── */}
          <div className="px-5 py-10 flex justify-center">
            <a
              href={winery.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
            >
              <div className="absolute inset-0 w-full h-full bg-[#D4AF37] transition-all duration-300 group-hover:scale-105" />
              <div className="absolute inset-0 w-full h-full bg-black/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-3 text-stone-900 font-bold text-xs uppercase tracking-[0.3em]">
                <Globe size={16} /> {t('wineries.official_site', language)}
              </span>
            </a>
          </div>

        </div>
      </div>
    </div>
  );
};
