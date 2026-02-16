
import * as fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const wines = db.wines;
const wineries = db.wineries;

// Simplified VDA filtering logic
const vdaLocationMap: Record<string, string[]> = {
    'bassa': ['donnas', 'pont-saint-martin', 'bard'],
    'nus-quart': ['nus', 'quart', 'fenis'],
    'la-plaine': ['aosta', 'saint-christophe', 'ghessi', 'sarre'],
    'plaine-to-valdigne': ['saint-pierre', 'aymavilles', 'villeneuve', 'introd'],
    'valdigne': ['morgex', 'la salle']
};

const determineWineryRegion = (winery: any): string => {
    if (!winery) return 'unknown';
    const loc = (winery.location || "").toLowerCase();
    const regionManual = (winery.region || "").toLowerCase();

    if (regionManual.includes("bassa")) return 'bassa';
    if (regionManual.includes("nus")) return 'nus-quart';
    // ...
    for (const [zoneId, towns] of Object.entries(vdaLocationMap)) {
        if (towns.some(town => loc.includes(town))) {
            return zoneId;
        }
    }
    return 'unknown';
};

const vdaZones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne'];

let missingWineries = 0;

console.log("Starting scan...");

// Scan ALL wines
wines.forEach((w: any, index: number) => {
    // Check if wine itself is malformed
    if (!w || typeof w !== 'object') {
        console.error(`CRITICAL: Wine at index ${index} is not an object! Value: ${w}`);
        return;
    }

    if (!w.id) {
        console.error(`CRITICAL: Wine at index ${index} has NO ID! Full entry: ${JSON.stringify(w)}`);
    }

    const winery = wineries.find((win: any) => win.id === w.wineryId);

    if (!winery) {
        if (w.wineryId) {
            console.error(`ERROR: Wine at index ${index} (ID: ${w.id}) references missing wineryId: ${w.wineryId}`);
        } else {
            console.error(`ERROR: Wine at index ${index} (ID: ${w.id}) has NO wineryId property!`);
        }
        missingWineries++;
    } else {
        const regionId = determineWineryRegion(winery);
        if (vdaZones.includes(regionId)) {
            // It is a VDA wine
            if (w.id.includes('/') || w.id.includes('\\')) {
                console.warn(`WARNING: Wine ID contains slashes: ${w.id}`);
            }
        }
    }
});

console.log(`Scan complete. Found ${missingWineries} issues.`);
