
import React, { useMemo } from 'react';
import { Winery } from '../types';
import { Language } from '../translations';
import { getWineriesIntroContent } from '../contentTranslations';

const BarrelsIcon = () => (
    <div className="flex items-end gap-1 text-[#D4AF37] mb-2">
        <svg width="14" height="18" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
            <ellipse cx="12" cy="6" rx="8" ry="4" />
            <path d="M4 6V26C4 28.2 7.6 30 12 30C16.4 30 20 28.2 20 26V6" />
            <path d="M4 14C4 16.2 7.6 18 12 18C16.4 18 20 16.2 20 14" strokeOpacity="0.4" />
            <path d="M4 22C4 24.2 7.6 26 12 26C16.4 26 20 24.2 20 22" strokeOpacity="0.4" />
        </svg>
        <svg width="18" height="24" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="12" cy="6" rx="8" ry="4" />
            <path d="M4 6V26C4 28.2 7.6 30 12 30C16.4 30 20 28.2 20 26V6" />
            <path d="M4 14C4 16.2 7.6 18 12 18C16.4 18 20 16.2 20 14" strokeOpacity="0.4" />
            <path d="M4 22C4 24.2 7.6 26 12 26C16.4 26 20 24.2 20 22" strokeOpacity="0.4" />
        </svg>
        <svg width="14" height="18" viewBox="0 0 24 32" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
            <ellipse cx="12" cy="6" rx="8" ry="4" />
            <path d="M4 6V26C4 28.2 7.6 30 12 30C16.4 30 20 28.2 20 26V6" />
            <path d="M4 14C4 16.2 7.6 18 12 18C16.4 18 20 16.2 20 14" strokeOpacity="0.4" />
            <path d="M4 22C4 24.2 7.6 26 12 26C16.4 26 20 24.2 20 22" strokeOpacity="0.4" />
        </svg>
    </div>
);

export const CantineListIntro: React.FC<{ wineries: Winery[], language: Language, title?: string, description?: string }> = ({ wineries, language, title, description }) => {
    const content = getWineriesIntroContent(language);
    const closing = content.wineries.closing;
    // Use provided title/description or fallback to VDA content
    // If description is explicitly empty string, don't fallback
    const displayTitle = title || content.wineries.title;
    const displayDescription = description !== undefined ? description : closing;

    // Generate sorted list dynamically from actual data to ensure links work
    const sortedWineries = useMemo(() => {
        return [...wineries].sort((a, b) => a.name.localeCompare(b.name));
    }, [wineries]);

    const scrollToWinery = (name: string) => {
        const id = `winery - ${name.replace(/\s+/g, '-').toLowerCase()} `;
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Add a temporary highlight effect
            element.classList.add('ring-4', 'ring-[#D4AF37]/30');
            setTimeout(() => element.classList.remove('ring-4', 'ring-[#D4AF37]/30'), 2000);
        }
    };

    if (sortedWineries.length === 0) return null;

    return (
        <div className="max-w-4xl mx-auto px-6 mb-12 text-center">
            {/* Cantine Section */}
            <div className="space-y-8">
                <div className="flex flex-col items-center gap-3">
                    <BarrelsIcon />
                    <h4 className="font-serif text-2xl font-bold uppercase tracking-widest text-stone-800">{displayTitle}</h4>
                </div>

                {displayDescription && displayDescription.trim() !== "" && (
                    <p className="font-serif text-stone-600 italic leading-relaxed text-lg max-w-2xl mx-auto text-balance">{displayDescription}</p>
                )}

                <div className="pt-8 opacity-60">
                    <p className="text-[10px] font-sans uppercase tracking-[0.2em] leading-loose text-stone-500 text-center text-balance max-w-3xl mx-auto">
                        <span className="mr-2">{content.wineries.list}</span>
                        {sortedWineries.map((winery, index) => (
                            <React.Fragment key={winery.id}>
                                <button
                                    onClick={() => scrollToWinery(winery.name)}
                                    className="hover:text-[#D4AF37] hover:underline decoration-[#D4AF37]/50 underline-offset-4 transition-all cursor-pointer uppercase inline"
                                >
                                    {winery.name}
                                </button>
                                {index < sortedWineries.length - 1 && <span>, </span>}
                            </React.Fragment>
                        ))}
                    </p>
                </div>
            </div>
        </div>
    );
};
