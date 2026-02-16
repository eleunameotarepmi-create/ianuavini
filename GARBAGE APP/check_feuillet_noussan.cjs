const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

const queries = ['feuillet', 'noussan'];

console.log("--- Report Vini Richiesti (Feuillet, Noussan) ---");

queries.forEach(q => {
    console.log(`\nCercando: ${q}`);
    const found = db.wines.filter(w => w.name.toLowerCase().includes(q));

    // Also search by winery name just in case
    const winery = db.wineries.find(w => w.name.toLowerCase().includes(q));

    let winesByWinery = [];
    if (winery) {
        console.log(`  Trovata Cantina: ${winery.name} (${winery.id})`);
        winesByWinery = db.wines.filter(w => w.wineryId === winery.id);
    }

    // Combine results unique by ID
    const allWines = [...found];
    winesByWinery.forEach(w => {
        if (!allWines.find(aw => aw.id === w.id)) {
            allWines.push(w);
        }
    });

    if (allWines.length === 0) {
        console.log("  Nessun vino trovato.");
    } else {
        allWines.forEach(w => console.log(`  - ${w.name}: ${w.price || 'PREZZO MANCANTE'}`));
    }
});
