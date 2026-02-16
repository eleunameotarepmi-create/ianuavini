import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronDown, Hand } from 'lucide-react';

// --- SHARED DATA ---
const MANIFESTO_TEXT = [
    "La porta delle Alpi.",
    "Un confine che non divide, ma unisce.",
    "Qui il vino è fatica, roccia e cielo.",
    "Ogni sorso è un passo verso la vetta.",
    "Benvenuti in Valle d'Aosta."
];

const BG_IMAGE = "https://ianua.it/site/assets/files/1/img_20221021_204707_hdr.webp"; // Using your existing URL

// --- VARIANT 1: STORY MODE ---
const StoryMode = ({ onFinish }: { onFinish: () => void }) => {
    const [index, setIndex] = useState(0);

    const handleTap = () => {
        if (index < MANIFESTO_TEXT.length - 1) {
            setIndex(index + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="relative h-full w-full bg-black text-white overflow-hidden" onClick={handleTap}>
            {/* Background with Zoom Effect */}
            <motion.img
                key={index} // Force re-render for slight movement per slide? Or continuous?
                src={BG_IMAGE}
                animate={{ scale: [1, 1.1] }}
                transition={{ duration: 10, repeat: Infinity, repeatType: "mirror" }}
                className="absolute inset-0 w-full h-full object-cover opacity-60 blur-sm"
            />

            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
                {MANIFESTO_TEXT.map((_, i) => (
                    <div key={i} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: "0%" }}
                            animate={{ width: i <= index ? "100%" : "0%" }}
                            className="h-full bg-[#D4AF37]"
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-[2px]">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 1.05 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h2 className="text-3xl font-serif italic leading-relaxed text-[#D4AF37] drop-shadow-lg">
                            "{MANIFESTO_TEXT[index]}"
                        </h2>
                    </motion.div>
                </AnimatePresence>

                <motion.div
                    className="absolute bottom-10 text-white/50 text-xs uppercase tracking-widest flex items-center gap-2"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <Hand size={14} /> Tap per continuare
                </motion.div>
            </div>
        </div>
    );
};

// --- VARIANT 2: PARALLAX SCROLL ---
const ParallaxMode = ({ onFinish }: { onFinish: () => void }) => {
    return (
        <div className="relative w-full overflow-y-auto h-full bg-stone-950 snap-y snap-mandatory scroll-behavior-smooth">
            {/* Hero Section */}
            <section className="h-full w-full relative snap-start flex flex-col items-center justify-center shrink-0">
                <div className="absolute inset-0 z-0">
                    <img src={BG_IMAGE} className="w-full h-full object-cover opacity-70" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-stone-950" />
                </div>
                <div className="z-10 text-center space-y-4">
                    <h1 className="text-6xl font-serif text-[#D4AF37] tracking-[0.2em]">IANUA</h1>
                    <p className="text-stone-300 uppercase text-xs tracking-[0.4em]">Scroll Down</p>
                    <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                        <ChevronDown className="text-[#D4AF37] mx-auto" />
                    </motion.div>
                </div>
            </section>

            {/* Text Sections */}
            {MANIFESTO_TEXT.map((text, i) => (
                <section key={i} className="h-full w-full snap-center flex items-center justify-center p-8 relative shrink-0">
                    <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                        <div className="text-[200px] font-serif text-white/5 absolute -top-20 -left-20">{i + 1}</div>
                    </div>
                    <motion.p
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: false, amount: 0.5 }}
                        className="text-3xl font-serif text-center leading-relaxed text-stone-200 z-10"
                    >
                        {text}
                    </motion.p>
                </section>
            ))}

            {/* Final Section */}
            <section className="h-full w-full snap-center flex items-center justify-center bg-[#D4AF37] text-stone-950 shrink-0">
                <button onClick={onFinish} className="text-2xl font-serif uppercase tracking-widest font-bold flex items-center gap-4 px-8 py-4 bg-black/10 rounded-full">
                    Inizia il Viaggio <ArrowRight />
                </button>
            </section>
        </div>
    );
};

// --- VARIANT 3: MINIMAL CARD ---
const MinimalMode = ({ onFinish }: { onFinish: () => void }) => {
    return (
        <div className="relative h-full w-full bg-[#EAE8E3] text-stone-900 flex flex-col">
            {/* Top Image (Fixed Card) */}
            <div className="h-[45%] m-4 rounded-[2rem] overflow-hidden relative shadow-2xl shrink-0">
                <img src={BG_IMAGE} className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                    Valle d'Aosta
                </div>
            </div>

            {/* Bottom Scrollable Text */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 space-y-8">
                <h2 className="text-4xl font-serif text-stone-900 mb-6 sticky top-0 bg-[#EAE8E3] py-2 z-10">Manifesto</h2>

                {MANIFESTO_TEXT.map((text, i) => (
                    <div key={i} className="border-l-2 border-[#D4AF37] pl-4">
                        <p className="text-lg font-serif italic text-stone-700 leading-relaxed">
                            {text}
                        </p>
                    </div>
                ))}

                <button
                    onClick={onFinish}
                    className="w-full bg-stone-900 text-[#D4AF37] py-4 rounded-xl font-bold uppercase tracking-widest shadow-lg mt-8 active:scale-95 transition-transform mb-8"
                >
                    Entra
                </button>
            </div>
        </div>
    );
};

const MODE_LABELS: Record<'story' | 'parallax' | 'minimal', string> = {
    story: "Story",
    parallax: "Scroll",
    minimal: "Card"
};

// --- PLAYGROUND CONTAINER ---
export const MobileCoverPlayground: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [mode, setMode] = useState<'story' | 'parallax' | 'minimal'>('story');

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col h-[100dvh]">
            {/* Mode Switcher Header */}
            <div className="bg-stone-900 text-white p-3 flex gap-2 justify-center shrink-0 border-b border-white/10 safe-area-top">
                {(['story', 'parallax', 'minimal'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={`flex-1 px-3 py-2 text-[10px] uppercase tracking-widest rounded-md transition-colors ${mode === m ? 'bg-[#D4AF37] text-black font-bold' : 'bg-white/10 text-stone-400'}`}
                    >
                        {MODE_LABELS[m]}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden bg-black">
                {mode === 'story' && <StoryMode onFinish={onExit} />}
                {mode === 'parallax' && <ParallaxMode onFinish={onExit} />}
                {mode === 'minimal' && <MinimalMode onFinish={onExit} />}
            </div>

            <div className="absolute bottom-4 right-4 z-[60]">
                <button onClick={onExit} className="bg-red-500/20 text-red-400 border border-red-500/50 px-3 py-1 rounded-full text-xs hover:bg-red-500/40 backdrop-blur-md">
                    Chiudi Demo
                </button>
            </div>
        </div>
    );
};
