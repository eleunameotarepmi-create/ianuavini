import React, { useMemo } from 'react';
import type { Wine } from '../types';

interface WineGlassProps {
    wine: Wine;
    className?: string;
    style?: React.CSSProperties;
    straight?: boolean; // New prop to force visual verticality
}

// Mapping to Image Assets
// Mapping to Image Assets
type GlassAsset = 'glass_red_real_tr_v2.png' | 'glass_white_real_tr_v2.png' | 'glass_flute_real_tr_v3.png' | 'glass_rose_real_tr_v2.png' | 'glass_tulip_real_tr_v2.png' | 'glass_sparkling_rose_real_tr_v2.png' | 'glass_white_gold_clean_v2.png' | 'glass_white_gold_clean_v5.png' | 'glass_red_gold_clean_v2.png' | 'glass_flute_gold_clean_v2.png' | 'glass_passito_gold_clean_v2.png' | 'glass_red_gold_proper.png' | 'glass_rose_gold_proper.png' | 'glass_sparkling_rose_gold_proper.png';

export const WineGlass: React.FC<WineGlassProps> = ({ wine, className, style, ...props }) => {

    const { type, description, grapes, name } = wine;
    const text = (description + ' ' + grapes + ' ' + name).toLowerCase();

    // Logic to determine which image to use
    const glassAsset = useMemo((): GlassAsset => {
        // 1. Explicit Type (Priority)
        if (type) {
            if (type === 'sparkling' || type === 'champagne') return 'glass_flute_gold_clean_v2.png';
            if (type === 'sparkling_rose') return 'glass_sparkling_rose_gold_proper.png'; // NEW: Proper Sparkling Rose
            if (type === 'rose') return 'glass_rose_gold_proper.png'; // NEW: Proper Rose
            if (type === 'dessert') return 'glass_passito_gold_clean_v2.png';
            if (type === 'white') return 'glass_white_gold_clean_v5.png';
            if (type === 'red') return 'glass_red_gold_proper.png'; // NEW: Use proper red wine image
        }

        // Sparkling Rosé -> Sparkling Rose Glass (Priority over generic Sparkling)
        const isSparkling = text.includes('spumante') || text.includes('champagne') || text.includes('franciacorta') || text.includes('prosecco') || text.includes('metodo classico') || text.includes('bollicine') || text.includes('frizzante') || text.includes('pet nat') || text.includes('pet-nat');
        const isRose = text.includes('rosato') || text.includes('rosé') || text.includes('rosè') || text.includes('cerasuolo');

        if (isSparkling && isRose) {
            return 'glass_sparkling_rose_gold_proper.png';
        }

        // Sparkling -> Flute
        if (isSparkling) {
            return 'glass_flute_gold_clean_v2.png';
        }

        // Rosé -> Rose Glass
        if (isRose) {
            return 'glass_rose_gold_proper.png';
        }

        // Passito/Dessert -> Tulip Glass (New)
        if (text.includes('passito') || text.includes('vendemmia tardiva') || text.includes('dolce') || text.includes('dessert') || text.includes('flétri') || text.includes('muffato') || text.includes('moscato')) {
            return 'glass_passito_gold_clean_v2.png';
        }

        // White -> White Glass
        if (text.includes('bianco') || text.includes('white') || text.includes('blanc') ||
            text.includes('chardonnay') || text.includes('sauvignon') || text.includes('petite arvine') || text.includes('müller')
        ) {
            return 'glass_white_gold_clean_v5.png';
        }

        // Default to Red -> Use proper red wine image
        return 'glass_red_gold_proper.png';
    }, [type, text]);

    // Determine rotation based on glass type (correcting mixed source orientations)
    // Goal: STRICTLY VERTICAL (DRITTI)
    const rotationClass = useMemo(() => {
        const straightMap: Record<GlassAsset, string> = {
            'glass_red_real_tr_v2.png': '-rotate-[15deg]',
            'glass_white_real_tr_v2.png': '-rotate-[15deg]',
            'glass_rose_real_tr_v2.png': 'rotate-0',
            'glass_flute_real_tr_v3.png': 'rotate-0',
            'glass_sparkling_rose_real_tr_v2.png': 'rotate-0',
            'glass_tulip_real_tr_v2.png': 'rotate-0',
            'glass_white_gold_clean_v2.png': 'rotate-0',
            'glass_white_gold_clean_v5.png': 'rotate-0',
            'glass_red_gold_clean_v2.png': 'rotate-0',
            'glass_flute_gold_clean_v2.png': 'rotate-0',
            'glass_passito_gold_clean_v2.png': 'rotate-0',
            'glass_red_gold_proper.png': 'rotate-0',
            'glass_rose_gold_proper.png': 'rotate-0',
            'glass_sparkling_rose_gold_proper.png': 'rotate-0'
        };

        if (props.straight) {
            return straightMap[glassAsset];
        }

        const aestheticMap: Record<GlassAsset, string> = {
            'glass_red_real_tr_v2.png': '-rotate-[15deg]',
            'glass_white_real_tr_v2.png': '-rotate-[15deg]',
            'glass_rose_real_tr_v2.png': 'rotate-[22deg]',
            'glass_flute_real_tr_v3.png': 'rotate-0',
            'glass_sparkling_rose_real_tr_v2.png': 'rotate-0',
            'glass_tulip_real_tr_v2.png': 'rotate-0',
            'glass_white_gold_clean_v2.png': 'rotate-0',
            'glass_white_gold_clean_v5.png': 'rotate-0',
            'glass_red_gold_clean_v2.png': 'rotate-0',
            'glass_flute_gold_clean_v2.png': 'rotate-0',
            'glass_passito_gold_clean_v2.png': 'rotate-0',
            'glass_red_gold_proper.png': 'rotate-0',
            'glass_rose_gold_proper.png': 'rotate-0',
            'glass_sparkling_rose_gold_proper.png': 'rotate-0'
        };
        return aestheticMap[glassAsset] || 'rotate-0';
    }, [glassAsset, props.straight]);

    // Determine CSS filters
    const filterClass = useMemo(() => {
        // Shared logic for detection
        const isSparkling = text.includes('spumante') || text.includes('champagne') || text.includes('franciacorta') || text.includes('prosecco') || text.includes('metodo classico') || text.includes('bollicine') || text.includes('frizzante');
        const isRose = text.includes('rosato') || text.includes('rosé') || text.includes('rosè') || text.includes('cerasuolo');

        // Logic for Still Rose
        if (glassAsset === 'glass_white_gold_clean_v5.png' && isRose && !isSparkling) {
            return "hue-rotate-[-35deg] saturate-[0.6] brightness-125"; // Legacy fallback
        }

        return "";
    }, [wine.type, glassAsset, text]);

    return (
        <div className={`relative ${className} w-full h-full`} style={{ ...style }}>
            <img
                src={`/assets/${glassAsset}`}
                alt={`${wine.type} glass`}
                className={`w-full h-full object-contain origin-center transition-all duration-300 ${props.straight ? 'translate-y-0' : 'translate-y-[50px] md:translate-y-[80px]'} 
                ${props.straight ? rotationClass : (className?.includes('rotate') ? '' : rotationClass)} 
                ${filterClass}
                ${glassAsset === 'glass_flute_gold_clean_v2.png' ? "scale-[1.3] origin-bottom" : ""}
                ${glassAsset === 'glass_passito_gold_clean_v2.png' ? "scale-[1.2] origin-bottom" : ""}
                ${glassAsset === 'glass_white_gold_clean_v5.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_red_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_rose_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_sparkling_rose_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                `}
            />
        </div>
    );
};
