const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'db.json');

console.log("Verifying DB at:", dbPath);

try {
    if (!fs.existsSync(dbPath)) {
        console.error("ERROR: db.json does not exist!");
        process.exit(1);
    }

    const raw = fs.readFileSync(dbPath, 'utf8');
    const db = JSON.parse(raw);

    const wineCount = db.wines ? db.wines.length : 0;
    const wineryCount = db.wineries ? db.wineries.length : 0;
    const menuCount = db.menu ? db.menu.length : 0;

    console.log("--- DATA INTEGRITY REPORT ---");
    console.log(`WINERIES_COUNT: ${wineryCount}`);
    console.log(`WINES_COUNT: ${wineCount}`);
    console.log(`MENU_ITEMS: ${menuCount}`);

    if (wineryCount < 5) {
        console.warn("WARNING: Winery count is suspiciously low!");
    }
    if (wineCount < 50) {
        console.warn("WARNING: Wine count is suspiciously low!");
    }

    console.log("--- STATUS: OK ---");

} catch (err) {
    console.error("CRITICAL FAILURE:", err.message);
}
