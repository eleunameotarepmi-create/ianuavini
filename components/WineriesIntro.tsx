
import React from 'react';
import { Mountain, Wind, Grape } from 'lucide-react';
import { t, Language } from '../translations';
import { getWineriesIntroContent } from '../contentTranslations';

export const WineriesIntro: React.FC<{ language: Language }> = ({ language }) => {
    const content = getWineriesIntroContent(language);
    const { sections, grapes, footer } = content;

    const SectionDivider = () => <div className="w-12 h-px bg-[#D4AF37]/40 mx-auto my-8" />;

    return (
        <div className="relative -mx-6 mb-12 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0 select-none">
                <img
                    src="/assets/images/wineries_intro_bg.jpg"
                    alt="Cantina storica"
                    className="w-full h-full object-cover grayscale opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#fcfbf9] via-[#fcfbf9]/60 to-[#fcfbf9]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-10 animate-in fade-in duration-1000">
                {/* Main Title */}
                <h2 className="text-2xl sm:text-3xl font-serif text-stone-800 uppercase tracking-[0.3em] text-center mb-4">{t('wineries.main_title', language)}</h2>
                <div className="w-12 h-px bg-[#D4AF37] mx-auto mb-8" />

                {/* Main Intro Quote */}
                <div className="text-center mb-8">
                    <p className="font-serif text-xl sm:text-2xl text-stone-700 italic leading-relaxed text-balance">
                        "{t('wineries.intro_quote', language)}"
                    </p>
                </div>

                {/* Journey Text */}
                <div className="text-center mb-8">
                    <p className="font-serif text-lg text-[#D4AF37] italic leading-relaxed">
                        {t('wineries.intro_journey', language)}
                    </p>
                </div>

                <SectionDivider />

                {/* Territorio & Filosofie - Editorial Layout */}
                <div className="space-y-16">
                    {sections.map((sec, idx) => (
                        <div key={idx} className="text-center">
                            <div className="flex flex-col items-center gap-3 mb-6">
                                {idx === 0 ? <Mountain className="text-[#D4AF37]" size={24} strokeWidth={1} /> : <Wind className="text-[#D4AF37]" size={24} strokeWidth={1} />}
                                <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-stone-800">{sec.title}</h4>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-4 text-left max-w-2xl mx-auto">
                                {sec.items.map((item, i) => (
                                    <p key={i} className="font-serif text-stone-600 italic text-sm leading-relaxed flex items-baseline gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]/60 flex-shrink-0 translate-y-1" />
                                        {item}
                                    </p>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <SectionDivider />

                {/* Vitigni */}
                <div className="text-center space-y-8">
                    <div className="flex flex-col items-center gap-3">
                        <Grape className="text-[#D4AF37]" size={24} strokeWidth={1} />
                        <h4 className="font-serif text-xl font-bold uppercase tracking-widest text-stone-800">{grapes.title}</h4>
                    </div>
                    {/* <p className="font-serif text-stone-600 italic">{grapes.description}</p> */}

                    <div className="space-y-8">
                        {grapes.categories.map((cat, idx) => (
                            <div key={idx} className="space-y-2">
                                <h5 className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{cat.name}</h5>
                                <p className="font-serif text-stone-700 text-sm leading-relaxed max-w-xl mx-auto">
                                    {cat.list.split('·').map((g, i, arr) => (
                                        <span key={i}>
                                            {g.trim()}
                                            {i < arr.length - 1 && <span className="mx-2 text-[#D4AF37]/40">~</span>}
                                        </span>
                                    ))}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>


                <SectionDivider />

                {/* Footer Quote (Ogni calice...) */}
                <div className="text-center mt-20 max-w-2xl mx-auto pt-8 border-t border-[#D4AF37]/20">
                    <p className="font-serif text-[#D4AF37] italic text-lg leading-relaxed">
                        {footer.replace(/^📍 /, '')}
                    </p>
                </div>
            </div>
        </div>
    );
};
