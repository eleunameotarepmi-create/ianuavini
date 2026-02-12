
import React from 'react';
import { GroupMenuData, GroupMenuExtras, Language } from '../groupMenuData';
import { GroupWineIcon, GoldLeafIcon, PrintIcon } from './GroupMenuIcons';

interface GroupMenuPageProps {
    menu: GroupMenuData;
    extras: GroupMenuExtras;
    lang: Language;
    onPrint?: () => void;
}

const GroupMenuPage: React.FC<GroupMenuPageProps> = ({ menu, extras, lang, onPrint }) => {
    const labels = {
        it: { proposal: "MENÙ GRUPPI 2026", complete: "PROPOSTA COMPLETA" },
        en: { proposal: "GROUP MENU 2026", complete: "COMPLETE PACKAGE" },
        fr: { proposal: "MENU GROUPES 2026", complete: "FORFAIT COMPLET" }
    };

    return (
        <div className="bg-[#fdfbf7] min-h-[1056px] w-full max-w-4xl mx-auto shadow-2xl p-12 md:p-20 relative overflow-hidden flex flex-col page-break mb-12 border border-[#e5e1da] print:px-8 print:py-8 print:min-h-0 print:h-[100vh] print:w-full print:max-w-none print:border-0 print:shadow-none print:overflow-visible print:mb-0 print:block">
            {/* Decorative Golden Corner Elements */}
            <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-[#d4af37]/40 m-8 print:hidden"></div>
            <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-[#d4af37]/40 m-8 print:hidden"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-[#d4af37]/40 m-8 print:hidden"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-[#d4af37]/40 m-8 print:hidden"></div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] print:hidden"></div>

            {/* Content Wrapper for Print Centering */}
            <div className="flex-1 w-full flex flex-col print:h-full print:justify-between">
                {/* Header */}
                <div className="text-center relative z-10 mb-12 group/header print:mb-1 text-slate-900">
                    {onPrint && (
                        <button
                            onClick={onPrint}
                            className="absolute right-0 top-0 p-2 text-slate-300 hover:text-[#d4af37] transition-colors rounded-full hover:bg-slate-50 opacity-0 group-hover/header:opacity-100 no-print"
                            title="Stampa questo menu"
                        >
                            <PrintIcon className="w-5 h-5" />
                        </button>
                    )}
                    <div className="flex justify-center mb-6 print:mb-1">
                        <img src="/assets/ianua_logo_gold_transparent.png" alt="IANUA Logo" className="w-24 h-auto print:w-16" />
                    </div>
                    <h1 className="font-serif text-5xl md:text-6xl tracking-[0.25em] text-slate-900 mb-2 print:text-5xl print:mb-2" style={{ fontFamily: '"Cinzel", serif' }}>IANUA</h1>
                    <div className="flex items-center justify-center gap-4 mb-4 print:mb-4">
                        <div className="w-16 h-[1px] bg-[#d4af37] print:w-12"></div>
                        <p className="font-serif text-lg tracking-[0.4em] text-[#b08d2b] print:text-sm print:tracking-[0.3em]" style={{ fontFamily: '"Cinzel", serif' }}>{labels[lang].proposal}</p>
                        <div className="w-16 h-[1px] bg-[#d4af37] print:w-12"></div>
                    </div>
                </div>

                {/* Menu Identification */}
                <div className="mb-12 text-center z-10 print:mb-4">
                    <h2 className="font-serif italic text-4xl text-slate-800 border-b border-[#d4af37]/20 pb-4 inline-block px-12 print:text-4xl print:pb-2 print:px-8 print:border-b" style={{ fontFamily: '"Playfair Display", serif' }}>
                        {menu.id} - {menu.name[lang]}
                    </h2>
                    <p className="mt-4 font-serif text-xs tracking-[0.3em] text-[#d4af37] uppercase print:mt-2 print:text-xs" style={{ fontFamily: '"Cinzel", serif' }}>
                        {menu.category[lang]}
                    </p>
                </div>

                {/* Menu Items */}
                <div className="flex-grow z-10 flex flex-col items-center justify-center py-8 print:py-4 print:flex-grow">
                    <div className="w-full max-w-2xl space-y-10 print:space-y-6">
                        {menu.courses[lang].map((course, idx) => (
                            <div key={idx} className="relative group text-center">
                                <p className={`font-serif leading-relaxed text-slate-700 font-light print:leading-relaxed ${course.length > 170 || course.startsWith("Sempre") || course.startsWith("Sorbet")
                                    ? 'text-base md:text-lg print:text-sm'
                                    : 'text-2xl md:text-3xl print:text-2xl'
                                    }`} style={{ fontFamily: '"Playfair Display", serif' }}>
                                    {course}
                                </p>
                                {idx < menu.courses[lang].length - 1 && (
                                    <div className="mt-10 flex justify-center items-center gap-2 print:mt-6 print:flex">
                                        <div className="w-1 h-1 rounded-full bg-[#d4af37] print:bg-[#d4af37]"></div>
                                        <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent print:from-transparent print:via-[#d4af37] print:to-transparent"></div>
                                        <div className="w-1 h-1 rounded-full bg-[#d4af37] print:bg-[#d4af37]"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price & Footer */}
                <div className="mt-auto pt-12 z-10 print:pt-4 print:mt-0">
                    <div className="flex flex-col items-center gap-8 print:gap-4">
                        <div className="flex items-center gap-4 w-full">
                            <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-[#d4af37]/30"></div>
                            <div className="flex flex-col items-center">
                                <span className="font-serif text-xs tracking-widest text-[#d4af37] mb-1 uppercase print:text-[10px] print:mb-1" style={{ fontFamily: '"Cinzel", serif' }}>{labels[lang].complete}</span>
                                <span className="font-serif text-5xl text-slate-900 print:text-4xl whitespace-nowrap" style={{ fontFamily: '"Playfair Display\", serif' }}>{menu.price}€</span>
                            </div>
                            <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-[#d4af37]/30"></div>
                        </div>

                        <div className="text-center max-w-xl">
                            <p className="font-serif italic text-slate-500 text-sm mb-4 print:mb-2 print:text-sm print:leading-normal" style={{ fontFamily: '"Playfair Display", serif' }}>
                                {extras.included[lang]}
                            </p>
                            <div className="flex flex-wrap justify-center gap-x-12 gap-y-2 print:gap-x-8 print:gap-y-1">
                                <div className="flex items-center gap-2">
                                    <GroupWineIcon className="w-4 h-4 text-[#d4af37]" />
                                    <span className="font-serif text-[10px] tracking-widest text-slate-600 uppercase" style={{ fontFamily: '"Cinzel", serif' }}>{extras.forfaitWine[lang]}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GroupWineIcon className="w-4 h-4 text-[#d4af37]" />
                                    <span className="font-serif text-[10px] tracking-widest text-slate-600 uppercase" style={{ fontFamily: '"Cinzel", serif' }}>{extras.forfaitFull[lang]}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Elegant Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.02] pointer-events-none scale-150 print:hidden">
                <GoldLeafIcon className="w-96 h-96 text-slate-900" />
            </div>

        </div>
    );
};

export default GroupMenuPage;
