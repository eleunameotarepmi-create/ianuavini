
import { RegionConfig } from './types';
import { vda } from './vda';
import { piemonte } from './piemonte';
import { liguria } from './liguria';
import { sardegna } from './sardegna';
import { toscana } from './toscana';
import { veneto } from './veneto';
import { lombardia } from './lombardia';
import { francia } from './francia';
import { Winery } from '../../types';

export const ALL_REGIONS: RegionConfig[] = [vda, piemonte, liguria, sardegna, toscana, veneto, lombardia, francia];

export const getRegionById = (id: string): RegionConfig | undefined => {
    return ALL_REGIONS.find(r => r.id === id);
};

export const getAllZones = () => {
    return ALL_REGIONS.flatMap(r => r.zones);
};

export const determineWineryRegion = (winery: Winery | undefined): string => {
    if (!winery) return 'unknown';

    const loc = (winery.location || "").toLowerCase();
    const regionManual = (winery.region || "").toLowerCase();

    // 1. Iterate through ALL regions to check for MANUAL overrides first
    // This is the "Data Driven" approach - regions define their own triggers
    for (const region of ALL_REGIONS) {
        // Check manual match against zone Ids or Labels (simplified)
        // Ideally we would add 'keywords' to the RegionConfig, but using keys is safe start
        for (const zone of region.zones) {
            // Check if manual field matches a zone ID or a simplified Label
            if (regionManual.includes(zone.id) || regionManual.includes(zone.label.toLowerCase())) {
                return zone.id;
            }
        }
        // Check VDA specific manual overrides (legacy support)
        if (region.id === 'vda') {
            if (regionManual.includes("bassa")) return 'bassa';
            if (regionManual.includes("nus") || regionManual.includes("quart")) return 'nus-quart';
            if (regionManual.includes("plaine") && !regionManual.includes("valdigne")) return 'la-plaine';
            if (regionManual.includes("media valle") || regionManual.includes("verso la valdigne")) return 'plaine-to-valdigne';
        }
    }

    // 2. Iterate through ALL regions to check for LOCATION overrides
    for (const region of ALL_REGIONS) {
        for (const [zoneId, towns] of Object.entries(region.locationMap)) {
            if (towns.some(town => loc.includes(town))) {
                return zoneId;
            }
        }
    }

    return 'unknown';
};

export const getGlobalAltitude = (location: string): number => {
    for (const region of ALL_REGIONS) {
        if (region.locationAltitudes) {
            // Check direct match or substring
            // Optimized to check keys against location
            for (const [town, alt] of Object.entries(region.locationAltitudes)) {
                if (location.toLowerCase().includes(town.replace(/_/g, ' '))) {
                    return alt;
                }
            }
        }
    }
    return 0;
};
