
import React from 'react';
import { Winery, Wine } from '../types';
import { X, MapPin, Globe, ChevronRight, Lightbulb, Info } from 'lucide-react';
import { t, Language } from '../translations';

// Helper to get translated field
const getTranslated = (obj: any, field: string, lang: Language): string => {
  if (lang === 'en' && obj[`${field}_en`]) return obj[`${field}_en`];
  if (lang === 'fr' && obj[`${field}_fr`]) return obj[`${field}_fr`];
  return obj[field] || '';
};


export const WineryDetailModal: React.FC<{
  winery: Winery;
  wines: Wine[];
  language: Language;
  onClose: () => void;
  onSelectWine: (wine: Wine) => void;
}> = ({ winery, wines, language, onClose, onSelectWine }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[#1c1917]/80 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-[#fdfcf9] rounded-t-[3rem] sm:rounded-none overflow-hidden max-h-[95vh] flex flex-col animate-in slide-in-from-bottom duration-500 border-t-4 sm:border-b-4 sm:border-x-4 border-[#D4AF37] shadow-2xl no-scrollbar">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 bg-white/50 backdrop-blur-md rounded-full text-stone-800 hover:bg-stone-800 hover:text-[#D4AF37] transition-all shadow-lg"
        >
          <X size={24} />
        </button>

        <div className="relative h-64 sm:h-80 w-full overflow-hidden flex-shrink-0">
          <img src={winery.image} alt={winery.name} className="w-full h-full object-cover brightness-95" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdfcf9] via-transparent to-black/10" />
          <div className="absolute bottom-6 left-8 right-8">
            <h2 className="text-4xl sm:text-5xl font-serif text-stone-800 font-bold uppercase tracking-wider drop-shadow-sm">{winery.name}</h2>
            <div className="flex items-center gap-2 text-[#D4AF37] mt-2">
              <MapPin size={16} />
              <span className="font-sans text-[11px] font-bold uppercase tracking-[0.2em]">{winery.location}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-12 no-scrollbar">
          <section className="space-y-4">
            <div className="flex items-center gap-4">
              <Info className="text-[#D4AF37]" size={16} />
              <h3 className="font-serif text-[10px] font-bold text-stone-800 uppercase tracking-[0.4em] border-b border-[#D4AF37]/20 pb-2 flex-1">{t('wineries.story_territory', language)}</h3>
            </div>
            <p className="text-stone-700 font-serif leading-relaxed text-xl italic px-4 border-l-2 border-[#D4AF37]/30">"{getTranslated(winery, 'description', language)}"</p>
          </section>

          {(winery.curiosity || (winery as any).curiosity_en || (winery as any).curiosity_fr) && (
            <section className="bg-amber-50/50 p-8 rounded-[2.5rem] border border-[#D4AF37]/10 relative overflow-hidden">
              <Lightbulb className="absolute -top-4 -right-4 text-[#D4AF37]/10 scale-[3]" size={64} />
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Lightbulb size={18} />
                  <h4 className="font-serif text-[9px] font-bold uppercase tracking-[0.4em]">{t('wineries.curiosity', language)}</h4>
                </div>
                <p className="text-stone-700 font-serif italic text-lg leading-relaxed">{getTranslated(winery, 'curiosity', language)}</p>
              </div>
            </section>
          )}

          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-[10px] font-bold text-stone-800 uppercase tracking-[0.4em]">{t('wineries.in_menu', language)}</h3>
              <div className="h-[1px] flex-1 bg-[#D4AF37]/20 ml-6" />
            </div>

            <div className="grid gap-6">
              {wines.filter(w => !w.hidden).length > 0 ? wines.filter(w => !w.hidden).map(wine => (
                <div
                  key={wine.id}
                  onClick={() => onSelectWine(wine)}
                  className="group flex items-center gap-4 sm:gap-6 p-4 sm:p-5 bg-white border border-stone-50 hover:border-[#D4AF37]/40 transition-all cursor-pointer shadow-sm rounded-2xl overflow-hidden"
                >
                  <div className="w-16 sm:w-24 h-24 sm:h-32 flex items-center justify-center rounded-xl flex-shrink-0 overflow-visible">
                    <img
                      src={wine.image}
                      className={`max-h-[120px] w-auto object-contain transition-transform duration-500 group-hover:scale-110 ${wine.id.includes('muscat') ? 'rotate-[-90deg] scale-[2.2]' : 'scale-[1.1]'}`}
                      alt={wine.name}
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-serif text-base sm:text-xl font-bold text-[#800020] group-hover:text-[#D4AF37] transition-colors leading-tight uppercase line-clamp-2">{wine.name}</h4>
                    <p className="font-sans text-[9px] text-stone-400 font-bold uppercase tracking-widest mt-1">{wine.grapes}</p>
                    <p className="text-xs text-stone-500 font-serif italic mt-2 line-clamp-2">"{getTranslated(wine, 'description', language)}"</p>
                  </div>
                  <ChevronRight size={20} className="text-stone-200 group-hover:text-[#D4AF37] transition-colors" />
                </div>
              )) : (
                <p className="font-serif italic text-stone-400 text-center py-10">{t('wineries.no_wines', language)}</p>
              )}
            </div>
          </section>

          <div className="pt-6 pb-12">
            <a
              href={winery.website}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-4 py-5 bg-[#1c1917] text-[#D4AF37] font-sans text-[11px] font-bold uppercase tracking-[0.4em] shadow-2xl hover:bg-black transition-all group rounded-2xl"
            >
              <Globe size={20} className="group-hover:rotate-45 transition-transform duration-500" />
              {t('wineries.official_site', language)}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
