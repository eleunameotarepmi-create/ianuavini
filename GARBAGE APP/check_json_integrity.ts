
import * as fs from 'fs';

const db = JSON.parse(fs.readFileSync('db.json', 'utf8'));
const wines = db.wines;
const wineries = db.wineries;

const results = [];

wines.forEach((w: any, index: number) => {
    if (!w || !w.id) {
        results.push({ index, issue: 'Missing ID', val: w });
        return;
    }
    const winery = wineries.find((win: any) => win.id === w.wineryId);
    if (!winery) {
        results.push({ index, issue: 'Missing Winery', id: w.id, wineryId: w.wineryId });
    }
});

fs.writeFileSync('integrity_results.json', JSON.stringify(results, null, 2));
console.log('Done');
