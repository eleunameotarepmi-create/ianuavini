
import React from 'react';
import { Mountain, Wind, Grape } from 'lucide-react';

export const PiemonteIntro: React.FC = () => {
    const SectionDivider = () => <div className="w-12 h-px bg-[#D4AF37]/40 mx-auto my-12" />;

    return (
        <div className="relative -mx-6 mb-24 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 z-0 select-none">
                <img
                    src="https://images.unsplash.com/photo-1534234828569-1f27c71f54c9?q=80"
                    alt="Piemonte Vineyards"
                    className="w-full h-full object-cover grayscale opacity-40"
                    style={{ backgroundPosition: 'center 40%' }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#fcfbf9] via-[#fcfbf9]/60 to-[#fcfbf9]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-20 animate-in fade-in duration-1000">
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-800 uppercase tracking-[0.3em] text-center mb-8">La Discesa</h2>
                <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-12" />

                <div className="text-center mb-16">
                    <p className="font-serif text-xl sm:text-2xl text-stone-700 italic leading-relaxed text-balance">
                        "Il Piemonte non è solo una regione, è un'altimetria dell'anima. Scendendo dalle vette della Valle, la terra si fa collina, il respiro si allarga e il vino diventa storia."
                    </p>
                </div>

                <SectionDivider />

                {/* Territorio & Clima */}
                <div className="space-y-16">
                    <div className="text-center">
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <Mountain className="text-[#D4AF37]" size={24} strokeWidth={1} />
                            <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-stone-800">Un Mare di Colline</h4>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 text-left max-w-2xl mx-auto">
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Patrimonio UNESCO, un mosaico di vigne pettinate dal vento.
                            </p>
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Suoli antichi: dalle sabbie del Roero alle marne blu delle Langhe.
                            </p>
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Esposizioni studiate passo per passo, dove ogni "bricco" ha il suo carattere.
                            </p>
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Terre di nebbie mattutine che proteggono e nutrono il Nebbiolo.
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="flex flex-col items-center gap-3 mb-6">
                            <Wind className="text-[#D4AF37]" size={24} strokeWidth={1} />
                            <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-stone-800">Filosofia Reale</h4>
                        </div>
                        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 text-left max-w-2xl mx-auto">
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                La pazienza del tempo: lunghi affinamenti in legno grande.
                            </p>
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Vinificazioni tradizionali per esaltare purezza e longevità.
                            </p>
                            <p className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                Vini aristocratici, strutturati, capaci di sfidare i decenni.
                            </p>
                        </div>
                    </div>
                </div>

                <SectionDivider />

                {/* Vitigni */}
                <div className="text-center space-y-8">
                    <div className="flex flex-col items-center gap-3">
                        <Grape className="text-[#D4AF37]" size={24} strokeWidth={1} />
                        <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-stone-800">I Re del Piemonte</h4>
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Rossi Nobili</h5>
                            <p className="font-serif text-stone-700 text-sm leading-relaxed">
                                Nebbiolo (Barolo, Barbaresco) <span className="mx-2 text-[#D4AF37]/40">~</span> Barbera <span className="mx-2 text-[#D4AF37]/40">~</span> Dolcetto <span className="mx-2 text-[#D4AF37]/40">~</span> Grignolino <span className="mx-2 text-[#D4AF37]/40">~</span> Ruché
                            </p>
                        </div>
                        <div className="space-y-2">
                            <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Bianchi Preziosi</h5>
                            <p className="font-serif text-stone-700 text-sm leading-relaxed">
                                Arneis <span className="mx-2 text-[#D4AF37]/40">~</span> Erbaluce <span className="mx-2 text-[#D4AF37]/40">~</span> Timorasso <span className="mx-2 text-[#D4AF37]/40">~</span> Nascetta <span className="mx-2 text-[#D4AF37]/40">~</span> Moscato
                            </p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-20 max-w-2xl mx-auto pt-8 border-t border-[#D4AF37]/20">
                    <p className="font-serif text-[#D4AF37] italic text-lg leading-relaxed">
                        "Un patrimonio di terre e culture che è un inno alla bellezza."
                    </p>
                </div>

            </div>
        </div>
    );
};
