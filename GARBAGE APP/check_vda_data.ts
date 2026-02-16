
import * as fs from 'fs';

interface Wine {
    id: string;
    wineryId: string;
    name: string;
    price?: string;
    priceRange?: string;
    image?: string;
    region?: string;
}

interface Winery {
    id: string;
    name: string;
    region?: string;
    location?: string;
}

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const wines: Wine[] = db.wines;
const wineries: Winery[] = db.wineries;

// Simplified VDA filtering logic from MobileApp.tsx
const vdaLocationMap: Record<string, string[]> = {
    'bassa': ['donnas', 'pont-saint-martin', 'bard'],
    'nus-quart': ['nus', 'quart', 'fenis'],
    'la-plaine': ['aosta', 'saint-christophe', 'ghessi', 'sarre'],
    'plaine-to-valdigne': ['saint-pierre', 'aymavilles', 'villeneuve', 'introd'],
    'valdigne': ['morgex', 'la salle']
};

const determineWineryRegion = (winery: Winery | undefined): string => {
    if (!winery) return 'unknown';
    const loc = (winery.location || "").toLowerCase();
    const regionManual = (winery.region || "").toLowerCase();

    if (regionManual.includes("bassa")) return 'bassa';
    if (regionManual.includes("nus")) return 'nus-quart';
    if (regionManual.includes("quart")) return 'nus-quart';
    if (regionManual.includes("plaine")) return 'la-plaine';
    if (regionManual.includes("valdigne")) return 'valdigne';

    for (const [zoneId, towns] of Object.entries(vdaLocationMap)) {
        if (towns.some(town => loc.includes(town))) {
            return zoneId;
        }
    }
    return 'unknown';
};

const vdaZones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne'];
const vdaWines = wines.filter(w => {
    const winery = wineries.find(win => win.id === w.wineryId);
    const regionId = determineWineryRegion(winery);
    return vdaZones.includes(regionId);
});

console.log(`Found ${vdaWines.length} VDA wines found with logic.`);

let errors = 0;
vdaWines.forEach(w => {
    // Check Price
    if (w.price !== undefined && typeof w.price !== 'string') {
        console.error(`ERROR: Wine ${w.id} (${w.name}) has 'price' of type ${typeof w.price}. Expected string or undefined.`);
        errors++;
    }

    // Check Wine Name
    if (typeof w.name !== 'string') {
        console.error(`ERROR: Wine ${w.id} has 'name' of type ${typeof w.name}.`);
        errors++;
    }

    // Check Image
    if (w.image !== undefined && typeof w.image !== 'string') {
        console.error(`ERROR: Wine ${w.id} (${w.name}) has 'image' of type ${typeof w.image}.`);
        errors++;
    }
});

if (errors === 0) {
    console.log("No data type errors found in VDA wines.");
} else {
    console.log(`Found ${errors} data type errors.`);
}
