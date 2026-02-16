
const fs = require('fs');
const path = require('path');

const v2Path = path.join(__dirname, '..', 'Ianua vini v2', 'db.json');
const v3Path = path.join(__dirname, 'db.json');

console.log(`Reading v2 database from: ${v2Path}`);
console.log(`Reading v3 database from: ${v3Path}`);

if (!fs.existsSync(v2Path)) {
    console.error("ERROR: v2 database not found!");
    process.exit(1);
}

try {
    const v2Data = JSON.parse(fs.readFileSync(v2Path, 'utf8'));
    let v3Data = {};

    if (fs.existsSync(v3Path)) {
        v3Data = JSON.parse(fs.readFileSync(v3Path, 'utf8'));
    }

    // MIGRATION LOGIC
    console.log("Migrating data...");

    // 1. Copy Regions (User specifically mentioned missing region images)
    if (v2Data.regions) {
        console.log(`Overwriting v3 regions (${v3Data.regions?.length || 0}) with v2 regions (${v2Data.regions.length})...`);
        v3Data.regions = v2Data.regions;
    }

    // 2. Copy Wines (User mentioned missing glass data which depends on wine 'type' likely updated in v2)
    if (v2Data.wines) {
        console.log(`Overwriting v3 wines (${v3Data.wines?.length || 0}) with v2 wines (${v2Data.wines.length})...`);
        v3Data.wines = v2Data.wines;
    }

    // 3. Copy Menu (Just in case)
    if (v2Data.menu) {
        console.log(`Overwriting v3 menu with v2 menu...`);
        v3Data.menu = v2Data.menu;
    }

    fs.writeFileSync(v3Path, JSON.stringify(v3Data, null, 2));
    console.log("SUCCESS: Data migration complete.");

} catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
}
