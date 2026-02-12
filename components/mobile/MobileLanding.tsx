import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Lock, Globe } from 'lucide-react';

interface MobileLandingProps {
    onEnter: () => void;
    language: 'it' | 'en' | 'fr';
    setLanguage: (lang: 'it' | 'en' | 'fr') => void;
    onLogin: () => void;
}

export const MobileLanding: React.FC<MobileLandingProps> = ({ onEnter, language, setLanguage, onLogin }) => {
    // Determine language label
    const langLabel = language.toUpperCase();
    const [showLangMenu, setShowLangMenu] = useState(false);

    // Dynamic background images
    const images = [
        "https://ianua.it/site/assets/files/1/img_20221021_204707_hdr.webp",
        "/assets/images/cellar_view.jpg"
    ];
    const [currentImage, setCurrentImage] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImage((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-screen w-full overflow-hidden bg-stone-950 flex flex-col justify-between">
            {/* Background Slider */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="popLayout">
                    <motion.img
                        key={currentImage}
                        src={images[currentImage]}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute inset-0 w-full h-full object-cover brightness-[0.4] blur-[1px]"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
            </div>

            {/* Top Bar */}
            <div className="relative z-30 flex justify-between items-center p-6 pt-12">
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 text-xs font-bold uppercase tracking-widest text-[#D4AF37]"
                >
                    <Globe size={14} /> {langLabel}
                </motion.button>

                {showLangMenu && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute top-24 left-6 z-50 flex flex-col gap-2 bg-stone-900/90 backdrop-blur-xl p-2 rounded-xl border border-[#D4AF37]/30 shadow-2xl"
                    >
                        {['it', 'en', 'fr'].map((l) => (
                            <button
                                key={l}
                                onClick={() => { setLanguage(l as any); setShowLangMenu(false); }}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest text-left ${language === l ? 'bg-[#D4AF37] text-stone-900' : 'text-stone-400 hover:text-white'}`}
                            >
                                {l}
                            </button>
                        ))}
                    </motion.div>
                )}

                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={onLogin}
                    className="w-10 h-10 flex items-center justify-center bg-white/5 backdrop-blur-md rounded-full border border-white/5 text-stone-400 active:scale-95 transition-transform"
                >
                    <Lock size={16} />
                </motion.button>
            </div>

            {/* Center Content */}
            <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8 text-center -mt-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, type: "spring" }}
                    className="mb-6 relative"
                >
                    <div className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full" />
                    <h1 className="relative text-7xl font-serif text-[#D4AF37] opacity-90 tracking-[0.05em] drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                        IANUA
                    </h1>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-stone-300 font-serif italic text-lg leading-relaxed max-w-xs drop-shadow-md"
                >
                    {`"${language === 'it' ? 'La porta delle Alpi' : language === 'fr' ? 'La porte des Alpes' : 'The Gate of the Alps'}"`}
                </motion.p>
                <div className="w-12 h-[1px] bg-[#D4AF37]/50 mt-4 mb-4" />
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ delay: 1 }}
                    className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37]"
                >
                    Valle d'Aosta
                </motion.p>
            </div>

            {/* Bottom Interaction */}
            <div className="relative z-10 p-8 pb-12 w-full">
                <motion.button
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2, type: "spring", stiffness: 100 }}
                    onClick={onEnter}
                    whileTap={{ scale: 0.95 }}
                    className="group w-full relative overflow-hidden bg-[#D4AF37] text-stone-950 font-serif text-lg py-5 rounded-2xl shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] transition-all duration-500"
                >
                    <span className="relative z-10 flex items-center justify-center gap-3 font-bold uppercase tracking-widest">
                        {language === 'it' ? 'Entra' : language === 'fr' ? 'Entrer' : 'Enter'} <ArrowRight size={20} />
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </motion.button>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ delay: 2 }}
                    className="text-center text-[9px] text-stone-500 mt-6 uppercase tracking-widest"
                >
                    Portable Experience v1.0
                </motion.p>
            </div>
        </div>
    );
};
