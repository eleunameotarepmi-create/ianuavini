import fs from 'fs';
import path from 'path';

const BACKUP_FILE = 'c:\\Surface Shares\\Riproviamo da qui Antigravity\\Ianua vini v3\\db.backup.json';

try {
    const raw = fs.readFileSync(BACKUP_FILE, 'utf8');
    const data = JSON.parse(raw);

    console.log("Analyzing backup file...");

    // 1. Check Root Keys
    const requiredKeys = ['wines', 'wineries', 'menu'];
    const missingKeys = requiredKeys.filter(key => !data.hasOwnProperty(key));

    if (missingKeys.length > 0) {
        console.error("❌ FAILURE: Missing keys:", missingKeys);
        process.exit(1);
    } else {
        console.log("✅ Root keys present.");
    }

    // 2. Check Wines Structure
    if (Array.isArray(data.wines) && data.wines.length > 0) {
        const sampleWine = data.wines[0];
        if (!sampleWine.hasOwnProperty('id') || !sampleWine.hasOwnProperty('name')) {
            console.error("❌ FAILURE: First wine missing 'id' or 'name'.", sampleWine);
            process.exit(1);
        } else {
            console.log("✅ Wine structure looks OK (sample checked).");
        }
    } else {
        console.warn("⚠️ Wines array is empty or not an array.");
    }

    // 3. Check JSON Size
    console.log(`ℹ️ File size: ${(raw.length / 1024 / 1024).toFixed(2)} MB`);

    console.log("✅ VALIDATION PASSED. This file *should* be accepted by the server.");

} catch (err) {
    console.error("❌ FATAL: Script failed", err);
}
