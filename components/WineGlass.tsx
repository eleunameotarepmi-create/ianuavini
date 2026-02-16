import React, { useMemo } from 'react';
import type { Wine } from '../types';

interface WineGlassProps {
    wine: Wine;
    className?: string;
    style?: React.CSSProperties;
    straight?: boolean; // New prop to force visual verticality
}

// Mapping to Image Assets
type GlassAsset = 'glass_red_real_tr_v2.png' | 'glass_white_real_tr_v2.png' | 'glass_flute_real_tr_v3.png' | 'glass_flute_white_unstructured.png' | 'glass_rose_real_tr_v2.png' | 'glass_tulip_real_tr_v2.png' | 'glass_tulip_white_complex.png' | 'glass_tulip_rose_complex.png' | 'glass_tulipano_rose_frizzante.png' | 'glass_sparkling_rose_real_tr_v2.png' | 'glass_sparkling_rose_real_tr_v2_proper.png' | 'glass_sparkling_rose_unstructured.png' | 'glass_passiti.png' | 'glass_balloon.png' | 'glass_balloon_young_red.png' | 'glass_gran_balloon.png' | 'glass_barbaresco_premium.png' | 'glass_renano_bianco.png' | 'glass_renano_rose.png' | 'glass_borgogna_bianco_strutturato.png' | 'glass_borgogna_rosso.png' | 'glass_borgogna_rose.png';

export const WineGlass: React.FC<WineGlassProps> = ({ wine, className, style, ...props }) => {

    const { type, description, grapes, name } = wine;
    const text = (description + ' ' + grapes + ' ' + name).toLowerCase();

    // Logic to determine which image to use - STRICTLY USING SAFE ASSETS
    const glassAsset = useMemo((): GlassAsset => {
        // 1. Explicit Type (Priority)
        if (type) {
            if (type === 'sparkling_complex' || type === 'champagne') return 'glass_tulip_white_complex.png';
            if (type === 'sparkling_rose_complex') return 'glass_tulip_rose_complex.png';
            if (type === 'sparkling') return 'glass_flute_white_unstructured.png';
            if (type === 'sparkling_rose' || type === 'flute_rose') return 'glass_sparkling_rose_unstructured.png';
            if (type === 'rose') return 'glass_renano_rose.png';
            if (type === 'rose_structured' || type === 'borgogna_rose') return 'glass_borgogna_rose.png';
            if (type === 'dessert') return 'glass_passiti.png';
            if (type === 'white_complex' || type === 'borgogna' || type === 'white_structured') return 'glass_borgogna_bianco_strutturato.png';
            if (type === 'borgogna_red') return 'glass_borgogna_rosso.png';
            if (type === 'white') return 'glass_renano_bianco.png';
            if (type === 'red_structured') return 'glass_borgogna_rosso.png';
            if (type === 'red_complex') return 'glass_gran_balloon.png';
            if (type === 'barbaresco' || type === 'red_premium') return 'glass_barbaresco_premium.png';
            if (type === 'balloon' || type === 'red') return 'glass_balloon_young_red.png';
        }

        // Sparkling Rosé -> Sparkling Rose Glass
        const isSparkling = text.includes('spumante') || text.includes('champagne') || text.includes('franciacorta') || text.includes('prosecco') || text.includes('metodo classico') || text.includes('bollicine') || text.includes('frizzante') || text.includes('pet nat') || text.includes('pet-nat');
        const isRose = text.includes('rosato') || text.includes('rosé') || text.includes('rosè') || text.includes('cerasuolo');

        if (isSparkling && isRose) {
            return 'glass_sparkling_rose_unstructured.png';
        }

        // Sparkling -> Flute (white sparkling gets new unstructured flute)
        if (isSparkling) {
            return 'glass_flute_white_unstructured.png';
        }

        // Rosé -> Rose Glass
        if (isRose) {
            return 'glass_rose_real_tr_v2.png';
        }

        // Passito/Dessert -> Passito Glass
        if (text.includes('passito') || text.includes('vendemmia tardiva') || text.includes('dolce') || text.includes('dessert') || text.includes('flétri') || text.includes('muffato') || text.includes('moscato')) {
            return 'glass_passiti.png';
        }

        // White -> White Glass
        if (text.includes('bianco') || text.includes('white') || text.includes('blanc') ||
            text.includes('chardonnay') || text.includes('sauvignon') || text.includes('petite arvine') || text.includes('müller')
        ) {
            return 'glass_white_real_tr_v2.png';
        }

        // Default to Red -> Red Glass
        return 'glass_red_real_tr_v2.png';
    }, [type, text]);

    // Determine rotation based on glass type
    // Goal: STRICTLY VERTICAL (DRITTI) for consistency
    const rotationClass = useMemo(() => {
        // Corrections to align source images vertically
        // Source images have varying inclinations, these values counter-rotate them to be straight
        const rotationMap: Record<GlassAsset, string> = {
            'glass_red_real_tr_v2.png': '-rotate-[30deg]',       // Tilted right -> Rotate left
            'glass_white_real_tr_v2.png': '-rotate-[30deg]',     // Tilted right -> Rotate left
            'glass_rose_real_tr_v2.png': '-rotate-[30deg]',      // Tilted right -> Rotate left
            'glass_flute_real_tr_v3.png': 'rotate-[20deg]',      // Tilted left -> Rotate right (legacy)
            'glass_flute_white_unstructured.png': 'rotate-0', // New white sparkling flute
            'glass_sparkling_rose_real_tr_v2.png': 'rotate-[20deg]', // Legacy asset
            'glass_sparkling_rose_real_tr_v2_proper.png': 'rotate-0', // Previous adjusted asset
            'glass_sparkling_rose_unstructured.png': 'rotate-0', // New rosé sparkling flute
            'glass_tulip_real_tr_v2.png': 'rotate-[20deg]',      // Tilted left -> Rotate right
            'glass_tulip_white_complex.png': 'rotate-0',         // New white complex tulip
            'glass_tulip_rose_complex.png': 'rotate-0',          // New rosé complex tulip
            'glass_tulipano_rose_frizzante.png': 'rotate-0',     // New rosé tulip
            'glass_passiti.png': 'rotate-0',
            'glass_balloon.png': 'rotate-0',
            'glass_balloon_young_red.png': 'rotate-0',
            'glass_barbaresco_premium.png': 'rotate-0',
            'glass_renano_bianco.png': 'rotate-0',
            'glass_renano_rose.png': 'rotate-0',
            'glass_gran_balloon.png': 'rotate-0',
            'glass_borgogna_bianco_strutturato.png': 'rotate-0',
            'glass_borgogna_rosso.png': 'rotate-0',
            'glass_borgogna_rose.png': 'rotate-0'
        };

        return rotationMap[glassAsset] || 'rotate-0';
    }, [glassAsset]);

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
                className={`w-full h-full object-contain origin-center transition-all duration-300 ${props.straight ? 'translate-y-0' : 'translate-y-[50px]'} 
                ${props.straight ? rotationClass : (className?.includes('rotate') ? '' : rotationClass)} 
                ${filterClass}
                ${glassAsset === 'glass_flute_gold_clean_v2.png' ? "scale-[1.3] origin-bottom" : ""}
                ${glassAsset === 'glass_white_gold_clean_v5.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_red_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_rose_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_sparkling_rose_gold_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_sparkling_rose_real_tr_v2_proper.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_sparkling_rose_unstructured.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_flute_white_unstructured.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_tulip_white_complex.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_tulip_rose_complex.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_tulipano_rose_frizzante.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""} 
                ${glassAsset === 'glass_borgogna_bianco_strutturato.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_borgogna_rosso.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_barbaresco.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_balloon.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_balloon_young_red.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_barbaresco_premium.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_renano_bianco.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_renano_rose.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_passiti.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_gran_balloon.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_borgogna_rose.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_renano.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_renano_rose.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_tulipano.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_tulipano_rose.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_flute.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                ${glassAsset === 'glass_flute_rose.png' ? "scale-[0.75] !translate-y-[20px] origin-bottom" : ""}
                `}
            />
        </div>
    );
};
