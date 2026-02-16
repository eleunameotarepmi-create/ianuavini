
const fs = require('fs');
const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));

console.log("Total Wines:", db.wines.length);
console.log("Total Wineries:", db.wineries.length);

const targetWinery = "Cave des Onze Communes";
const winery = db.wineries.find(w => w.name.includes("Onze"));
if (winery) {
    console.log(`\nWines for ${winery.name} (${winery.id}):`);
    const wines = db.wines.filter(w => w.wineryId === winery.id);
    wines.forEach(w => console.log(`- ${w.name} (Price: ${w.price})`));
} else {
    console.log(`\nWinery ${targetWinery} not found.`);
}

const targetWinery2 = "Feuillet";
const winery2 = db.wineries.find(w => w.name.includes("Feuillet"));
if (winery2) {
    console.log(`\nWines for ${winery2.name} (${winery2.id}):`);
    const wines = db.wines.filter(w => w.wineryId === winery2.id);
    wines.forEach(w => console.log(`- ${w.name} (Price: ${w.price})`));
}
