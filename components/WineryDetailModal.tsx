
import React, { useEffect, useState } from 'react';
import { Winery, Wine } from '../types';
import { X, MapPin, Globe, ChevronRight, Lightbulb, Info, MoveRight, ArrowUpRight } from 'lucide-react';
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
    <div className="max-w-none">
      <p className="font-serif text-base md:text-lg leading-relaxed text-stone-300 italic">
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
}> = ({ winery, wines, language, onClose, onSelectWine }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 bg-background animate-in fade-in duration-700 transition-colors duration-500">

      {/* GLOBAL BACKGROUND AMBIENCE */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-[#D4AF37]/5 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-[#800020]/10 blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.04] mix-blend-overlay" />
      </div>

      <button
        onClick={onClose}
        className="fixed top-6 right-6 z-50 p-3 bg-surface/20 backdrop-blur-md rounded-full text-primary/70 hover:text-primary hover:bg-surface/40 transition-all border border-border"
      >
        <X size={24} />
      </button>

      <div className="w-full h-full overflow-y-auto overflow-x-hidden no-scrollbar relative">

        {/* HERO SECTION */}
        <div className="relative w-full h-[65vh] flex items-center justify-center overflow-hidden">
          <div className={`absolute inset-0 transition-transform duration-[20s] ease-linear ${isAnimating ? 'scale-110' : 'scale-100'}`}>
            <img
              src={winery.image}
              alt={winery.name}
              className="w-full h-full object-cover filter brightness-[0.7] contrast-[1.1]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/60 to-transparent" />
          <div className="absolute inset-0 bg-black/20" /> {/* Dimmer */}

          {/* TITLE OVERLAY */}
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-6">
            <div className={`transition-all duration-1000 delay-300 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface/10 backdrop-blur-md border border-border text-accent font-sans text-[10px] font-bold uppercase tracking-[0.3em]">
                <MapPin size={12} /> {winery.location}
              </span>
            </div>

            <h1 className={`text-5xl md:text-7xl lg:text-8xl font-serif text-white uppercase tracking-tight leading-none shadow-black drop-shadow-2xl transition-all duration-1000 delay-500 transform ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              {winery.name}
            </h1>

            <div className={`w-24 h-1 bg-accent mx-auto transition-all duration-1000 delay-700 transform ${isAnimating ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}`} />
          </div>
        </div>

        {/* CONTENT CONTAINER */}
        <div className="relative z-10 -mt-24 px-4 md:px-12 pb-24 max-w-7xl mx-auto">
          <div className="bg-surface/90 backdrop-blur-xl border border-white/5 rounded-[3rem] p-8 md:p-16 shadow-2xl relative overflow-hidden transition-colors duration-500">

            {/* Watermark Logo */}
            <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none mix-blend-overlay">
              <img src={winery.image} className="w-96 h-96 object-cover rounded-full grayscale" alt="" />
            </div>

            {/* GOLDEN VINES — Clean, full height */}
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-[url('/assets/golden_vines.png')] bg-contain bg-no-repeat opacity-10 mix-blend-screen pointer-events-none scale-x-[-1]" />
            <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[url('/assets/golden_vines.png')] bg-contain bg-no-repeat bg-bottom-right opacity-15 mix-blend-screen pointer-events-none" />

            {/* STORY SECTION */}
            <div className="max-w-4xl mx-auto mb-20">
              <div className="relative bg-stone-950/80 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-[#D4AF37]/10 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <span className="w-12 h-[1px] bg-accent" />
                  <h2 className="text-accent font-sans text-xs font-bold uppercase tracking-[0.4em]">{t('wineries.story_territory', language)}</h2>
                </div>

                <ExpandableDescription text={getTranslated(winery, 'description', language)} language={language} />

                {/* CURIOSITY CARD */}
                {(winery.curiosity || (winery as any).curiosity_en || (winery as any).curiosity_fr) && (
                  <div className="mt-10 relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl blur-xl" />
                    <div className="relative bg-stone-900/70 border border-accent/20 p-6 md:p-8 rounded-2xl flex gap-5 items-start">
                      <div className="p-3 bg-accent/10 rounded-full text-accent flex-shrink-0">
                        <Lightbulb size={24} />
                      </div>
                      <div>
                        <h4 className="font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-accent mb-3">{t('wineries.curiosity', language)}</h4>
                        <p className="font-serif text-stone-300 italic text-base md:text-lg leading-relaxed">
                          {getTranslated(winery, 'curiosity', language)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* WINES COLLECTION */}
            <div className="relative bg-stone-950/80 backdrop-blur-md rounded-2xl p-6 md:p-10 border border-[#D4AF37]/10 shadow-2xl">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h3 className="text-3xl md:text-4xl font-serif text-primary uppercase tracking-widest mb-2">{t('wineries.in_menu', language)}</h3>
                  <p className="text-stone-400 font-sans text-xs uppercase tracking-[0.2em]">{wines.filter(w => !w.hidden).length} Etichette Selezionate</p>
                </div>

              </div>

              {wines.filter(w => !w.hidden).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {wines.filter(w => !w.hidden).map(wine => (
                    <div
                      key={wine.id}
                      onClick={() => onSelectWine(wine)}
                      className="group relative bg-surface border border-border hover:border-accent/50 rounded-xl p-4 cursor-pointer transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex items-center gap-4 h-full"
                    >
                      {/* Bottle Image */}
                      <div className="h-28 w-12 flex-shrink-0 flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img
                          src={getSafeImage(wine.image)}
                          alt={wine.name}
                          className={`w-auto object-contain drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110 
                            ${wine.id.includes('muscat') ? 'rotate-[-45deg] scale-[1.4] h-full' :
                              (wine.name.toLowerCase().includes('1.5') || wine.name.toLowerCase().includes('magnum')) ? 'h-full rotate-[-12deg]' :
                                (wine.name.toLowerCase().includes('375') || wine.name.toLowerCase().includes('mezza') || wine.name.toLowerCase().includes('0.375')) ? 'h-[60%] rotate-[-12deg]' :
                                  'h-[85%] rotate-[-12deg]'
                            }`}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center h-full py-1">
                        <h4 className="font-serif text-sm md:text-[15px] font-bold text-primary group-hover:text-accent transition-colors leading-[1.1] uppercase line-clamp-3 mb-1" title={wine.name}>
                          {wine.name}
                        </h4>
                        <p className="text-[9px] text-secondary font-bold uppercase tracking-widest mb-2 line-clamp-1">{wine.grapes}</p>
                        <div className="flex items-center gap-2 text-secondary group-hover:text-primary transition-colors text-[10px] mt-auto">
                          <span className="uppercase tracking-wider">Scopri</span> <ArrowUpRight size={10} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                  <p className="font-serif italic text-stone-500">{t('wineries.no_wines', language)}</p>
                </div>
              )}
            </div>

            {/* FOOTER ACTIONS */}
            <div className="mt-20 flex justify-center">
              <a
                href={winery.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-full"
              >
                <div className="absolute inset-0 w-full h-full bg-accent transition-all duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 w-full h-full bg-surface/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center gap-3 text-stone-900 font-bold text-xs uppercase tracking-[0.3em]">
                  <Globe size={16} /> {t('wineries.official_site', language)}
                </span>
              </a>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
