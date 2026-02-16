
import React, { useState, useEffect } from 'react';
import { Wine, Winery } from '../types';
import { X, Droplets, Thermometer, Utensils, Grape, ArrowUpRight } from 'lucide-react';
import { t, Language } from '../translations';

// Helper to get translated field
const getTranslated = (obj: any, field: string, lang: Language): string => {
  if (lang === 'en' && obj[`${field}_en`]) return obj[`${field}_en`];
  if (lang === 'fr' && obj[`${field}_fr`]) return obj[`${field}_fr`];
  return obj[field] || '';
};


interface WineDetailModalProps {
  wine: Wine;
  winery: Winery | undefined;
  language: Language;
  onClose: () => void;
  onGoToWinery?: (winery: Winery) => void;
}

export const WineDetailModal: React.FC<WineDetailModalProps> = ({ wine, winery, language, onClose, onGoToWinery }) => {
  const [selectedVintage, setSelectedVintage] = useState<{ year: string; price: string } | null>(null);

  useEffect(() => {
    if (wine.vintages && wine.vintages.length > 0) {
      setSelectedVintage(wine.vintages[0]);
    } else {
      setSelectedVintage(null);
    }
  }, [wine]);

  const getRotationStyle = () => {
    const name = wine.name.toLowerCase();
    const id = wine.id.toLowerCase();

    // Moscato di Chambave (La Crotta) - Bottiglia che richiede rotazione e scala specifica
    if (id.includes('muscat')) {
      return {
        transform: 'rotate(-90deg) scale(1.8) translateY(10%)',
        filter: 'drop-shadow(30px 0px 45px rgba(0,0,0,0.2))'
      };
    }

    // Syrah e Fumin (La Crotta) - Bottiglie borgognone
    if (id.includes('syrah') || id.includes('fumin')) {
      return {
        transform: 'scale(1.3) translateY(5%)',
        filter: 'drop-shadow(0px 20px 40px rgba(0,0,0,0.18))'
      };
    }

    // Boen e Donnas (Bordolesi/Albe)
    return {
      transform: 'scale(1.15)',
      filter: 'drop-shadow(0px 15px 35px rgba(0,0,0,0.18))'
    };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-4 bg-stone-900/90 backdrop-blur-xl overflow-hidden">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white sm:rounded-[3rem] shadow-2xl flex flex-col max-h-screen sm:max-h-[96vh] overflow-hidden animate-in slide-in-from-bottom duration-500 border-t sm:border border-[#D4AF37]">

        {/* Header con bottiglia */}
        <div className="relative h-80 sm:h-96 w-full bg-[#fdfcf9] flex-shrink-0 flex items-center justify-center overflow-visible">
          <button onClick={onClose} className="absolute top-6 right-6 z-50 p-3 bg-white/95 rounded-full text-stone-800 shadow-xl border border-amber-50 hover:bg-stone-800 hover:text-[#D4AF37] transition-all">
            <X size={20} />
          </button>

          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/5" />

          <div className="relative z-10 flex items-center justify-center h-full w-full overflow-visible p-8">
            <img
              src={wine.image}
              alt={wine.name}
              style={getRotationStyle()}
              className="h-full max-h-[260px] sm:max-h-[320px] object-contain transition-all duration-1000"
            />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/95 to-transparent z-20 text-center">
            <p className="font-sans text-[7px] uppercase font-bold text-[#D4AF37] tracking-[0.5em] mb-1">{winery?.name}</p>
            <h2 className="text-2xl sm:text-3xl font-serif text-[#800020] font-bold uppercase tracking-widest px-6 leading-tight drop-shadow-sm">{wine.name}</h2>

            {/* Vintage Selector */}
            {wine.vintages && wine.vintages.length > 0 && (
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {wine.vintages.map(v => (
                  <button
                    key={v.year}
                    onClick={(e) => { e.stopPropagation(); setSelectedVintage(v); }}
                    className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${selectedVintage?.year === v.year ? 'bg-[#800020] border-[#800020] text-white shadow-md scale-105' : 'bg-white border-stone-200 text-stone-400 hover:border-[#800020] hover:text-[#800020]'}`}
                  >
                    {v.year}
                  </button>
                ))}
              </div>
            )}

            {(selectedVintage?.price || wine.price) && (
              <div className="mt-4">
                <span className="font-serif text-xl sm:text-2xl text-[#800020] font-bold border-b border-[#D4AF37] pb-1">€ {selectedVintage ? selectedVintage.price : wine.price}</span>
              </div>
            )}
          </div>
        </div>

        {/* Dettagli */}
        <div className="flex-1 overflow-y-auto px-8 py-8 space-y-12 bg-white no-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Grape, label: t('wine.grapes', language), val: wine.grapes },
              { icon: Droplets, label: t('wine.alcohol', language), val: wine.alcohol },
              { icon: Utensils, label: t('wine.pairing', language), val: getTranslated(wine, 'pairing', language) },
              { icon: Thermometer, label: t('wine.serving', language), val: wine.temperature }
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 bg-[#fdfcf6] border border-amber-50 rounded-2xl shadow-sm hover:border-[#D4AF37]/30 transition-colors">
                <item.icon className="text-[#D4AF37]" size={18} />
                <div className="flex-1 min-w-0">
                  <p className="font-sans text-[7px] uppercase text-stone-400 font-bold tracking-[0.1em]">{item.label}</p>
                  <p className="font-serif text-[11px] font-bold text-[#800020] leading-tight">{item.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="font-serif text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] text-nowrap">{t('wine.sensory_profile', language)}</h3>
              <div className="flex-1 h-[1px] bg-amber-100/30" />
            </div>
            <p className="text-stone-700 font-serif leading-relaxed text-xl italic px-4 border-l-2 border-[#D4AF37]/30">"{getTranslated(wine, 'description', language)}"</p>
          </div>

          {/* Curiosity Section - only shows if wine has curiosity */}
          {getTranslated(wine, 'curiosity', language) && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <h3 className="font-serif text-[9px] font-bold text-[#D4AF37] uppercase tracking-[0.5em] text-nowrap">✦ {t('wine.curiosity', language)}</h3>
                <div className="flex-1 h-[1px] bg-amber-100/30" />
              </div>
              <p className="text-stone-600 font-serif leading-relaxed text-base italic px-4 border-l-2 border-[#D4AF37]/20 bg-amber-50/30 py-3 rounded-r-lg">
                {getTranslated(wine, 'curiosity', language)}
              </p>
            </div>
          )}

          <div className="pt-4 pb-12 space-y-6">
            <div className="bg-[#fdfcf9] border border-amber-50 p-12 flex items-center justify-center rounded-[3.5rem] shadow-inner relative group overflow-visible min-h-[440px]">
              <img
                src={wine.image}
                alt={`${wine.name} - Studio`}
                style={getRotationStyle()}
                className="h-full max-h-[360px] w-auto object-contain transition-transform duration-1000 group-hover:scale-[1.05]"
              />
              <div className="absolute top-10 left-10">
                <p className="font-sans text-[6px] uppercase font-bold text-stone-300 tracking-[0.9em] vertical-text">IANUA EXCLUSIVE SELECTION</p>
              </div>
            </div>

            {/* Go to Winery Button */}
            {onGoToWinery && winery && (
              <button
                onClick={() => onGoToWinery(winery)}
                className="w-full py-4 bg-stone-900 text-[#D4AF37] rounded-2xl font-serif text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-3 hover:bg-[#D4AF37] hover:text-white transition-all shadow-xl group"
              >
                {t('wine.discover_winery', language)} <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
