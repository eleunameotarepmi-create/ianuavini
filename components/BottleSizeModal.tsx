
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wine as WineIcon, X } from 'lucide-react';
import { t, Language } from '../translations';

interface BottleSizeModalProps {
    language: Language;
    onClose: () => void;
    wineImage?: string; // Optional: use the actual wine image if available
    availableFormats?: {
        mezza: boolean;
        standard: boolean;
        magnum: boolean;
    };
}

export const BottleSizeModal: React.FC<BottleSizeModalProps> = ({ language, onClose, wineImage, availableFormats = { mezza: true, standard: true, magnum: true } }) => {

    // Fallback if no image is provided (should theoretically not happen if called from wine detail)
    // But we can use a generic silhouette or placeholder
    const renderBottle = (heightPx: number, label: string) => {
        if (wineImage) {
            return (
                <div style={{ height: `${heightPx}px` }} className="relative flex items-end justify-center transition-transform duration-500 hover:scale-105">
                    <img
                        src={wineImage}
                        alt={label}
                        className="h-full w-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
                    />
                </div>
            );
        }
        // Fallback placeholder
        return (
            <div style={{ height: `${heightPx}px`, width: `${heightPx * 0.3}px` }} className="bg-stone-800 rounded-t-full rounded-b-lg border border-white/10" />
        );
    };

    // Count how many formats are available to adjust layout
    const activeFormats = [availableFormats.mezza, availableFormats.standard, availableFormats.magnum].filter(Boolean).length;
    const isSingleFormat = activeFormats === 1;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500"
                onClick={onClose}
            >
                {/* Modal Card */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-6xl max-h-[90vh] bg-[#0c0c0c] border border-[#D4AF37]/20 rounded-[2rem] shadow-2xl overflow-y-auto flex flex-col md:flex-row shadow-black/80"
                    onClick={(e) => e.stopPropagation()}
                >

                    {/* Close Button - FIXED so it is always visible even if scrolled */}
                    <button
                        onClick={onClose}
                        className="fixed top-6 right-6 z-[60] p-3 text-stone-400 hover:text-white transition-colors rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/10"
                    >
                        <X size={24} />
                    </button>

                    {/* Left Side: Title & Intro */}
                    <div className={`${isSingleFormat ? 'w-full md:w-1/3' : 'w-full md:w-1/4'} bg-[#121212] p-8 flex flex-col justify-center border-b md:border-b-0 md:border-r border-[#D4AF37]/10 relative transition-all duration-500`}>
                        <h2 className="text-3xl font-serif text-white uppercase tracking-widest mb-6 leading-tight">
                            <span className="text-[#D4AF37] block text-xs font-sans font-bold tracking-[0.4em] mb-3">{t('bottle.guide_title', language)}</span>
                            L'Importanza<br />del Formato
                        </h2>
                        <p className="text-stone-400 font-serif italic leading-relaxed text-sm">
                            Il formato influenza l'evoluzione. Le bottiglie più grandi invecchiano più lentamente e con maggiore eleganza rispetto a quelle standard o piccole, grazie al rapporto tra volume di liquido e ossigeno.
                        </p>
                    </div>

                    {/* Right Side: Visual Comparison using REAL IMAGES */}
                    <div className={`${isSingleFormat ? 'w-full md:w-2/3' : 'w-full md:w-3/4'} p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-[#1c1917] to-black relative transition-all duration-500`}>
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none" />

                        <div className={`flex justify-center items-end ${isSingleFormat ? 'gap-0' : 'gap-8 md:gap-16'} w-full h-auto min-h-[400px] pb-12 text-center relative z-10 transition-all duration-500`}>

                            {/* MEZZA (0.375L) */}
                            {availableFormats.mezza && (
                                <div className={`flex flex-col items-center justify-end h-full gap-6 ${isSingleFormat ? 'w-full' : 'w-1/3'} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100`}>
                                    {renderBottle(isSingleFormat ? 250 : 130, 'Mezza')}
                                    <div className="space-y-2">
                                        <h3 className={`text-white font-serif tracking-widest ${isSingleFormat ? 'text-4xl mb-2' : 'text-xl'}`}>{t('bottle.mezza_volume', language)}</h3>
                                        <p className="text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.2em]">{t('bottle.mezza_title', language)}</p>
                                        <p className={`text-stone-400 mx-auto leading-tight mt-2 ${isSingleFormat ? 'text-sm max-w-sm' : 'text-[10px] max-w-[150px] hidden md:block'}`}>{t('bottle.mezza_desc', language)}</p>
                                    </div>
                                </div>
                            )}

                            {/* STANDARD (0.75L) */}
                            {availableFormats.standard && (
                                <div className={`flex flex-col items-center justify-end h-full gap-6 ${isSingleFormat ? 'w-full' : 'w-1/3'} animate-in fade-in slide-in-in-from-bottom-4 duration-700 delay-200`}>
                                    {renderBottle(isSingleFormat ? 300 : 190, 'Standard')}
                                    <div className="space-y-2">
                                        <h3 className={`text-white font-serif tracking-widest font-bold ${isSingleFormat ? 'text-5xl mb-2' : 'text-3xl'}`}>{t('bottle.standard_volume', language)}</h3>
                                        <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">{t('bottle.standard_title', language)}</p>
                                        <p className={`text-stone-400 mx-auto leading-tight mt-2 ${isSingleFormat ? 'text-sm max-w-md' : 'text-[10px] max-w-[180px] hidden md:block'}`}>{t('bottle.standard_desc', language)}</p>
                                    </div>
                                </div>
                            )}

                            {/* MAGNUM (1.5L) */}
                            {availableFormats.magnum && (
                                <div className={`flex flex-col items-center justify-end h-full gap-6 ${isSingleFormat ? 'w-full' : 'w-1/3'} animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300`}>
                                    {renderBottle(isSingleFormat ? 340 : 260, 'Magnum')}
                                    <div className="space-y-2">
                                        <h3 className={`text-white font-serif tracking-widest ${isSingleFormat ? 'text-6xl mb-2' : 'text-4xl'}`}>{t('bottle.magnum_volume', language)}</h3>
                                        <p className="text-[#D4AF37] text-xs font-bold uppercase tracking-[0.2em]">{t('bottle.magnum_title', language)}</p>
                                        <p className={`text-stone-400 mx-auto leading-tight mt-2 ${isSingleFormat ? 'text-base max-w-lg italic font-serif' : 'text-[10px] max-w-[200px] hidden md:block'}`}>
                                            {isSingleFormat
                                                ? "Il formato regale per eccellenza. La massa maggiore garantisce una temperatura più stabile e un rapporto ossigeno/vino ridotto, favorendo un invecchiamento lento e nobile che esalta la complessità aromatica nel tempo."
                                                : t('bottle.magnum_desc', language)
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
