
import * as fs from 'fs';
import * as path from 'path';

// Load DB
try {
    const dbPath = path.resolve('c:/Surface Shares/Riproviamo da qui Antigravity/Ianua vini v3/db.json');
    const dbRaw = fs.readFileSync(dbPath, 'utf-8');
    const db = JSON.parse(dbRaw);
    const wines = db.wines || [];
    const wineries = db.wineries || [];

    // Filter for VDA wines (approximate logic matching current app)
    const vdaZones = ['bassa', 'nus-quart', 'la-plaine', 'plaine-to-valdigne', 'valdigne'];

    // We can't easily reproduce the FULL region logic here without copying all registry files
    // But we can check wines linked to the IDs we found earlier or just check ALL wines for massive images

    console.log("Checking image sizes...");

    let largeImageCount = 0;
    const threshold = 100000; // 100KB string length

    wines.forEach((w: any) => {
        if (w.image && w.image.length > threshold) {
            largeImageCount++;
            if (largeImageCount <= 5) {
                console.log(`Wine ${w.id} (${w.name}) image length: ${w.image.length}`);
            }
        }
    });

    console.log(`Total wines with images > ${threshold} chars: ${largeImageCount}`);

} catch (error) {
    console.error("Error:", error);
}
