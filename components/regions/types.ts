
import { Wine, Winery } from '../../types';

export interface RegionZone {
    id: string;
    label: string;
    minAlt: number;
    targetId?: string;
    image?: string; // Optional image for the zone card/header
} // DOM ID for scrolling

export interface RegionDetails {
    territory: {
        title: string;
        points: string[];
    };
    philosophy: {
        title: string;
        points: string[];
    };
    varieties: {
        title: string;
        groups: {
            label: string;
            items: string[];
        }[];
    };
}

export interface RegionConfig {
    id: 'vda' | 'piemonte' | 'liguria' | 'sardegna' | 'francia' | string;
    label: string;
    description: string;

    // Intro Content
    heroImage: string; // Used for Gateway Card
    coverImage?: string; // Used for Full Screen Cover Page (defaults to heroImage if missing)
    introTitle: string;
    introContent: string;
    introAuthor?: string;

    // Rich Details (Territory, Philosophy, Varieties)
    details?: RegionDetails;

    // Zones / Sub-regions
    zones: RegionZone[];

    // Locations Map (Towns -> Zone ID)
    // Used for automatic classification if Admin region is not set
    locationMap: Record<string, string[]>;

    // Specific Altitudes for Towns (if needed)
    locationAltitudes?: Record<string, number>;
}
