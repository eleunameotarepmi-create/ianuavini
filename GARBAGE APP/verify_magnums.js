import fs from 'fs';

const dbPath = 'db.json';
const rawData = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(rawData);
const wines = data.wines;

const magnums = wines.filter(w => w.name.toLowerCase().includes('magnum'));

console.log(`FOUND ${magnums.length} MAGNUMS:`);
magnums.forEach(w => {
    console.log(`- ${w.name} (ID: ${w.id})`);
});
