
import * as fs from 'fs';
import * as path from 'path';

// Mock types
interface Wine {
    id: string;
    name: string;
    wineryId: string;
    hidden?: boolean;
    grapes: string;
    region?: string;
}

interface Winery {
    id: string;
    name: string;
    location: string;
    region?: string;
}

// Mock Registry logic
const vda = {
    id: 'vda',
    zones: [
        { id: 'bassa' }, { id: 'nus-quart' }, { id: 'la-plaine' }, { id: 'plaine-to-valdigne' }, { id: 'valdigne' }
    ],
    locationMap: {
        'bassa': ['ponte-saint-martin', 'donnas', 'perloz', 'bard', 'hône', 'arnad', 'issogne', 'champoluc', 'challand', 'montjovet', 'champdepraz', 'verrès', 'chambave', 'pontey', 'fenis', 'saint-vincent', 'chatillon'],
        'nus-quart': ['nus', 'quart'],
        'la-plaine': ['saint-christophe', 'pollein', 'charvensod', 'gignod', 'aosta'],
        'plaine-to-valdigne': ['sarre', 'saint-pierre', 'jovençan', 'villeneuve', 'aymavilles', 'introd', 'arvier', 'avise', 'saint-nicolas', 'gressan'],
        'valdigne': ['la salle', 'morgex', 'pré-saint-didier', 'courmayeur']
    }
};

const ALL_REGIONS = [vda];

const determineWineryRegion = (winery: Winery | undefined): string => {
    if (!winery) return 'unknown';

    const loc = (winery.location || "").toLowerCase();
    const regionManual = (winery.region || "").toLowerCase();

    // 1. Manual check (simplified for VDA)
    if (regionManual.includes("bassa")) return 'bassa';
    if (regionManual.includes("nus") || regionManual.includes("quart")) return 'nus-quart';
    if (regionManual.includes("plaine") && !regionManual.includes("valdigne")) return 'la-plaine';
    if (regionManual.includes("media valle") || regionManual.includes("verso la valdigne")) return 'plaine-to-valdigne';

    // 2. Location check
    for (const [zoneId, towns] of Object.entries(vda.locationMap)) {
        if (towns.some(town => loc.includes(town))) {
            return zoneId;
        }
    }

    return 'unknown';
};

// Load DB
try {
    const dbPath = path.resolve('c:/Surface Shares/Riproviamo da qui Antigravity/Ianua vini v3/db.json');
    const dbRaw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbRaw);
    const wines: Wine[] = db.wines || [];
    const wineries: Winery[] = db.wineries || [];

    console.log(`Loaded ${wines.length} wines and ${wineries.length} wineries.`);

    // Simulation of filtering logic
    const selectedRegion = 'vda';
    const searchTerm = '';

    console.log("Starting filtering...");

    const filteredWines = wines.filter(w => !w.hidden).filter(w => {
        // 1. Search Filter
        const term = searchTerm.toLowerCase();
        const matchesSearch = w.name.toLowerCase().includes(term) || w.grapes.toLowerCase().includes(term);

        // 2. Region Filter
        let matchesRegion = true;

        // Find winery
        const winery = wineries.find(win => win.id === w.wineryId);

        // Call registry function
        let regionId = 'unknown';
        try {
            regionId = determineWineryRegion(winery);
        } catch (e) {
            console.error(`Error in determineWineryRegion for wine ${w.id}:`, e);
            return false;
        }

        if (selectedRegion === 'vda') {
            // VDA Logic: Explicit Inclusion + Safety Exclusion
            const vdaZones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne'];
            const isVdaZone = vdaZones.includes(regionId);

            if (isVdaZone) {
                matchesRegion = true;
            } else {
                // Fallback for unknown/generic regions: Exclude other known regions
                const isPiemonteZone = ['langhe', 'roero', 'monferrato', 'alto-piemonte', 'canavese', 'tortonese'].includes(regionId);
                matchesRegion = !isPiemonteZone && (regionId !== 'liguria') && (regionId !== 'sardegna') && (winery?.region !== 'piemonte');
            }
        }

        if (matchesRegion && matchesSearch) {
            // console.log(`Matched Wine: ${w.name} (${w.id}) - RegionID: ${regionId}`);
        }

        return matchesSearch && matchesRegion;
    });

    console.log(`Filtering complete. Found ${filteredWines.length} VDA wines.`);

    // Check for heavy images in the result
    /*
    filteredWines.forEach(w => {
        const fullWine = db.wines.find((x:any) => x.id === w.id);
        if (fullWine && fullWine.image && fullWine.image.length > 500000) {
            console.warn(`Warning: Wine ${w.id} (${w.name}) has a very large image (${fullWine.image.length} chars).`);
        }
    });
    */

} catch (error) {
    console.error("CRITICAL ERROR:", error);
}
