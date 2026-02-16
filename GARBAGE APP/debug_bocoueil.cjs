const fs = require('fs');
const path = require('path');

function normalize(str) {
    return str.replace(/’/g, "'").toLowerCase().replace(/[^a-z0-9']/g, ' ').trim().replace(/\s+/g, ' ');
}

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const item = { name: "Bocoueil", full_string: "Bocoueil Priod" };

let bestMatch = null;
let bestScore = -Infinity;

const nB = normalize(item.name);
const tokensB = nB.split(' ').filter(t => t.length > 2);

console.log("Input:", nB, tokensB);

for (const wine of db.wines) {
    const nA = normalize(wine.name);
    const tokensA = nA.split(' ').filter(t => t.length > 2);

    if (tokensA.length === 0) continue;

    const intersection = tokensA.filter(t => tokensB.includes(t));
    let overlapB = intersection.length / tokensB.length;
    let overlapA = intersection.length / tokensA.length;

    // Only check wines with overlap
    if (overlapB > 0) {
        console.log(`Candidate: ${nA} | Overlap: ${overlapB}`);
    }
}
