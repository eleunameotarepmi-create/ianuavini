const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const queries = ['vevey', 'pellissier', 'source', 'gasperi', 'barrò', 'barro'];

console.log("--- Report Vini Richiesti ---");

queries.forEach(q => {
    console.log(`\nCercando: ${q}`);
    const found = db.wines.filter(w => w.name.toLowerCase().includes(q) || (w.wineryId && w.wineryId.toLowerCase().includes(q))); // WineryID check is loose, ideally verify against winery list

    // Better: Search by Winery *Name* if possible, but structure has winery separated.
    // I'll search just wine names first for simplicity, usually contains winery or recognizable string.
    // Also search in wineries list to map IDs?

    if (found.length === 0) {
        console.log("  Nessun vino trovato nel nome.");
        // Try searching wineries
        const winery = db.wineries.find(w => w.name.toLowerCase().includes(q));
        if (winery) {
            console.log(`  Trovata Cantina: ${winery.name} (${winery.id}). Cerco vini collegati...`);
            const winesByWinery = db.wines.filter(w => w.wineryId === winery.id);
            if (winesByWinery.length > 0) {
                winesByWinery.forEach(w => console.log(`  - ${w.name}: ${w.price || 'PREZZO MANCANTE'}`));
            } else {
                console.log("  Nessun vino collegato a questa cantina.");
            }
        }
    } else {
        found.forEach(w => console.log(`  - ${w.name}: ${w.price || 'PREZZO MANCANTE'}`));
    }
});
