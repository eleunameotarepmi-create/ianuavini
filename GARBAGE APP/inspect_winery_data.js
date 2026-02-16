import fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const wineries = db.wineries;

console.log("Total Wineries:", wineries.length);

const targets = ["Gaja", "Vietti", "Ceretto", "Conterno", "Mascarello", "Rinaldi", "Sandrone", "Voerzio"];
const found = wineries.filter(w => targets.some(t => w.name.toLowerCase().includes(t.toLowerCase())));

console.log("\n--- Targeted Wineries Inspection ---");
found.forEach(w => {
    console.log(`\nID: ${w.id}`);
    console.log(`Name: ${w.name}`);
    console.log(`Location: "${w.location}"`);
    console.log(`Region (Manual): "${w.region}"`);
});

console.log("\n--- All Wineries with 'Piemonte' in Location/Region ---");
const piemonte = wineries.filter(w => (w.location || "").toLowerCase().includes("piemonte") || (w.region || "").toLowerCase().includes("piemonte"));
piemonte.slice(0, 10).forEach(w => {
    console.log(`- ${w.name} (${w.location}) [${w.region}]`);
});
