
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Printer } from 'lucide-react';
import { GROUP_MENUS, GROUP_MENU_EXTRAS, Language } from '../groupMenuData';
import GroupMenuPage from './GroupMenuPage';

interface GroupMenusModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'it' | 'en' | 'fr';
}

export const GroupMenusModal: React.FC<GroupMenusModalProps> = ({ isOpen, onClose, language }) => {
    const [selectedMenuId, setSelectedMenuId] = useState(1);


    if (!isOpen) return null;

    const selectedMenu = GROUP_MENUS.find(m => m.id === selectedMenuId) || GROUP_MENUS[0];

    const handlePrint = () => {
        window.print();
    };

    const goToPrev = () => {
        const idx = GROUP_MENUS.findIndex(m => m.id === selectedMenuId);
        if (idx > 0) setSelectedMenuId(GROUP_MENUS[idx - 1].id);
    };

    const goToNext = () => {
        const idx = GROUP_MENUS.findIndex(m => m.id === selectedMenuId);
        if (idx < GROUP_MENUS.length - 1) setSelectedMenuId(GROUP_MENUS[idx + 1].id);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-stone-900 flex flex-col animate-in fade-in duration-300 overflow-hidden print:static print:h-auto print:overflow-visible print:bg-white">

            {/* Header Bar */}
            <div className="bg-stone-900 text-white p-3 flex items-center justify-between border-b border-[#D4AF37]/20 shrink-0 print:hidden">
                <div className="flex items-center gap-3">
                    <span className="font-serif text-sm tracking-widest uppercase text-[#D4AF37]">
                        {language === 'it' ? 'Menù Gruppi 2026' : language === 'fr' ? 'Menus Groupes 2026' : 'Group Menus 2026'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handlePrint}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2 text-[#D4AF37]"
                    >
                        <Printer size={18} />
                        <span className="text-sm hidden sm:inline">{language === 'it' ? 'Stampa' : language === 'fr' ? 'Imprimer' : 'Print'}</span>
                    </button>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-[#D4AF37]"
                    >
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden flex flex-col">

                {/* Sidebar - Menu List (horizontal scroll on mobile, vertical sidebar on desktop) */}
                <div className="w-full bg-stone-800 border-b border-[#D4AF37]/10 overflow-x-auto p-2 shrink-0 print:hidden">
                    <div className="flex gap-2 min-w-max">
                        {GROUP_MENUS.map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedMenuId(menu.id)}
                                className={`whitespace-nowrap text-left px-3 py-2 rounded-lg transition-all text-sm ${selectedMenuId === menu.id
                                    ? 'bg-[#D4AF37] text-stone-900 shadow-lg'
                                    : 'text-stone-300 hover:bg-stone-700'
                                    }`}
                            >
                                <span className={`text-xs mr-2 ${selectedMenuId === menu.id ? 'text-stone-700' : 'text-stone-500'}`}>
                                    {menu.id.toString().padStart(2, '0')}
                                </span>
                                <span className="font-serif italic">{menu.name[language]}</span>
                                <span className="ml-2 text-xs opacity-60 whitespace-nowrap">{menu.price}€</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content - Menu Page */}
                <div className="flex-1 overflow-y-auto bg-stone-100 p-4 print:p-0 print:overflow-visible">
                    {/* Screen View */}
                    <div className="print:hidden">
                        <GroupMenuPage
                            menu={selectedMenu}
                            extras={GROUP_MENU_EXTRAS}
                            lang={language}
                            onPrint={handlePrint}
                        />
                    </div>

                    {/* Print View - All Languages */}
                    <div className="hidden print:block">
                        {(['it', 'fr', 'en'] as const).map((langCode) => (
                            <div key={langCode} style={{ breakAfter: 'page', pageBreakAfter: 'always', minHeight: '100vh' }}>
                                <GroupMenuPage
                                    menu={selectedMenu}
                                    extras={GROUP_MENU_EXTRAS}
                                    lang={langCode}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Navigation */}
            <div className="bg-stone-800 border-t border-[#D4AF37]/10 p-3 flex items-center justify-between shrink-0 print:hidden">
                <button
                    onClick={goToPrev}
                    disabled={selectedMenuId === GROUP_MENUS[0].id}
                    className="flex items-center gap-1 text-stone-400 hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft size={20} />
                    <span className="text-sm hidden sm:inline">{language === 'it' ? 'Precedente' : language === 'fr' ? 'Précédent' : 'Previous'}</span>
                </button>

                <span className="text-xs text-stone-500">
                    {selectedMenuId} / {GROUP_MENUS.length}
                </span>

                <button
                    onClick={goToNext}
                    disabled={selectedMenuId === GROUP_MENUS[GROUP_MENUS.length - 1].id}
                    className="flex items-center gap-1 text-stone-400 hover:text-[#D4AF37] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <span className="text-sm hidden sm:inline">{language === 'it' ? 'Successivo' : language === 'fr' ? 'Suivant' : 'Next'}</span>
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
};
